/**
 * Runtime probes for Discovery Readiness board — no schema changes.
 */

import { prisma } from '@/lib/prisma';
import type { ReadinessItem } from './types';

export async function buildDiscoveryReadinessBoard(): Promise<ReadinessItem[]> {
  const hasScrapeKey = Boolean(process.env.SCRAPEGRAPH_API_KEY);
  const hasClaimToken = Boolean(process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32);

  const [discoveredCount, claimedCount, campaignCount, interactionCount] = await Promise.all([
    prisma.user.count({
      where: {
        role: 'SUPPLIER',
        OR: [{ importedFrom: { startsWith: 'discovery:' } }, { importedFrom: 'admin_import' }],
      },
    }),
    prisma.user.count({
      where: {
        role: 'SUPPLIER',
        isClaimed: true,
        OR: [{ importedFrom: { startsWith: 'discovery:' } }, { importedFrom: 'admin_import' }],
      },
    }),
    prisma.outreachCampaign.count(),
    prisma.interactionMemory.count({ where: { source: 'discovery' } }),
  ]);

  const ingestionReady = discoveredCount > 0;
  const crmReady = interactionCount > 0 || claimedCount > 0;
  const invitationReady = campaignCount > 0;

  return [
    {
      id: 'search',
      label: 'Search',
      status: hasScrapeKey ? 'READY' : 'PARTIAL',
      note: hasScrapeKey
        ? 'ScrapeGraph + Google search wired; public-web policy enforced.'
        : 'SCRAPEGRAPH_API_KEY not set — scrape runs will fail.',
    },
    {
      id: 'ingestion',
      label: 'Ingestion',
      status: ingestionReady ? 'READY' : 'PARTIAL',
      note: ingestionReady
        ? `${discoveredCount} discovered suppliers ingested as unclaimed Users.`
        : 'Pipeline wired; no discovered suppliers yet.',
    },
    {
      id: 'enrichment',
      label: 'Enrichment',
      status: 'PARTIAL',
      note: 'Metadata in preferences.discovery Json; no automated GST/website enrichment API.',
    },
    {
      id: 'trust',
      label: 'Trust Score',
      status: 'PARTIAL',
      note: 'User.trustScore + event bumps + daily batch cron at /api/cron/trust-scores.',
    },
    {
      id: 'invitation',
      label: 'Invitation Engine',
      status: invitationReady ? (hasClaimToken ? 'READY' : 'PARTIAL') : 'PARTIAL',
      note: invitationReady
        ? `${campaignCount} outreach campaigns; H6-13 state machine active.`
        : 'Campaign service wired; create first DRAFT campaign to activate.',
    },
    {
      id: 'crm',
      label: 'CRM Journey',
      status: crmReady ? 'READY' : 'PARTIAL',
      note: crmReady
        ? 'Per-company timeline API + /admin/crm/[userId] journey page live.'
        : 'Timeline API wired; awaiting first discovery events.',
    },
    {
      id: 'rfq',
      label: 'RFQ Matching',
      status: 'PARTIAL',
      note: 'orchestration.ts production-ready; voice/video paths use parallel Agent Zero.',
    },
  ];
}

export function discoveryReadinessScoreFromBoard(board: ReadinessItem[]): {
  score: number;
  ready: number;
  partial: number;
  missing: number;
} {
  const ready = board.filter((i) => i.status === 'READY').length;
  const partial = board.filter((i) => i.status === 'PARTIAL').length;
  const missing = board.filter((i) => i.status === 'MISSING').length;
  const total = board.length;
  const score = Math.round(((ready + partial * 0.5) / total) * 100);
  return { score, ready, partial, missing };
}
