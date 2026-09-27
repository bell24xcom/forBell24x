import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'Logout successful'
  });

  const cookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 0,
    path: '/',
  };

  // Clear BOTH session cookies. An OTP-widget admin login sets both
  // auth-token and admin-token (see otp/widget-verify/route.ts) -- this
  // route previously cleared only auth-token, leaving admin-token valid
  // and the admin session effectively alive after "logout".
  response.cookies.set('auth-token', '', cookieOpts);
  response.cookies.set('admin-token', '', cookieOpts);

  return response;
}
