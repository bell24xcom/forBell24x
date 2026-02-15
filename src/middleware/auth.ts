import { NextRequest, NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function authMiddleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Get session
  const { data: { session } } = await supabase.auth.getSession();

  // Protected routes that require authentication
  const protectedRoutes = [
    '/dashboard',
    '/dashboard/wallet',
    '/dashboard/payments',
    '/dashboard/profile',
    '/rfq/create',
    '/supplier/contact'
  ];

  const isProtectedRoute = protectedRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  );

  // If accessing protected route without session, redirect to login
  if (isProtectedRoute && !session) {
    const loginUrl = new URL('/auth/login', req.url);
    loginUrl.searchParams.set('redirect', req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If accessing login page with session, redirect to dashboard
  if (req.nextUrl.pathname === '/auth/login' && session) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return res;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/auth/:path*',
    '/rfq/:path*',
    '/supplier/:path*'
  ]
};
