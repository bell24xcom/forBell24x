import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateToken } from '@/lib/jwt';
import { authLogger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

function normalizePhone(raw: string): string | null {
  const cleaned = raw.replace(/[\s\-\(\)]/g, '').replace(/^\+91/, '').replace(/^91/, '');
  return /^\d{10}$/.test(cleaned) ? cleaned : null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const rawPhone = body.phone?.toString() || '';
    const otp = body.otp?.toString() || '';
    const phone = normalizePhone(rawPhone);

    if (!phone || !otp || otp.length !== 6) {
      return NextResponse.json(
        { success: false, message: 'Valid phone number and 6-digit OTP required' },
        { status: 400 }
      );
    }

    // Look up OTP record
    const otpRecord = await prisma.oTPVerification.findUnique({ where: { phone } });

    if (!otpRecord) {
      return NextResponse.json(
        { success: false, message: 'OTP not found. Please request a new OTP.' },
        { status: 400 }
      );
    }

    if (otpRecord.isVerified) {
      return NextResponse.json(
        { success: false, message: 'OTP already used. Please request a new OTP.' },
        { status: 400 }
      );
    }

    if (new Date() > otpRecord.expiresAt) {
      return NextResponse.json(
        { success: false, message: 'OTP expired. Please request a new OTP.' },
        { status: 400 }
      );
    }

    if (otpRecord.attempts >= 3) {
      return NextResponse.json(
        { success: false, message: 'Too many attempts. Please request a new OTP.' },
        { status: 429 }
      );
    }

    if (otpRecord.otp !== otp) {
      await prisma.oTPVerification.update({
        where: { phone },
        data: { attempts: otpRecord.attempts + 1 },
      });
      const remaining = 3 - (otpRecord.attempts + 1);
      return NextResponse.json(
        { success: false, message: `Invalid OTP. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.` },
        { status: 400 }
      );
    }

    // OTP valid — mark as used
    await prisma.oTPVerification.update({
      where: { phone },
      data: { isVerified: true },
    });

    // Find or create user
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
          trustScore: 30, // base score: phone verified via OTP
          lastLoginAt: new Date(),
        },
      });
      authLogger.info('New user created', { userId: user.id, phone: `${phone.slice(0, 5)}*****` });
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true, isActive: true, lastLoginAt: new Date() },
      });
    }

    // Generate real JWT token using lib/jwt.ts
    const token = generateToken({ userId: user.id, phone: user.phone ?? phone, role: user.role });

    authLogger.info('User authenticated', { userId: user.id });

    const responseData = {
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
    };

    const response = NextResponse.json(responseData);

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;

  } catch (error) {
    authLogger.error('Verify OTP error', { error });
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
