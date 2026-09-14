/**
 * Invitation Engine metrics — status, funnel, outreach readiness.
 */

import { prisma } from '@/lib/prisma';
import { DISCOVERY_SUPPLIER_WHERE } from './supplier-scope';
import { isClaimTokenConfigured } from '@/src/lib/outreach/claimToken';

export interface InvitationStatusBreakdown {
  status: string;
  count: number;
}

export interface OutreachFunnelStep {
  stage: string;
  count: number;
  rateFromPrevious: number;
}

export interface OutreachReadiness {
  claimTokenConfigured: boolean;
  scrapegraphConfigured: boolean;
  unclaimedWithPhone: number;
  unclaimedEligible: number;
  draftCampaigns: number;
  liveCampaigns: number;
  suppressedCount: number;
}

export interface InvitationEngineMetrics {
  invitations: InvitationStatusBreakdown[];
  recipientStates: InvitationStatusBreakdown[];
  campaignStatuses: InvitationStatusBreakdown[];
  funnel: OutreachFunnelStep[];
  readiness: OutreachReadiness;
  claimSummary: { claimed: number; unclaimed: number; claimRate: number };
  generatedAt: string;
}

export async function computeInvitationEngineMetrics(): Promise<InvitationEngineMetrics> {
  const discoveryCompanyIds = (
    await prisma.user.findMany({
      where: DISCOVERY_SUPPLIER_WHERE,
      select: { id: true, isClaimed: true, phone: true },
    })
  );

  const ids = discoveryCompanyIds.map((c) => c.id);
  const claimed = discoveryCompanyIds.filter((c) => c.isClaimed).length;
  const unclaimed = discoveryCompanyIds.length - claimed;

  const [
    invitationGroups,
    recipientGroups,
    campaignGroups,
    draftCampaigns,
    liveCampaigns,
    suppressedCount,
    unclaimedWithPhone,
  ] = await Promise.all([
    prisma.claimInvitation.groupBy({
      by: ['status'],
      where: { companyId: { in: ids } },
      _count: { _all: true },
    }),
    prisma.outreachRecipient.groupBy({
      by: ['state'],
      where: { companyId: { in: ids } },
      _count: { _all: true },
    }),
    prisma.outreachCampaign.groupBy({
      by: ['status'],
      _count: { _all: true },
    }),
    prisma.outreachCampaign.count({ where: { status: 'DRAFT' } }),
    prisma.outreachCampaign.count({ where: { status: 'LIVE' } }),
    prisma.outreachRecipient.count({
      where: { companyId: { in: ids }, state: 'SUPPRESSED' },
    }),
    prisma.user.count({
      where: {
        ...DISCOVERY_SUPPLIER_WHERE,
        isClaimed: false,
        phone: { not: null },
      },
    }),
  ]);

  const invitations: InvitationStatusBreakdown[] = invitationGroups.map((g) => ({
    status: g.status,
    count: g._count._all,
  }));

  const recipientStates: InvitationStatusBreakdown[] = recipientGroups.map((g) => ({
    status: g.state,
    count: g._count._all,
  }));

  const campaignStatuses: InvitationStatusBreakdown[] = campaignGroups.map((g) => ({
    status: g.status,
    count: g._count._all,
  }));

  const pending = recipientGroups.find((g) => g.state === 'PENDING')?._count._all ?? 0;
  const queued = recipientGroups.find((g) => g.state === 'QUEUED')?._count._all ?? 0;
  const sent =
    (recipientGroups.find((g) => g.state === 'SENT')?._count._all ?? 0) +
    (recipientGroups.find((g) => g.state === 'DELIVERED')?._count._all ?? 0);
  const claimedRecipients = recipientGroups.find((g) => g.state === 'CLAIMED')?._count._all ?? 0;
  const inPipeline = pending + queued;

  const funnel: OutreachFunnelStep[] = [
    { stage: 'Discovered', count: discoveryCompanyIds.length, rateFromPrevious: 100 },
    {
      stage: 'In Pipeline',
      count: inPipeline + sent + claimedRecipients,
      rateFromPrevious: discoveryCompanyIds.length > 0
        ? Math.round(((inPipeline + sent + claimedRecipients) / discoveryCompanyIds.length) * 100)
        : 0,
    },
    {
      stage: 'Sent',
      count: sent + claimedRecipients,
      rateFromPrevious: inPipeline + sent + claimedRecipients > 0
        ? Math.round(((sent + claimedRecipients) / (inPipeline + sent + claimedRecipients)) * 100)
        : 0,
    },
    {
      stage: 'Claimed',
      count: claimedRecipients,
      rateFromPrevious: sent + claimedRecipients > 0
        ? Math.round((claimedRecipients / (sent + claimedRecipients)) * 100)
        : 0,
    },
  ];

  const readiness: OutreachReadiness = {
    claimTokenConfigured: isClaimTokenConfigured(),
    scrapegraphConfigured: Boolean(process.env.SCRAPEGRAPH_API_KEY),
    unclaimedWithPhone,
    unclaimedEligible: unclaimedWithPhone,
    draftCampaigns,
    liveCampaigns,
    suppressedCount,
  };

  return {
    invitations,
    recipientStates,
    campaignStatuses,
    funnel,
    readiness,
    claimSummary: {
      claimed,
      unclaimed,
      claimRate: discoveryCompanyIds.length > 0 ? Math.round((claimed / discoveryCompanyIds.length) * 100) : 0,
    },
    generatedAt: new Date().toISOString(),
  };
}
