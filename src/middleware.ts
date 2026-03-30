import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Protects /admin (requires admin-token cookie) and
 * /dashboard + /rfq/create (requires auth-token cookie).
 */
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // ── Admin protection ──────────────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    // Login page is always accessible
    if (pathname === '/admin/login') {
      return NextResponse.next()
    }
    const adminToken = request.cookies.get('admin-token')?.value
    if (!adminToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    return NextResponse.next()
  }

  // ── Regular user protection ───────────────────────────────────────
  const token = request.cookies.get('auth-token')?.value
  const isProtected =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/supplier') ||
    pathname.startsWith('/rfq/create') ||
    pathname.startsWith('/checkout') ||
    pathname.startsWith('/wallet') ||
    pathname.startsWith('/messages') ||
    pathname.startsWith('/notifications') ||
    pathname.startsWith('/negotiation')

  if (isProtected && !token) {
    const loginUrl = new URL('/auth/phone-email', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/supplier/:path*',
    '/rfq/create',
    '/checkout/:path*',
    '/wallet/:path*',
    '/messages/:path*',
    '/notifications',
    '/negotiation/:path*',
  ],
}
