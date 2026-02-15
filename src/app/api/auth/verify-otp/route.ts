import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwt } from '@/lib/jwt';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const { phone, otp } = await request.json();

    // Validate input
    if (!phone || typeof phone !== 'string' || !phone.trim()) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    if (!otp || typeof otp !== 'string' || otp.trim().length !== 6) {
      return NextResponse.json(
        { error: 'Valid OTP is required' },
        { status: 400 }
      );
    }

    // Find user and validate OTP
    const user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.otp !== otp) {
      return NextResponse.json(
        { error: 'Invalid OTP' },
        { status: 400 }
      );
    }

    if (user.otpExpiry < Date.now()) {
      return NextResponse.json(
        { error: 'OTP has expired' },
        { status: 400 }
      );
    }

    // Verify OTP with MSG91
    const msg91AuthKey = process.env.MSG91_AUTH_KEY;

    if (!msg91AuthKey) {
      logger.error('MSG91 configuration missing');
      return NextResponse.json(
        { error: 'Authentication service unavailable' },
        { status: 500 }
      );
    }

    const verifyOtpUrl = `https://api.msg91.com/api/v5/otp/verify?authkey=${msg91AuthKey}&mobile=${phone}&otp=${otp}`;

    const verifyOtpResponse = await fetch(verifyOtpUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!verifyOtpResponse.ok) {
      const errorData = await verifyOtpResponse.json().catch(() => ({}));
      logger.error('MSG91 verification error:', errorData);
      return NextResponse.json(
        { error: 'OTP verification failed' },
        { status: 500 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        phone: user.phone,
        role: user.role || 'user',
      },
      {
        expiresIn: '7d',
      }
    );

    // Clear OTP after successful verification
    await prisma.user.update({
      where: { phone },
      data: { otp: null, otpExpiry: null },
    });

    // Create response with JWT cookie
    const response = NextResponse.json({ message: 'OTP verified successfully' });

    // Set secure cookie
    response.cookies.set('bell24h_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;

  } catch (error) {
    logger.error('Verify OTP error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}