// app/api/auth/refresh/route.ts
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { signToken, signRefreshToken, verifyToken } from '@/lib/jwt';
import { successResponse, errorResponse } from '@/lib/errors';
import { SESSION_EXPIRY_MS } from '@/constants/security';

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 * 
 * Implements token rotation:
 * - Old refresh token is invalidated
 * - New access token and refresh token are issued
 * - Session metadata is updated
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refreshToken')?.value;

    if (!refreshToken) {
      return errorResponse(request, 401, 'No refresh token provided');
    }

    // Verify refresh token
    const payload = verifyToken(refreshToken);

    if (!payload) {
      logger.warn('Invalid refresh token attempted', {
        ip: request.headers.get('x-forwarded-for'),
      });
      return errorResponse(request, 401, 'Invalid refresh token');
    }

    // Get session
    const session = await prisma.session.findUnique({
      where: { id: payload.sessionId },
      include: { user: true },
    });

    if (!session || session.userId !== payload.userId) {
      logger.warn('Session mismatch or not found during token refresh', {
        sessionId: payload.sessionId,
        userId: payload.userId,
      });
      return errorResponse(request, 401, 'Session not found');
    }

    // Check if session expired
    if (new Date() > session.expiresAt) {
      await prisma.session.delete({ where: { id: session.id } });
      logger.warn('Session expired during token refresh', {
        userId: session.userId,
      });
      return errorResponse(request, 401, 'Session expired');
    }

    // Verify token version hasn't been incremented (invalidation check)
    if (payload.tokenVersion !== session.user.tokenVersion) {
      logger.warn('Token version mismatch - tokens invalidated', {
        userId: session.user.id,
      });
      return errorResponse(request, 401, 'Tokens have been invalidated');
    }

    // Generate new tokens
    const newAccessToken = signToken({
      userId: session.user.id,
      email: session.user.email,
      role: session.user.role as 'ADMIN' | 'CUSTOMER',
      sessionId: session.id,
      tokenVersion: session.user.tokenVersion,
    });

    const newRefreshToken = signRefreshToken({
      userId: session.user.id,
      email: session.user.email,
      role: session.user.role as 'ADMIN' | 'CUSTOMER',
      sessionId: session.id,
      tokenVersion: session.user.tokenVersion,
    });

    // Update session with new token and extend expiry
    await prisma.session.update({
      where: { id: session.id },
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresAt: new Date(Date.now() + SESSION_EXPIRY_MS),
        updatedAt: new Date(),
      },
    });

    // Set new HTTP-Only cookies
    cookieStore.set('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60, // 15 minutes
      path: '/',
    });

    cookieStore.set('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    logger.info('Token refreshed successfully', {
      userId: session.user.id,
      sessionId: session.id,
    });

    return successResponse('Token refreshed', {
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
      },
    });
  } catch (error) {
    logger.error('Token refresh error', {}, error as Error);
    return errorResponse(request, 500, 'Failed to refresh token');
  }
}

/**
 * GET /api/auth/refresh
 * Also support GET for compatibility
 */
export async function GET(request: NextRequest) {
  return POST(request);
}