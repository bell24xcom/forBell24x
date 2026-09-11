import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveClaimTarget } from '@/src/lib/outreach/resolveClaimTarget';
import { logProviderFailure } from '@/lib/providerFailure';

export const dynamic = 'force-dynamic';

function normalizePhone(raw: string): string | null {
  const cleaned = raw.replace(/[\s\-\(\)]/g, '').replace(/^\+91/, '').replace(/^91/, '');
  return /^\d{10}$/.test(cleaned) ? cleaned : null;
}

async function sendOtpViaMSG91(phone: string, otp: string) {
  const AUTH_KEY = process.env.MSG91_AUTH_KEY;
  const TEMPLATE = process.env.MSG91_TEMPLATE_ID;
  if (!AUTH_KEY || !TEMPLATE) return { success: false, error: 'MSG91 not configured' };

  try {
    const res = await fetch('https://api.msg91.com/api/v5/otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', authkey: AUTH_KEY },
      body: JSON.stringify({
        template_id: TEMPLATE,
        mobile: `91${phone}`,
        authkey: AUTH_KEY,
        sender: process.env.MSG91_SENDER_ID || 'BELL24H',
        otp,
      }),
    });
    const result = await res.json();
    return res.ok && result.type === 'success' ? { success: true } : { success: false, error: result.message };
  } catch {
    return { success: false, error: 'Network error' };
  }
}

/**
 * POST /api/claim/verify
 * Step 1: Validate claim token + phone, send OTP
 * Body: { token: string, phone: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { token, phone: rawPhone } = await request.json();

    if (!token) {
      return NextResponse.json({ success: false, message: 'Claim token required' }, { status: 400 });
    }

    const phone = normalizePhone(rawPhone || '');
    if (!phone) {
      return NextResponse.json({ success: false, message: 'Valid 10-digit phone required' }, { status: 400 });
    }

    // H6-13: resolves both the new signed-invitation token format and the
    // legacy bare-UUID users.claim_token format (H6-12 baseline, unchanged).
    const target = await resolveClaimTarget(token);

    if (!target) {
      return NextResponse.json({ success: false, message: 'Invalid or expired claim link' }, { status: 404 });
    }

    if (target.isClaimed) {
      return NextResponse.json({ success: false, message: 'This profile has already been claimed' }, { status: 409 });
    }

    const supplier = { id: target.companyId, company: target.company, name: target.name };

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.oTPVerification.upsert({
      where: { phone },
      update: { otp, expiresAt, attempts: 0, isVerified: false },
      create: { phone, otp, expiresAt, attempts: 0, isVerified: false },
    });

    const isDev = process.env.NODE_ENV === 'development';
    const pilotMode = process.env.PILOT_OTP_IN_RESPONSE === 'true';

    if (!isDev && !pilotMode) {
      const smsResult = await sendOtpViaMSG91(phone, otp);
      if (!smsResult.success) {
        // Fire-and-forget — never awaited, never blocks/slows this request.
        logProviderFailure({
          provider: 'msg91',
          endpoint: 'https://api.msg91.com/api/v5/otp',
          errorMessage: smsResult.error || 'Unknown MSG91 error',
          recipient: phone,
        }).catch(() => {});
        return NextResponse.json(
          { success: false, message: 'Unable to send OTP SMS. Please try again or contact support.' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: `OTP sent to +91 ${phone.slice(0, 5)}*****`,
      companyName: supplier.company || supplier.name || 'Your Business',
      ...(isDev || pilotMode ? { otp } : {}),
    });
  } catch (error) {
    console.error('Claim verify error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
