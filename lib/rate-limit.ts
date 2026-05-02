// lib/rate-limit.ts
/**
 * Redis-based rate limiting for production
 * Distributed across all server instances
 */

import { getRedis } from './redis';
import { RateLimitError } from './errors';
import { logger } from './logger';

/**
 * Check if request is rate limited using Redis
 * Returns true if allowed, false if rate limited
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number = 60 * 1000 // 1 minute default
): Promise<boolean> {
  try {
    const redis = await getRedis();
    const redisKey = `rate-limit:${key}`;
    
    const current = await redis.incr(redisKey);
    
    if (current === 1) {
      // First request in window, set expiry
      const windowSeconds = Math.ceil(windowMs / 1000);
      await redis.expire(redisKey, windowSeconds);
    }
    
    return current <= limit;
  } catch (error) {
    logger.error('Rate limit check failed, allowing request:', { key, error: error instanceof Error ? error.message : 'Unknown' }, error as Error);
    // On error, allow the request (fail open)
    return true;
  }
}

/**
 * Check rate limit and throw error if exceeded
 */
export async function enforceRateLimit(
  key: string,
  limit: number,
  windowMs: number = 60 * 1000
): Promise<void> {
  const allowed = await checkRateLimit(key, limit, windowMs);
  
  if (!allowed) {
    logger.warn('Rate limit exceeded', { key, limit });
    throw new RateLimitError('Too many requests. Please try again later.');
  }
}

/**
 * Get rate limit info
 */
export async function getRateLimitInfo(
  key: string,
  limit: number,
  windowMs: number = 60 * 1000
): Promise<{
  remaining: number;
  resetTime: number;
  isLimited: boolean;
}> {
  try {
    const redis = await getRedis();
    const redisKey = `rate-limit:${key}`;
    
    const ttl = await redis.ttl(redisKey);
    const current = await redis.get(redisKey);
    const count = parseInt(current || '0');
    
    const remaining = Math.max(0, limit - count);
    const resetTime = ttl > 0 ? Date.now() + (ttl * 1000) : Date.now() + windowMs;
    
    return {
      remaining,
      resetTime,
      isLimited: remaining === 0,
    };
  } catch (error) {
    logger.error('Failed to get rate limit info:', { key, error: error instanceof Error ? error.message : 'Unknown' }, error as Error);
    return {
      remaining: limit,
      resetTime: Date.now() + windowMs,
      isLimited: false,
    };
  }
}

/**
 * Reset rate limit for a key
 */
export async function resetRateLimit(key: string): Promise<void> {
  try {
    const redis = await getRedis();
    await redis.del(`rate-limit:${key}`);
    logger.debug('Rate limit reset', { key });
  } catch (error) {
    logger.error('Failed to reset rate limit:', { key, error: error instanceof Error ? error.message : 'Unknown' }, error as Error);
  }
}

/**
 * Rate limit types with common configs
 */
export const rateLimitConfigs = {
    // Auth endpoints
    login: { limit: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
    register: { limit: 3, windowMs: 60 * 60 * 1000 }, // 3 attempts per hour
    sendOtp: { limit: 3, windowMs: 60 * 60 * 1000 }, // 3 OTPs per hour
    verifyOtp: { limit: 5, windowMs: 10 * 60 * 1000 }, // 5 attempts per 10 minutes

    // API endpoints
    api: { limit: 100, windowMs: 60 * 1000 }, // 100 requests per minute
    create: { limit: 30, windowMs: 60 * 60 * 1000 }, // 30 creates per hour
    delete: { limit: 10, windowMs: 60 * 60 * 1000 }, // 10 deletes per hour
};

/**
 * Get rate limit key from request
 */
export function getRateLimitKey(
    identifier: string,
    endpoint: string,
    useIp?: string
): string {
    return `${endpoint}:${identifier}${useIp ? `:${useIp}` : ''}`;
}

const rateFunctions = {
    checkRateLimit,
    getRateLimitInfo,
    resetRateLimit,
    // clearAllRateLimits,
    // cleanupExpiredRateLimits,
    rateLimitConfigs,
    getRateLimitKey,
};

export default rateFunctions;