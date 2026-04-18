import { NextResponse } from "next/server";
import { z } from "zod";
import { getOTPTemplate } from "@/lib/templates";
import { prisma } from "@/lib/db";
import { hashOtp } from "@/lib/otp";
import { sendEmail } from "@/lib/nodemailer";

const sendOtpSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase(),
  type: z.enum(["EMAIL_VERIFICATION", "PASSWORD_RESET", "LOGIN_VERIFICATION"]),
});

// Rate limiting: max 3 OTP requests per email per hour
const otpRateLimit = new Map<string, { count: number; resetTime: Date }>();

const checkRateLimit = (email: string): boolean => {
  const limit = otpRateLimit.get(email);
  
  if (!limit) {
    otpRateLimit.set(email, { count: 1, resetTime: new Date(Date.now() + 60 * 60 * 1000) });
    return true;
  }
  
  if (new Date() > limit.resetTime) {
    otpRateLimit.set(email, { count: 1, resetTime: new Date(Date.now() + 60 * 60 * 1000) });
    return true;
  }
  
  if (limit.count >= 3) {
    return false; // Rate limited
  }
  
  limit.count += 1;
  return true;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = sendOtpSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: "Invalid input provided" },
        { status: 400 }
      );
    }

    const { email, type } = validation.data;

    // ✅ Rate limiting
    if (!checkRateLimit(email)) {
      return NextResponse.json(
        { success: false, message: "Too many OTP requests. Try again later." },
        { status: 429 }
      );
    }

    // Don't reveal if user exists (security best practice)
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      // Still send 200 to avoid user enumeration
      return NextResponse.json(
        { success: true, message: "If account exists, OTP has been sent" },
        { status: 200 }
      );
    }

    // ✅ Email verification check - only for new registrations
    if (type === "EMAIL_VERIFICATION" && user.emailVerified) {
      return NextResponse.json(
        { success: true, message: "If account exists, OTP has been sent" },
        { status: 200 }
      );
    }

    // Delete previous OTPs
    await prisma.otpToken.deleteMany({ where: { email, type } });

    // ✅ Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    // ✅ Hash OTP before storing
    const hashedOtp = hashOtp(otp);

    await prisma.otpToken.create({
      data: {
        email,
        code: hashedOtp, // Store hashed, not plain text
        type,
        expiresAt,
        attempts: 0,
      },
    });

    let subject = "Verify Your Email";
    if (type === "PASSWORD_RESET") subject = "Reset Your Password";
    if (type === "LOGIN_VERIFICATION") subject = "Your Login Verification Code";
    
    const htmlTemplate = getOTPTemplate(otp, type);
    
    const emailSent = await sendEmail(email, subject, htmlTemplate.html);

    if (!emailSent) {
      // Still return success to avoid revealing backend issues
      console.error(`Failed to send OTP email to ${email}`);
      return NextResponse.json(
        { success: true, message: "If account exists, OTP has been sent" },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { success: true, message: "If account exists, OTP has been sent" },
      { status: 200 }
    );

  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}