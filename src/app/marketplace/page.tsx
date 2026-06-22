import { Suspense } from 'react';
import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { SITE_URL } from '@/lib/site-url';
import MarketplaceClient from './MarketplaceClient';

export const metadata: Metadata = {
  title: 'B2B Marketplace — Verified Indian Suppliers',
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

    {/* Server-rendered — always visible to crawlers */}
    <section className="max-w-4xl mx-auto px-4 pt-2 pb-14 border-t border-slate-800 mt-4">
      <h2 className="text-lg font-bold text-white mb-3">How the VyaparSethu Trade Network Works</h2>
      <p className="text-slate-400 text-sm leading-relaxed mb-3">
        VyaparSethu connects verified Indian buyers and suppliers across Steel, Textiles, Chemicals,
        Packaging, Machinery, and 450+ other B2B categories. Buyers post their Requirements — specifying
        quantity, timeline, and quality standards — and receive competitive quotes from verified suppliers
        within 24 hours.
      </p>
      <p className="text-slate-400 text-sm leading-relaxed mb-5">
        Every deal on VyaparSethu includes Protected Payment: funds are held securely and released only
        after both buyer and supplier confirm delivery. This eliminates the risk of bad debt that costs
        Indian MSMEs crores every year. Our Trade Confidence Score helps you evaluate each supplier's
        payment history, on-time delivery rate, and dispute track record before you commit to an order.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div>
          <p className="text-white text-sm font-semibold mb-1">1. Post a Requirement</p>
          <p className="text-slate-500 text-xs leading-relaxed">Describe what you need by voice, video, or text. Takes under 90 seconds for most Requirements. No account needed to browse.</p>
        </div>
        <div>
          <p className="text-white text-sm font-semibold mb-1">2. Receive Verified Quotes</p>
          <p className="text-slate-500 text-xs leading-relaxed">Verified suppliers submit competitive quotes. Compare Trade Confidence Scores, delivery timelines, and per-unit pricing before choosing.</p>
        </div>
        <div>
          <p className="text-white text-sm font-semibold mb-1">3. Trade with Protection</p>
          <p className="text-slate-500 text-xs leading-relaxed">Accept a quote, pay via Protected Payment, and track delivery status. Funds release only after confirmed receipt — zero bad-debt risk.</p>
        </div>
      </div>
    </section>
    </>
  );
}
