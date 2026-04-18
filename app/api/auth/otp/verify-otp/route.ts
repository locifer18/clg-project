import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { verifyOtp, checkOtpAttempts, recordOtpAttempt, resetOtpAttempts } from "@/lib/otp";

const verifyOtpSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase(),
  code: z.string().min(6, "Invalid OTP format"),
  type: z.enum(["EMAIL_VERIFICATION", "PASSWORD_RESET", "LOGIN_VERIFICATION"]),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = verifyOtpSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: "Invalid input" },
        { status: 400 }
      );
    }

    const { email, code, type } = validation.data;

    // ✅ Check rate limiting before proceeding
    if (!checkOtpAttempts(email)) {
      return NextResponse.json(
        { success: false, message: "Too many failed attempts. Try again later." },
        { status: 429 }
      );
    }

    // Find OTP token
    const existingOtp = await prisma.otpToken.findFirst({
      where: { email, type },
      orderBy: { createdAt: "desc" },
    });

    if (!existingOtp) {
      recordOtpAttempt(email);
      return NextResponse.json(
        { success: false, message: "Invalid OTP" },
        { status: 400 }
      );
    }

    // Check expiration
    if (new Date() > existingOtp.expiresAt) {
      await prisma.otpToken.delete({ where: { id: existingOtp.id } });
      recordOtpAttempt(email);
      return NextResponse.json(
        { success: false, message: "OTP has expired" },
        { status: 400 }
      );
    }

    // ✅ Verify hashed OTP
    const isValidOtp = verifyOtp(code, existingOtp.code);

    if (!isValidOtp) {
      recordOtpAttempt(email);
      
      // Increment attempts in database
      await prisma.otpToken.update({
        where: { id: existingOtp.id },
        data: { attempts: { increment: 1 } },
      });

      return NextResponse.json(
        { success: false, message: "Invalid OTP" },
        { status: 400 }
      );
    }

    // ✅ Get user before deleting OTP
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      await prisma.otpToken.delete({ where: { id: existingOtp.id } });
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // ✅ Handle EMAIL_VERIFICATION - Mark email as verified
    if (type === "EMAIL_VERIFICATION") {
      await prisma.user.update({
        where: { email },
        data: { emailVerified: new Date() },
      });
    }

    // ✅ Delete OTP after successful verification
    await prisma.otpToken.delete({ where: { id: existingOtp.id } });

    // ✅ Reset rate limiting on successful verification
    resetOtpAttempts(email);

    return NextResponse.json(
      { 
        success: true, 
        message: "OTP verified successfully",
        email: user.email,
        type,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}