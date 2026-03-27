import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * TEMPORARY DEMO LOGIN - For testing without MSG91
 * 
 * ⚠️ WARNING: This is a temporary bypass for testing purposes.
 * Remove this route before production deployment.
 * 
 * Sets demo authentication cookies to allow dashboard access.
 */
export async function POST(request: NextRequest) {
  try {
    const demoEmail = 'demo-user@bell24h.com';
    const user = await prisma.user.upsert({
      where: { email: demoEmail },
      update: { isActive: true },
      create: { email: demoEmail, name: 'Demo User', phone: '9999999999', role: 'BUYER', isActive: true },
    });
    const response = NextResponse.json({
      success: true,
      message: 'Demo login successful',
      user: { id: user.id, name: user.name ?? 'Demo User', mobile: user.phone ?? '9999999999', role: 'buyer', company: 'Demo Company' },
      token: 'demo_token_temporary_bypass',
      demo: true,
    });

    // Set demo authentication cookies (middleware checks these)
    response.cookies.set('auth_token', 'demo_token_temporary_bypass', {
      httpOnly: false, // Allow client-side access
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    response.cookies.set('session_id', 'demo_session_temporary_bypass', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    // Also set in localStorage-compatible header for client
    response.headers.set('X-Demo-Login', 'true');

    return response;
  } catch (error) {
    console.error('Demo login error:', error);
    return NextResponse.json(
      { success: false, message: 'Demo login failed' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for demo login (allows direct link access)
 */
export async function GET(request: NextRequest) {
  const response = await POST(request);
  
  // Redirect to dashboard after setting cookies
  if (response instanceof NextResponse && response.status === 200) {
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }
  
  return response;
}

