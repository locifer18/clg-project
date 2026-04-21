import bcrypt from "bcryptjs";
import crypto from "crypto";

import { prisma } from "@/lib/db";
import { signToken } from "@/lib/jwt";
import { createSession, getSessionMetadata } from "@/lib/session";

import {
  ValidationError,
  AuthenticationError,
  ConflictError,
  NotFoundError,
} from "@/lib/errors";

import {
  RegisterRequest,
  LoginRequest,
  Role,
  VerifyLoginOtpRequest,
  ResetPasswordRequest
} from "@/types";
import { sendOtpService, verifyOtpService } from "./OtpServise";

// ================= REGISTER =================
export async function registerUser(data: RegisterRequest) {
  const { name, email, password, phone } = data;

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true, emailVerified: true },
  });

  if (existingUser) {
    if (!existingUser.emailVerified) {
      await sendOtpService({
        email,
        type: "EMAIL_VERIFICATION",
      });

      return {
        message: "Account exists but not verified. OTP sent again.",
        nextStep: "EMAIL_VERIFICATION",
      };
    }

    throw new ConflictError("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      phone: phone || null,
      emailVerified: null,
      cart: { create: {} },
    },
    select: {
      id: true,
      email: true,
    },
  });

  // Send verification OTP
  await sendOtpService({
    email,
    type: "EMAIL_VERIFICATION",
  });

  return {
    message: "Registration successful. Please verify your email.",
    user,
    nextStep: "EMAIL_VERIFICATION",
  };
}

// ================= LOGIN STEP 1 =================
export async function loginUser(data: LoginRequest & { password: string }) {
  const { email, password } = data;

  if (!email || !password) {
    throw new ValidationError("Email and password required");
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AuthenticationError("Invalid credentials");
  }

  if (!user.emailVerified) {
    throw new AuthenticationError("Please verify your email first");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password || "");

  if (!isPasswordValid) {
    throw new AuthenticationError("Invalid credentials");
  }

  // ✅ Send OTP for login
  await sendOtpService({
    email,
    type: "LOGIN_VERIFICATION",
  });

  return {
    message: "OTP sent to your email",
    nextStep: "VERIFY_LOGIN_OTP",
  };
}

// ================= LOGIN STEP 2 =================
export async function verifyLoginOtp(
  data: VerifyLoginOtpRequest,
  req: Request
) {
  const { email, code } = data;

  // Verify OTP via service
  await verifyOtpService({
    email,
    code,
    type: "LOGIN_VERIFICATION",
  });

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AuthenticationError("User not found");
  }

  const session = await createSession(user.id, "temp", {
    userAgent: req.headers.get("user-agent") || undefined,
    ipAddress: getSessionMetadata(req).ipAddress,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  const accessToken = signToken({
    userId: user.id,
    email: user.email,
    role: user.role as Role,
    sessionId: session.id,
    tokenVersion: user.tokenVersion,
  });

  const refreshToken = crypto.randomBytes(32).toString("hex");

  if (session) {
    await prisma.session.update({
      where: { id: session.id },
      data: {
        accessToken,
        refreshToken
      },
    });
  }
  
  return {
    message: "Login successful",
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
}

export async function logoutUser(req: Request) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.split(" ")[1];

  if (token) {
    const session = await prisma.session.findUnique({
      where: { accessToken: token },
    });

    if (session) {
      await prisma.session.delete({ where: { id: session.id } });
    }
  }

  return {
    message: "Logged out successfully",
  };
}

export async function refreshTokenService(refreshToken: string) {
  if (!refreshToken) {
    throw new AuthenticationError("Refresh token required");
  }

  const session = await prisma.session.findUnique({
    where: { refreshToken },
    include: { user: true },
  });

  if (!session) {
    throw new AuthenticationError("Invalid refresh token");
  }

  if (new Date() > session.expiresAt) {
    await prisma.session.delete({ where: { id: session.id } });
    throw new AuthenticationError("Refresh token expired");
  }

  if (!session.user || session.user.isLocked) {
    throw new AuthenticationError("Account locked or user not found");
  }

  const newAccessToken = signToken({
    userId: session.user.id,
    email: session.user.email,
    role: session.user.role as Role,
    sessionId: session.id,
    tokenVersion: session.user.tokenVersion,
  });

  const newRefreshToken = crypto.randomBytes(32).toString("hex");

  await prisma.session.update({
    where: { id: session.id },
    data: {
      refreshToken: newRefreshToken,
      updatedAt: new Date(),
    },
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
}

export async function resetPasswordService(data: ResetPasswordRequest) {
  const { email, newPassword } = data;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new ValidationError("Invalid request");
  }

  const isSame = await bcrypt.compare(newPassword, user.password || "");

  if (isSame) {
    throw new ValidationError("Password must be different");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { email },
    data: {
      password: hashedPassword,
      tokenVersion: { increment: 1 },
    },
  });

  return {
    message: "Password reset successful",
  };
}

export async function getUserSessionsService(userId: string) {
  const sessions = await prisma.session.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return sessions;
}

export async function deleteSessionService(
  userId: string,
  sessionId: string
) {
  const session = await prisma.session.findFirst({
    where: { id: sessionId, userId },
  });

  if (!session) {
    throw new NotFoundError("Session not found");
  }

  await prisma.session.delete({ where: { id: sessionId } });

  return {
    message: "Session deleted",
  };
}

export async function logoutAllSessionsService(userId: string) {
  const deleted = await prisma.session.deleteMany({
    where: { userId },
  });

  return {
    message: `Logged out from ${deleted.count} devices`,
  };
}