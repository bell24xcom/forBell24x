/**
 * Trust Score Engine status — formula doc + live aggregates from User.trustScore.
 */

import { prisma } from '@/lib/prisma';
import { TRUST_SCORE_FORMULA } from '@/src/lib/trust-formula';
import { DISCOVERY_SUPPLIER_WHERE } from './supplier-scope';

export interface TrustEngineStatus {
  formula: typeof TRUST_SCORE_FORMULA;
  cronEndpoint: string;
  discoveredSuppliers: {
    count: number;
    avgScore: number;
    min: number;
    max: number;
    claimedAvg: number;
    unclaimedAvg: number;
    distribution: { bucket: string; count: number }[];
  };
  allSuppliers: {
    count: number;
    avgScore: number;
    highTrustCount: number;
  };
  generatedAt: string;
}

export async function computeTrustEngineStatus(): Promise<TrustEngineStatus> {
  const [discovered, allSuppliers] = await Promise.all([
    prisma.user.findMany({
      where: DISCOVERY_SUPPLIER_WHERE,
      select: { trustScore: true, isClaimed: true },
    }),
    prisma.user.findMany({
      where: { role: 'SUPPLIER' },
      select: { trustScore: true },
    }),
  ]);

  const buckets = [
    { bucket: '0–19', min: 0, max: 19 },
    { bucket: '20–39', min: 20, max: 39 },
    { bucket: '40–59', min: 40, max: 59 },
    { bucket: '60–79', min: 60, max: 79 },
    { bucket: '80–100', min: 80, max: 100 },
  ];

  const distribution = buckets.map((b) => ({
    bucket: b.bucket,
    count: discovered.filter((s) => s.trustScore >= b.min && s.trustScore <= b.max).length,
  }));

  const scores = discovered.map((s) => s.trustScore);
  const claimedScores = discovered.filter((s) => s.isClaimed).map((s) => s.trustScore);
  const unclaimedScores = discovered.filter((s) => !s.isClaimed).map((s) => s.trustScore);

  const avg = (arr: number[]) => (arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0);

  return {
    formula: TRUST_SCORE_FORMULA,
    cronEndpoint: '/api/cron/trust-scores',
    discoveredSuppliers: {
      count: discovered.length,
      avgScore: avg(scores),
      min: scores.length ? Math.min(...scores) : 0,
      max: scores.length ? Math.max(...scores) : 0,
      claimedAvg: avg(claimedScores),
      unclaimedAvg: avg(unclaimedScores),
      distribution,
    },
    allSuppliers: {
      count: allSuppliers.length,
      avgScore: avg(allSuppliers.map((s) => s.trustScore)),
      highTrustCount: allSuppliers.filter((s) => s.trustScore >= 70).length,
    },
    generatedAt: new Date().toISOString(),
  };
}
