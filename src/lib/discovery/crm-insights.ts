/**
 * Discovery CRM Insights — claimed/unclaimed, source performance, top converters.
 */

import { prisma } from '@/lib/prisma';
import {
  DISCOVERY_SUPPLIER_WHERE,
  categoryFromPreferences,
  cityFromLocation,
  sourceFromImportedFrom,
  claimRate,
} from './supplier-scope';

export interface ClaimedUnclaimedSummary {
  claimed: number;
  unclaimed: number;
  claimRate: number;
  claimedLast7d: number;
  claimedLast30d: number;
}

export interface SourcePerformance {
  source: string;
  imported: number;
  claimed: number;
  claimRate: number;
  avgTrustScore: number;
}

export interface TopConverter {
  name: string;
  imported: number;
  claimed: number;
  claimRate: number;
}

export interface DiscoveryCrmInsights {
  claimedUnclaimed: ClaimedUnclaimedSummary;
  sourcePerformance: SourcePerformance[];
  topCategories: TopConverter[];
  topCities: TopConverter[];
  generatedAt: string;
}

export async function computeDiscoveryCrmInsights(): Promise<DiscoveryCrmInsights> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [suppliers, claimedLast7d, claimedLast30d] = await Promise.all([
    prisma.user.findMany({
      where: DISCOVERY_SUPPLIER_WHERE,
      select: {
        isClaimed: true,
        claimedAt: true,
        trustScore: true,
        preferences: true,
        location: true,
        importedFrom: true,
      },
    }),
    prisma.user.count({
      where: { ...DISCOVERY_SUPPLIER_WHERE, isClaimed: true, claimedAt: { gte: sevenDaysAgo } },
    }),
    prisma.user.count({
      where: { ...DISCOVERY_SUPPLIER_WHERE, isClaimed: true, claimedAt: { gte: thirtyDaysAgo } },
    }),
  ]);

  const claimed = suppliers.filter((s) => s.isClaimed).length;
  const unclaimed = suppliers.length - claimed;

  const sourceMap = new Map<string, { imported: number; claimed: number; trustSum: number }>();
  const catMap = new Map<string, { imported: number; claimed: number }>();
  const cityMap = new Map<string, { imported: number; claimed: number }>();

  for (const s of suppliers) {
    const source = sourceFromImportedFrom(s.importedFrom);
    const cat = categoryFromPreferences(s.preferences);
    const city = cityFromLocation(s.location);

    const src = sourceMap.get(source) ?? { imported: 0, claimed: 0, trustSum: 0 };
    src.imported++;
    if (s.isClaimed) src.claimed++;
    src.trustSum += s.trustScore;
    sourceMap.set(source, src);

    for (const [map, key] of [[catMap, cat], [cityMap, city]] as const) {
      const entry = map.get(key) ?? { imported: 0, claimed: 0 };
      entry.imported++;
      if (s.isClaimed) entry.claimed++;
      map.set(key, entry);
    }
  }

  const sourcePerformance: SourcePerformance[] = Array.from(sourceMap.entries())
    .map(([source, v]) => ({
      source,
      imported: v.imported,
      claimed: v.claimed,
      claimRate: claimRate(v.claimed, v.imported),
      avgTrustScore: v.imported > 0 ? Math.round(v.trustSum / v.imported) : 0,
    }))
    .sort((a, b) => b.claimRate - a.claimRate || b.imported - a.imported);

  const toTopConverters = (map: Map<string, { imported: number; claimed: number }>): TopConverter[] =>
    Array.from(map.entries())
      .filter(([, v]) => v.imported >= 1)
      .map(([name, v]) => ({
        name,
        imported: v.imported,
        claimed: v.claimed,
        claimRate: claimRate(v.claimed, v.imported),
      }))
      .sort((a, b) => b.claimRate - a.claimRate || b.claimed - a.claimed)
      .slice(0, 15);

  return {
    claimedUnclaimed: {
      claimed,
      unclaimed,
      claimRate: claimRate(claimed, suppliers.length),
      claimedLast7d,
      claimedLast30d,
    },
    sourcePerformance,
    topCategories: toTopConverters(catMap),
    topCities: toTopConverters(cityMap),
    generatedAt: new Date().toISOString(),
  };
}
