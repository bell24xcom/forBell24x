import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import MarketplaceClient from './MarketplaceClient';

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

  return (
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
  );
}
