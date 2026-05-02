// lib/jwt.ts
import { TokenPayload } from '@/types';
import jwt, { Secret } from 'jsonwebtoken';
import { logger } from './logger';
import { ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY, JWT_ALGORITHM } from '@/constants/security';

// ✅ Proper JWT Secret validation
const JWT_SECRET = process.env.JWT_SECRET;

// Validate JWT_SECRET at module load time
if (process.env.NODE_ENV === 'production') {
  if (!JWT_SECRET) {
    logger.error('❌ JWT_SECRET environment variable is required in production');
    throw new Error('JWT_SECRET is required in production');
  }
  
  if (JWT_SECRET.length < 32) {
    logger.error(`❌ JWT_SECRET must be at least 32 characters in production. Current: ${JWT_SECRET.length}`);
    throw new Error(`JWT_SECRET must be at least 32 characters (current: ${JWT_SECRET.length})`);
  }
}

if (!JWT_SECRET && process.env.NODE_ENV !== 'production') {
  logger.warn('⚠️ Using default JWT_SECRET in development. Set JWT_SECRET in .env for production');
}

/**
 * Sign an access token (short-lived)
 */
export function signToken(payload: TokenPayload): string {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  try {
    const token = jwt.sign(payload, JWT_SECRET as Secret, {
      expiresIn: ACCESS_TOKEN_EXPIRY, // 15 minutes
      algorithm: JWT_ALGORITHM,
    });

    logger.debug('JWT token signed', { userId: payload.userId });
    return token;
  } catch (error) {
    logger.error('Failed to sign JWT token:', { error: error instanceof Error ? error.message : 'Unknown error' }, error as Error);
    throw new Error('Token signing failed');
  }
}

/**
 * Sign a refresh token (long-lived)
 */
export function signRefreshToken(payload: TokenPayload): string {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  try {
    const token = jwt.sign(payload, JWT_SECRET as Secret, {
      expiresIn: REFRESH_TOKEN_EXPIRY, // 7 days
      algorithm: JWT_ALGORITHM,
    });

    logger.debug('JWT refresh token signed', { userId: payload.userId });
    return token;
  } catch (error) {
    logger.error('Failed to sign refresh token:', { error: error instanceof Error ? error.message : 'Unknown error' }, error as Error);
    throw new Error('Refresh token signing failed');
  }
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string): TokenPayload | null {
  if (!JWT_SECRET) {
    logger.error('JWT_SECRET is not configured');
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: [JWT_ALGORITHM],
    });

    return decoded as TokenPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      logger.debug('Token expired', { expiredAt: error.expiredAt });
    } else if (error instanceof jwt.JsonWebTokenError) {
      logger.warn('Invalid JWT token', { error: error.message });
    } else {
      logger.error('Failed to verify token:', { error: error instanceof Error ? error.message : 'Unknown error' }, error as Error);
    }
    return null;
  }
}

/**
 * Decode token without verification (for debugging)
 * ⚠️ Use only for reading payload, never for auth!
 */
export function decodeToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.decode(token);
    return decoded as TokenPayload;
  } catch (error) {
    logger.debug('Failed to decode token:', { error: error instanceof Error ? error.message : 'Unknown error' });
    return null;
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded) return true;

  const now = Math.floor(Date.now() / 1000);
  return (decoded.exp || 0) < now;
}

/**
 * Get time remaining before token expires (in seconds)
 */
export function getTokenTimeRemaining(token: string): number {
  const decoded = decodeToken(token);
  if (!decoded) return 0;

  const now = Math.floor(Date.now() / 1000);
  return Math.max(0, (decoded.exp || 0) - now);
}

const jwtFunctions = {
  signToken,
  verifyToken,
  decodeToken,
  isTokenExpired,
  getTokenTimeRemaining,
  signRefreshToken,
};

export default jwtFunctions;