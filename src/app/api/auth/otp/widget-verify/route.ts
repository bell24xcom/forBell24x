import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateToken } from '@/lib/jwt';
import { authLogger } from '@/lib/logger';
import { recordSignupConsent, NO_CONSENT_UI } from '@/src/lib/consent/recordSignupConsent';
import { verifyMsg91AccessToken, normalizePhone, phonesMismatch } from '@/lib/msg91-widget';

export const dynamic = 'force-dynamic';

const VERIFY_ERROR_MESSAGES: Record<string, string> = {
  invalid_token: 'Invalid verification token',
  phone_unresolved: 'Could not verify a phone number for this token',
  service_unavailable: 'Verification service unavailable. Please try again shortly.',
};

export async function POST(request: NextRequest) {
  let step = 'init';
  try {
    step = 'parse';
    const body = await request.json();
    const accessToken = body.accessToken?.toString() || '';
    const bodyPhone = normalizePhone(body.phone?.toString() || '');

    if (!accessToken) {
      return NextResponse.json(
        { success: false, code: 'invalid_token', message: 'Verification token required' },
        { status: 401 }
      );
    }

    // Server-side MSG91 verification is the ONLY source of truth for phone
    // ownership -- a client-supplied token proves nothing on its own. Fail
    // closed on every non-verified outcome, before any database access.
    step = 'msg91-verify';
    const verification = await verifyMsg91AccessToken(accessToken);

    if (!verification.ok || !verification.phone) {
      authLogger.warn('Widget OTP verification failed', {
        code: verification.code,
        responseShape: verification.responseShape,
      });
      return NextResponse.json(
        { success: false, code: verification.code, message: VERIFY_ERROR_MESSAGES[verification.code] },
        { status: 401 }
      );
    }

    const phone = verification.phone;

    // The request body's phone is never trusted for identity -- only used
    // to detect and log a mismatch against what MSG91 actually verified.
    if (phonesMismatch(bodyPhone, phone)) {
      authLogger.warn('Widget OTP phone mismatch: request body phone differs from MSG91-verified phone', {
        bodyPhoneLast4: bodyPhone!.slice(-4),
        verifiedPhoneLast4: phone.slice(-4),
      });
    }

    // Find or create user
    step = 'db-find';
    let isNewUser = false;
    let user = await prisma.user.findUnique({ where: { phone } });

    if (!user) {
      isNewUser = true;
      step = 'db-create';
      // Use phone-based placeholder email — guaranteed unique since phone is unique
      const placeholderEmail = `ph_${phone}@bell24h.placeholder`;
      user = await prisma.user.create({
        data: {
          phone,
          name:       `User ${phone.slice(-4)}`,
          email:      placeholderEmail,
          company:    '',
          role:       'SUPPLIER',
          isActive:   true,
          isVerified: true,
          trustScore: 30,
          lastLoginAt: new Date(),
        },
      });
      authLogger.info('New user created via widget OTP', { userId: user.id });

      // consent: passing NO_CONSENT_UI until the MSG91-widget screens
      // (/auth/phone-email, /auth/login, /admin/login) ship a real,
      // versioned consent line; then pass that version.
      await recordSignupConsent({
        userId: user.id,
        req: request,
        consentTextVersion: NO_CONSENT_UI,
        entryPoint: 'otp/widget-verify (web: /auth/phone-email, /auth/login, /admin/login widget mode)',
      });

      // BOM activation: first life event for every new company. Non-blocking.
      import('@/src/lib/bom/life-events')
        .then(({ recordLifeEventAsync }) =>
          recordLifeEventAsync({
            companyId: user!.id,
            eventType: 'company_joined',
            actorId: user!.id,
            metadata: { via: 'otp-widget', role: user!.role },
            source: 'auth',
            confidence: 1,
          }),
        )
        .catch(() => {});
    } else {
      step = 'db-update';
      user = await prisma.user.update({
        where: { id: user.id },
        data:  { isVerified: true, isActive: true, lastLoginAt: new Date() },
      });
    }

    step = 'jwt';
    const token = generateToken({
      userId: user.id,
      phone:  user.phone ?? phone,
      role:   user.role,
    });

    authLogger.info('User authenticated via MSG91 widget', { userId: user.id, isNewUser });

    step = 'response';
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      isNewUser,
      user: {
        id:         user.id,
        name:       user.name,
        email:      user.email,
        phone:      user.phone,
        company:    user.company,
        role:       user.role,
        isVerified: user.isVerified,
      },
      token,
    });

    const cookieOpts = {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge:   7 * 24 * 60 * 60,
      path:     '/',
    };

    response.cookies.set('auth-token', token, cookieOpts);

    // Middleware gates /admin/* on 'admin-token'; set it for admin users
    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
      response.cookies.set('admin-token', token, cookieOpts);
    }

    return response;

  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    authLogger.error('Widget OTP verify error', { step, error: msg });
    return NextResponse.json(
      { success: false, message: `Failed at [${step}]: ${msg}` },
      { status: 500 }
    );
  }
}
