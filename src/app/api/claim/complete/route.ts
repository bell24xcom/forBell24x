import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sign } from 'jsonwebtoken';
import { resolveClaimTarget } from '@/src/lib/outreach/resolveClaimTarget';
import { consumeClaimInvitation } from '@/src/lib/outreach/claimInvitation';
import { logDiscoveryEvent } from '@/src/lib/discovery/events';

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
    const { token, phone: rawPhone, otp, consent } = await request.json();

    if (!token || !otp) {
      return NextResponse.json({ success: false, message: 'Token and OTP required' }, { status: 400 });
    }
    if (!consent) {
      return NextResponse.json({ success: false, message: 'You must agree to receive WhatsApp/SMS updates to continue.' }, { status: 400 });
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

    // H6-13: resolves both the new signed-invitation token format and the
    // legacy bare-UUID users.claim_token format (H6-12 baseline, unchanged).
    const target = await resolveClaimTarget(token);

    if (!target) {
      return NextResponse.json({ success: false, message: 'Invalid claim link' }, { status: 404 });
    }
    if (target.isClaimed) {
      return NextResponse.json({ success: false, message: 'Profile already claimed' }, { status: 409 });
    }

    const claimUserData = {
      isClaimed: true,
      claimedAt: new Date(),
      isVerified: true,
      isActive: true,
      phone: target.phone ?? phone, // keep original if already set
      lastLoginAt: new Date(),
      trustScore: Math.max(target.trustScore, 30),
    };

    let updatedUser;
    if (target.source === 'invitation' && target.invitationId) {
      // H6-13 campaign-issued invitation: atomic, replay-safe claim. The
      // invitation row and the user row are updated inside one
      // transaction, each guarded by a conditional updateMany() count
      // check, so a concurrent double-claim can only ever have one winner
      // (Phase 5's atomicity/idempotency/replay-safety requirement).
      const outcome = await consumeClaimInvitation(target.invitationId, target.companyId, async (tx) => {
        const result = await tx.user.updateMany({
          where: { id: target.companyId, isClaimed: false },
          data: claimUserData,
        });
        return result.count === 1;
      });
      if (!outcome.ok) {
        return NextResponse.json({ success: false, message: 'Profile already claimed' }, { status: 409 });
      }
      updatedUser = await prisma.user.findUniqueOrThrow({ where: { id: target.companyId } });
    } else {
      // Legacy path (H6-12 baseline) — intentionally unchanged. Not wrapped
      // in the same conditional-count guard as the new invitation path;
      // see H6-13 report §Security Findings for this pre-existing gap.
      updatedUser = await prisma.user.update({
        where: { id: target.companyId },
        data: claimUserData,
      });
    }

    // Consent: ClaimForm.tsx now shows a specific WhatsApp/SMS consent line
    // (id="claim-consent") and this route rejects the request above if it
    // wasn't checked. The OTP check above proves control of the phone the
    // claim link was delivered to, so this is the correct place to record
    // whatsapp/transactional-messaging consent — mirrors the shape
    // recordSignupConsent() uses, but that helper is hardcoded to
    // purpose: 'account_signup' and can't be reused for a different purpose
    // without mislabeling this consent event.
    const existingWaConsent = await prisma.consentEvent.findFirst({
      where: { userId: updatedUser.id, purpose: 'whatsapp/transactional-messaging', granted: true },
    });
    if (!existingWaConsent) {
      const rawIp = request.headers.get('x-forwarded-for')?.split(',')[0] ?? request.headers.get('x-real-ip') ?? '';
      const ipHash = rawIp ? Buffer.from(rawIp).toString('base64').slice(0, 16) : null;
      await prisma.consentEvent.create({
        data: {
          userId: updatedUser.id,
          purpose: 'whatsapp/transactional-messaging',
          method: 'claim-otp-verified',
          consentTextVersion: 'claim-whatsapp-v1',
          granted: true,
          ipHash,
        },
      });
    }

    // Issue JWT — 7 day session
    // H6-16A: true fail-closed. No hardcoded secret is ever substituted — if
    // JWT_SECRET is missing or empty, signing throws and falls through to
    // this handler's existing catch block (below), which already returns a
    // safe error response for any thrown error.
    if (!process.env.JWT_SECRET) {
      console.error('[JWT] CRITICAL: JWT_SECRET env var is not set. Set it in Vercel → Settings → Environment Variables.');
      throw new Error('JWT_SECRET is not configured — refusing to sign a session token');
    }
    const JWT_SECRET = process.env.JWT_SECRET;
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

    logDiscoveryEvent('profile_claimed', {
      userId: updatedUser.id,
      metadata: {
        source: target.source,
        trustScore: updatedUser.trustScore,
      },
    });

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
