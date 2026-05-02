// lib/csrf.ts
import Csrf from 'csrf';
import { getRedis } from './redis';
import { InternalServerError } from './errors';

const csrf = new Csrf();

/**
 * Generate CSRF token for a session
 */
export async function generateCsrfToken(sessionId: string): Promise<string> {
  try {
    const redis = await getRedis();
    
    const secret = csrf.secretSync();
    const token = csrf.create(secret);
    
    // Store secret in Redis with session (24 hour TTL)
    await redis.setEx(
      `csrf:secret:${sessionId}`,
      24 * 60 * 60,
      secret
    );
    
    return token;
  } catch (error) {
    console.error('Failed to generate CSRF token:', error);
    throw new InternalServerError('Failed to generate CSRF token');
  }
}

/**
 * Verify CSRF token
 */
export async function verifyCsrfToken(
  sessionId: string,
  token: string
): Promise<boolean> {
  try {
    const redis = await getRedis();
    
    const secret = await redis.get(`csrf:secret:${sessionId}`);
    
    if (!secret) {
      console.warn(`CSRF token verification failed: No secret found for session ${sessionId}`);
      return false;
    }
    
    const isValid = csrf.verify(secret, token);
    return isValid;
  } catch (error) {
    console.error('Failed to verify CSRF token:', error);
    return false;
  }
}

/**
 * Revoke CSRF token (on logout)
 */
export async function revokeCsrfToken(sessionId: string): Promise<void> {
  try {
    const redis = await getRedis();
    await redis.del(`csrf:secret:${sessionId}`);
  } catch (error) {
    console.error('Failed to revoke CSRF token:', error);
  }
}

export default { generateCsrfToken, verifyCsrfToken, revokeCsrfToken };
