// api/auth/refresh.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { signToken, verifyToken } from "@/lib/jwt";
import crypto from "crypto";

/**
 * POST /api/auth/refresh
 * 
 * Exchanges a refresh token for a new access token
 * Used to maintain long sessions with short-lived access tokens
 * 
 * Request body:
 * {
 *   "refreshToken": "..."  // Refresh token from cookie or body
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "accessToken": "...",
 *   "refreshToken": "..."  // New refresh token (optional, for rotation)
 * }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, message: "Refresh token required" },
        { status: 401 }
      );
    }

    // ✅ Find the session by refresh token
    const session = await prisma.session.findUnique({
      where: { refreshToken },
      include: { user: true },
    });

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Invalid refresh token" },
        { status: 401 }
      );
    }

    // ✅ Check if refresh token is expired
    if (new Date() > session.expiresAt) {
      await prisma.session.delete({ where: { id: session.id } });
      return NextResponse.json(
        { success: false, message: "Refresh token expired" },
        { status: 401 }
      );
    }

    // ✅ Check user still exists and account not locked
    if (!session.user || session.user.isLocked) {
      return NextResponse.json(
        { success: false, message: "Account locked or user not found" },
        { status: 401 }
      );
    }

    // ✅ Generate new access token (short-lived: 15 minutes)
    const newAccessToken = signToken({
      userId: session.user.id,
      email: session.user.email,
      role: session.user.role,
      sessionId: session.id,
      tokenVersion: session.user.tokenVersion,
    });

    // ✅ Optional: Rotate refresh token (better security)
    const newRefreshToken = crypto.randomBytes(32).toString("hex");
    
    // Update session with new refresh token
    await prisma.session.update({
      where: { id: session.id },
      data: {
        refreshToken: newRefreshToken,
        updatedAt: new Date(),
      },
    });

    // ✅ Set new access token in HttpOnly cookie
    const response = NextResponse.json({
      success: true,
      message: "Token refreshed successfully",
      accessToken: newAccessToken,
      refreshToken: newRefreshToken, // Also return in body for SPA
    });

    response.headers.set(
      "Set-Cookie",
      `accessToken=${newAccessToken}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=900` // 15 minutes
    );

    // Optional: Also set refresh token in a secure, non-HttpOnly cookie
    // (HttpOnly cookies can't be accessed by JS, so if you want SPA rotation, use body)
    response.headers.append(
      "Set-Cookie",
      `refreshToken=${newRefreshToken}; HttpOnly; Secure; SameSite=Strict; Path=/api/auth/refresh; Max-Age=604800` // 7 days, only sent to refresh endpoint
    );

    return response;

  } catch (error) {
    console.error("Token refresh error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to refresh token" },
      { status: 500 }
    );
  }
}

/**
 * Alternative: Store refresh token securely without returning in response
 * (More secure but requires httpOnly cookie management)
 */
export async function POST_ALTERNATIVE(request: Request) {
  try {
    // Get refresh token from httpOnly cookie
    const cookies = request.headers.get("cookie");
    const refreshTokenMatch = cookies?.match(/refreshToken=([^;]+)/);
    const refreshToken = refreshTokenMatch?.[1];

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, message: "No refresh token found" },
        { status: 401 }
      );
    }

    const session = await prisma.session.findUnique({
      where: { refreshToken },
      include: { user: true },
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Invalid refresh token" },
        { status: 401 }
      );
    }

    if (new Date() > session.expiresAt) {
      await prisma.session.delete({ where: { id: session.id } });
      return NextResponse.json(
        { success: false, message: "Refresh token expired" },
        { status: 401 }
      );
    }

    const newAccessToken = signToken({
      userId: session.user.id,
      email: session.user.email,
      role: session.user.role,
      sessionId: session.id,
    });

    const response = NextResponse.json({
      success: true,
      message: "Token refreshed",
    });

    response.headers.set(
      "Set-Cookie",
      `accessToken=${newAccessToken}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=900`
    );

    return response;

  } catch (error) {
    console.error("Token refresh error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}