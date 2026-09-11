/**
 * Discovery Engine health metrics — computed from existing tables (no mock data).
 */

import { prisma } from '@/lib/prisma';
import { DISCOVERY_SUPPLIER_WHERE, categoryFromPreferences } from './supplier-scope';

const DISCOVERY_WHERE = DISCOVERY_SUPPLIER_WHERE;

export interface DiscoveryHealthMetrics {
  imported: number;
  claimed: number;
  unclaimed: number;
  claimRate: number;
  invitationSent: number;
  invitationClaimed: number;
  invitationConversion: number;
  trustDistribution: { bucket: string; count: number }[];
  categoryCoverage: { category: string; count: number }[];
  outreachQueued: number;
  outreachSent: number;
  recentImports7d: number;
}

export async function computeDiscoveryHealth(): Promise<DiscoveryHealthMetrics> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [imported, claimed, unclaimed, suppliers, recipients, recentImports7d] = await Promise.all([
    prisma.user.count({ where: DISCOVERY_WHERE }),
    prisma.user.count({ where: { ...DISCOVERY_WHERE, isClaimed: true } }),
    prisma.user.count({ where: { ...DISCOVERY_WHERE, isClaimed: false } }),
    prisma.user.findMany({
      where: DISCOVERY_WHERE,
      select: { trustScore: true, preferences: true },
    }),
    prisma.outreachRecipient.findMany({
      where: {
        company: {
          role: 'SUPPLIER',
          OR: [
            { importedFrom: { startsWith: DISCOVERY_IMPORTED_FROM_PREFIX } },
            { importedFrom: 'admin_import' },
          ],
        },
      },
      select: { state: true, sentAt: true, claimedAt: true },
    }),
    prisma.user.count({
      where: { ...DISCOVERY_WHERE, createdAt: { gte: sevenDaysAgo } },
    }),
  ]);

  const invitationSent = recipients.filter((r) => r.sentAt || r.state === 'SENT' || r.state === 'DELIVERED').length;
  const invitationClaimed = recipients.filter((r) => r.claimedAt || r.state === 'CLAIMED').length;

  // Trust score buckets
  const buckets = [
    { bucket: '0–19', min: 0, max: 19 },
    { bucket: '20–39', min: 20, max: 39 },
    { bucket: '40–59', min: 40, max: 59 },
    { bucket: '60–79', min: 60, max: 79 },
    { bucket: '80–100', min: 80, max: 100 },
  ];
  const trustDistribution = buckets.map((b) => ({
    bucket: b.bucket,
    count: suppliers.filter((s) => s.trustScore >= b.min && s.trustScore <= b.max).length,
  }));

  // Category coverage
  const catMap = new Map<string, number>();
  for (const s of suppliers) {
    const cat = categoryFromPreferences(s.preferences);
    catMap.set(cat, (catMap.get(cat) ?? 0) + 1);
  }
  const categoryCoverage = Array.from(catMap.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  const outreachQueued = recipients.filter((r) => r.state === 'QUEUED' || r.state === 'PENDING').length;
  const outreachSent = invitationSent;

  return {
    imported,
    claimed,
    unclaimed,
    claimRate: imported > 0 ? Math.round((claimed / imported) * 100) : 0,
    invitationSent,
    invitationClaimed,
    invitationConversion: invitationSent > 0 ? Math.round((invitationClaimed / invitationSent) * 100) : 0,
    trustDistribution,
    categoryCoverage,
    outreachQueued,
    outreachSent,
    recentImports7d,
  };
}
