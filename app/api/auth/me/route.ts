import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, extractToken } from '@/lib/jwt';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    // Support both Authorization header and auth-token cookie (set by OTP verify)
    const token = extractToken(
      request.headers.get('authorization'),
      request.cookies.get('auth-token')?.value
    );

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    let payload;
    try {
      payload = verifyToken(token);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Session expired. Please log in again.' },
        { status: 401 }
      );
    }

    // Fetch live user record from DB
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        company: true,
        role: true,
        isVerified: true,
        isActive: true,
        gstNumber: true,
        location: true,
        avatar: true,
        preferences: true,
        lastLoginAt: true,
      },
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { success: false, error: 'User not found or deactivated' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        ...user,
        loginMethod: 'otp',
      },
    });

  } catch (error) {
    console.error('GET /api/auth/me error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get user information' },
      { status: 500 }
    );
  }
}
