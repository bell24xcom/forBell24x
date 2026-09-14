/**
 * Discovery Intelligence Board — category, city, source, and conversion metrics.
 */

import { prisma } from '@/lib/prisma';
import {
  DISCOVERY_SUPPLIER_WHERE,
  categoryFromPreferences,
  cityFromLocation,
  sourceFromImportedFrom,
  claimRate,
} from './supplier-scope';

export interface CategoryIntelligence {
  category: string;
  imported: number;
  claimed: number;
  claimRate: number;
  avgTrustScore: number;
}

export interface CityIntelligence {
  city: string;
  imported: number;
  claimed: number;
  claimRate: number;
}

export interface SourceIntelligence {
  source: string;
  imported: number;
  claimed: number;
  claimRate: number;
  outreachSent: number;
  outreachClaimed: number;
}

export interface DiscoveryConversionMetrics {
  imported: number;
  withOutreach: number;
  outreachRate: number;
  sent: number;
  sentRate: number;
  claimed: number;
  claimRate: number;
  endToEndConversion: number;
}

export interface DiscoveryIntelligence {
  categories: CategoryIntelligence[];
  cities: CityIntelligence[];
  sources: SourceIntelligence[];
  conversion: DiscoveryConversionMetrics;
  generatedAt: string;
}

function aggregateByKey<T extends { imported: number; claimed: number }>(
  map: Map<string, T & { trustSum?: number }>,
  key: string,
  isClaimed: boolean,
  trustScore: number,
): void {
  const entry = map.get(key) ?? { imported: 0, claimed: 0, trustSum: 0 };
  entry.imported++;
  if (isClaimed) entry.claimed++;
  entry.trustSum = (entry.trustSum ?? 0) + trustScore;
  map.set(key, entry);
}

export async function computeDiscoveryIntelligence(): Promise<DiscoveryIntelligence> {
  const [suppliers, recipients] = await Promise.all([
    prisma.user.findMany({
      where: DISCOVERY_SUPPLIER_WHERE,
      select: {
        id: true,
        isClaimed: true,
        trustScore: true,
        preferences: true,
        location: true,
        importedFrom: true,
      },
    }),
    prisma.outreachRecipient.findMany({
      where: { company: DISCOVERY_SUPPLIER_WHERE },
      select: { companyId: true, state: true, sentAt: true, claimedAt: true },
    }),
  ]);

  const catMap = new Map<string, { imported: number; claimed: number; trustSum: number }>();
  const cityMap = new Map<string, { imported: number; claimed: number }>();
  const sourceMap = new Map<string, { imported: number; claimed: number }>();

  for (const s of suppliers) {
    const cat = categoryFromPreferences(s.preferences);
    const city = cityFromLocation(s.location);
    const source = sourceFromImportedFrom(s.importedFrom);

    aggregateByKey(catMap, cat, s.isClaimed, s.trustScore);
    aggregateByKey(cityMap, city, s.isClaimed, 0);
    aggregateByKey(sourceMap, source, s.isClaimed, 0);
  }

  const companyOutreach = new Map<string, { sent: boolean; claimed: boolean }>();
  for (const r of recipients) {
    const cur = companyOutreach.get(r.companyId) ?? { sent: false, claimed: false };
    if (r.sentAt || r.state === 'SENT' || r.state === 'DELIVERED') cur.sent = true;
    if (r.claimedAt || r.state === 'CLAIMED') cur.claimed = true;
    companyOutreach.set(r.companyId, cur);
  }

  const categories: CategoryIntelligence[] = Array.from(catMap.entries())
    .map(([category, v]) => ({
      category,
      imported: v.imported,
      claimed: v.claimed,
      claimRate: claimRate(v.claimed, v.imported),
      avgTrustScore: v.imported > 0 ? Math.round(v.trustSum / v.imported) : 0,
    }))
    .sort((a, b) => b.imported - a.imported);

  const cities: CityIntelligence[] = Array.from(cityMap.entries())
    .map(([city, v]) => ({
      city,
      imported: v.imported,
      claimed: v.claimed,
      claimRate: claimRate(v.claimed, v.imported),
    }))
    .sort((a, b) => b.imported - a.imported);

  const sources: SourceIntelligence[] = Array.from(sourceMap.entries())
    .map(([source, v]) => {
      const companyIds = suppliers.filter((s) => sourceFromImportedFrom(s.importedFrom) === source).map((s) => s.id);
      let outreachSent = 0;
      let outreachClaimed = 0;
      for (const id of companyIds) {
        const o = companyOutreach.get(id);
        if (o?.sent) outreachSent++;
        if (o?.claimed) outreachClaimed++;
      }
      return {
        source,
        imported: v.imported,
        claimed: v.claimed,
        claimRate: claimRate(v.claimed, v.imported),
        outreachSent,
        outreachClaimed,
      };
    })
    .sort((a, b) => b.imported - a.imported);

  const imported = suppliers.length;
  const withOutreach = companyOutreach.size;
  const sent = Array.from(companyOutreach.values()).filter((o) => o.sent).length;
  const claimed = suppliers.filter((s) => s.isClaimed).length;

  const conversion: DiscoveryConversionMetrics = {
    imported,
    withOutreach,
    outreachRate: claimRate(withOutreach, imported),
    sent,
    sentRate: claimRate(sent, Math.max(withOutreach, 1)),
    claimed,
    claimRate: claimRate(claimed, imported),
    endToEndConversion: claimRate(claimed, imported),
  };

  return {
    categories,
    cities,
    sources,
    conversion,
    generatedAt: new Date().toISOString(),
  };
}
