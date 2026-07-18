/**
 * Product Intelligence — Prisma-backed persistence.
 * Replaces the static src/data/product-intelligence-catalog.ts as the source of truth.
 * In-memory TTL cache keeps this catalog (low write frequency, read on nearly every
 * admin/SEO request) from round-tripping to Postgres on every call.
 */

import type { Prisma, ProductIntelligenceRecord as ProductIntelligenceRow } from '@prisma/client';
import { prisma } from '@/src/lib/prisma';
import { createMemoryCache } from '@/src/lib/cache/cache-store';
import { VersionConflictError } from '@/src/lib/version-conflict';
import { paginate, type PaginationParams, type PaginatedResult } from '@/src/lib/pagination';
import type {
  ProductIntelligenceRecord,
  ProductManufacturing,
  ProductCommercial,
  ProductKnowledge,
  ProductBusinessIntel,
  ProductSeoFields,
} from './types';

const CACHE_TTL_MS = 60_000;
const LIST_CACHE_KEY = 'all';

const listCache = createMemoryCache<ProductIntelligenceRecord[]>();
const bySlugCache = createMemoryCache<ProductIntelligenceRecord | null>();

function invalidateCache(slug?: string): void {
  listCache.clear();
  if (slug) bySlugCache.delete(slug);
  else bySlugCache.clear();
}

function rowToRecord(row: ProductIntelligenceRow): ProductIntelligenceRecord {
  return {
    slug: row.slug,
    name: row.name,
    family: row.family ?? undefined,
    category: row.category,
    subcategory: row.subcategory ?? undefined,
    brand: row.brand ?? undefined,
    description: row.description,
    manufacturing: (row.manufacturing as ProductManufacturing | null) ?? {},
    commercial: (row.commercial as ProductCommercial | null) ?? {},
    knowledge: (row.knowledge as ProductKnowledge | null) ?? {},
    businessIntel: (row.businessIntel as ProductBusinessIntel | null) ?? {},
    seo: (row.seo as ProductSeoFields | null) ?? {},
    referenceCompany: row.referenceCompany ?? undefined,
    updatedAt: row.updatedAt.toISOString().slice(0, 10),
  };
}

function toJson<T>(v: T | null | undefined): Prisma.InputJsonValue | undefined {
  return v === null || v === undefined ? undefined : (v as unknown as Prisma.InputJsonValue);
}

function toCreateData(input: ProductIntelligenceRecord) {
  return {
    slug: input.slug,
    name: input.name,
    family: input.family,
    category: input.category,
    subcategory: input.subcategory,
    brand: input.brand,
    description: input.description,
    manufacturing: toJson(input.manufacturing),
    commercial: toJson(input.commercial),
    knowledge: toJson(input.knowledge),
    businessIntel: toJson(input.businessIntel),
    seo: toJson(input.seo),
    referenceCompany: input.referenceCompany,
  };
}

function toUpdateData(patch: Partial<ProductIntelligenceRecord>) {
  return {
    name: patch.name,
    family: patch.family,
    category: patch.category,
    subcategory: patch.subcategory,
    brand: patch.brand,
    description: patch.description,
    manufacturing: toJson(patch.manufacturing),
    commercial: toJson(patch.commercial),
    knowledge: toJson(patch.knowledge),
    businessIntel: toJson(patch.businessIntel),
    seo: toJson(patch.seo),
    referenceCompany: patch.referenceCompany,
  };
}

/** version is bumped server-side on update; not accepted from callers. */
export async function listProductRecords(): Promise<ProductIntelligenceRecord[]>;
export async function listProductRecords(
  pagination: PaginationParams,
): Promise<PaginatedResult<ProductIntelligenceRecord>>;
export async function listProductRecords(
  pagination?: PaginationParams,
): Promise<ProductIntelligenceRecord[] | PaginatedResult<ProductIntelligenceRecord>> {
  let data = listCache.get(LIST_CACHE_KEY);
  if (!data) {
    const rows = await prisma.productIntelligenceRecord.findMany({ orderBy: { slug: 'asc' } });
    data = rows.map(rowToRecord);
    listCache.set(LIST_CACHE_KEY, data, CACHE_TTL_MS);
  }
  return pagination ? paginate(data, pagination) : data;
}

export async function listProductSlugsFromDb(): Promise<string[]> {
  return (await listProductRecords()).map(r => r.slug);
}

export async function getProductRecordBySlug(slug: string): Promise<ProductIntelligenceRecord | null> {
  const cached = bySlugCache.get(slug);
  if (cached !== undefined) return cached;
  const row = await prisma.productIntelligenceRecord.findUnique({ where: { slug } });
  const data = row ? rowToRecord(row) : null;
  bySlugCache.set(slug, data, CACHE_TTL_MS);
  return data;
}

/**
 * Batch slug lookup — the N+1 fix. Reuses the warm list cache when available (zero DB
 * round trips); otherwise issues exactly one `findMany` for whichever slugs miss the
 * per-slug cache, instead of one `findUnique` per slug.
 */
export async function getProductRecordsBySlugs(
  slugs: string[],
): Promise<Map<string, ProductIntelligenceRecord | null>> {
  const result = new Map<string, ProductIntelligenceRecord | null>();
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
    const rows = await prisma.productIntelligenceRecord.findMany({ where: { slug: { in: misses } } });
    const found = new Map(rows.map(r => [r.slug, rowToRecord(r)]));
    for (const s of misses) {
      const rec = found.get(s) ?? null;
      bySlugCache.set(s, rec, CACHE_TTL_MS);
      result.set(s, rec);
    }
  }

  return result;
}

export async function searchProductRecordsDb(query: string, limit = 20): Promise<ProductIntelligenceRecord[]> {
  const q = query.trim();
  if (!q) return (await listProductRecords()).slice(0, limit);
  const rows = await prisma.productIntelligenceRecord.findMany({
    where: {
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { category: { contains: q, mode: 'insensitive' } },
        { subcategory: { contains: q, mode: 'insensitive' } },
        { family: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ],
    },
    take: limit,
    orderBy: { slug: 'asc' },
  });
  return rows.map(rowToRecord);
}

export async function createProductRecord(input: ProductIntelligenceRecord): Promise<ProductIntelligenceRecord> {
  const row = await prisma.productIntelligenceRecord.create({ data: toCreateData(input) });
  invalidateCache();
  return rowToRecord(row);
}

/**
 * True optimistic concurrency: the update only applies if `expectedVersion` still
 * matches the stored row. If another writer got there first, `count` is 0 and we throw
 * rather than silently overwriting their change.
 */
export async function updateProductRecord(
  slug: string,
  patch: Partial<ProductIntelligenceRecord>,
  expectedVersion: number,
): Promise<ProductIntelligenceRecord> {
  const { count } = await prisma.productIntelligenceRecord.updateMany({
    where: { slug, version: expectedVersion },
    data: { ...toUpdateData(patch), version: { increment: 1 } },
  });
  if (count === 0) throw new VersionConflictError(slug, expectedVersion);
  invalidateCache(slug);
  const row = await prisma.productIntelligenceRecord.findUniqueOrThrow({ where: { slug } });
  return rowToRecord(row);
}

/**
 * `expectedVersion` provided: conditional update-or-create with the same optimistic
 * check as `updateProductRecord` (falls through to create only when the row genuinely
 * doesn't exist yet — a stale version on an existing row still throws).
 * `expectedVersion` omitted: unconditional last-writer-wins upsert, kept for callers
 * that aren't racing concurrent editors (e.g. one-off imports) — not exposed to any
 * live route today.
 */
export async function upsertProductRecord(
  input: ProductIntelligenceRecord,
  expectedVersion?: number,
): Promise<ProductIntelligenceRecord> {
  if (expectedVersion !== undefined) {
    const { count } = await prisma.productIntelligenceRecord.updateMany({
      where: { slug: input.slug, version: expectedVersion },
      data: { ...toUpdateData(input), version: { increment: 1 } },
    });
    if (count > 0) {
      invalidateCache(input.slug);
      const row = await prisma.productIntelligenceRecord.findUniqueOrThrow({ where: { slug: input.slug } });
      return rowToRecord(row);
    }
    const existing = await prisma.productIntelligenceRecord.findUnique({ where: { slug: input.slug } });
    if (existing) throw new VersionConflictError(input.slug, expectedVersion);
    const row = await prisma.productIntelligenceRecord.create({ data: toCreateData(input) });
    invalidateCache(input.slug);
    return rowToRecord(row);
  }

  const row = await prisma.productIntelligenceRecord.upsert({
    where: { slug: input.slug },
    create: toCreateData(input),
    update: { ...toUpdateData(input), version: { increment: 1 } },
  });
  invalidateCache(input.slug);
  return rowToRecord(row);
}

export async function deleteProductRecord(slug: string): Promise<void> {
  await prisma.productIntelligenceRecord.delete({ where: { slug } });
  invalidateCache(slug);
}
