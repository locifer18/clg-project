import { prisma } from "@/lib/db";
import { verifyOtp, checkOtpAttempts, recordOtpAttempt, resetOtpAttempts } from "@/lib/otp";
import { signToken } from "@/lib/jwt";
import { createSession, getSessionMetadata } from "@/lib/session";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // ✅ Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // ✅ Check if account is locked
    if (user.isLocked && new Date() < (user.lockedUntil || new Date())) {
      // Still locked
      const minutesRemaining = Math.ceil(
        ((user.lockedUntil?.getTime() || 0) - Date.now()) / 60000
      );
      
      return NextResponse.json(
        {
          success: false,
          message: `Account locked. Try again in ${minutesRemaining} minutes.`,
          lockedUntil: user.lockedUntil,
        },
        { status: 429 }
      );
    }

    // ✅ Unlock account if lockout expired
    if (user.isLocked && new Date() > (user.lockedUntil || new Date())) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          isLocked: false,
          lockedUntil: null,
          loginAttempts: 0,
        },
      });
    }

    // ✅ ENFORCE EMAIL VERIFICATION
    if (!user.emailVerified) {
      return NextResponse.json(
        {
          success: false,
          message: "Please verify your email first",
          requiresEmailVerification: true,
        },
        { status: 403 }
      );
    }

    // ✅ Find OTP
    const otp = await prisma.otpToken.findFirst({
      where: {
        email: user.email,
        type: "LOGIN_VERIFICATION",
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otp) {
      return NextResponse.json(
        { success: false, message: "OTP not found or expired" },
        { status: 400 }
      );
    }

    // ✅ Check expiration
    if (new Date() > otp.expiresAt) {
      await prisma.otpToken.delete({ where: { id: otp.id } });
      return NextResponse.json(
        { success: false, message: "OTP has expired" },
        { status: 400 }
      );
    }

    // ✅ Verify OTP
    const isValidOtp = verifyOtp(code, otp.code);

    if (!isValidOtp) {
      await prisma.otpToken.update({
        where: { id: otp.id },
        data: { attempts: { increment: 1 } },
      });

      // Increment login attempts
      const newAttempts = user.loginAttempts + 1;

      // Lock account after 5 failed attempts
      if (newAttempts >= 5) {
        const lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

        await prisma.user.update({
          where: { id: user.id },
          data: {
            isLocked: true,
            lockedUntil,
            loginAttempts: newAttempts,
          },
        });

        // Log failed attempt
        await prisma.loginLog.create({
          data: {
            userId: user.id,
            email: user.email,
            success: false,
            reason: "Invalid OTP - Account locked",
            ...getSessionMetadata(req),
          },
        });

        return NextResponse.json(
          {
            success: false,
            message: "Account locked due to too many failed attempts",
            lockedUntil,
          },
          { status: 429 }
        );
      }

      // Log failed attempt
      await prisma.loginLog.create({
        data: {
          userId: user.id,
          email: user.email,
          success: false,
          reason: "Invalid OTP",
          ...getSessionMetadata(req),
        },
      });

      return NextResponse.json(
        {
          success: false,
          message: "Invalid OTP",
          attemptsRemaining: 5 - newAttempts,
        },
        { status: 400 }
      );
    }

    // ✅ OTP is valid! Delete it
    await prisma.otpToken.delete({ where: { id: otp.id } });

    // ✅ Reset failed login attempts
    await prisma.user.update({
      where: { id: user.id },
      data: {
        loginAttempts: 0,
        isLocked: false,
        lockedUntil: null,
        lastLoginAt: new Date(),
      },
    });

    // ✅ Create JWT tokens
    const accessToken = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion,
    });

    // ✅ Generate refresh token
    const refreshToken = crypto.randomBytes(32).toString("hex");

    // ✅ Store session in database
    const session = await createSession(user.id, accessToken, {
      userAgent: req.headers.get("user-agent") || undefined,
      ipAddress: getSessionMetadata(req).ipAddress,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    // ✅ Update session with refresh token
    if (session) {
      await prisma.session.update({
        where: { id: session.id },
        data: { refreshToken },
      });
    }

    // ✅ Log successful login
    await prisma.loginLog.create({
      data: {
        userId: user.id,
        email: user.email,
        success: true,
        ...getSessionMetadata(req),
      },
    });

    // ✅ Log activity
    console.log(`User logged in: ${user.email} at ${new Date().toISOString()}`);

    // ✅ Set cookies and return response
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken, // Also return tokens in body for SPA
      refreshToken,
    });

    // ✅ Set access token cookie (15 minutes)
    response.headers.set(
      "Set-Cookie",
      `accessToken=${accessToken}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=900`
    );

    // ✅ Set refresh token cookie (7 days, only for refresh endpoint)
    response.headers.append(
      "Set-Cookie",
      `refreshToken=${refreshToken}; HttpOnly; Secure; SameSite=Strict; Path=/api/auth/refresh; Max-Age=604800`
    );

    return response;

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}