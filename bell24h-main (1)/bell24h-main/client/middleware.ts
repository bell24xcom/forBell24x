import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const protectedPaths = ['/dashboard', '/admin'];
  const isProtected = protectedPaths.some(path => pathname.startsWith(path));

  const token = request.cookies.get('auth_token')?.value;
  const session = request.cookies.get('session_id')?.value;

  if (isProtected && !token && !session) {
    console.log("No auth, redirecting to login");
    const loginUrl = new URL('/auth/login-otp', request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === '/auth/login-otp' && (token || session)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/auth/login-otp']
};
