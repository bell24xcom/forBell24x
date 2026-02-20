import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateToken } from '@/lib/jwt';
import { authLogger } from '@/lib/logger';
import { errorLogger } from '@/lib/errorLogger';

export const dynamic = 'force-dynamic';

function normalizePhone(raw: string): string | null {
  const cleaned = raw.replace(/[\s\-\(\)]/g, '').replace(/^\+91/, '').replace(/^91/, '');
  return /^\d{10}$/.test(cleaned) ? cleaned : null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const accessToken = body.accessToken?.toString() || '';
    const rawPhone = body.phone?.toString() || '';
    const phone = normalizePhone(rawPhone);

    if (!accessToken || !phone) {
      return NextResponse.json(
        { success: false, message: 'Access token and phone number required' },
        { status: 400 }
      );
    }

    // Verify the MSG91 widget access-token with MSG91 servers
    const AUTH_KEY = process.env.MSG91_AUTH_KEY;
    if (!AUTH_KEY) {
      authLogger.error('MSG91_AUTH_KEY not configured for widget verification');
      return NextResponse.json(
        { success: false, message: 'Authentication service not configured' },
        { status: 500 }
      );
    }

    const verifyResponse = await fetch('https://control.msg91.com/api/v5/widget/verifyAccessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ authkey: AUTH_KEY, 'access-token': accessToken }),
    });

    const verifyResult = await verifyResponse.json();

    if (!verifyResponse.ok || verifyResult.type !== 'success') {
      authLogger.warn('MSG91 widget token verification failed', {
        phone: `${phone.slice(0, 5)}*****`,
        msg91Response: verifyResult.message,
      });
      return NextResponse.json(
        { success: false, message: 'OTP verification failed. Please try again.' },
        { status: 401 }
      );
    }

    // Token verified — find or create user
    let user = await prisma.user.findUnique({ where: { phone } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          phone,
          name: `User ${phone.slice(-4)}`,
          email: `${phone}@bell24h.com`,
          company: '',
          role: 'SUPPLIER',
          isActive: true,
          isVerified: true,
          trustScore: 30,
          lastLoginAt: new Date(),
        },
      });
      authLogger.info('New user created via widget OTP', { userId: user.id, phone: `${phone.slice(0, 5)}*****` });
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true, isActive: true, lastLoginAt: new Date() },
      });
    }

    const token = generateToken({ userId: user.id, phone: user.phone ?? phone, role: user.role });

    authLogger.info('User authenticated via MSG91 widget', { userId: user.id });

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        company: user.company,
        role: user.role,
        isVerified: user.isVerified,
      },
      token,
    });

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;

  } catch (error) {
    authLogger.error('Widget OTP verify error', { error });
    errorLogger.critical(error, { route: '/api/auth/otp/widget-verify', meta: {} });
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
