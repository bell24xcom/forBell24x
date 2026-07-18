/**
 * Industry Intelligence seed catalog.
 */

import type { IndustryIntelligenceRecord } from '@/src/lib/industry-intelligence/types';
import { withDbTimeout, DbTimeoutError } from '@/src/lib/db-timeout';

export const INDUSTRY_INTELLIGENCE_CATALOG: Record<string, IndustryIntelligenceRecord> = {
  'fabric-sampling-industry': {
    slug: 'fabric-sampling-industry',
    name: 'Fabric Sampling & Swatch Book Industry',
    description:
      'Manufacturers and suppliers producing fabric sample books, swatch cards, and presentation formats for domestic and export textile buyers.',
    manufacturers: ['Digitex Studio', 'Swatch book binders', 'Textile presentation houses'],
    suppliers: ['Binding hardware suppliers', 'Fabric mills', 'Label printers'],
    buyers: ['Furniture OEMs', 'Interior designers', 'Export houses', 'Retail chains'],
    products: [
      'fabric-sample-books',
      'upholstery-fabric-swatch-books',
      'curtain-fabric-swatch-books',
      'fabric-sample-cards',
      'pvc-sample-books',
      'sample-book-fasteners-binding-hardware',
    ],
    machines: ['Swatch cutting machine', 'Binding press', 'Corner rounding machine', 'Label printer'],
    rawMaterials: ['Cotton fabric', 'Synthetic fabric', 'Binding board', 'Metal fasteners', 'PVC sheets'],
    standards: ['OEKO-TEX (textile)', 'ISO 9001 (process quality)'],
    tradeAssociations: ['AEPC', 'CITI', 'MAIT'],
    tradeShows: ['India ITME', 'Heimtextil (Frankfurt)', 'Index Mumbai'],
    governmentSchemes: ['RoDTEP', 'Export Promotion Capital Goods (EPCG)'],
    certifications: ['GST registration', 'Udyam MSME', 'IEC for exporters'],
    relatedClusterSlugs: ['bhiwandi-textile-cluster', 'surat-gidc'],
    relatedProductSlugs: ['fabric-sample-books'],
    trends: {
      importTrend: 'Binding hardware partially imported from East Asia',
      exportTrend: 'Growing export of premium presentation formats',
      priceTrend: 'Stable with premium segment rising 8–12% YoY',
      procurementTrend: 'Bulk orders from hospitality and furniture OEMs',
      hiringTrend: 'Skilled binding operators in demand in Bhiwandi corridor',
    },
    updatedAt: '2026-06-27',
  },

  'upholstery-furniture-industry': {
    slug: 'upholstery-furniture-industry',
    name: 'Upholstery & Furniture Industry',
    description: 'Furniture manufacturers, upholstery fabric buyers, and interior supply chains.',
    products: ['upholstery-fabric-swatch-books', 'fabric-sample-books'],
    relatedClusterSlugs: ['bhiwandi-textile-cluster'],
    trends: { demandTrend: 'Hospitality recovery driving swatch book orders' },
    updatedAt: '2026-06-27',
  },

  'automotive-interiors': {
    slug: 'automotive-interiors',
    name: 'Automotive Interiors Industry',
    description: 'Auto OEM and tier-2 suppliers sourcing synthetic and PVC sampling formats.',
    products: ['pvc-sample-books'],
    relatedClusterSlugs: ['chakan-auto-cluster'],
    trends: { procurementTrend: 'EV interior programmes increasing sampling frequency' },
    updatedAt: '2026-06-27',
  },

  'metal-hardware-industry': {
    slug: 'metal-hardware-industry',
    name: 'Metal Hardware & Fasteners',
    description: 'Suppliers of binding screws, corners, and presentation hardware.',
    products: ['sample-book-fasteners-binding-hardware'],
    relatedClusterSlugs: ['rajkot-engineering', 'kalamboli-metals-cluster'],
    trends: { priceTrend: 'Steel-linked pricing with quarterly adjustments' },
    updatedAt: '2026-06-27',
  },
};

/**
 * DB-backed reads (src/lib/industry-intelligence/service.ts), falling back to this
 * static catalog if the DB table isn't reachable yet (e.g. before migration 0005 runs)
 * or a DB call is slow (see withDbTimeout — 1.5s guard, never blocks page render).
 */
export async function listIndustrySlugs(): Promise<string[]> {
  try {
    const slugs = await withDbTimeout(async () => {
      const { listIndustrySlugsFromDb } = await import('@/src/lib/industry-intelligence/service');
      return listIndustrySlugsFromDb();
    });
    if (slugs.length > 0) return slugs;
  } catch (err) {
    if (err instanceof DbTimeoutError) console.warn('[industry-intelligence] listIndustrySlugs: DB timeout, falling back to static catalog');
    /* DB table may not exist until migration 0005 runs, or DB call timed out */
  }
  return Object.keys(INDUSTRY_INTELLIGENCE_CATALOG);
}

export async function getIndustryRecord(slug: string): Promise<IndustryIntelligenceRecord | null> {
  try {
    const record = await withDbTimeout(async () => {
      const { getIndustryRecordBySlug } = await import('@/src/lib/industry-intelligence/service');
      return getIndustryRecordBySlug(slug);
    });
    if (record) return record;
  } catch (err) {
    if (err instanceof DbTimeoutError) console.warn(`[industry-intelligence] getIndustryRecord(${slug}): DB timeout, falling back to static catalog`);
    /* DB table may not exist until migration 0005 runs, or DB call timed out */
  }
  return INDUSTRY_INTELLIGENCE_CATALOG[slug] ?? null;
}

/**
 * Batch fallback for the N+1 fix — callers should prefer this over mapping
 * `getIndustryRecord` across a slug array. One batched DB round trip (via
 * getIndustryRecordsBySlugs) instead of N, with the same per-slug static fallback.
 */
export async function getIndustryRecords(slugs: string[]): Promise<Map<string, IndustryIntelligenceRecord | null>> {
  const result = new Map<string, IndustryIntelligenceRecord | null>();
  if (slugs.length === 0) return result;
  try {
    const dbResult = await withDbTimeout(async () => {
      const { getIndustryRecordsBySlugs } = await import('@/src/lib/industry-intelligence/service');
      return getIndustryRecordsBySlugs(slugs);
    });
    for (const s of slugs) result.set(s, dbResult.get(s) ?? INDUSTRY_INTELLIGENCE_CATALOG[s] ?? null);
    return result;
  } catch (err) {
    if (err instanceof DbTimeoutError) console.warn(`[industry-intelligence] getIndustryRecords: DB timeout, falling back to static catalog for ${slugs.length} slug(s)`);
    for (const s of slugs) result.set(s, INDUSTRY_INTELLIGENCE_CATALOG[s] ?? null);
    return result;
  }
}
