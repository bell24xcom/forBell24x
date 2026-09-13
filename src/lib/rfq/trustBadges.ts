import { prisma } from '@/lib/prisma';

/**
 * Batch-checks which of the given user ids have at least one admin-approved
 * KYC document — the only real, human-reviewed verification signal in the
 * schema.
 *
 * Deliberately NOT User.isVerified: that field is set true on every
 * successful phone-OTP login/signup (src/app/api/auth/otp/verify/route.ts,
 * widget-verify/route.ts) and on seeded/demo suppliers at creation time
 * (src/app/api/admin/seed-suppliers/route.ts) — it means "has an account
 * that's been logged into," not "KYC-verified business." Using it here
 * would put a "Verified Buyer" badge on essentially every real buyer and
 * every demo account equally. See SPRINT-STDV-01 Priority 3 findings.
 */
export async function getVerifiedBuyerIds(userIds: string[]): Promise<Set<string>> {
  const distinctIds = Array.from(new Set(userIds));
  if (distinctIds.length === 0) return new Set();

  // KycDocumentStatus enum is PENDING | VERIFIED | REJECTED — not APPROVED.
  const approved = await prisma.kycDocument.findMany({
    where: { userId: { in: distinctIds }, status: 'VERIFIED' },
    select: { userId: true },
    distinct: ['userId'],
  });

  return new Set(approved.map(d => d.userId));
}
