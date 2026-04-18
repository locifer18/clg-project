// api/auth/sessions.ts
import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { deleteSession, deleteAllUserSessions, getUserSessions } from "@/lib/session";
import { prisma } from "@/lib/db";

/**
 * GET /api/auth/sessions
 * Get all active sessions for the logged-in user
 */
export async function GET(request: Request) {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const sessions = await getUserSessions(user.id);

    return NextResponse.json({
      success: true,
      sessions: sessions.map((session) => ({
        id: session.id,
        device: parseUserAgent(session.userAgent),
        ipAddress: maskIpAddress(session.ipAddress),
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
        isCurrentSession: session.token === request.headers.get("authorization")?.split(" ")[1],
      })),
    });

  } catch (error) {
    console.error("Get sessions error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/auth/sessions/:sessionId
 * Logout from a specific device
 */
export async function DELETE(request: Request) {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get sessionId from URL
    const url = new URL(request.url);
    const sessionId = url.searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: "Session ID required" },
        { status: 400 }
      );
    }

    // Verify session belongs to user
    const session = await prisma.session.findFirst({
      where: {
        id: sessionId,
        userId: user.id,
      },
    });

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Session not found" },
        { status: 404 }
      );
    }

    // Delete the session
    const deleted = await deleteSession(sessionId);

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Failed to delete session" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Session deleted successfully",
    });

  } catch (error) {
    console.error("Delete session error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/auth/sessions/logout-all
 * Logout from ALL devices
 */
export async function POST(request: Request) {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action } = body;

    if (action === "logout-all") {
      // Delete all sessions
      const deletedCount = await deleteAllUserSessions(user.id);

      // Clear cookies
      const response = NextResponse.json({
        success: true,
        message: `Logged out from ${deletedCount} device(s)`,
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

    return NextResponse.json(
      { success: false, message: "Invalid action" },
      { status: 400 }
    );

  } catch (error) {
    console.error("Logout all error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Helper: Parse user agent to show device type
 */
function parseUserAgent(userAgent?: string): string {
  if (!userAgent) return "Unknown device";

  if (/mobile/i.test(userAgent)) return "Mobile";
  if (/tablet/i.test(userAgent)) return "Tablet";
  if (/windows/i.test(userAgent)) return "Windows PC";
  if (/macintosh/i.test(userAgent)) return "Mac";
  if (/linux/i.test(userAgent)) return "Linux";

  return "Unknown device";
}

/**
 * Helper: Mask IP address for privacy
 */
function maskIpAddress(ip?: string): string {
  if (!ip) return "Unknown";

  if (ip.includes(":")) {
    // IPv6
    const parts = ip.split(":");
    return parts.slice(0, 3).join(":") + ":***";
  } else {
    // IPv4
    const parts = ip.split(".");
    return parts.slice(0, 3).join(".") + ".*";
  }
}