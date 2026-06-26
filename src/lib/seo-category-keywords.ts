/**
 * Category / supplier / product keyword rank index.
 * Positions updated manually from GSC — competitor benchmarks are SERP estimates.
 */

import { COMPLETE_CATEGORIES } from '@/src/data/complete-categories';
import { REMAINING_CATEGORIES } from '@/src/data/remaining-categories';
import { CATEGORY_META } from '@/src/data/city-category-seo';

export type EntityRankType = 'category' | 'subcategory' | 'city-category' | 'supplier' | 'product';

export interface CompetitorRank {
  name: string;
  domain: string;
  estPosition: number | null;
  note?: string;
}

export interface EntityKeywordRank {
  id: string;
  entityType: EntityRankType;
  entityName: string;
  slug: string;
  parentSlug?: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  ourPosition: number | null;
  ourUrl: string | null;
  competitors: CompetitorRank[];
  lastChecked: string | null;
  searchVolume: number | null;
  seoDifficulty: number | null;
}

const DEFAULT_COMPETITORS: CompetitorRank[] = [
  { name: 'IndiaMART', domain: 'indiamart.com', estPosition: 3, note: 'SERP benchmark' },
  { name: 'TradeIndia', domain: 'tradeindia.com', estPosition: 5, note: 'SERP benchmark' },
  { name: 'ExportersIndia', domain: 'exporterindia.com', estPosition: 8, note: 'SERP benchmark' },
];

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function buildFromCategories(): EntityKeywordRank[] {
  const all = [...COMPLETE_CATEGORIES, ...REMAINING_CATEGORIES];
  const rows: EntityKeywordRank[] = [];

  for (const cat of all) {
    const primary = `${cat.name.toLowerCase()} suppliers india`;
    rows.push({
      id: `cat-${cat.slug}`,
      entityType: 'category',
      entityName: cat.name,
      slug: cat.slug,
      primaryKeyword: primary,
      secondaryKeywords: cat.seo?.keywords?.slice(0, 5) ?? [`${cat.name} manufacturers india`, `b2b ${cat.name.toLowerCase()}`],
      ourPosition: null,
      ourUrl: `/categories/${cat.slug}`,
      competitors: DEFAULT_COMPETITORS,
      lastChecked: null,
      searchVolume: null,
      seoDifficulty: null,
    });

    for (const sub of cat.subcategories ?? []) {
      const subPrimary = `${sub.name.toLowerCase()} suppliers india`;
      rows.push({
        id: `sub-${cat.slug}-${sub.slug}`,
        entityType: 'subcategory',
        entityName: sub.name,
        slug: sub.slug,
        parentSlug: cat.slug,
        primaryKeyword: subPrimary,
        secondaryKeywords: [`${sub.name} manufacturers`, `wholesale ${sub.name.toLowerCase()} india`],
        ourPosition: null,
        ourUrl: `/categories/${cat.slug}/${sub.slug}`,
        competitors: DEFAULT_COMPETITORS,
        lastChecked: null,
        searchVolume: null,
        seoDifficulty: null,
      });
    }
  }

  for (const [slug, meta] of Object.entries(CATEGORY_META)) {
    const kw = meta.keywords[0] ?? `${meta.name.toLowerCase()} suppliers india`;
    rows.push({
      id: `citycat-${slug}`,
      entityType: 'city-category',
      entityName: meta.name,
      slug,
      primaryKeyword: kw,
      secondaryKeywords: meta.keywords.slice(1, 4),
      ourPosition: null,
      ourUrl: `/suppliers/mumbai/${slug}`,
      competitors: DEFAULT_COMPETITORS,
      lastChecked: null,
      searchVolume: null,
      seoDifficulty: null,
    });
  }

  return rows;
}

/** Full index — 400+ category/subcategory/city-category rows */
export const CATEGORY_KEYWORD_INDEX: EntityKeywordRank[] = buildFromCategories();

export const CATEGORY_RANK_SUMMARY = {
  totalEntities: CATEGORY_KEYWORD_INDEX.length,
  categories: CATEGORY_KEYWORD_INDEX.filter(r => r.entityType === 'category').length,
  subcategories: CATEGORY_KEYWORD_INDEX.filter(r => r.entityType === 'subcategory').length,
  cityCategories: CATEGORY_KEYWORD_INDEX.filter(r => r.entityType === 'city-category').length,
  ranked: CATEGORY_KEYWORD_INDEX.filter(r => r.ourPosition !== null && r.ourPosition <= 100).length,
  notRanked: CATEGORY_KEYWORD_INDEX.filter(r => r.ourPosition === null).length,
  lastBulkUpdate: null as string | null,
};

export function getRankBySlug(entityType: EntityRankType, slug: string, parentSlug?: string): EntityKeywordRank | undefined {
  if (entityType === 'subcategory' && parentSlug) {
    return CATEGORY_KEYWORD_INDEX.find(r => r.entityType === 'subcategory' && r.slug === slug && r.parentSlug === parentSlug);
  }
  return CATEGORY_KEYWORD_INDEX.find(r => r.entityType === entityType && r.slug === slug);
}

export function getRanksForSupplier(categories: string[], companyName?: string): EntityKeywordRank[] {
  const normalized = categories.map(c => c.toLowerCase());
  const matched = CATEGORY_KEYWORD_INDEX.filter(row => {
    const name = row.entityName.toLowerCase();
    const slug = row.slug.toLowerCase();
    return normalized.some(c => c.includes(name) || c.includes(slug) || name.includes(c));
  });

  if (matched.length > 0) return matched.slice(0, 5);

  if (companyName) {
    return [{
      id: `supplier-${slugify(companyName)}`,
      entityType: 'supplier',
      entityName: companyName,
      slug: slugify(companyName),
      primaryKeyword: `${companyName} b2b supplier india`,
      secondaryKeywords: [`${companyName} gst verified`, `${companyName} wholesale`],
      ourPosition: null,
      ourUrl: null,
      competitors: DEFAULT_COMPETITORS,
      lastChecked: null,
      searchVolume: null,
      seoDifficulty: null,
    }];
  }
  return [];
}

export function getRanksForProduct(productName: string, categoryName?: string): EntityKeywordRank {
  const kw = categoryName
    ? `${productName.toLowerCase()} ${categoryName.toLowerCase()} supplier india`
    : `${productName.toLowerCase()} b2b supplier india`;
  return {
    id: `product-${slugify(productName)}`,
    entityType: 'product',
    entityName: productName,
    slug: slugify(productName),
    primaryKeyword: kw,
    secondaryKeywords: [`buy ${productName.toLowerCase()} bulk india`, `${productName} manufacturers`],
    ourPosition: null,
    ourUrl: null,
    competitors: DEFAULT_COMPETITORS,
    lastChecked: null,
    searchVolume: null,
    seoDifficulty: null,
  };
}

export function searchCategoryRanks(query: string, limit = 50): EntityKeywordRank[] {
  const q = query.toLowerCase().trim();
  if (!q) return CATEGORY_KEYWORD_INDEX.slice(0, limit);
  return CATEGORY_KEYWORD_INDEX.filter(
    r =>
      r.entityName.toLowerCase().includes(q) ||
      r.primaryKeyword.includes(q) ||
      r.slug.includes(q),
  ).slice(0, limit);
}
