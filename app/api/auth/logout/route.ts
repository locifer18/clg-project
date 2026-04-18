import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { deleteSession } from "@/lib/session";
import { prisma } from "@/lib/db";

/**
 * POST /api/auth/logout
 * 
 * Logout from current device and clear session
 */
export async function POST(request: Request) {
  try {
    // Get current user
    const user = await getUser();

    if (!user) {
      // Still clear cookies even if not authenticated
      const response = NextResponse.json({
        success: true,
        message: "Logged out",
      });

      response.headers.set(
        "Set-Cookie",
        "accessToken=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0"
      );

      response.headers.append(
        "Set-Cookie",
        "refreshToken=; HttpOnly; Secure; SameSite=Strict; Path=/api/auth/refresh; Max-Age=0"
      );

      return response;
    }

    // Get current session from token
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (token) {
      // Find and delete the specific session
      const session = await prisma.session.findUnique({
        where: { token },
      });

      if (session) {
        await deleteSession(session.id);
      }
    }

    // Log logout activity
    console.log(`User logged out: ${user.email} at ${new Date().toISOString()}`);

    // Clear cookies
    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });

    response.headers.set(
      "Set-Cookie",
      "accessToken=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0"
    );

    response.headers.append(
      "Set-Cookie",
      "refreshToken=; HttpOnly; Secure; SameSite=Strict; Path=/api/auth/refresh; Max-Age=0"
    );

    return response;

  } catch (error) {
    console.error("Logout error:", error);
    
    // Still clear cookies on error
    const response = NextResponse.json({
      success: true,
      message: "Logged out",
    });

    response.headers.set(
      "Set-Cookie",
      "accessToken=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0"
    );

    response.headers.append(
      "Set-Cookie",
      "refreshToken=; HttpOnly; Secure; SameSite=Strict; Path=/api/auth/refresh; Max-Age=0"
    );

    return response;
  }
}