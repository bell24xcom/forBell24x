/**
 * Product Intelligence completeness scoring.
 */

import type { ProductIntelligenceRecord, ProductIntelligenceView } from './types';

const CHECKS: { key: string; test: (p: ProductIntelligenceRecord) => boolean }[] = [
  { key: 'name', test: p => !!p.name },
  { key: 'description', test: p => p.description.length > 40 },
  { key: 'category', test: p => !!p.category },
  { key: 'manufacturing.process', test: p => (p.manufacturing.process?.length ?? 0) > 0 },
  { key: 'manufacturing.rawMaterials', test: p => (p.manufacturing.rawMaterials?.length ?? 0) > 0 },
  { key: 'commercial.hsCode', test: p => !!p.commercial.hsCode },
  { key: 'commercial.moq', test: p => !!p.commercial.moq },
  { key: 'commercial.exportMarkets', test: p => (p.commercial.exportMarkets?.length ?? 0) > 0 },
  { key: 'knowledge.faqs', test: p => (p.knowledge.faqs?.length ?? 0) >= 2 },
  { key: 'businessIntel.relatedIndustrySlugs', test: p => (p.businessIntel.relatedIndustrySlugs?.length ?? 0) > 0 },
  { key: 'businessIntel.relatedClusterSlugs', test: p => (p.businessIntel.relatedClusterSlugs?.length ?? 0) > 0 },
  { key: 'seo.metaTitle', test: p => !!p.seo.metaTitle },
  { key: 'seo.metaDescription', test: p => !!p.seo.metaDescription },
];

export function scoreProductIntelligence(record: ProductIntelligenceRecord): {
  completenessScore: number;
  missingFields: string[];
} {
  const missing: string[] = [];
  let hits = 0;
  for (const c of CHECKS) {
    if (c.test(record)) hits++;
    else missing.push(c.key);
  }
  return {
    completenessScore: Math.round((hits / CHECKS.length) * 100),
    missingFields: missing,
  };
}

export function toProductView(record: ProductIntelligenceRecord): ProductIntelligenceView {
  const { completenessScore, missingFields } = scoreProductIntelligence(record);
  return { ...record, completenessScore, missingFields };
}

export function averageProductCompleteness(records: ProductIntelligenceRecord[]): number {
  if (records.length === 0) return 0;
  const sum = records.reduce((a, r) => a + scoreProductIntelligence(r).completenessScore, 0);
  return Math.round(sum / records.length);
}
