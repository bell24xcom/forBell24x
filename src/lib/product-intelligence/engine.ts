/**
 * Product Intelligence engine — read catalog + optional DB supplier products.
 */

import {
  getProductRecord,
  getProductRecords,
  listProductSlugs,
} from '@/src/data/product-intelligence-catalog';
import { getIndustryRecords } from '@/src/data/industry-intelligence-catalog';
import { getClusterRecord } from '@/src/data/industrial-clusters';
import { listProductRecords as listProductRecordsDb } from './service';
import { toProductView, averageProductCompleteness } from './score';
import { paginate, type PaginationParams, type PaginatedResult } from '@/src/lib/pagination';
import type { ProductIntelligenceRecord, ProductIntelligenceView } from './types';

function definedRecords(
  slugs: string[],
  map: Map<string, ProductIntelligenceRecord | null>,
): ProductIntelligenceRecord[] {
  return slugs
    .map(s => map.get(s))
    .filter((p): p is ProductIntelligenceRecord => p !== null && p !== undefined);
}

export async function listProducts(): Promise<ProductIntelligenceView[]>;
export async function listProducts(pagination: PaginationParams): Promise<PaginatedResult<ProductIntelligenceView>>;
export async function listProducts(
  pagination?: PaginationParams,
): Promise<ProductIntelligenceView[] | PaginatedResult<ProductIntelligenceView>> {
  const slugs = await listProductSlugs();
  const records = await getProductRecords(slugs);
  const views = definedRecords(slugs, records).map(toProductView);
  return pagination ? paginate(views, pagination) : views;
}

export async function getProduct(slug: string): Promise<ProductIntelligenceView | null> {
  const record = await getProductRecord(slug);
  return record ? toProductView(record) : null;
}

export async function getRelatedProducts(slug: string): Promise<ProductIntelligenceView[]> {
  const record = await getProductRecord(slug);
  const relatedSlugs = record?.businessIntel.relatedProductSlugs ?? [];
  if (relatedSlugs.length === 0) return [];
  const related = await getProductRecords(relatedSlugs);
  return definedRecords(relatedSlugs, related).map(toProductView);
}

export async function getProductIndustries(slug: string) {
  const record = await getProductRecord(slug);
  const industrySlugs = record?.businessIntel.relatedIndustrySlugs ?? [];
  if (industrySlugs.length === 0) return [];
  const industries = await getIndustryRecords(industrySlugs);
  return industrySlugs.map(s => industries.get(s)).filter(Boolean);
}

export async function getProductClusters(slug: string) {
  const record = await getProductRecord(slug);
  if (!record) return [];
  return (record.businessIntel.relatedClusterSlugs ?? [])
    .map(s => getClusterRecord(s))
    .filter(Boolean);
}

export async function catalogStats() {
  const records = await listProductRecordsDb().catch(() => [] as ProductIntelligenceRecord[]);
  let resolved = records;
  if (resolved.length === 0) {
    const slugs = await listProductSlugs();
    const map = await getProductRecords(slugs);
    resolved = definedRecords(slugs, map);
  }
  return {
    total: resolved.length,
    avgCompleteness: averageProductCompleteness(resolved),
    families: Array.from(new Set(resolved.map(r => r.family).filter(Boolean))),
  };
}
