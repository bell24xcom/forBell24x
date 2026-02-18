import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authLogger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

// Normalize phone: strip +91, spaces, dashes → 10 digits
function normalizePhone(raw: string): string | null {
  const cleaned = raw.replace(/[\s\-\(\)]/g, '').replace(/^\+91/, '').replace(/^91/, '');
  return /^\d{10}$/.test(cleaned) ? cleaned : null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const rawPhone = body.phone?.toString() || '';
    const phone = normalizePhone(rawPhone);

    if (!phone) {
      return NextResponse.json(
        { success: false, message: 'Valid 10-digit phone number required' },
        { status: 400 }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in database (upsert to handle resends)
    await prisma.otpVerification.upsert({
      where: { phone },
      update: { otp, expiresAt, attempts: 0, isVerified: false },
      create: { phone, otp, expiresAt, attempts: 0, isVerified: false },
    });

    // Send OTP via MSG91
    const smsResult = await sendViaMSG91(phone, otp);

    if (!smsResult.success) {
      authLogger.error('MSG91 send failed', { phone: `${phone.slice(0, 5)}*****`, error: smsResult.error });
      // In dev/test, still succeed so UI can be tested
      if (process.env.NODE_ENV === 'development') {
        authLogger.warn(`DEV MODE: OTP for ${phone} is ${otp}`);
        return NextResponse.json({
          success: true,
          message: 'OTP sent (DEV mode - check server logs)',
          phone: phone.replace(/(\d{5})(\d{5})/, '$1*****'),
          devOtp: otp, // Only exposed in dev
        });
      }
      return NextResponse.json(
        { success: false, message: 'Failed to send OTP. Please try again.' },
        { status: 500 }
      );
    }

    authLogger.info('OTP sent', { phone: `${phone.slice(0, 5)}*****` });
    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      phone: phone.replace(/(\d{5})(\d{5})/, '$1*****'),
    });

  } catch (error) {
    authLogger.error('Send OTP error', { error });
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function sendViaMSG91(phone: string, otp: string): Promise<{ success: boolean; error?: string }> {
  const AUTH_KEY   = process.env.MSG91_AUTH_KEY;
  const TEMPLATE   = process.env.MSG91_TEMPLATE_ID;
  const SENDER     = process.env.MSG91_SENDER_ID || 'BELL24H';

  if (!AUTH_KEY || !TEMPLATE) {
    authLogger.warn('MSG91 credentials not configured — OTP will not be sent via SMS');
    return { success: false, error: 'MSG91 not configured' };
  }

  try {
    const response = await fetch('https://api.msg91.com/api/v5/otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'authkey': AUTH_KEY },
      body: JSON.stringify({
        template_id: TEMPLATE,
        mobile: `91${phone}`,
        authkey: AUTH_KEY,
        sender: SENDER,
        otp,
      }),
    });

    const result = await response.json();
    if (response.ok && result.type === 'success') {
      return { success: true };
    }
    return { success: false, error: result.message || 'MSG91 API error' };
  } catch (error) {
    return { success: false, error: 'Network error reaching MSG91' };
  }
}
