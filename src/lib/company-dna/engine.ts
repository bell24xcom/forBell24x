/**
 * Company DNA Engine — syncs User + Elephant Memory → 15-layer Business DNA profile.
 */

import { prisma } from '@/lib/prisma';
import { getMarketInsights } from '@/lib/memory-engine';
import { buildDnaGraph } from './graph-builder';
import {
  DNA_LAYERS,
  type CompanyDnaLayers,
  type CompanyDnaProfileView,
  type DnaGraphData,
  type DnaLayerId,
} from './types';

function scoreLayer(data: unknown, requiredFields: number, filled: number): number {
  if (!data) return 0;
  return Math.min(100, Math.round((filled / Math.max(requiredFields, 1)) * 100));
}

function countFilled(obj: Record<string, unknown> | undefined | null): number {
  if (!obj) return 0;
  return Object.values(obj).filter(v => {
    if (v == null) return false;
    if (Array.isArray(v)) return v.length > 0;
    if (typeof v === 'string') return v.trim().length > 0;
    return true;
  }).length;
}

export function computeLayerScores(layers: CompanyDnaLayers): Record<string, number> {
  return {
    identity: scoreLayer(layers.identity, 6, countFilled(layers.identity as Record<string, unknown>)),
    business: scoreLayer(layers.business, 5, countFilled(layers.business as Record<string, unknown>)),
    procurement: scoreLayer(layers.procurement, 4, countFilled(layers.procurement as Record<string, unknown>)),
    suppliers: Math.min(100, (layers.suppliers?.length ?? 0) * 25),
    customers: scoreLayer(layers.customers, 4, countFilled(layers.customers as Record<string, unknown>)),
    financial: scoreLayer(layers.financial, 4, countFilled(layers.financial as Record<string, unknown>)),
    market: scoreLayer(layers.market, 4, countFilled(layers.market as Record<string, unknown>)),
    risk: scoreLayer(layers.risk, 4, countFilled(layers.risk as Record<string, unknown>)),
    trust: scoreLayer(layers.trust, 5, countFilled(layers.trust as Record<string, unknown>)),
    relationships: scoreLayer(layers.relationships, 3, countFilled(layers.relationships as Record<string, unknown>)),
    procurementMemory: scoreLayer(layers.procurementMemory, 4, countFilled(layers.procurementMemory as Record<string, unknown>)),
    decisions: Math.min(100, (layers.decisions?.length ?? 0) * 33),
    opportunities: scoreLayer(layers.opportunities, 3, countFilled(layers.opportunities as Record<string, unknown>)),
    timeline: 0,
    aiMemory: scoreLayer(layers.aiMemory, 3, countFilled(layers.aiMemory as Record<string, unknown>)),
  };
}

export function computeCompleteness(scores: Record<string, number>): number {
  const vals = Object.values(scores);
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

/** Demo DNA for Digitex Studio — fabric sample books example from product vision */
export function buildDigitexDemoLayers(): CompanyDnaLayers {
  return {
    identity: {
      companyName: 'Digitex Studio',
      gst: '27XXXXX0000X1Z5',
      udyam: 'UDYAM-MH-00-XXXXXXX',
      locations: ['Navi Mumbai, Maharashtra'],
      factoryLocations: ['Bhiwandi, Maharashtra'],
    },
    business: {
      industry: 'Packaging & Printing',
      subIndustry: 'Fabric Sample Books',
      products: ['Fabric Sample Books', 'Swatch Cards', 'Look Books'],
      monthlyProduction: '10,000 Books/month',
      installedMachinery: ['Printing', 'Cutting', 'Eyelet', 'Binding'],
      factoryArea: '5,000 sq ft',
    },
    procurement: {
      rawMaterials: ['Grey Board', 'PVC', 'Fabric Samples', 'Metal Corners'],
      consumables: ['Labels', 'Adhesives', 'Ink'],
      packaging: ['Shrink Wrap', 'Cartons'],
    },
    suppliers: [
      { name: 'Grey Board India', role: 'primary', yearsTogether: 4, qualityRating: 4.2, avgDeliveryDays: 7 },
      { name: 'PVC Traders Bhiwandi', role: 'backup', yearsTogether: 2, qualityRating: 3.8, avgDeliveryDays: 5 },
    ],
    customers: {
      topCustomers: ['Textile Exporters Surat', 'Garment Brands Mumbai'],
      customerCategories: ['Textile', 'Fashion', 'Export Houses'],
      exportMarkets: ['UAE', 'Bangladesh'],
    },
    financial: {
      enterpriseSize: 'small',
      growthTrend: 'rising',
      procurementSpendTrend: 'Stable with Q3 spike',
      salesTrend: 'Rising pre-Diwali',
    },
    market: {
      productsSold: ['Fabric Sample Books'],
      seasonality: ['Textile demand peaks before Diwali', 'PVC prices rise every July'],
      industryTrends: ['Eco-friendly swatch materials rising'],
    },
    risk: {
      supplierDependencyPct: 62,
      riskLevel: 'medium',
      notes: ['62% purchases from one grey board supplier'],
    },
    trust: {
      gstVerified: true,
      udyamVerified: true,
      yearsActive: 8,
      trustScore: 78,
      escrowCount: 3,
    },
    relationships: {
      associations: ['Bhiwandi Textile Association', 'KBBF Member'],
      industryNetwork: ['Surat Textile Cluster'],
    },
    procurementMemory: {
      rfqCount: 12,
      quotationCount: 34,
      supplierChanges: 1,
    },
    decisions: [
      { decision: 'Changed PVC supplier', outcome: 'Saved 8%', impactPct: 8 },
      { decision: 'Added eyelet machine', outcome: 'Delivery improved 2 days', impactPct: 15 },
    ],
    opportunities: {
      crossSell: ['Eco swatch books for export buyers'],
      exportOpportunities: ['UAE garment brands via VyaparSethu'],
      costSavings: ['Bulk grey board from alternate Gujarat supplier'],
    },
    aiMemory: {
      summary: 'Growing fabric sample book manufacturer with seasonal textile demand. Medium supplier concentration risk.',
      likelyNext: ['Diwali season volume spike', 'PVC cost watch in July'],
      recommendedActions: ['Diversify grey board supplier', 'List on VyaparSethu Packaging category'],
    },
  };
}

async function buildLayersFromUser(userId: string): Promise<{ layers: CompanyDnaLayers; companyName: string }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      quotes: { take: 20, orderBy: { createdAt: 'desc' }, include: { rfq: { select: { title: true, category: true } } } },
      rfqs: { take: 20, orderBy: { createdAt: 'desc' } },
      buyerDeals: { take: 10 },
      supplierDeals: { take: 10 },
    },
  });

  if (!user) throw new Error('User not found');

  const prefs = (user.preferences ?? {}) as { categories?: string[]; products?: string[]; cities?: string[] };
  const categories = prefs.categories ?? [];
  const primaryCategory = categories[0] ?? 'General';

  const rfqMemories = await prisma.rfqMemory.findMany({
    where: { OR: [{ rfqId: { in: user.rfqs.map(r => r.id) } }, { category: { in: categories } }] },
    take: 10,
    orderBy: { createdAt: 'desc' },
  });

  const quoteMemories = await prisma.quoteMemory.findMany({
    where: { supplierId: userId },
    take: 20,
    orderBy: { createdAt: 'desc' },
  });

  const marketInsight = await getMarketInsights(primaryCategory);

  const layers: CompanyDnaLayers = {
    identity: {
      companyName: user.company ?? user.name ?? undefined,
      gst: user.gstNumber ?? undefined,
      udyam: user.udyamNumber ?? undefined,
      locations: user.location ? [user.location] : prefs.cities,
    },
    business: {
      industry: primaryCategory,
      products: prefs.products,
      subIndustry: categories[1],
    },
    procurementMemory: {
      rfqCount: user.rfqs.length,
      quotationCount: user.quotes.length + quoteMemories.length,
      recentRfqs: rfqMemories.map(m => ({ id: m.rfqId, title: m.title, category: m.category })),
    },
    trust: {
      gstVerified: !!user.gstNumber && user.isVerified,
      udyamVerified: !!user.udyamNumber,
      trustScore: user.trustScore,
      transactionCount: user.buyerDeals.length + user.supplierDeals.length,
      escrowCount: user.buyerDeals.length + user.supplierDeals.length,
    },
    market: {
      categoryDemand: marketInsight
        ? { [primaryCategory]: marketInsight.demandTrend ?? 'STABLE' }
        : undefined,
      industryTrends: marketInsight?.demandTrend === 'RISING' ? ['Category demand rising on VyaparSethu'] : undefined,
    },
    financial: {
      enterpriseSize: user.plan === 'ENTERPRISE' ? 'medium' : user.plan === 'PRO' ? 'small' : 'micro',
      growthTrend: marketInsight?.demandTrend === 'RISING' ? 'rising' : marketInsight?.demandTrend === 'DECLINING' ? 'declining' : 'stable',
    },
    risk: {
      supplierDependencyPct: quoteMemories.length > 0 ? undefined : undefined,
      riskLevel: user.trustScore >= 70 ? 'low' : user.trustScore >= 40 ? 'medium' : 'high',
    },
    aiMemory: {
      summary: `VyaparSethu ${user.role} with ${categories.length} categories. Trust score ${user.trustScore}.`,
      recommendedActions: categories.length === 0 ? ['Complete category profile'] : ['Respond to matching RFQs'],
    },
  };

  return { layers, companyName: user.company ?? user.name ?? 'Unknown Company' };
}

export async function syncCompanyDna(userId: string, useDemo = false): Promise<CompanyDnaProfileView> {
  const { layers, companyName } = useDemo
    ? { layers: buildDigitexDemoLayers(), companyName: 'Digitex Studio' }
    : await buildLayersFromUser(userId);

  const layerScores = computeLayerScores(layers);
  const completeness = computeCompleteness(layerScores);
  const graph = buildDnaGraph(companyName, layers, completeness, layerScores);

  const timelineData = useDemo
    ? [
        { year: 2016, label: 'Company Started', eventType: 'founded' },
        { year: 2020, label: 'Udyam Registered', eventType: 'registration' },
        { year: 2024, label: 'New Factory Bhiwandi', eventType: 'expansion' },
        { year: 2026, label: 'Joined VyaparSethu', eventType: 'platform' },
      ]
    : userId
      ? [{ year: new Date().getFullYear(), label: 'DNA profile synced', eventType: 'sync' }]
      : [];

  const profile = await prisma.companyDnaProfile.upsert({
    where: { userId },
    create: {
      userId,
      companyName,
      completeness,
      layerScores,
      identity: layers.identity ?? undefined,
      business: layers.business ?? undefined,
      procurement: layers.procurement ?? undefined,
      suppliers: layers.suppliers ?? undefined,
      customers: layers.customers ?? undefined,
      financial: layers.financial ?? undefined,
      market: layers.market ?? undefined,
      risk: layers.risk ?? undefined,
      trust: layers.trust ?? undefined,
      relationships: layers.relationships ?? undefined,
      procurementMemory: layers.procurementMemory ?? undefined,
      decisions: layers.decisions ?? undefined,
      opportunities: layers.opportunities ?? undefined,
      aiMemory: layers.aiMemory ?? undefined,
      graphSnapshot: graph as object,
      lastSyncedAt: new Date(),
    },
    update: {
      companyName,
      completeness,
      layerScores,
      identity: layers.identity ?? undefined,
      business: layers.business ?? undefined,
      procurement: layers.procurement ?? undefined,
      suppliers: layers.suppliers ?? undefined,
      customers: layers.customers ?? undefined,
      financial: layers.financial ?? undefined,
      market: layers.market ?? undefined,
      risk: layers.risk ?? undefined,
      trust: layers.trust ?? undefined,
      relationships: layers.relationships ?? undefined,
      procurementMemory: layers.procurementMemory ?? undefined,
      decisions: layers.decisions ?? undefined,
      opportunities: layers.opportunities ?? undefined,
      aiMemory: layers.aiMemory ?? undefined,
      graphSnapshot: graph as object,
      lastSyncedAt: new Date(),
    },
    include: { timeline: true, memoryEvents: true },
  });

  if (timelineData.length) {
    await prisma.dnaTimelineEvent.deleteMany({ where: { profileId: profile.id } });
    await prisma.dnaTimelineEvent.createMany({
      data: timelineData.map(t => ({
        profileId: profile.id,
        year: t.year,
        label: t.label,
        eventType: t.eventType,
      })),
    });
  }

  if (useDemo && layers.decisions?.length) {
    await prisma.dnaMemoryEvent.deleteMany({ where: { profileId: profile.id } });
    await prisma.dnaMemoryEvent.createMany({
      data: layers.decisions.map(d => ({
        profileId: profile.id,
        layer: 'decisions',
        eventType: 'supplier_change',
        decision: d.decision,
        outcome: d.outcome,
        impactScore: d.impactPct,
      })),
    });
  }

  const refreshed = await prisma.companyDnaProfile.findUnique({
    where: { id: profile.id },
    include: { timeline: { orderBy: { year: 'asc' } }, memoryEvents: { orderBy: { createdAt: 'desc' }, take: 20 } },
  });

  return profileToView(refreshed!);
}

function profileToView(p: {
  id: string;
  userId: string;
  companyName: string | null;
  completeness: number;
  layerScores: unknown;
  identity: unknown;
  business: unknown;
  procurement: unknown;
  suppliers: unknown;
  customers: unknown;
  financial: unknown;
  market: unknown;
  risk: unknown;
  trust: unknown;
  relationships: unknown;
  procurementMemory: unknown;
  decisions: unknown;
  opportunities: unknown;
  aiMemory: unknown;
  lastSyncedAt: Date;
  timeline: { year: number; label: string; eventType: string }[];
  memoryEvents: unknown[];
}): CompanyDnaProfileView {
  return {
    id: p.id,
    userId: p.userId,
    companyName: p.companyName ?? 'Unknown',
    completeness: p.completeness,
    layerScores: (p.layerScores as Record<string, number>) ?? {},
    layers: {
      identity: p.identity as CompanyDnaLayers['identity'],
      business: p.business as CompanyDnaLayers['business'],
      procurement: p.procurement as CompanyDnaLayers['procurement'],
      suppliers: p.suppliers as CompanyDnaLayers['suppliers'],
      customers: p.customers as CompanyDnaLayers['customers'],
      financial: p.financial as CompanyDnaLayers['financial'],
      market: p.market as CompanyDnaLayers['market'],
      risk: p.risk as CompanyDnaLayers['risk'],
      trust: p.trust as CompanyDnaLayers['trust'],
      relationships: p.relationships as CompanyDnaLayers['relationships'],
      procurementMemory: p.procurementMemory as CompanyDnaLayers['procurementMemory'],
      decisions: p.decisions as CompanyDnaLayers['decisions'],
      opportunities: p.opportunities as CompanyDnaLayers['opportunities'],
      aiMemory: p.aiMemory as CompanyDnaLayers['aiMemory'],
    },
    timeline: p.timeline,
    memoryEventCount: p.memoryEvents.length,
    lastSyncedAt: p.lastSyncedAt.toISOString(),
  };
}

export async function getCompanyDnaProfile(userId: string): Promise<CompanyDnaProfileView | null> {
  const p = await prisma.companyDnaProfile.findUnique({
    where: { userId },
    include: { timeline: { orderBy: { year: 'asc' } }, memoryEvents: true },
  });
  if (!p) return null;
  return profileToView(p);
}

export async function listCompanyDnaProfiles(limit = 50): Promise<{ userId: string; companyName: string; completeness: number; lastSyncedAt: string }[]> {
  const rows = await prisma.companyDnaProfile.findMany({
    take: limit,
    orderBy: { lastSyncedAt: 'desc' },
    select: { userId: true, companyName: true, completeness: true, lastSyncedAt: true },
  });
  return rows.map(r => ({
    userId: r.userId,
    companyName: r.companyName ?? 'Unknown',
    completeness: r.completeness,
    lastSyncedAt: r.lastSyncedAt.toISOString(),
  }));
}

export async function getDnaGraphForUser(userId: string): Promise<DnaGraphData | null> {
  const p = await prisma.companyDnaProfile.findUnique({ where: { userId } });
  if (!p) return null;

  if (p.graphSnapshot) {
    return p.graphSnapshot as unknown as DnaGraphData;
  }

  const layers: CompanyDnaLayers = {
    identity: p.identity as CompanyDnaLayers['identity'],
    business: p.business as CompanyDnaLayers['business'],
    procurement: p.procurement as CompanyDnaLayers['procurement'],
    suppliers: p.suppliers as CompanyDnaLayers['suppliers'],
    customers: p.customers as CompanyDnaLayers['customers'],
    financial: p.financial as CompanyDnaLayers['financial'],
    market: p.market as CompanyDnaLayers['market'],
    risk: p.risk as CompanyDnaLayers['risk'],
    trust: p.trust as CompanyDnaLayers['trust'],
    relationships: p.relationships as CompanyDnaLayers['relationships'],
    procurementMemory: p.procurementMemory as CompanyDnaLayers['procurementMemory'],
    decisions: p.decisions as CompanyDnaLayers['decisions'],
    opportunities: p.opportunities as CompanyDnaLayers['opportunities'],
    aiMemory: p.aiMemory as CompanyDnaLayers['aiMemory'],
  };

  return buildDnaGraph(
    p.companyName ?? 'Company',
    layers,
    p.completeness,
    (p.layerScores as Record<string, number>) ?? {},
  );
}

export { DNA_LAYERS, type DnaLayerId };
