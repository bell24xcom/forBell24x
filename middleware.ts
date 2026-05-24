import { NextRequest, NextResponse } from 'next/server';

// ─── Rate Limiting Configuration ──────────────────────────────────────────────
// Note: In serverless (Vercel), this is per-instance. 
// For global limiting, use Upstash Redis + @upstash/ratelimit.
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 100;
const ipCache = new Map<string, { count: number; start: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const userData = ipCache.get(ip);

  if (!userData) {
    ipCache.set(ip, { count: 1, start: now });
    return false;
  }

  if (now - userData.start > RATE_LIMIT_WINDOW) {
    ipCache.set(ip, { count: 1, start: now });
    return false;
  }

  userData.count += 1;
  return userData.count > MAX_REQUESTS;
}

// ─── Content Security Policy ──────────────────────────────────────────────────
const getCSP = () => {
  const csp = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com https://www.google-analytics.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' blob: data: https://*.insforge.app https://*.insforge.site https://www.google-analytics.com;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://*.insforge.app https://*.insforge.site https://*.nvidia.com https://api.brevo.com;
    frame-src 'none';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim();
  return csp;
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = request.ip || '127.0.0.1';

  // ── Admin route protection ────────────────────────────────────────────
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const adminToken = request.cookies.get('admin-token')?.value;
    if (!adminToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }


  // 1. Directory Access & Path Traversal Protection
  const forbiddenPaths = ['/node_modules', '/.env', '/package.json', '/prisma/schema.prisma'];
  if (forbiddenPaths.some(p => pathname.toLowerCase().includes(p)) || pathname.includes('..')) {
    return new NextResponse(null, { status: 403 });
  }

  // 2. Global Rate Limiting (Skip for static assets)
  const isStatic = pathname.startsWith('/_next') || pathname.includes('.');
  if (!isStatic && isRateLimited(ip)) {
    return new NextResponse('Too Many Requests', { status: 429 });
  }

  // 3. Stricter limits for Auth and Marketing APIs
  if (pathname.startsWith('/api/auth') || pathname.startsWith('/api/marketing')) {
    // Logic for even stricter limits could be added here
  }

  const response = NextResponse.next();

  // 4. Secure Headers
  response.headers.set('Content-Security-Policy', getCSP());
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  // 5. Cache Leaks Protection for API
  if (pathname.startsWith('/api/')) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
