import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ============= ROUTE CONFIGURATIONS =============

const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/verify-email',
  '/verify-login',
  '/forgot-password',
  '/reset-password',
  '/products',
  '/about',
  '/contact',
  '/terms',
  '/privacy',
];

const PUBLIC_API_ROUTES = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/otp/send-otp',
  '/api/auth/otp/verify-otp',
  '/api/auth/reset-password',
  '/api/auth/refresh',
  '/api/health',
  '/api/products',
  '/api/categories',
];

const AUTH_ROUTES = [
  '/login',
  '/register',
  '/verify-email',
  '/verify-login',
  '/forgot-password',
  '/reset-password',
];

const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

// ============= HELPERS =============

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => {
    if (route === '/') return pathname === '/';
    return pathname.startsWith(route);
  });
}

function isPublicApiRoute(pathname: string): boolean {
  return PUBLIC_API_ROUTES.some((route) => pathname.startsWith(route));
}

function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some((route) => pathname.startsWith(route));
}

/**
 * Add comprehensive security headers
 * OWASP recommendations for production
 */
function addSecurityHeaders(response: NextResponse, request: NextRequest): NextResponse {
  // Prevent MIME-type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');
  
  // XSS Protection (legacy, but doesn't hurt)
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Referrer Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions Policy (formerly Feature Policy)
  response.headers.set(
    'Permissions-Policy',
    'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()'
  );

  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // ← Can be stricter in production
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');
  
  response.headers.set('Content-Security-Policy', csp);

  // Production-only strict security headers
  if (process.env.NODE_ENV === 'production') {
    // HSTS: Force HTTPS for 1 year
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );

    // Disable MIME type inference
    response.headers.set('X-Content-Type-Options', 'nosniff');
  }

  return response;
}

/**
 * Verify CSRF token for state-changing requests
 */
async function verifyCsrf(request: NextRequest): Promise<boolean> {
  // Only verify for non-safe methods
  if (SAFE_METHODS.includes(request.method)) {
    return true;
  }

  const csrfToken = request.headers.get('x-csrf-token');
  const sessionId = request.cookies.get('sessionId')?.value;

  // For now, CSRF verification will be in API route handlers
  // This is a placeholder for future enhancement
  if (!csrfToken && !sessionId) {
    return false;
  }

  return true;
}

// ============= MIDDLEWARE =============

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // ✅ Allow public routes
  if (isPublicRoute(pathname) && !isAuthRoute(pathname)) {
    return addSecurityHeaders(NextResponse.next(), request);
  }

  // ✅ Allow public API routes
  if (isPublicApiRoute(pathname)) {
    const response = NextResponse.next();
    return addSecurityHeaders(response, request);
  }

  // ✅ Get access token
  const accessToken = request.cookies.get('accessToken')?.value;

  // ✅ If on auth page and has token, redirect to dashboard
  if (isAuthRoute(pathname)) {
    if (accessToken) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return addSecurityHeaders(NextResponse.next(), request);
  }

  // ✅ Protected routes - require authentication
  if (!accessToken) {
    if (pathname.startsWith('/api/')) {
      // API request without token
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized - Please login',
          code: 'UNAUTHORIZED',
        },
        { status: 401 }
      );
    }

    // Frontend route without token - redirect to login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ✅ CSRF verification for state-changing API requests
  if (pathname.startsWith('/api/') && !SAFE_METHODS.includes(request.method)) {
    const isCsrfValid = await verifyCsrf(request);
    
    if (!isCsrfValid) {
      return NextResponse.json(
        {
          success: false,
          message: 'CSRF token invalid or missing',
          code: 'CSRF_INVALID',
        },
        { status: 403 }
      );
    }
  }

  // ✅ Token exists - allow request
  // API routes will verify token validity and signature
  const response = NextResponse.next();
  return addSecurityHeaders(response, request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ttf|woff|woff2)$).*)',
  ],
};