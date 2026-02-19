import { NextRequest, NextResponse } from 'next/server';
import { generateToken } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    || 'admin@bell24h.com';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password required' },
        { status: 400 }
      );
    }

    if (email.toLowerCase() !== ADMIN_EMAIL.toLowerCase() || password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Issue admin JWT
    const token = generateToken({ userId: 'admin', phone: '', role: 'ADMIN' }, '8h');

    const response = NextResponse.json({
      success: true,
      message: 'Admin login successful',
    });

    response.cookies.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 8 * 60 * 60, // 8 hours
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  // Admin logout — clear the cookie
  const response = NextResponse.json({ success: true, message: 'Logged out' });
  response.cookies.delete('admin-token');
  return response;
}
