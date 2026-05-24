import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

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

    let userId: string;
    try {
      const payload = verifyToken(token);
      userId = payload.userId;
      console.log('[/api/auth/me] JWT verified, userId:', userId);
    } catch (jwtError) {
      console.error('[/api/auth/me] JWT verify failed:', jwtError);
      return NextResponse.json({ success: false, error: 'Invalid or expired token' }, { status: 401 });
    }

    if (!userId) {
      console.error('[/api/auth/me] No userId in token payload');
      return NextResponse.json({ success: false, error: 'No userId in token' }, { status: 401 });
    }

    // Hardcoded admin shortcut — /api/admin/login signs a JWT with
    // userId='admin' for the env-credentialed admin, which has no
    // DB row. Without this, the DB lookup below 401s and AdminLayout
    // bounces the user back to the login page.
    if (userId === 'admin') {
      return NextResponse.json({
        success: true,
        user: {
          id: 'admin',
          name: 'Admin',
          email: process.env.ADMIN_EMAIL || 'admin@bell24h.com',
          phone: '',
          company: null,
          role: 'ADMIN',
          isVerified: true,
          isActive: true,
          gstNumber: null,
          location: null,
          avatar: null,
          preferences: null,
          lastLoginAt: null,
        },
      });
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
