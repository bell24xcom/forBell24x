import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authLogger } from '@/lib/logger';
import { LawfulBasis } from '@prisma/client';

/**
 * Sentinel passed by callers that have no real, versioned consent line to
 * point to yet. The helper writes NOTHING when it sees this — the honesty
 * rule (no consent line in the UI → no ConsentEvent) is enforced here,
 * structurally, rather than left to each call site to remember.
 */
export const NO_CONSENT_UI = 'NO_CONSENT_UI' as const;

interface RecordSignupConsentArgs {
  userId: string;
  req: NextRequest;
  /** Required — pass NO_CONSENT_UI if the calling screen has no real consent line yet. Never fabricate a version. */
  consentTextVersion: string;
  /** Which screen/endpoint is calling — named in the skip warning so a real gap is traceable. */
  entryPoint: string;
  /** ISO country code of the regime governing this event. Optional — not yet supplied by any call site. */
  jurisdiction?: string;
  /** Lawful basis relied on. Optional — not yet supplied by any call site. */
  lawfulBasis?: LawfulBasis;
}

/**
 * The single place 'account_signup' consent is ever recorded. Both
 * user-creation endpoints (otp/verify, otp/widget-verify) route through this
 * so consent can't be silently skipped at one of them, or duplicated across
 * re-verify/re-login attempts.
 */
export async function recordSignupConsent({
  userId,
  req,
  consentTextVersion,
  entryPoint,
  jurisdiction,
  lawfulBasis,
}: RecordSignupConsentArgs): Promise<void> {
  if (consentTextVersion === NO_CONSENT_UI) {
    authLogger.warn('[consent] account_signup skipped — no real consent line yet', { userId, entryPoint });
    return;
  }

  // Dedupe: a re-verify or re-login for the same user must not stack a
  // second granted event for the same purpose.
  const existing = await prisma.consentEvent.findFirst({
    where: { userId, purpose: 'account_signup', granted: true },
  });
  if (existing) return;

  const rawIp = req.headers.get('x-forwarded-for')?.split(',')[0] ?? req.headers.get('x-real-ip') ?? '';
  const ipHash = rawIp ? Buffer.from(rawIp).toString('base64').slice(0, 16) : null;

  await prisma.consentEvent.create({
    data: {
      userId,
      purpose: 'account_signup',
      method: 'phone_otp',
      consentTextVersion,
      granted: true,
      ipHash,
      jurisdiction,
      lawfulBasis,
    },
  });
}
