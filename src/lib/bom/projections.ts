/**
 * Project BOM memory modules from BusinessLifeEvent stream.
 * Company DNA reads projections — not raw tables directly.
 */

import type { CompanyDnaLayers } from '@/src/lib/company-dna/types';
import { getLifeEvents, lifeEventLabel, type LifeEventView } from './life-events';
import { BOM_MODULES } from './modules';

export interface BomProjection {
  companyId: string;
  eventCount: number;
  timeline: { year: number; label: string; eventType: string; intent?: string }[];
  decisions: { decision: string; outcome?: string; date?: string; impactPct?: number }[];
  intents: string[];
  productNames: string[];
  categories: string[];
  layers: Partial<CompanyDnaLayers>;
  moduleScores: Record<string, number>;
}

function extractProducts(events: LifeEventView[]): string[] {
  const names = new Set<string>();
  for (const e of events) {
    if (e.eventType === 'product_added' || e.eventType === 'product_updated') {
      const n = e.metadata?.productName ?? e.metadata?.name;
      if (typeof n === 'string') names.add(n);
    }
  }
  return Array.from(names);
}

function extractCategories(events: LifeEventView[]): string[] {
  const cats = new Set<string>();
  for (const e of events) {
    if (e.category) cats.add(e.category);
  }
  return Array.from(cats);
}

function scoreModule(moduleId: string, events: LifeEventView[]): number {
  const mod = BOM_MODULES.find(m => m.id === moduleId);
  if (!mod) return 0;
  if (mod.eventTypes.includes('*')) return Math.min(100, events.length * 5);
  const hits = events.filter(e => mod.eventTypes.includes(e.eventType)).length;
  return Math.min(100, hits * 15);
}

export async function projectBomFromLifeEvents(companyId: string): Promise<BomProjection> {
  const events = await getLifeEvents(companyId, 200);
  const chronological = [...events].reverse();

  const timeline = chronological.map(e => ({
    year: new Date(e.createdAt).getFullYear(),
    label: lifeEventLabel(e.eventType),
    eventType: e.eventType,
    intent: e.intent ?? undefined,
  }));

  const decisions = events
    .filter(e => e.decision || e.eventType === 'supplier_changed' || e.eventType === 'decision_recorded')
    .map(e => ({
      decision: e.decision ?? lifeEventLabel(e.eventType),
      outcome: e.outcome ?? undefined,
      date: e.createdAt.slice(0, 10),
      impactPct: typeof e.metadata?.impactPct === 'number' ? e.metadata.impactPct : undefined,
    }))
    .slice(0, 20);

  const intents = Array.from(new Set(events.map(e => e.intent).filter(Boolean) as string[]));
  const productNames = extractProducts(events);
  const categories = extractCategories(events);

  const rfqCount = events.filter(e =>
    ['rfq_created', 'voice_rfq', 'video_rfq'].includes(e.eventType),
  ).length;
  const quoteCount = events.filter(e => e.eventType === 'quote_received').length;

  const layers: Partial<CompanyDnaLayers> = {
    procurementMemory: {
      rfqCount,
      quotationCount: quoteCount,
      recentRfqs: events
        .filter(e => ['rfq_created', 'voice_rfq', 'video_rfq'].includes(e.eventType))
        .slice(0, 5)
        .map(e => ({
          id: String(e.metadata?.rfqId ?? e.id),
          title: String(e.metadata?.title ?? lifeEventLabel(e.eventType)),
          category: e.category ?? 'General',
        })),
    },
    business: {
      products: productNames.length ? productNames : undefined,
      industry: categories[0],
    },
    market: {
      productsSold: productNames.length ? productNames : undefined,
    },
    decisions: decisions.length ? decisions : undefined,
    aiMemory: {
      summary:
        events.length === 0
          ? 'No business life events recorded yet.'
          : `${events.length} life events recorded. Latest: ${lifeEventLabel(events[0].eventType)}.`,
      whatHappened: events.slice(0, 5).map(e => lifeEventLabel(e.eventType)),
      likelyNext: intents.length ? [`Intent pattern: ${intents[0]}`] : undefined,
    },
  };

  const moduleScores: Record<string, number> = {};
  for (const mod of BOM_MODULES) {
    if (mod.enabled) moduleScores[mod.id] = scoreModule(mod.id, events);
  }

  return {
    companyId,
    eventCount: events.length,
    timeline,
    decisions,
    intents,
    productNames,
    categories,
    layers,
    moduleScores,
  };
}

export function mergeLayersFromProjection(
  base: CompanyDnaLayers,
  projection: BomProjection,
): CompanyDnaLayers {
  return {
    ...base,
    business: { ...base.business, ...projection.layers.business },
    market: { ...base.market, ...projection.layers.market },
    procurementMemory: { ...base.procurementMemory, ...projection.layers.procurementMemory },
    decisions: projection.layers.decisions ?? base.decisions,
    aiMemory: { ...base.aiMemory, ...projection.layers.aiMemory },
  };
}
