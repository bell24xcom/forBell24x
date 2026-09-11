/**
 * H6-13 - Shared dual-format claim token resolution
 *
 * Every entry point that accepts a `/claim/[token]` path segment (the page,
 * /api/claim/verify, /api/claim/complete) must resolve it the same way, so
 * this lives in one place rather than being re-implemented three times.
 *
 * Two token formats can arrive here:
 *  - New campaign-issued invitations: a signed JWT (claimToken.ts).
 *  - Legacy links already in the wild (H6-12 baseline, unchanged):
 *    a bare UUID stored directly on users.claim_token.
 */

import { prisma } from '@/lib/prisma';
import { looksLikeClaimJwt } from './claimToken';
import { resolveClaimInvitation } from './claimInvitation';

export interface ResolvedClaimTarget {
  source: 'invitation' | 'legacy';
  companyId: string;
  name: string | null;
  company: string | null;
  location: string | null;
  gstNumber: string | null;
  udyamNumber: string | null;
  isClaimed: boolean;
  claimedAt: Date | null;
  phone: string | null;
  trustScore: number;
  /** Present only when source === 'invitation'. */
  invitationId?: string;
  campaignId?: string;
}

async function tryInvitation(token: string): Promise<ResolvedClaimTarget | null> {
  const result = await resolveClaimInvitation(token);
  if (!result.ok) return null;
  return {
    source: 'invitation',
    companyId: result.company.id,
    name: result.company.name,
    company: result.company.company,
    location: result.company.location,
    gstNumber: result.company.gstNumber,
    udyamNumber: result.company.udyamNumber,
    isClaimed: result.company.isClaimed,
    claimedAt: result.company.claimedAt,
    phone: result.company.phone,
    trustScore: result.company.trustScore,
    invitationId: result.invitation.id,
    campaignId: result.invitation.campaignId,
  };
}

async function tryLegacy(token: string): Promise<ResolvedClaimTarget | null> {
  const supplier = await prisma.user.findUnique({
    where: { claimToken: token },
    select: {
      id: true, name: true, company: true, location: true,
      gstNumber: true, udyamNumber: true, isClaimed: true, claimedAt: true,
      phone: true, trustScore: true,
    },
  });
  if (!supplier) return null;
  return {
    source: 'legacy',
    companyId: supplier.id,
    name: supplier.name,
    company: supplier.company,
    location: supplier.location,
    gstNumber: supplier.gstNumber,
    udyamNumber: supplier.udyamNumber,
    isClaimed: supplier.isClaimed,
    claimedAt: supplier.claimedAt,
    phone: supplier.phone,
    trustScore: supplier.trustScore,
  };
}

export async function resolveClaimTarget(token: string): Promise<ResolvedClaimTarget | null> {
  if (looksLikeClaimJwt(token)) {
    return (await tryInvitation(token)) ?? (await tryLegacy(token));
  }
  return (await tryLegacy(token)) ?? (await tryInvitation(token));
}
