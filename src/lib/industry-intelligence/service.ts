/**
 * Industry Intelligence — Prisma-backed persistence.
 * Replaces the static src/data/industry-intelligence-catalog.ts as the source of truth.
 */

import type { Prisma, IndustryIntelligenceRecord as IndustryIntelligenceRow } from '@prisma/client';
import { prisma } from '@/src/lib/prisma';
import { createMemoryCache } from '@/src/lib/cache/cache-store';
import { VersionConflictError } from '@/src/lib/version-conflict';
import { paginate, type PaginationParams, type PaginatedResult } from '@/src/lib/pagination';
import type { IndustryIntelligenceRecord, IndustryTrends } from './types';

const CACHE_TTL_MS = 60_000;
const LIST_CACHE_KEY = 'all';

const listCache = createMemoryCache<IndustryIntelligenceRecord[]>();
const bySlugCache = createMemoryCache<IndustryIntelligenceRecord | null>();

function invalidateCache(slug?: string): void {
  listCache.clear();
  if (slug) bySlugCache.delete(slug);
  else bySlugCache.clear();
}

function rowToRecord(row: IndustryIntelligenceRow): IndustryIntelligenceRecord {
  return {
    slug: row.slug,
    name: row.name,
    description: row.description,
    manufacturers: row.manufacturers,
    suppliers: row.suppliers,
    buyers: row.buyers,
    products: row.products,
    machines: row.machines,
    rawMaterials: row.rawMaterials,
    standards: row.standards,
    tradeAssociations: row.tradeAssociations,
    tradeShows: row.tradeShows,
    governmentSchemes: row.governmentSchemes,
    certifications: row.certifications,
    relatedClusterSlugs: row.relatedClusterSlugs,
    relatedProductSlugs: row.relatedProductSlugs,
    trends: (row.trends as IndustryTrends | null) ?? {},
    updatedAt: row.updatedAt.toISOString().slice(0, 10),
  };
}

function toJson<T>(v: T | null | undefined): Prisma.InputJsonValue | undefined {
  return v === null || v === undefined ? undefined : (v as unknown as Prisma.InputJsonValue);
}

function toCreateData(input: IndustryIntelligenceRecord) {
  return {
    slug: input.slug,
    name: input.name,
    description: input.description,
    manufacturers: input.manufacturers ?? [],
    suppliers: input.suppliers ?? [],
    buyers: input.buyers ?? [],
    products: input.products ?? [],
    machines: input.machines ?? [],
    rawMaterials: input.rawMaterials ?? [],
    standards: input.standards ?? [],
    tradeAssociations: input.tradeAssociations ?? [],
    tradeShows: input.tradeShows ?? [],
    governmentSchemes: input.governmentSchemes ?? [],
    certifications: input.certifications ?? [],
    relatedClusterSlugs: input.relatedClusterSlugs ?? [],
    relatedProductSlugs: input.relatedProductSlugs ?? [],
    trends: toJson(input.trends) as Prisma.InputJsonValue,
  };
}

function toUpdateData(patch: Partial<IndustryIntelligenceRecord>) {
  return {
    name: patch.name,
    description: patch.description,
    manufacturers: patch.manufacturers,
    suppliers: patch.suppliers,
    buyers: patch.buyers,
    products: patch.products,
    machines: patch.machines,
    rawMaterials: patch.rawMaterials,
    standards: patch.standards,
    tradeAssociations: patch.tradeAssociations,
    tradeShows: patch.tradeShows,
    governmentSchemes: patch.governmentSchemes,
    certifications: patch.certifications,
    relatedClusterSlugs: patch.relatedClusterSlugs,
    relatedProductSlugs: patch.relatedProductSlugs,
    trends: toJson(patch.trends),
  };
}

export async function listIndustryRecords(): Promise<IndustryIntelligenceRecord[]>;
export async function listIndustryRecords(
  pagination: PaginationParams,
): Promise<PaginatedResult<IndustryIntelligenceRecord>>;
export async function listIndustryRecords(
  pagination?: PaginationParams,
): Promise<IndustryIntelligenceRecord[] | PaginatedResult<IndustryIntelligenceRecord>> {
  let data = listCache.get(LIST_CACHE_KEY);
  if (!data) {
    const rows = await prisma.industryIntelligenceRecord.findMany({ orderBy: { slug: 'asc' } });
    data = rows.map(rowToRecord);
    listCache.set(LIST_CACHE_KEY, data, CACHE_TTL_MS);
  }
  return pagination ? paginate(data, pagination) : data;
}

export async function listIndustrySlugsFromDb(): Promise<string[]> {
  return (await listIndustryRecords()).map(r => r.slug);
}

export async function getIndustryRecordBySlug(slug: string): Promise<IndustryIntelligenceRecord | null> {
  const cached = bySlugCache.get(slug);
  if (cached !== undefined) return cached;
  const row = await prisma.industryIntelligenceRecord.findUnique({ where: { slug } });
  const data = row ? rowToRecord(row) : null;
  bySlugCache.set(slug, data, CACHE_TTL_MS);
  return data;
}

/**
 * Batch slug lookup — the N+1 fix. Reuses the warm list cache when available (zero DB
 * round trips); otherwise issues exactly one `findMany` for whichever slugs miss the
 * per-slug cache, instead of one `findUnique` per slug.
 */
export async function getIndustryRecordsBySlugs(
  slugs: string[],
): Promise<Map<string, IndustryIntelligenceRecord | null>> {
  const result = new Map<string, IndustryIntelligenceRecord | null>();
  const uniqueSlugs = Array.from(new Set(slugs));

  const warmList = listCache.get(LIST_CACHE_KEY);
  if (warmList) {
    const bySlug = new Map(warmList.map(r => [r.slug, r]));
    for (const s of uniqueSlugs) result.set(s, bySlug.get(s) ?? null);
    return result;
  }

  const misses: string[] = [];
  for (const s of uniqueSlugs) {
    const cached = bySlugCache.get(s);
    if (cached !== undefined) result.set(s, cached);
    else misses.push(s);
  }

  if (misses.length > 0) {
    const rows = await prisma.industryIntelligenceRecord.findMany({ where: { slug: { in: misses } } });
    const found = new Map(rows.map(r => [r.slug, rowToRecord(r)]));
    for (const s of misses) {
      const rec = found.get(s) ?? null;
      bySlugCache.set(s, rec, CACHE_TTL_MS);
      result.set(s, rec);
    }
  }

  return result;
}

export async function searchIndustryRecordsDb(query: string, limit = 20): Promise<IndustryIntelligenceRecord[]> {
  const q = query.trim();
  if (!q) return (await listIndustryRecords()).slice(0, limit);
  const rows = await prisma.industryIntelligenceRecord.findMany({
    where: {
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { products: { has: q } },
      ],
    },
    take: limit,
    orderBy: { slug: 'asc' },
  });
  return rows.map(rowToRecord);
}

export async function createIndustryRecord(input: IndustryIntelligenceRecord): Promise<IndustryIntelligenceRecord> {
  const row = await prisma.industryIntelligenceRecord.create({ data: toCreateData(input) });
  invalidateCache();
  return rowToRecord(row);
}

/**
 * True optimistic concurrency: the update only applies if `expectedVersion` still
 * matches the stored row. If another writer got there first, `count` is 0 and we throw
 * rather than silently overwriting their change.
 */
export async function updateIndustryRecord(
  slug: string,
  patch: Partial<IndustryIntelligenceRecord>,
  expectedVersion: number,
): Promise<IndustryIntelligenceRecord> {
  const { count } = await prisma.industryIntelligenceRecord.updateMany({
    where: { slug, version: expectedVersion },
    data: { ...toUpdateData(patch), version: { increment: 1 } },
  });
  if (count === 0) throw new VersionConflictError(slug, expectedVersion);
  invalidateCache(slug);
  const row = await prisma.industryIntelligenceRecord.findUniqueOrThrow({ where: { slug } });
  return rowToRecord(row);
}

/**
 * `expectedVersion` provided: conditional update-or-create with the same optimistic
 * check as `updateIndustryRecord` (falls through to create only when the row genuinely
 * doesn't exist yet — a stale version on an existing row still throws).
 * `expectedVersion` omitted: unconditional last-writer-wins upsert, kept for callers
 * that aren't racing concurrent editors (e.g. one-off imports) — not exposed to any
 * live route today.
 */
export async function upsertIndustryRecord(
  input: IndustryIntelligenceRecord,
  expectedVersion?: number,
): Promise<IndustryIntelligenceRecord> {
  if (expectedVersion !== undefined) {
    const { count } = await prisma.industryIntelligenceRecord.updateMany({
      where: { slug: input.slug, version: expectedVersion },
      data: { ...toUpdateData(input), version: { increment: 1 } },
    });
    if (count > 0) {
      invalidateCache(input.slug);
      const row = await prisma.industryIntelligenceRecord.findUniqueOrThrow({ where: { slug: input.slug } });
      return rowToRecord(row);
    }
    const existing = await prisma.industryIntelligenceRecord.findUnique({ where: { slug: input.slug } });
    if (existing) throw new VersionConflictError(input.slug, expectedVersion);
    const row = await prisma.industryIntelligenceRecord.create({ data: toCreateData(input) });
    invalidateCache(input.slug);
    return rowToRecord(row);
  }

  const row = await prisma.industryIntelligenceRecord.upsert({
    where: { slug: input.slug },
    create: toCreateData(input),
    update: { ...toUpdateData(input), version: { increment: 1 } },
  });
  invalidateCache(input.slug);
  return rowToRecord(row);
}

export async function deleteIndustryRecord(slug: string): Promise<void> {
  await prisma.industryIntelligenceRecord.delete({ where: { slug } });
  invalidateCache(slug);
}
