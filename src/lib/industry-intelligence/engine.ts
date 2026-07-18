/**
 * Industry Intelligence engine + scoring.
 */

import {
  getIndustryRecord,
  getIndustryRecords,
  listIndustrySlugs,
} from '@/src/data/industry-intelligence-catalog';
import { getClusterRecord } from '@/src/data/industrial-clusters';
import { getProductRecords } from '@/src/data/product-intelligence-catalog';
import { listIndustryRecords as listIndustryRecordsDb } from './service';
import { paginate, type PaginationParams, type PaginatedResult } from '@/src/lib/pagination';
import type { IndustryIntelligenceRecord, IndustryIntelligenceView } from './types';

function definedRecords(
  slugs: string[],
  map: Map<string, IndustryIntelligenceRecord | null>,
): IndustryIntelligenceRecord[] {
  return slugs
    .map(s => map.get(s))
    .filter((r): r is IndustryIntelligenceRecord => r !== null && r !== undefined);
}

function scoreIndustry(record: IndustryIntelligenceRecord): number {
  const checks = [
    record.description.length > 50,
    (record.products?.length ?? 0) > 0,
    (record.manufacturers?.length ?? 0) > 0,
    (record.rawMaterials?.length ?? 0) > 0,
    (record.tradeShows?.length ?? 0) > 0,
    !!record.trends.exportTrend || !!record.trends.procurementTrend,
    (record.relatedClusterSlugs?.length ?? 0) > 0,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export async function toIndustryView(record: IndustryIntelligenceRecord): Promise<IndustryIntelligenceView> {
  const pulseAreaKeys = (record.relatedClusterSlugs ?? [])
    .map(s => getClusterRecord(s)?.areaKey)
    .filter((k): k is string => !!k);
  return {
    ...record,
    completenessScore: scoreIndustry(record),
    pulseAreaKeys: Array.from(new Set(pulseAreaKeys)),
  };
}

export async function listIndustries(): Promise<IndustryIntelligenceView[]>;
export async function listIndustries(pagination: PaginationParams): Promise<PaginatedResult<IndustryIntelligenceView>>;
export async function listIndustries(
  pagination?: PaginationParams,
): Promise<IndustryIntelligenceView[] | PaginatedResult<IndustryIntelligenceView>> {
  const slugs = await listIndustrySlugs();
  const records = await getIndustryRecords(slugs);
  const views = await Promise.all(definedRecords(slugs, records).map(toIndustryView));
  return pagination ? paginate(views, pagination) : views;
}

export async function getIndustry(slug: string): Promise<IndustryIntelligenceView | null> {
  const r = await getIndustryRecord(slug);
  return r ? toIndustryView(r) : null;
}

export async function getIndustryProducts(slug: string) {
  const r = await getIndustryRecord(slug);
  const productSlugs = r?.products ?? [];
  if (productSlugs.length === 0) return [];
  const products = await getProductRecords(productSlugs);
  return productSlugs.map(s => products.get(s)).filter(Boolean);
}

export async function getIndustryClusters(slug: string) {
  const r = await getIndustryRecord(slug);
  if (!r?.relatedClusterSlugs) return [];
  return r.relatedClusterSlugs.map(s => getClusterRecord(s)).filter(Boolean);
}

export async function industryCatalogStats() {
  const records = await listIndustryRecordsDb().catch(() => [] as IndustryIntelligenceRecord[]);
  let resolved = records;
  if (resolved.length === 0) {
    const slugs = await listIndustrySlugs();
    const map = await getIndustryRecords(slugs);
    resolved = definedRecords(slugs, map);
  }
  const scores = resolved.map(scoreIndustry);
  return {
    total: resolved.length,
    avgCompleteness: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
  };
}

export async function averageIndustryCompleteness(): Promise<number> {
  return (await industryCatalogStats()).avgCompleteness;
}
