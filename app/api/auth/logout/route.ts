// app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { successResponse, errorResponse } from '@/lib/errors';
import { verifyToken } from '@/lib/jwt';
import { revokeCsrfToken } from '@/lib/csrf';

/**
 * POST /api/auth/logout
 * Logout user and revoke session
 * 
 * Headers:
 * - x-logout-all-devices: 'true' (optional) - logout from all devices
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getUser();

    if (!user) {
      return errorResponse(request, 401, 'Not authenticated');
    }

    // Get the current access token
    const accessToken = request.cookies.get('accessToken')?.value;
    const logoutAllDevices = request.headers.get('x-logout-all-devices') === 'true';
    const sessionId = request.cookies.get('sessionId')?.value;

    // Verify token to get session ID
    if (accessToken) {
      const payload = verifyToken(accessToken);

      if (payload?.sessionId) {
        if (logoutAllDevices) {
          // Delete all sessions for this user
          await prisma.session.deleteMany({
            where: { userId: user.id },
          });

          // Increment token version to invalidate all existing tokens
          await prisma.user.update({
            where: { id: user.id },
            data: {
              tokenVersion: { increment: 1 },
            },
          });

          // Revoke CSRF tokens
          const sessions = await prisma.session.findMany({
            where: { userId: user.id },
          });
          
          for (const session of sessions) {
            await revokeCsrfToken(session.id);
          }

          logger.info('User logged out from all devices', {
            userId: user.id,
            email: user.email,
          });
        } else {
          // Delete only current session
          if (payload.sessionId) {
            await prisma.session.deleteMany({
              where: { id: payload.sessionId },
            });

            // Revoke CSRF token
            await revokeCsrfToken(payload.sessionId);
          }
        }
      }
    }

    // Clear HTTP-Only cookies
    const cookieStore = await cookies();
    cookieStore.delete('accessToken');
    cookieStore.delete('refreshToken');
    cookieStore.delete('sessionId');

    logger.info('User logged out successfully', {
      userId: user.id,
      email: user.email,
      logoutAllDevices,
    });

    return successResponse(
      logoutAllDevices ? 'Logged out from all devices' : 'Logged out successfully'
    );
  } catch (error) {
    logger.error('Logout error', {}, error as Error);
    return errorResponse(request, 500, 'Logout failed');
  }
}

/**
 * GET /api/auth/logout
 * Support GET for simple logout links (web forms)
 */
export async function GET(request: NextRequest) {
  return POST(request);
}