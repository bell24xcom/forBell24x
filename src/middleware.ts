import { NextRequest, NextResponse } from 'next/server';

// ─── Rate Limiting ────────────────────────────────────────────────────────────
// Per-instance only — serverless cold starts reset this. For global limiting,
// move to Upstash Redis + @upstash/ratelimit.
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 100;
const ipCache = new Map<string, { count: number; start: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const userData = ipCache.get(ip);

  if (!userData || now - userData.start > RATE_LIMIT_WINDOW) {
    ipCache.set(ip, { count: 1, start: now });
    return false;
  }

  userData.count += 1;
  return userData.count > MAX_REQUESTS;
}

// ─── Content Security Policy ──────────────────────────────────────────────────
const CSP = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com https://www.google-analytics.com https://checkout.razorpay.com https://verify.msg91.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' blob: data: https://*.insforge.app https://*.insforge.site https://www.google-analytics.com https://*.razorpay.com;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://*.insforge.app https://*.insforge.site https://*.nvidia.com https://api.brevo.com https://api.resend.com https://api.razorpay.com https://api.msg91.com https://control.msg91.com https://api.groq.com https://api.openai.com;
  media-src 'self' blob:;
  frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com https://verify.msg91.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`.replace(/\s{2,}/g, ' ').trim();

const PROTECTED_USER_PATHS = [
  '/dashboard',
  '/supplier',
  '/rfq/create',
  '/checkout',
  '/wallet',
  '/messages',
  '/notifications',
  '/negotiation',
];

const FORBIDDEN_PATHS = ['/node_modules', '/.env', '/package.json', '/prisma/schema.prisma'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = request.ip || '127.0.0.1';

  // 1. Path traversal & forbidden paths
  if (FORBIDDEN_PATHS.some(p => pathname.toLowerCase().includes(p)) || pathname.includes('..')) {
    return new NextResponse(null, { status: 403 });
  }

  // 2. Rate limit (skip static assets)
  const isStatic = pathname.startsWith('/_next') || pathname.includes('.');
  if (!isStatic && isRateLimited(ip)) {
    return new NextResponse('Too Many Requests', { status: 429 });
  }

  // 3. Admin protection
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const adminToken = request.cookies.get('admin-token')?.value;
    if (!adminToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // 4. User route protection
  if (PROTECTED_USER_PATHS.some(p => pathname.startsWith(p))) {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      const loginUrl = new URL('/auth/phone-email', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  const response = NextResponse.next();

  // 5. Security headers — applied to every non-static response
  response.headers.set('Content-Security-Policy', CSP);
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Voice/Video RFQ need camera + mic from same origin
  response.headers.set('Permissions-Policy', 'camera=(self), microphone=(self), geolocation=(self)');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  // 6. API cache hardening
  if (pathname.startsWith('/api/')) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
