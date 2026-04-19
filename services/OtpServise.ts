import { prisma } from "@/lib/db";
import { hashOtp, verifyOtp } from "@/lib/otp";
import { sendEmail } from "@/lib/nodemailer";
import { getOTPTemplate } from "@/lib/templates";

import {
  ValidationError,
  RateLimitError,
  NotFoundError,
} from "@/lib/errors";

import { SendOtpRequest, VerifyOtpRequest } from "@/types";

// ⚠️ Temporary in-memory rate limiter
const otpRateLimit = new Map<
  string,
  { count: number; resetTime: Date }
>();

const checkRateLimit = (email: string): boolean => {
  const limit = otpRateLimit.get(email);

  if (!limit) {
    otpRateLimit.set(email, {
      count: 1,
      resetTime: new Date(Date.now() + 60 * 60 * 1000),
    });
    return true;
  }

  if (new Date() > limit.resetTime) {
    otpRateLimit.set(email, {
      count: 1,
      resetTime: new Date(Date.now() + 60 * 60 * 1000),
    });
    return true;
  }

  if (limit.count >= 3) return false;

  limit.count += 1;
  return true;
};

// ================= SEND OTP =================
export async function sendOtpService(data: SendOtpRequest) {
  const { email, type } = data;

  // ✅ Rate limit
  if (!checkRateLimit(email)) {
    throw new RateLimitError("Too many OTP requests. Try again later.");
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  // 👉 Always silent response (handled in route)
  if (!user) return;

  // Email already verified case
  if (type === "EMAIL_VERIFICATION" && user.emailVerified) {
    return;
  }

  // Delete old OTPs
  await prisma.otpToken.deleteMany({
    where: { email, type },
  });

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOtp = hashOtp(otp);

  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.otpToken.create({
    data: {
      email,
      code: hashedOtp,
      type,
      expiresAt,
      attempts: 0,
    },
  });

  // Email subject
  let subject = "Verify Your Email";
  if (type === "PASSWORD_RESET") subject = "Reset Your Password";
  if (type === "LOGIN_VERIFICATION")
    subject = "Your Login Verification Code";

  const template = getOTPTemplate(otp, type);

  const emailSent = await sendEmail(email, subject, template.html);

  if (!emailSent) {
    console.error(`Failed to send OTP to ${email}`);
  }
}

// ================= VERIFY OTP =================
export async function verifyOtpService(data: VerifyOtpRequest) {
  const { email, code, type } = data;

  const existingOtp = await prisma.otpToken.findFirst({
    where: { email, type },
    orderBy: { createdAt: "desc" },
  });

  if (!existingOtp) {
    throw new ValidationError("Invalid OTP");
  }

  // Expiry
  if (new Date() > existingOtp.expiresAt) {
    await prisma.otpToken.delete({ where: { id: existingOtp.id } });
    throw new ValidationError("OTP has expired");
  }

  // Attempt limit
  if (existingOtp.attempts >= 5) {
    await prisma.otpToken.delete({ where: { id: existingOtp.id } });
    throw new RateLimitError("Too many invalid attempts");
  }

  const isValid = verifyOtp(code, existingOtp.code);

  if (!isValid) {
    await prisma.otpToken.update({
      where: { id: existingOtp.id },
      data: { attempts: { increment: 1 } },
    });

    throw new ValidationError("Invalid OTP");
  }

  // Get user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    await prisma.otpToken.delete({ where: { id: existingOtp.id } });
    throw new NotFoundError("User not found");
  }

  // Handle types
  if (type === "EMAIL_VERIFICATION") {
    await prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    });
  }

  // Delete OTP
  await prisma.otpToken.delete({
    where: { id: existingOtp.id },
  });

  return {
    email: user.email,
    type,
  };
}