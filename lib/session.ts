// lib/session.ts
import { prisma } from "./db";

export interface SessionData {
  userId: string;
  accessToken: string;
  userAgent?: string;
  ipAddress?: string;
  expiresAt: Date;
}

/**
 * Create a new session for user
 */
export async function createSession(
  userId: string,
  accessToken: string,
  options?: {
    userAgent?: string;
    ipAddress?: string;
    expiresAt?: Date;
  }
): Promise<any> {
  try {
    const session = await prisma.session.create({
      data: {
        userId,
        accessToken,
        userAgent: options?.userAgent,
        ipAddress: options?.ipAddress,
        expiresAt: options?.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return session;
  } catch (error) {
    console.error("Failed to create session:", error);
    return null;
  }
}

/**
 * Get session by accessToken
 */
export async function getSessionByToken(accessToken: string): Promise<any | null> {
  try {
    const session = await prisma.session.findUnique({
      where: { accessToken },
      include: { user: { select: { id: true, email: true, role: true } } },
    });

    if (!session) return null;

    // Check if session expired
    if (new Date() > session.expiresAt) {
      await prisma.session.delete({ where: { id: session.id } });
      return null;
    }

    return session;
  } catch (error) {
    console.error("Failed to get session:", error);
    return null;
  }
}

/**
 * Get all active sessions for a user
 */
export async function getUserSessions(userId: string): Promise<any[]> {
  try {
    const sessions = await prisma.session.findMany({
      where: { userId },
      select: {
        id: true,
        accessToken: true,
        userAgent: true,
        ipAddress: true,
        createdAt: true,
        expiresAt: true,
      },
    });

    // Filter out expired sessions
    return sessions.filter((session) => new Date() < session.expiresAt);
  } catch (error) {
    console.error("Failed to get user sessions:", error);
    return [];
  }
}

/**
 * Delete a specific session
 */
export async function deleteSession(sessionId: string): Promise<boolean> {
  try {
    await prisma.session.delete({
      where: { id: sessionId },
    });
    return true;
  } catch (error) {
    console.error("Failed to delete session:", error);
    return false;
  }
}

/**
 * Delete all sessions for a user (logout from all devices)
 */
export async function deleteAllUserSessions(userId: string): Promise<number> {
  try {
    const result = await prisma.session.deleteMany({
      where: { userId },
    });
    return result.count;
  } catch (error) {
    console.error("Failed to delete all sessions:", error);
    return 0;
  }
}

/**
 * Cleanup expired sessions
 * Run this periodically (e.g., cron job)
 */
export async function cleanupExpiredSessions(): Promise<number> {
  try {
    const result = await prisma.session.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
    return result.count;
  } catch (error) {
    console.error("Failed to cleanup expired sessions:", error);
    return 0;
  }
}

/**
 * Invalidate all sessions on password change
 * Use tokenVersion in User model for this
 */
export async function invalidateAllSessionsForUser(userId: string): Promise<void> {
  try {
    // Delete all sessions
    await deleteAllUserSessions(userId);

    // Increment tokenVersion to invalidate JWT tokens
    await prisma.user.update({
      where: { id: userId },
      data: { tokenVersion: { increment: 1 } },
    });

    console.log(`Invalidated all sessions for user: ${userId}`);
  } catch (error) {
    console.error("Failed to invalidate sessions:", error);
  }
}

/**
 * Extract IP and User Agent from request
 */
export function getSessionMetadata(request: Request): {
  ipAddress?: string;
  userAgent?: string;
} {
  const ipAddress =
    (request.headers.get("x-forwarded-for")?.split(",")[0]) ||
    (request.headers.get("x-real-ip") as string) ||
    undefined;

  const userAgent = request.headers.get("user-agent") as string | undefined;

  return { ipAddress, userAgent };
}