import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sign } from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

function normalizePhone(raw: string): string | null {
  const cleaned = raw.replace(/[\s\-\(\)]/g, '').replace(/^\+91/, '').replace(/^91/, '');
  return /^\d{10}$/.test(cleaned) ? cleaned : null;
}

/**
 * POST /api/claim/complete
 * Step 2: Verify OTP → set isClaimed=true → issue JWT → set cookie
 * Body: { token: string, phone: string, otp: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { token, phone: rawPhone, otp } = await request.json();

    if (!token || !otp) {
      return NextResponse.json({ success: false, message: 'Token and OTP required' }, { status: 400 });
    }

    const phone = normalizePhone(rawPhone || '');
    if (!phone) {
      return NextResponse.json({ success: false, message: 'Valid 10-digit phone required' }, { status: 400 });
    }

    // Verify OTP record
    const otpRecord = await prisma.oTPVerification.findUnique({ where: { phone } });

    if (!otpRecord) {
      return NextResponse.json({ success: false, message: 'OTP not found. Request a new one.' }, { status: 400 });
    }
    if (otpRecord.isVerified) {
      return NextResponse.json({ success: false, message: 'OTP already used. Request a new one.' }, { status: 400 });
    }
    if (new Date() > otpRecord.expiresAt) {
      return NextResponse.json({ success: false, message: 'OTP expired. Request a new one.' }, { status: 400 });
    }
    if (otpRecord.attempts >= 3) {
      return NextResponse.json({ success: false, message: 'Too many attempts. Request a new OTP.' }, { status: 429 });
    }
    if (otpRecord.otp !== otp) {
      await prisma.oTPVerification.update({ where: { phone }, data: { attempts: otpRecord.attempts + 1 } });
      const remaining = 3 - (otpRecord.attempts + 1);
      return NextResponse.json(
        { success: false, message: `Invalid OTP. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.` },
        { status: 400 }
      );
    }

    // Mark OTP used
    await prisma.oTPVerification.update({ where: { phone }, data: { isVerified: true } });

    // Find supplier by claim token
    const supplier = await prisma.user.findUnique({ where: { claimToken: token } });

    if (!supplier) {
      return NextResponse.json({ success: false, message: 'Invalid claim link' }, { status: 404 });
    }
    if (supplier.isClaimed) {
      return NextResponse.json({ success: false, message: 'Profile already claimed' }, { status: 409 });
    }

    // Complete the claim — update supplier record
    const updatedUser = await prisma.user.update({
      where: { id: supplier.id },
      data: {
        isClaimed: true,
        claimedAt: new Date(),
        isVerified: true,
        isActive: true,
        phone: supplier.phone ?? phone, // keep original if already set
        lastLoginAt: new Date(),
        trustScore: Math.max(supplier.trustScore, 30),
      },
    });

    // TODO(consent): this is the flow real claim links (sent via WhatsApp
    // drip, see supplier-drip-engine.ts) actually reach, and the OTP check
    // above proves control of the phone the claim link was delivered to —
    // the right place to record whatsapp/transactional-messaging consent.
    // NOT wired yet: ClaimForm.tsx / claim/[token]/page.tsx show no specific
    // consent line for this purpose (only a generic "agree to Terms of
    // Service" link, no consentTextVersion). Add a real consent line to that
    // screen first, then write a ConsentEvent here:
    //   { userId: updatedUser.id, purpose: 'whatsapp/transactional-messaging',
    //     method: 'claim-otp-verified', consentTextVersion: <version shown>,
    //     granted: true, ipHash }
    // Guard re-claims: check for an existing granted event for
    // (userId, purpose: 'whatsapp/transactional-messaging') before creating
    // another — a user re-running the claim flow (e.g. after a failed OTP
    // attempt, or a second claim on the same profile) must not accumulate
    // duplicate consent rows.

    // Issue JWT — 7 day session
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    const authToken = sign(
      { userId: updatedUser.id, phone: updatedUser.phone ?? phone, role: updatedUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const responseData = {
      success: true,
      message: 'Profile claimed successfully! Welcome to Bell24h.',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        company: updatedUser.company,
        role: updatedUser.role,
        isClaimed: true,
      },
      token: authToken,
      redirectTo: '/dashboard',
    };

    const response = NextResponse.json(responseData);
    response.cookies.set('auth-token', authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Claim complete error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
