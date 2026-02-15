import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwt } from '@/lib/jwt';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();

    // Validate phone number
    if (!phone || typeof phone !== 'string' || !phone.trim()) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { phone },
    });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Save OTP to database
    if (user) {
      await prisma.user.update({
        where: { phone },
        data: { otp, otpExpiry },
      });
    } else {
      await prisma.user.create({
        data: { phone, otp, otpExpiry },
      });
    }

    // Send OTP via MSG91
    const msg91AuthKey = process.env.MSG91_AUTH_KEY;
    const msg91SenderId = process.env.MSG91_SENDER_ID;
    const msg91TemplateId = process.env.MSG91_TEMPLATE_ID;

    if (!msg91AuthKey || !msg91SenderId || !msg91TemplateId) {
      logger.error('MSG91 configuration missing');
      return NextResponse.json(
        { error: 'Authentication service unavailable' },
        { status: 500 }
      );
    }

    const msg91Url = `https://api.msg91.com/api/v5/otp?authkey=${msg91AuthKey}&template_id=${msg91TemplateId}&extra_param=${otp}&mobile=${phone}&sender=${msg91SenderId}`;

    const sendOtpResponse = await fetch(msg91Url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!sendOtpResponse.ok) {
      const errorData = await sendOtpResponse.json().catch(() => ({}));
      logger.error('MSG91 API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to send OTP' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'OTP sent successfully' });

  } catch (error) {
    logger.error('Send OTP error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}