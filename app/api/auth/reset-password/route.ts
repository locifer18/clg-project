import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { verifyOtp } from "@/lib/otp";

const passwordSchema = z
  .string()
  .min(12, "Password must be at least 12 characters")
  .refine((pass) => /[A-Z]/.test(pass), "Password must contain uppercase letter")
  .refine((pass) => /[a-z]/.test(pass), "Password must contain lowercase letter")
  .refine((pass) => /[0-9]/.test(pass), "Password must contain number")
  .refine((pass) => /[^A-Za-z0-9]/.test(pass), "Password must contain special character");

const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email").toLowerCase(),
  otp: z.string().min(6, "Invalid OTP"),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = resetPasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Validation Error",
          error: validation.error.issues[0].message,
        },
        { status: 400 }
      );
    }

    const { email, otp, newPassword } = validation.data;

    // ✅ Find user
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Don't reveal if user exists
      return NextResponse.json(
        { success: false, message: "Password reset request could not be processed" },
        { status: 400 }
      );
    }

    // ✅ Find and verify PASSWORD_RESET OTP
    const existingOtp = await prisma.otpToken.findFirst({
      where: {
        email,
        type: "PASSWORD_RESET",
      },
      orderBy: { createdAt: "desc" },
    });

    if (!existingOtp) {
      return NextResponse.json(
        { success: false, message: "No reset request found. Request a new OTP." },
        { status: 400 }
      );
    }

    // ✅ Check expiration
    if (new Date() > existingOtp.expiresAt) {
      await prisma.otpToken.delete({ where: { id: existingOtp.id } });
      return NextResponse.json(
        { success: false, message: "Reset OTP has expired. Request a new one." },
        { status: 400 }
      );
    }

    // ✅ Verify hashed OTP
    const isValidOtp = verifyOtp(otp, existingOtp.code);

    if (!isValidOtp) {
      await prisma.otpToken.update({
        where: { id: existingOtp.id },
        data: { attempts: { increment: 1 } },
      });

      if ((existingOtp.attempts + 1) >= 5) {
        await prisma.otpToken.delete({ where: { id: existingOtp.id } });
        return NextResponse.json(
          { success: false, message: "Too many failed attempts. Request a new OTP." },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { success: false, message: "Invalid OTP" },
        { status: 400 }
      );
    }

    // ✅ Check if password is different from current
    const isSamePassword = await require('bcryptjs').compare(newPassword, user.password || '');
    if (isSamePassword) {
      return NextResponse.json(
        { success: false, message: "New password must be different from current password" },
        { status: 400 }
      );
    }

    // ✅ Hash new password
    const hashedPassword = await hash(newPassword, 12);

    // ✅ Update password and increment token version for session invalidation
    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        // Optional: if you add tokenVersion to User model
        // tokenVersion: { increment: 1 }
      },
    });

    // ✅ Delete OTP after successful reset
    await prisma.otpToken.delete({ where: { id: existingOtp.id } });

    // ✅ Log password reset activity
    console.log(`Password reset for user: ${email} at ${new Date().toISOString()}`);

    return NextResponse.json(
      { 
        success: true, 
        message: "Password has been reset successfully. Please login with your new password." 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}