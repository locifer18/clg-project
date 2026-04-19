// lib/jwt.ts
import { TokenPayload } from '@/types';
import jwt, { Secret } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';

/**
 * Sign a JWT token
 */
export function signToken(payload: TokenPayload): string {
  try {
    const token = jwt.sign(payload, JWT_SECRET as Secret, {
      expiresIn: JWT_EXPIRY,
      algorithm: 'HS256',
    });

    return token;
  } catch (error) {
    console.error('Failed to sign token:', error);
    throw new Error('Token signing failed');
  }
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'],
    });

    return decoded as TokenPayload;
  } catch (error) {
    console.error('Failed to verify token:', error);
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
    console.error('Failed to decode token:', error);
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

/**
 * Create refresh token (different from access token)
 * Longer expiry for refresh token
 */
export function signRefreshToken(payload: TokenPayload): string {
  try {
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: '7d', // Refresh tokens live longer
      algorithm: 'HS256',
    });

    return token;
  } catch (error) {
    console.error('Failed to sign refresh token:', error);
    throw new Error('Refresh token signing failed');
  }
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