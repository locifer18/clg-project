# 🚨 CRITICAL SECURITY FIXES - IMPLEMENTATION GUIDE

## Week 1: Security Hardening (Most Important)

### 1️⃣ FIX HTTP-ONLY COOKIES (CRITICAL)

Create file: `app/api/auth/login/verify-otp/route.ts` - Update to set HTTP-Only cookies:

```typescript
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { verifyLoginOtp } from '@/services/AuthSerive';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, code } = body;

    // Get request metadata
    const userAgent = request.headers.get('user-agent') || undefined;
    const forwarded = request.headers.get('x-forwarded-for');
    const ipAddress = forwarded ? forwarded.split(',')[0] : undefined;

    // Verify OTP and get tokens
    const result = await verifyLoginOtp({ email, code }, request);
    
    // ✅ FIX: Set HTTP-Only cookies
    const cookieStore = await cookies();
    
    cookieStore.set('accessToken', result.accessToken, {
      httpOnly: true,          // ← CRITICAL: Cannot be accessed by JS
      secure: process.env.NODE_ENV === 'production', // ← HTTPS only
      sameSite: 'strict',      // ← CSRF protection
      maxAge: 15 * 60 * 1000,  // ← 15 minutes (NOT 7 days!)
      path: '/',
    });

    cookieStore.set('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // ← 7 days for refresh
      path: '/',
    });

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: result.user,
    });
  } catch (error) {
    // Error handling...
  }
}
```

---

### 2️⃣ FIX JWT SECRET VALIDATION (CRITICAL)

Update: `lib/jwt.ts`

```typescript
import { TokenPayload } from '@/types';
import jwt, { Secret } from 'jsonwebtoken';

// ✅ FIX: Proper validation
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = process.env.JWT_EXPIRY || '15m'; // ← Changed from 7d!
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d';

// Validate at startup
if (process.env.NODE_ENV === 'production') {
  if (!JWT_SECRET) {
    throw new Error('❌ JWT_SECRET environment variable is required in production');
  }
  
  if (JWT_SECRET.length < 32) {
    throw new Error('❌ JWT_SECRET must be at least 32 characters in production. Current: ' + JWT_SECRET.length);
  }
}

export function signToken(payload: TokenPayload): string {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  try {
    const token = jwt.sign(payload, JWT_SECRET as Secret, {
      expiresIn: JWT_EXPIRY, // ← 15 minutes now
      algorithm: 'HS256',
    });
    return token;
  } catch (error) {
    console.error('Failed to sign token:', error);
    throw new Error('Token signing failed');
  }
}

export function signRefreshToken(payload: TokenPayload): string {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  try {
    const token = jwt.sign(payload, JWT_SECRET as Secret, {
      expiresIn: REFRESH_TOKEN_EXPIRY, // ← 7 days
      algorithm: 'HS256',
    });
    return token;
  } catch (error) {
    console.error('Failed to sign refresh token:', error);
    throw new Error('Refresh token signing failed');
  }
}

export function verifyToken(token: string): TokenPayload | null {
  if (!JWT_SECRET) {
    console.error('JWT_SECRET is not configured');
    return null;
  }

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

// ... rest of the file
```

---

### 3️⃣ IMPLEMENT REDIS RATE LIMITING (CRITICAL)

Install Redis:
```bash
npm install redis ioredis
```

Create: `lib/redis.ts`

```typescript
import { createClient } from 'redis';

const redis = createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
});

redis.on('error', (err) => console.error('Redis Client Error:', err));
redis.on('connect', () => console.log('✅ Redis connected'));

export const connectRedis = async () => {
  if (!redis.isOpen) {
    await redis.connect();
  }
};

export default redis;
```

Update: `lib/rate-limit.ts` - Use Redis instead:

```typescript
import redis from './redis';
import { RateLimitError } from './errors';

/**
 * Check rate limit using Redis
 * Returns true if allowed, false if rate limited
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number = 60 * 1000 // 1 minute
): Promise<boolean> {
  await connectRedis();
  
  const current = await redis.incr(`rate-limit:${key}`);
  
  if (current === 1) {
    // First request, set expiry
    await redis.expire(`rate-limit:${key}`, Math.ceil(windowMs / 1000));
  }
  
  return current <= limit;
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
  await connectRedis();
  
  const ttl = await redis.ttl(`rate-limit:${key}`);
  const current = await redis.get(`rate-limit:${key}`);
  const count = parseInt(current || '0');
  
  return {
    remaining: Math.max(0, limit - count),
    resetTime: Date.now() + (ttl * 1000),
    isLimited: count >= limit,
  };
}

/**
 * Reset rate limit for a key
 */
export async function resetRateLimit(key: string): Promise<void> {
  await connectRedis();
  await redis.del(`rate-limit:${key}`);
}
```

Update: `services/OtpServise.ts` - Use Redis:

```typescript
import redis from '@/lib/redis';

const checkOtpRateLimit = async (email: string): Promise<boolean> => {
  const limit = 3; // 3 OTP requests per hour
  const windowMs = 60 * 60 * 1000; // 1 hour
  
  return checkRateLimit(`otp:${email}`, limit, windowMs);
};

export async function sendOtpService(data: SendOtpRequest) {
  const { email, type } = data;

  // ✅ Now using Redis-backed rate limiting
  if (!(await checkOtpRateLimit(email))) {
    throw new RateLimitError('Too many OTP requests. Try again after 1 hour.');
  }

  // ... rest of the function
}
```

---

### 4️⃣ IMPLEMENT CSRF PROTECTION (CRITICAL)

Install:
```bash
npm install csrf
```

Create: `lib/csrf.ts`

```typescript
import Csrf from 'csrf';
import redis from './redis';

const csrf = new Csrf();

/**
 * Generate CSRF token for a session
 */
export async function generateCsrfToken(sessionId: string): Promise<string> {
  await connectRedis();
  
  const secret = csrf.secretSync();
  const token = csrf.create(secret);
  
  // Store secret in Redis with session
  await redis.setex(`csrf:${sessionId}`, 24 * 60 * 60, secret);
  
  return token;
}

/**
 * Verify CSRF token
 */
export async function verifyCsrfToken(sessionId: string, token: string): Promise<boolean> {
  await connectRedis();
  
  const secret = await redis.get(`csrf:${sessionId}`);
  if (!secret) return false;
  
  return csrf.verify(secret, token);
}
```

Update: `middleware.ts` - Add CSRF to API routes:

```typescript
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ✅ Skip CSRF check for GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    return addSecurityHeaders(NextResponse.next());
  }

  // ✅ Skip CSRF for public routes
  if (isPublicApiRoute(pathname)) {
    return addSecurityHeaders(NextResponse.next());
  }

  // ✅ Verify CSRF token for POST, PUT, DELETE, PATCH
  const csrfToken = request.headers.get('x-csrf-token');
  const sessionId = request.cookies.get('sessionId')?.value;

  if (!csrfToken || !sessionId) {
    return errorResponse(request, 403, 'Missing CSRF token');
  }

  const isValidCsrf = await verifyCsrfToken(sessionId, csrfToken);
  if (!isValidCsrf) {
    return errorResponse(request, 403, 'Invalid CSRF token');
  }

  return addSecurityHeaders(NextResponse.next());
}
```

---

### 5️⃣ IMPLEMENT LOGOUT & SESSION REVOCATION (CRITICAL)

Create: `app/api/auth/logout/route.ts`

```typescript
import { NextResponse, NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { getUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    
    if (!user) {
      return errorResponse(request, 401, 'Not authenticated');
    }

    // Get current session ID from token or DB
    const token = request.cookies.get('accessToken')?.value;
    
    if (token) {
      // Find and delete current session
      const session = await prisma.session.deleteMany({
        where: {
          userId: user.id,
          accessToken: token,
        },
      });
    }

    // ✅ Increment token version to invalidate all sessions if needed
    // Optional: logout all devices
    const logoutAllDevices = request.headers.get('x-logout-all-devices') === 'true';
    
    if (logoutAllDevices) {
      await prisma.user.update({
        where: { id: user.id },
        data: { tokenVersion: { increment: 1 } },
      });
    }

    // Clear cookies
    const cookieStore = await cookies();
    cookieStore.delete('accessToken');
    cookieStore.delete('refreshToken');
    cookieStore.delete('sessionId');

    return successResponse('Logged out successfully');
  } catch (error) {
    console.error('Logout error:', error);
    return errorResponse(request, 500, 'Logout failed');
  }
}
```

---

### 6️⃣ IMPLEMENT ACCOUNT LOCKOUT (HIGH)

Update: `services/AuthSerive.ts` - Add lockout logic:

```typescript
export async function loginUser(data: LoginRequest & { password: string }) {
  const { email, password } = data;

  if (!email || !password) {
    throw new ValidationError('Email and password required');
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AuthenticationError('Invalid credentials');
  }

  // ✅ NEW: Check if account is locked
  if (user.isLocked && user.lockedUntil && new Date() < user.lockedUntil) {
    throw new AuthenticationError(
      `Account locked. Try again after ${user.lockedUntil.toLocaleString()}`
    );
  }

  if (!user.emailVerified) {
    throw new AuthenticationError('Please verify your email first');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password || '');

  if (!isPasswordValid) {
    // ✅ NEW: Increment failed attempts and lock if needed
    const newAttempts = user.loginAttempts + 1;
    const isLocked = newAttempts >= 5;
    
    await prisma.user.update({
      where: { id: user.id },
      data: {
        loginAttempts: newAttempts,
        ...(isLocked && {
          isLocked: true,
          lockedUntil: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
        }),
      },
    });

    if (isLocked) {
      throw new AuthenticationError(
        'Too many failed attempts. Account locked for 30 minutes.'
      );
    }

    throw new AuthenticationError(`Invalid credentials (${5 - newAttempts} attempts remaining)`);
  }

  // ✅ NEW: Reset attempts on successful password
  if (user.loginAttempts > 0) {
    await prisma.user.update({
      where: { id: user.id },
      data: { loginAttempts: 0, isLocked: false, lockedUntil: null },
    });
  }

  // Send OTP
  await sendOtpService({
    email,
    type: 'LOGIN_VERIFICATION',
  });

  return {
    message: 'OTP sent to your email',
    nextStep: 'VERIFY_LOGIN_OTP',
  };
}
```

---

## Week 2-3: Additional Hardening

### 7️⃣ ADD PASSWORD COMPROMISE CHECKING

Install:
```bash
npm install axios
```

Create: `lib/password-check.ts`

```typescript
import axios from 'axios';
import crypto from 'crypto';

/**
 * Check if password has been compromised using Have I Been Pwned API
 * Uses k-anonymity model (only sends first 5 chars of hash)
 */
export async function isPasswordCompromised(password: string): Promise<boolean> {
  try {
    // Hash password with SHA-1
    const hash = crypto.createHash('sha1').update(password).digest('hex').toUpperCase();
    const prefix = hash.substring(0, 5);
    const suffix = hash.substring(5);

    // Query HIBP API (only sends prefix)
    const response = await axios.get(
      `https://api.pwnedpasswords.com/range/${prefix}`,
      { timeout: 5000 }
    );

    // Check if our suffix is in the response
    const hashes = response.data.split('\r\n');
    for (const hashLine of hashes) {
      const [respSuffix] = hashLine.split(':');
      if (respSuffix === suffix) {
        return true; // Password is compromised
      }
    }

    return false; // Password is safe
  } catch (error) {
    // If API fails, allow the request (don't block user)
    console.error('Password check API error:', error);
    return false;
  }
}
```

Update: `lib/validation.ts` - Add to password schema:

```typescript
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters') // ← Changed from 12
  .max(128, 'Password too long')
  .refine(async (pass) => !(await isPasswordCompromised(pass)), 
    'This password has been compromised. Choose a different one.');
```

---

### 8️⃣ ADD INPUT SANITIZATION

Install:
```bash
npm install isomorphic-dompurify
```

Update: `services/AuthSerive.ts` - Sanitize inputs:

```typescript
import DOMPurify from 'isomorphic-dompurify';

export async function registerUser(data: RegisterRequest) {
  const { name, email, password, phone } = data;

  // ✅ Sanitize inputs
  const cleanName = DOMPurify.sanitize(name).trim();
  const cleanEmail = DOMPurify.sanitize(email).toLowerCase().trim();
  const cleanPhone = phone ? DOMPurify.sanitize(phone) : null;

  // Validate
  if (!cleanName || !cleanEmail || !password) {
    throw new ValidationError('Invalid input');
  }

  // ... rest of function
}
```

---

## Environment Variables (.env.example)

Create: `.env.example`

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/clg_db

# JWT & Sessions
JWT_SECRET=your-very-long-secret-key-at-least-32-characters-for-production
JWT_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# Redis (for rate limiting, caching, sessions)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Email
EMAIL_USER=noreply@example.com
EMAIL_PASS=your-app-password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_FROM=noreply@example.com

# NextAuth
NEXTAUTH_SECRET=your-nextauth-secret-change-this
NEXTAUTH_URL=http://localhost:3000

# OTP
OTP_SECRET=your-otp-secret

# Environment
NODE_ENV=development

# Logging
LOG_LEVEL=info

# Security
ALLOWED_ORIGINS=http://localhost:3000

# Payment (Razorpay)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# AWS S3 (for file uploads)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=
AWS_S3_REGION=
```

---

## Testing the Fixes

```bash
# 1. Create .env.local with proper secrets
cp .env.example .env.local

# 2. Start Redis
redis-server

# 3. Run database migrations
npx prisma migrate dev

# 4. Start development server
npm run dev

# 5. Test login flow with HTTP-Only cookies:
curl -c cookies.txt http://localhost:3000/api/auth/login
curl -b cookies.txt http://localhost:3000/api/auth/me  # Should work

# 6. Verify no token in cookies (should be httpOnly)
cat cookies.txt # accessToken should NOT appear here
```

---

## Summary of Changes

| Item | Status | Impact | Timeline |
|------|--------|--------|----------|
| HTTP-Only Cookies | ✅ | CRITICAL | 2 hours |
| JWT Secret Validation | ✅ | CRITICAL | 1 hour |
| Redis Rate Limiting | ✅ | CRITICAL | 4 hours |
| CSRF Protection | ✅ | CRITICAL | 3 hours |
| Session Logout | ✅ | CRITICAL | 2 hours |
| Account Lockout | ✅ | HIGH | 2 hours |
| Password Compromise Check | ✅ | HIGH | 2 hours |
| Input Sanitization | ✅ | MEDIUM | 1 hour |
| **Total** | | | **~17 hours** |

**You can complete all CRITICAL fixes in 1-2 days of focused work!** 🚀
