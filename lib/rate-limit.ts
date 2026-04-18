// lib/rate-limit.ts
/**
 * Simple in-memory rate limiting
 * For production, use Redis or similar
 */

interface RateLimitStore {
    [key: string]: {
        count: number;
        resetTime: number;
    };
}

const store: RateLimitStore = {};

/**
 * Check if request is rate limited
 * Returns true if allowed, false if rate limited
 */
export function checkRateLimit(
    key: string,
    limit: number,
    windowMs: number = 60 * 1000 // 1 minute default
): boolean {
    const now = Date.now();
    const record = store[key];

    // First request
    if (!record) {
        store[key] = { count: 1, resetTime: now + windowMs };
        return true;
    }

    // Window expired, reset
    if (now > record.resetTime) {
        store[key] = { count: 1, resetTime: now + windowMs };
        return true;
    }

    // Window active, check limit
    if (record.count < limit) {
        record.count++;
        return true;
    }

    // Rate limited
    return false;
}

/**
 * Get remaining attempts
 */
export function getRateLimitInfo(
    key: string,
    limit: number,
    windowMs: number = 60 * 1000
): {
    remaining: number;
    resetTime: number;
    isLimited: boolean;
} {
    const now = Date.now();
    const record = store[key];

    if (!record || now > record.resetTime) {
        return {
            remaining: limit,
            resetTime: now + windowMs,
            isLimited: false,
        };
    }

    const remaining = Math.max(0, limit - record.count);
    return {
        remaining,
        resetTime: record.resetTime,
        isLimited: remaining === 0,
    };
}

/**
 * Reset rate limit for a key
 */
export function resetRateLimit(key: string): void {
    delete store[key];
}

/**
 * Clear all rate limits
 */
export function clearAllRateLimits(): void {
    Object.keys(store).forEach((key) => delete store[key]);
}

/**
 * Cleanup expired records (run periodically)
 */
export function cleanupExpiredRateLimits(): number {
    const now = Date.now();
    let cleaned = 0;

    Object.entries(store).forEach(([key, record]) => {
        if (now > record.resetTime) {
            delete store[key];
            cleaned++;
        }
    });

    return cleaned;
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
    clearAllRateLimits,
    cleanupExpiredRateLimits,
    rateLimitConfigs,
    getRateLimitKey,
};

export default rateFunctions;