import { Suspense } from 'react';
import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { SITE_URL } from '@/lib/site-url';
import MarketplaceClient from './MarketplaceClient';

export const metadata: Metadata = {
  title: 'B2B Marketplace',
  description: "Browse active B2B requirements from verified Indian buyers. Submit quotes on Steel, Textiles, Chemicals, Machinery and more. Win new business on VyaparSethu.",
  alternates: { canonical: `${SITE_URL}/marketplace` },
  openGraph: {
    title: 'B2B Marketplace | VyaparSethu',
    description: "Browse active B2B requirements from verified Indian buyers. Submit quotes on Steel, Textiles, Chemicals, Machinery and more. Win new business on VyaparSethu.",
    url: `${SITE_URL}/marketplace`,
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: 'B2B Marketplace | VyaparSethu' }],
  },
};

// Revalidate server-rendered content every 60 seconds (ISR)
export const revalidate = 60;

async function getInitialRFQs() {
  try {
    const where = { status: 'ACTIVE' as const, isPublic: true };
    const [rfqs, total] = await Promise.all([
      prisma.rFQ.findMany({
        where,
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
        take: 20,
        select: {
          id: true,
          title: true,
          category: true,
          quantity: true,
          unit: true,
          minBudget: true,
          maxBudget: true,
          timeline: true,
          urgency: true,
          location: true,
          tags: true,
          priority: true,
          estimatedValue: true,
          createdAt: true,
          expiresAt: true,
          _count: { select: { quotes: true } },
        },
      }),
      prisma.rFQ.count({ where }),
    ]);

    return {
      rfqs: rfqs.map(r => ({
        ...r,
        budget: r.maxBudget || r.estimatedValue || 0,
        quotesCount: r._count?.quotes || 0,
        createdAt: r.createdAt.toISOString(),
        expiresAt: r.expiresAt?.toISOString() ?? null,
      })),
      total,
    };
  } catch {
    return { rfqs: [], total: 0 };
  }
}

export default async function MarketplacePage() {
  const { rfqs, total } = await getInitialRFQs();

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Marketplace', item: `${SITE_URL}/marketplace` },
    ],
  };

  const itemListLd = rfqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Active B2B Requirements',
    itemListElement: rfqs.slice(0, 20).map((rfq, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: rfq.title,
      url: `${SITE_URL}/rfq/${rfq.id}`,
    })),
  } : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      {itemListLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />
      )}
    <Suspense fallback={
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Loading marketplace…</p>
        </div>
      </div>
    }>
      <MarketplaceClient initialRfqs={rfqs} initialTotal={total} />
    </Suspense>
    </>
  );
}
