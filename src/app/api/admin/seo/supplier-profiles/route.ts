import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isErrorResponse } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { normalizeProducts, productPublicPath, type SupplierPreferences } from '@/lib/supplier-products';
import { SITE_URL } from '@/lib/site-url';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if (isErrorResponse(auth)) return auth;

  const suppliers = await prisma.user.findMany({
    where: { role: 'SUPPLIER', isActive: true },
    select: {
      id: true,
      company: true,
      name: true,
      location: true,
      gstNumber: true,
      isClaimed: true,
      isVerified: true,
      trustScore: true,
      preferences: true,
      updatedAt: true,
      companyDnaProfile: { select: { completeness: true, lastSyncedAt: true } },
    },
    orderBy: { updatedAt: 'desc' },
    take: 500,
  });

  const rows = suppliers.map(s => {
    const prefs = (s.preferences ?? {}) as SupplierPreferences;
    const products = normalizeProducts(prefs.products);
    const categories = prefs.categories ?? [];
    const hasDescription = !!(prefs.description && prefs.description.length >= 50);
    let seoScore = 0;
    if (s.company) seoScore += 20;
    if (s.gstNumber) seoScore += 20;
    if (categories.length) seoScore += 20;
    if (hasDescription) seoScore += 20;
    if (products.length) seoScore += 20;

    return {
      id: s.id,
      companyName: s.company || s.name || 'Unnamed',
      location: s.location,
      categories,
      productCount: products.length,
      products: products.map(p => ({
        name: p.name,
        slug: p.slug,
        url: `${SITE_URL}${productPublicPath(s.id, p.slug)}`,
      })),
      profileUrl: `${SITE_URL}/supplier/${s.id}`,
      isClaimed: s.isClaimed,
      isVerified: s.isVerified,
      trustScore: s.trustScore,
      seoScore,
      hasMeta: !!(s.company && (categories.length || products.length)),
      dnaCompleteness: s.companyDnaProfile?.completeness ?? null,
      dnaSyncedAt: s.companyDnaProfile?.lastSyncedAt?.toISOString() ?? null,
      updatedAt: s.updatedAt.toISOString(),
    };
  });

  return NextResponse.json({
    success: true,
    summary: {
      total: rows.length,
      withProducts: rows.filter(r => r.productCount > 0).length,
      indexedProfiles: rows.filter(r => r.isClaimed || r.gstNumber).length,
      avgSeoScore: rows.length ? Math.round(rows.reduce((a, r) => a + r.seoScore, 0) / rows.length) : 0,
    },
    suppliers: rows,
  });
}
