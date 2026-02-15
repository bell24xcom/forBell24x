import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Protects /dashboard and /rfq/create: redirects to login if no auth cookie.
 * Set cookie "bell24h_token" in verify-otp response (or from client after login) for this to work.
 */
export function middleware(request: NextRequest) {
  const token = request.cookies.get('bell24h_token')?.value
  const isProtected =
    request.nextUrl.pathname.startsWith('/dashboard') ||
    request.nextUrl.pathname.startsWith('/rfq/create')

  if (isProtected && !token) {
    const loginUrl = new URL('/auth/login-otp', request.url)
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/rfq/create'],
}
