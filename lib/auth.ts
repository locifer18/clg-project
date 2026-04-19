import { prisma } from './db';
import { verifyToken } from './jwt';

/**
 * Get current authenticated user from session or token
 * Works with both NextAuth sessions and JWT tokens
 */
import { headers, cookies } from "next/headers";

export async function getUser() {
  try {
    const headerList = await headers();
    let token =
      headerList.get("authorization")?.split(" ")[1] ||
      headerList.get("Authorization")?.split(" ")[1];
    if (!token) {
      const cookieStore = await cookies();
      token = cookieStore.get("accessToken")?.value;
    }

    if (!token) return null;

    // ✅ 3. Verify token
    const user = await getUserFromToken(token);

    return user;
  } catch (error) {
    console.error("Failed to get user:", error);
    return null;
  }
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    return user;
  } catch (error) {
    console.error('Failed to get user by email:', error);
    return null;
  }
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    return user;
  } catch (error) {
    console.error('Failed to get user by ID:', error);
    return null;
  }
}

/**
 * Get admin user (check if user exists and has ADMIN role)
 */
export async function getAdminUser() {
  try {
    const user = await getUser();

    if (!user || user.role !== 'ADMIN') {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Failed to get admin user:', error);
    return null;
  }
}

/**
 * Verify user owns a resource (for authorization)
 */
export async function isUserAuthorized(userId: string, resourceOwnerId: string): Promise<boolean> {
  return userId === resourceOwnerId;
}

/**
 * Check if user is admin
 */
export async function isAdmin(userId: string): Promise<boolean> {
  try {
    const user = await getUserById(userId);
    return user?.role === 'ADMIN';
  } catch (error) {
    console.error('Failed to check admin status:', error);
    return false;
  }
}

/**
 * Get user from JWT token (for API routes)
 */
export async function getUserFromToken(token: string) {
  try {
    const payload = verifyToken(token);
    if (!payload) return null;

    const session = await prisma.session.findUnique({
      where: { id: payload.sessionId },
    });

    if (!session) return null;
    if (new Date() > session.expiresAt) return null;

    const user = await getUserById(payload.userId);
    if (!user) return null;

    if (payload.tokenVersion !== user.tokenVersion) return null;

    return user;
  } catch (error) {
    console.error('Failed to get user from token:', error);
    return null;
  }
}

const authFuntions = {
  getUser,
  getUserByEmail,
  getUserById,
  getAdminUser,
  isUserAuthorized,
  isAdmin,
  getUserFromToken,
};

export default authFuntions