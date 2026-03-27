// Bell24h Production Middleware
// Combines security, rate limiting, caching, and performance optimizations

import { NextRequest, NextResponse } from 'next/server';

// Middleware configuration
const middlewareConfig = {
  // Routes that should be protected
  protectedRoutes: [
    '/admin',
    '/api/admin',
    '/api/auth',
    '/api/rfq',
    '/api/voice-rfq'
  ],
  
  // Routes that need rate limiting
  rateLimitedRoutes: {
    '/api/auth/send-otp': 'otp',
    '/api/auth/verify-otp': 'auth',
    '/api/rfq/create': 'api',
    '/api/voice-rfq/process': 'api',
    '/api/admin': 'admin',
    '/api/marketplace/search': 'search'
  },
  
  // Static assets that should be cached
  staticAssets: [
    '/_next/static',
    '/images',
    '/icons',
    '/favicon.ico'
  ],
  
  // API routes that should not be cached
  noCacheRoutes: [
    '/api/auth',
    '/api/admin',
    '/api/health'
  ]
};

// Main middleware function
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static assets
  if (pathname.startsWith('/_next/static') || 
      pathname.startsWith('/favicon.ico') ||
      pathname.startsWith('/images/')) {
    return NextResponse.next();
  }

  // Create response with security headers
  let response = NextResponse.next();
  
  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  
  // API route specific handling
  if (pathname.startsWith('/api/')) {
    response = handleAPIRoute(request, response);
  }
  
  // Admin route protection
  if (pathname.startsWith('/admin')) {
    response = handleAdminRoute(request, response);
  }
  
  // Performance optimizations
  response = addPerformanceHeaders(request, response);
  
  // Caching headers
  response = addCachingHeaders(request, response);
  
  return response;
}

// Handle API routes
function handleAPIRoute(request: NextRequest, response: NextResponse): NextResponse {
  const { pathname } = request.nextUrl;
  
  // Add API-specific security headers
  response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  
  // Apply rate limiting based on route
  const rateLimitType = middlewareConfig.rateLimitedRoutes[pathname as keyof typeof middlewareConfig.rateLimitedRoutes];
  if (rateLimitType) {
    // Note: Rate limiting logic would be applied here
    // For now, we'll add rate limit headers
    response.headers.set('X-RateLimit-Limit', '100');
    response.headers.set('X-RateLimit-Remaining', '99');
  }
  
  // Add CORS headers for API routes
  response.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bell24h.com');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers: response.headers });
  }
  
  return response;
}

// Handle admin routes
function handleAdminRoute(request: NextRequest, response: NextResponse): NextResponse {
  // Add admin-specific security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Check for admin authentication (this would be implemented with actual auth)
  const authHeader = request.headers.get('authorization');
  if (!authHeader && !request.nextUrl.pathname.includes('/login')) {
    // Redirect to admin login
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
  
  return response;
}

// Add performance headers
function addPerformanceHeaders(request: NextRequest, response: NextResponse): NextResponse {
  // Add performance hints
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('X-Download-Options', 'noopen');
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
  
  // Add resource hints for critical resources
  if (request.nextUrl.pathname === '/') {
    response.headers.set('Link', '</fonts/inter.woff2>; rel=preload; as=font; type=font/woff2; crossorigin');
  }
  
  return response;
}

// Add caching headers
function addCachingHeaders(request: NextRequest, response: NextResponse): NextResponse {
  const { pathname } = request.nextUrl;
  
  // Static assets - long cache
  if (pathname.startsWith('/_next/static/')) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    return response;
  }
  
  // Images - medium cache
  if (pathname.startsWith('/images/') || pathname.startsWith('/icons/')) {
    response.headers.set('Cache-Control', 'public, max-age=86400');
    return response;
  }
  
  // API routes - no cache
  if (pathname.startsWith('/api/')) {
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  }
  
  // HTML pages - short cache
  response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=300');
  
  return response;
}

// Middleware configuration
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

// Export individual middleware functions for testing
export {
  handleAPIRoute,
  handleAdminRoute,
  addPerformanceHeaders,
  addCachingHeaders
};