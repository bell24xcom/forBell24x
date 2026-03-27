import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function adminMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to admin login page
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  // Check for admin session cookie
  const adminSession = request.cookies.get('admin_session')?.value;

  if (!adminSession) {
    console.log('🚫 Admin access denied - no session');
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  // In production, validate the session token properly
  // For now, just check if it exists and looks valid
  if (!adminSession.startsWith('admin_')) {
    console.log('🚫 Admin access denied - invalid session');
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  console.log('✅ Admin access granted to:', pathname);
  return NextResponse.next();
} 
