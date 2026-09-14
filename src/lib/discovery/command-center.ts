/**
 * Founder Discovery Command Center — composite health across discovery, outreach, claim, trust.
 */

import { computeDiscoveryHealth } from './health';
import { computeInvitationEngineMetrics } from './invitation-metrics';
import { buildDiscoveryReadinessBoard, discoveryReadinessScoreFromBoard } from './readiness-probe';
import { prisma } from '@/lib/prisma';

export type HealthSignal = 'healthy' | 'attention' | 'critical' | 'unknown';

export interface CommandCenterPillar {
  id: string;
  label: string;
  signal: HealthSignal;
  summary: string;
  metrics: Record<string, number | string>;
}

export interface DiscoveryCommandCenter {
  pillars: CommandCenterPillar[];
  readinessScore: number;
  overallSignal: HealthSignal;
  generatedAt: string;
}

function signalFromRate(rate: number, healthyMin: number, attentionMin: number): HealthSignal {
  if (rate >= healthyMin) return 'healthy';
  if (rate >= attentionMin) return 'attention';
  return 'critical';
}

function worstSignal(signals: HealthSignal[]): HealthSignal {
  if (signals.includes('critical')) return 'critical';
  if (signals.includes('attention')) return 'attention';
  if (signals.includes('unknown')) return 'unknown';
  return 'healthy';
}

export async function computeDiscoveryCommandCenter(): Promise<DiscoveryCommandCenter> {
  const [health, invitation, board, recentClaimEvents] = await Promise.all([
    computeDiscoveryHealth(),
    computeInvitationEngineMetrics(),
    buildDiscoveryReadinessBoard(),
    prisma.interactionMemory.count({
      where: {
        source: 'discovery',
        actionType: 'profile_claimed',
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),
  ]);

  const readiness = discoveryReadinessScoreFromBoard(board);
  const highTrust = health.trustDistribution
    .filter((b) => b.bucket === '60–79' || b.bucket === '80–100')
    .reduce((sum, b) => sum + b.count, 0);

  const discoverySignal: HealthSignal =
    health.imported === 0
      ? 'unknown'
      : signalFromRate(health.claimRate, 15, 5);

  const outreachSignal: HealthSignal =
    invitation.readiness.liveCampaigns === 0
      ? 'attention'
      : health.invitationSent === 0
        ? 'attention'
        : signalFromRate(health.invitationConversion, 20, 8);

  const claimSignal: HealthSignal =
    health.imported === 0 ? 'unknown' : signalFromRate(health.claimRate, 15, 5);

  const trustSignal: HealthSignal =
    health.imported === 0
      ? 'unknown'
      : highTrust / health.imported >= 0.3
        ? 'healthy'
        : highTrust / health.imported >= 0.1
          ? 'attention'
          : 'critical';

  const pillars: CommandCenterPillar[] = [
    {
      id: 'discovery',
      label: 'Discovery Health',
      signal: discoverySignal,
      summary: `${health.imported} imported · ${health.recentImports7d} in last 7 days`,
      metrics: {
        imported: health.imported,
        unclaimed: health.unclaimed,
        recentImports7d: health.recentImports7d,
        claimRate: `${health.claimRate}%`,
      },
    },
    {
      id: 'outreach',
      label: 'Outreach Health',
      signal: outreachSignal,
      summary: `${health.outreachSent} sent · ${health.outreachQueued} queued · ${invitation.readiness.liveCampaigns} live campaigns`,
      metrics: {
        sent: health.outreachSent,
        queued: health.outreachQueued,
        conversion: `${health.invitationConversion}%`,
        liveCampaigns: invitation.readiness.liveCampaigns,
        suppressed: invitation.readiness.suppressedCount,
      },
    },
    {
      id: 'claim',
      label: 'Claim Health',
      signal: claimSignal,
      summary: `${health.claimed} claimed · ${recentClaimEvents} claim events (7d)`,
      metrics: {
        claimed: health.claimed,
        unclaimed: health.unclaimed,
        claimRate: `${health.claimRate}%`,
        claimEvents7d: recentClaimEvents,
      },
    },
    {
      id: 'trust',
      label: 'Trust Score Health',
      signal: trustSignal,
      summary: `${highTrust} suppliers at 60+ trust score`,
      metrics: {
        highTrust60Plus: highTrust,
        distribution80Plus: health.trustDistribution.find((b) => b.bucket === '80–100')?.count ?? 0,
        readinessPartial: board.find((b) => b.id === 'trust')?.status ?? 'PARTIAL',
      },
    },
  ];

  const overallSignal = worstSignal(pillars.map((p) => p.signal));

  return {
    pillars,
    readinessScore: readiness.score,
    overallSignal,
    generatedAt: new Date().toISOString(),
  };
}
