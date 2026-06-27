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
  let step = 'init';
  try {
    step = 'parse';
    const body = await request.json();
    const accessToken = body.accessToken?.toString() || '';
    const rawPhone   = body.phone?.toString() || '';
    const phone      = normalizePhone(rawPhone);

    if (!phone) {
      return NextResponse.json(
        { success: false, message: 'Valid 10-digit phone number required' },
        { status: 400 }
      );
    }

    // Validate token looks like a JWT (3 dot-separated parts, min length)
    step = 'token-check';
    const jwtParts = accessToken.split('.');
    if (jwtParts.length !== 3 || accessToken.length < 50) {
      return NextResponse.json(
        { success: false, message: 'Invalid verification token' },
        { status: 400 }
      );
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
