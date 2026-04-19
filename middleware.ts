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

function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  response.headers.set(
    'Content-Security-Policy',
    `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';`
  );

  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  return response;
}

// ============= MIDDLEWARE =============

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ✅ Allow public routes
  if (isPublicRoute(pathname) && !isAuthRoute(pathname)) {
    return addSecurityHeaders(NextResponse.next());
  }

  if (isPublicApiRoute(pathname)) {
    return addSecurityHeaders(NextResponse.next());
  }

  // ✅ Get token (don't verify - just check if exists)
  const token = request.cookies.get('accessToken')?.value;

  // ✅ If on auth page and has token, redirect to dashboard
  if (isAuthRoute(pathname)) {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return addSecurityHeaders(NextResponse.next());
  }

  // ✅ If no token, redirect to login
  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ✅ Token exists - allow request
  // API routes will verify token validity
  return addSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};