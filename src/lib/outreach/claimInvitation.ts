/**
 * H6-13 - Claim invitation issuance + redemption
 *
 * Redemption never trusts the signed token alone (Phase 2's explicit
 * requirement): resolveClaimInvitation() re-checks the database on every
 * call, and consumeClaimInvitation() performs the actual state change
 * inside a single Prisma interactive transaction guarded by conditional
 * updateMany() counts, so a concurrent double-claim can only ever have one
 * winner (Phase 5's atomicity/idempotency/replay-safety requirement).
 *
 * This module does not decide *how* a claimant authenticates (OTP vs
 * anything else) - that stays in the existing /api/claim/verify +
 * /api/claim/complete routes, which call consumeClaimInvitation() only
 * after their own OTP check has already succeeded.
 */

import { prisma } from '@/lib/prisma';
import { signClaimToken, verifyClaimToken, isClaimTokenConfigured } from './claimToken';
import { SITE_URL } from '@/lib/site-url';

export interface CreateInvitationResult {
  invitationId: string;
  token: string;
  claimUrl: string;
  expiresAt: Date;
}

/** Creates the DB row and the signed token together. Never issues an invitation for an already-claimed company. */
export async function createClaimInvitation(
  companyId: string,
  campaignId: string,
  expiryDays: number = 14
): Promise<CreateInvitationResult> {
  if (!isClaimTokenConfigured()) {
    throw new Error('CLAIM_INVITATION_SECRET is not configured - cannot issue claim invitations');
  }

  const company = await prisma.user.findUnique({ where: { id: companyId }, select: { isClaimed: true } });
  if (!company) throw new Error('Company not found');
  if (company.isClaimed) throw new Error('Company is already claimed - refusing to issue a new invitation');

  const expiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);
  const invitation = await prisma.claimInvitation.create({
    data: { companyId, campaignId, expiresAt },
  });

  const token = signClaimToken(
    { companyId, campaignId, invitationId: invitation.id },
    `${expiryDays}d`
  );

  return { invitationId: invitation.id, token, claimUrl: `${SITE_URL}/claim/${token}`, expiresAt };
}

export type ResolveInvitationResult =
  | {
      ok: true;
      invitation: { id: string; companyId: string; campaignId: string; status: string };
      company: { id: string; name: string | null; company: string | null; location: string | null; gstNumber: string | null; udyamNumber: string | null; isClaimed: boolean; claimedAt: Date | null; phone: string | null; trustScore: number };
    }
  | { ok: false; reason: 'INVALID_TOKEN' | 'EXPIRED' | 'NOT_FOUND' | 'REVOKED' | 'CAMPAIGN_CANCELLED' };

/**
 * Read-only resolution used both for page display (/claim/[token]) and
 * pre-OTP validation (/api/claim/verify). Marks the invitation VIEWED on
 * first successful resolution (best-effort, not required for correctness).
 *
 * Deliberately does NOT reject an already-claimed company - `ok: true`
 * with `company.isClaimed: true` lets the /claim/[token] page render the
 * "already claimed" screen (mirroring the legacy claimToken flow) instead
 * of a 404. Callers that must refuse to proceed on an already-claimed
 * company (verify/complete) check company.isClaimed themselves.
 */
export async function resolveClaimInvitation(token: string): Promise<ResolveInvitationResult> {
  const verified = verifyClaimToken(token);
  if (!verified.ok) {
    return { ok: false, reason: verified.reason === 'EXPIRED' ? 'EXPIRED' : 'INVALID_TOKEN' };
  }

  const invitation = await prisma.claimInvitation.findUnique({
    where: { id: verified.payload.invitationId },
    include: { company: { select: { id: true, name: true, company: true, location: true, gstNumber: true, udyamNumber: true, isClaimed: true, claimedAt: true, phone: true, trustScore: true } }, campaign: { select: { status: true } } },
  });

  if (!invitation) return { ok: false, reason: 'NOT_FOUND' };
  // Defense in depth: the token's embedded companyId/campaignId must match
  // the DB row's actual foreign keys, even though invitationId alone
  // already determines the row - a mismatch here would only be possible
  // if the signing key were reused across unrelated payload shapes.
  if (invitation.companyId !== verified.payload.companyId || invitation.campaignId !== verified.payload.campaignId) {
    return { ok: false, reason: 'INVALID_TOKEN' };
  }
  if (invitation.revokedAt) return { ok: false, reason: 'REVOKED' };
  if (invitation.expiresAt < new Date() && !invitation.company.isClaimed) return { ok: false, reason: 'EXPIRED' };
  if (invitation.campaign.status === 'CANCELLED' && !invitation.company.isClaimed) return { ok: false, reason: 'CAMPAIGN_CANCELLED' };

  if (invitation.status === 'ISSUED') {
    await prisma.claimInvitation.update({ where: { id: invitation.id }, data: { status: 'VIEWED', viewedAt: new Date() } }).catch(() => {});
  }

  return {
    ok: true,
    invitation: { id: invitation.id, companyId: invitation.companyId, campaignId: invitation.campaignId, status: invitation.status },
    company: invitation.company,
  };
}

export type ConsumeInvitationResult =
  | { ok: true }
  | { ok: false; reason: 'ALREADY_CLAIMED' | 'INVITATION_NOT_VALID' };

/**
 * The atomic claim step. Must be called only after the caller's own
 * authentication (OTP) has already succeeded. `claimUserAction` runs
 * inside the same transaction and must itself use a conditional
 * updateMany (isClaimed: false guard) so it cannot win a race the
 * invitation-side guard already lost, or vice versa.
 */
export async function consumeClaimInvitation(
  invitationId: string,
  claimedByUserId: string,
  claimUserAction: (tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]) => Promise<boolean>
): Promise<ConsumeInvitationResult> {
  return prisma.$transaction(async (tx) => {
    const invitationUpdate = await tx.claimInvitation.updateMany({
      where: { id: invitationId, consumedAt: null, revokedAt: null },
      data: { consumedAt: new Date(), status: 'CLAIMED', claimedByUserId },
    });
    if (invitationUpdate.count === 0) {
      return { ok: false, reason: 'INVITATION_NOT_VALID' as const };
    }

    const userClaimed = await claimUserAction(tx);
    if (!userClaimed) {
      // Roll back the invitation consumption too - the transaction throws,
      // Prisma rolls back every statement in it.
      throw new AlreadyClaimedError();
    }

    await tx.outreachRecipient.updateMany({
      where: { claimInvitationId: invitationId },
      data: { state: 'CLAIMED', claimedAt: new Date() },
    });

    return { ok: true as const };
  }).catch((err) => {
    if (err instanceof AlreadyClaimedError) return { ok: false, reason: 'ALREADY_CLAIMED' as const };
    throw err;
  });
}

class AlreadyClaimedError extends Error {}

export async function revokeClaimInvitation(invitationId: string): Promise<void> {
  await prisma.claimInvitation.update({
    where: { id: invitationId },
    data: { revokedAt: new Date(), status: 'REVOKED' },
  });
}
