import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

// Use the exact same secret and fallback as lib/jwt.ts generateToken
const JWT_SECRET = (() => {
  const s = process.env.JWT_SECRET;
  if (!s || s === 'bell24h_jwt_secret_change_in_production') {
    return 'dev_only_jwt_secret_not_for_production';
  }
  return s;
})();

export async function GET(request: NextRequest) {
  console.log('[/api/auth/me] Called');

  try {
    const token =
      request.cookies.get('auth-token')?.value ||
      request.cookies.get('admin-token')?.value;

    console.log('[/api/auth/me] Token exists:', !!token);

    if (!token) {
      return NextResponse.json({ success: false, error: 'No token' }, { status: 401 });
    }

    let payload: { userId?: string; id?: string; sub?: string; role?: string; phone?: string };
    try {
      payload = jwt.verify(token, JWT_SECRET) as typeof payload;
      console.log('[/api/auth/me] JWT verified, userId:', payload.userId || payload.id || payload.sub);
    } catch (jwtError) {
      console.error('[/api/auth/me] JWT verify failed:', jwtError);
      return NextResponse.json({ success: false, error: 'Invalid or expired token' }, { status: 401 });
    }

    const userId = payload.userId || payload.id || payload.sub;
    if (!userId) {
      console.error('[/api/auth/me] No userId in token payload:', payload);
      return NextResponse.json({ success: false, error: 'No userId in token' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
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

    console.log('[/api/auth/me] User found:', !!user, 'Role:', user?.role, 'Active:', user?.isActive);

    if (!user || !user.isActive) {
      return NextResponse.json({ success: false, error: 'User not found or deactivated' }, { status: 401 });
    }

    return NextResponse.json({ success: true, user });

  } catch (error) {
    console.error('[/api/auth/me] Unhandled error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
