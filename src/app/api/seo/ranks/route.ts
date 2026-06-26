import { NextRequest, NextResponse } from 'next/server';
import {
  getRankBySlug,
  getRanksForSupplier,
  getRanksForProduct,
  searchCategoryRanks,
  CATEGORY_RANK_SUMMARY,
  type EntityRankType,
} from '@/lib/seo-category-keywords';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') as EntityRankType | null;
  const slug = searchParams.get('slug');
  const parentSlug = searchParams.get('parentSlug') ?? undefined;
  const q = searchParams.get('q');
  const categories = searchParams.get('categories');
  const company = searchParams.get('company');
  const product = searchParams.get('product');
  const categoryName = searchParams.get('categoryName') ?? undefined;

  if (q) {
    return NextResponse.json({
      success: true,
      summary: CATEGORY_RANK_SUMMARY,
      ranks: searchCategoryRanks(q, 100),
    });
  }

  if (type === 'supplier' && categories) {
    const cats = categories.split('|').filter(Boolean);
    return NextResponse.json({
      success: true,
      ranks: getRanksForSupplier(cats, company ?? undefined),
    });
  }

  if (type === 'product' && product) {
    return NextResponse.json({
      success: true,
      ranks: [getRanksForProduct(product, categoryName)],
    });
  }

  if (type && slug) {
    const rank = getRankBySlug(type, slug, parentSlug);
    if (!rank) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, rank });
  }

  return NextResponse.json({
    success: true,
    summary: CATEGORY_RANK_SUMMARY,
    message: 'Pass ?q=, ?type=&slug=, or ?type=supplier&categories=',
  });
}
