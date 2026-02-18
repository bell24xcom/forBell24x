import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { generateToken } from '@/lib/jwt';
import { authLogger } from '@/lib/logger';

const prisma = new PrismaClient();

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
    const otpRecord = await prisma.otpVerification.findUnique({ where: { phone } });

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
      await prisma.otpVerification.update({
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
    await prisma.otpVerification.update({
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
          company: 'New Company',
          role: 'SUPPLIER',
          isActive: true,
          verified: true,
        },
      });
      authLogger.info('New user created', { userId: user.id, phone: `${phone.slice(0, 5)}*****` });
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { verified: true, isActive: true },
      });
    }

    // Generate real JWT token using lib/jwt.ts
    const token = generateToken({ userId: user.id, phone: user.phone, role: user.role });

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
        verified: user.verified,
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
