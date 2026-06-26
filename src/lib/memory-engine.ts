/**
 * Bell24h Elephant Memory Engine
 * ─────────────────────────────
 * 3-layer memory system for RFQ intelligence:
 *  1. Episodic   — raw events stored in Postgres
 *  2. Semantic   — structured metadata + Chroma embeddings
 *  3. Strategic  — aggregated market_insights per category
 *
 * RULES:
 *  - Memory FIRST, LLM LAST (never call LLM blindly)
 *  - Every RFQ triggers storeRFQ()
 *  - Every interaction triggers storeInteraction()
 *  - Every quote triggers storeQuote()
 */

import { prisma } from '@/lib/prisma';

// ─── Type definitions ─────────────────────────────────────────────────────────

export interface RFQMeta {
  rfqId: string;
  title: string;
  category: string;
  companyId?: string;
  product?: string;
  intent?: string;
  priceRange?: string;
  quantity?: string;
  location?: string;
  metadata?: Record<string, unknown>;
}

export interface InteractionMeta {
  rfqId?: string;
  userId?: string;
  sessionId?: string;
  actionType: 'view' | 'click' | 'quote' | 'bookmark' | 'share';
  source?: 'marketplace' | 'dashboard' | 'whatsapp' | 'email' | 'direct';
  metadata?: Record<string, unknown>;
}

export interface QuoteMeta {
  rfqId: string;
  supplierId: string;
  price: number;
  quantity: string;
  status?: 'PENDING' | 'WON' | 'LOST' | 'EXPIRED';
  metadata?: Record<string, unknown>;
}

export interface MarketInsightData {
  category: string;
  avgPrice?: number;
  minPrice?: number;
  maxPrice?: number;
  avgTimeline?: string;
  demandTrend?: 'RISING' | 'STABLE' | 'DECLINING';
  metadata?: Record<string, unknown>;
}

export interface SimilarRFQ {
  rfqId: string;
  title: string;
  category: string;
  priceRange?: string;
  quantity?: string;
  location?: string;
  similarity?: number;
}

// ─── Layer 1: Episodic Memory ────────────────────────────────────────────────

/**
 * StoreRFQ — saves structured RFQ metadata to episodic memory (Postgres)
 * Also updates market_insights for the category
 */
export async function storeRFQ(meta: RFQMeta): Promise<void> {
  await prisma.$transaction(async (tx) => {
    // Upsert into episodic memory
    await tx.rfqMemory.upsert({
      where: { rfqId: meta.rfqId },
      update: {
        title: meta.title,
        category: meta.category,
        product: meta.product ?? null,
        intent: meta.intent ?? null,
        priceRange: meta.priceRange ?? null,
        quantity: meta.quantity ?? null,
        location: meta.location ?? null,
        metadata: meta.metadata ?? null,
      },
      create: {
        rfqId: meta.rfqId,
        title: meta.title,
        category: meta.category,
        product: meta.product ?? null,
        intent: meta.intent ?? null,
        priceRange: meta.priceRange ?? null,
        quantity: meta.quantity ?? null,
        location: meta.location ?? null,
        metadata: meta.metadata ?? null,
      },
    });

    // Increment RFQ count in market_insights
    await tx.marketInsight.upsert({
      where: { category: meta.category },
      update: { rfqCount: { increment: 1 } },
      create: { category: meta.category, rfqCount: 1, quoteCount: 0 },
    });
  });

  const companyId = meta.companyId ?? (meta.metadata?.companyId as string | undefined);
  if (companyId) {
    const via = meta.metadata?.via as string | undefined;
    const eventType = via === 'voice' ? 'voice_rfq' : via === 'video' ? 'video_rfq' : 'rfq_created';
    const { recordLifeEventAsync } = await import('@/lib/bom/life-events');
    recordLifeEventAsync({
      companyId,
      eventType,
      actorId: companyId,
      category: meta.category,
      intent: meta.intent,
      metadata: {
        rfqId: meta.rfqId,
        title: meta.title,
        quantity: meta.quantity,
        location: meta.location,
        priceRange: meta.priceRange,
      },
      source: String(meta.metadata?.source ?? 'rfq'),
      confidence: 1,
    });
  }
}

/**
 * StoreInteraction — logs a user interaction event
 */
export async function storeInteraction(meta: InteractionMeta): Promise<void> {
  await prisma.interactionMemory.create({
    data: {
      rfqId: meta.rfqId ?? null,
      userId: meta.userId ?? null,
      sessionId: meta.sessionId ?? null,
      actionType: meta.actionType,
      source: meta.source ?? null,
      metadata: meta.metadata ?? null,
    },
  });
}

/**
 * StoreQuote — saves a supplier quote to episodic memory
 * Updates market_insights quote count and price range
 */
export async function storeQuote(meta: QuoteMeta): Promise<void> {
  const { rfqId, supplierId, price, quantity, status = 'PENDING', metadata } = meta;

  await prisma.$transaction(async (tx) => {
    await tx.quoteMemory.create({
      data: {
        rfqId,
        supplierId,
        price,
        quantity,
        status: status as any,
        metadata: metadata ?? null,
      },
    });

    // Update market_insights with price signals
    const rfq = await tx.rFQ.findUnique({
      where: { id: rfqId },
      select: { category: true, title: true, createdBy: true },
    });

    if (rfq) {
      const insight = await tx.marketInsight.findUnique({ where: { category: rfq.category } });

      if (insight) {
        const newQuoteCount = insight.quoteCount + 1;
        const currentAvg = insight.avgPrice ?? price;
        const newAvg = currentAvg + (price - currentAvg) / newQuoteCount;

        await tx.marketInsight.update({
          where: { category: rfq.category },
          data: {
            quoteCount: newQuoteCount,
            avgPrice: newAvg,
            minPrice: insight.minPrice ? Math.min(insight.minPrice, price) : price,
            maxPrice: insight.maxPrice ? Math.max(insight.maxPrice, price) : price,
          },
        });
      } else {
        await tx.marketInsight.create({
          data: {
            category: rfq.category,
            quoteCount: 1,
            avgPrice: price,
            minPrice: price,
            maxPrice: price,
          },
        });
      }
    }
  });

  const rfq = await prisma.rFQ.findUnique({
    where: { id: rfqId },
    select: { category: true, title: true, createdBy: true },
  });

  const { recordLifeEventAsync } = await import('@/lib/bom/life-events');
  const quoteMeta = { rfqId, price, quantity, title: rfq?.title };

  recordLifeEventAsync({
    companyId: supplierId,
    eventType: 'quote_received',
    actorId: supplierId,
    category: rfq?.category,
    metadata: { ...quoteMeta, role: 'supplier' },
    source: 'quote',
  });

  if (rfq?.createdBy) {
    recordLifeEventAsync({
      companyId: rfq.createdBy,
      eventType: 'quote_received',
      actorId: supplierId,
      category: rfq.category,
      metadata: { ...quoteMeta, supplierId, role: 'buyer' },
      source: 'quote',
    });
  }
}

// ─── Layer 2: Semantic Memory ────────────────────────────────────────────────

/**
 * ExtractMeta — converts raw RFQ into structured semantic metadata
 * This is the "understanding" layer — powers vector similarity search
 */
export function extractRFQMeta(rfq: {
  id: string;
  title: string;
  category: string;
  description?: string | null;
  quantity?: string | null;
  location?: string | null;
  maxBudget?: number | null;
  minBudget?: number | null;
}): RFQMeta {
  // Detect product + intent from title + description
  const text = `${rfq.title} ${rfq.description ?? ''}`.toLowerCase();

  // Simple keyword-based intent detection
  const intentKeywords = {
    export: ['export', 'uae', 'international', 'overseas', 'foreign'],
    bulk: ['bulk', 'wholesale', 'mass', 'large order', 'container'],
    urgent: ['urgent', 'asap', 'immediately', 'rush', 'emergency'],
    regular: ['regular', 'monthly', 'repeat', 'ongoing', 'annual'],
    sample: ['sample', 'trial', 'prototype', 'test order'],
  };

  let intent: string | undefined;
  for (const [key, words] of Object.entries(intentKeywords)) {
    if (words.some(w => text.includes(w))) {
      intent = key;
      break;
    }
  }

  // Price range bucket
  let priceRange: string | undefined;
  if (rfq.maxBudget) {
    if (rfq.maxBudget < 50000) priceRange = '0-50K';
    else if (rfq.maxBudget < 200000) priceRange = '50K-2L';
    else if (rfq.maxBudget < 1000000) priceRange = '2L-10L';
    else priceRange = '10L+';
  }

  return {
    rfqId: rfq.id,
    title: rfq.title,
    category: rfq.category,
    product: rfq.title.split('—')[0].split('-')[0].trim(),
    intent,
    priceRange,
    quantity: rfq.quantity ?? undefined,
    location: rfq.location ?? undefined,
  };
}

/**
 * GetSimilarRFQs — searches episodic memory for RFQs in the same category
 * Note: Full Chroma vector search requires embedding generation
 * This is a category-first fallback using Postgres
 */
export async function getSimilarRFQs(
  category: string,
  limit = 5
): Promise<SimilarRFQ[]> {
  const results = await prisma.rfqMemory.findMany({
    where: { category },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      rfqId: true,
      title: true,
      category: true,
      priceRange: true,
      quantity: true,
      location: true,
    },
  });

  return results.map(r => ({
    rfqId: r.rfqId,
    title: r.title,
    category: r.category,
    priceRange: r.priceRange ?? undefined,
    quantity: r.quantity ?? undefined,
    location: r.location ?? undefined,
  }));
}

// ─── Layer 3: Strategic Memory ────────────────────────────────────────────────

/**
 * GetMarketInsights — returns aggregated intelligence for a category
 */
export async function getMarketInsights(category: string): Promise<MarketInsightData | null> {
  const insight = await prisma.marketInsight.findUnique({ where: { category } });
  if (!insight) return null;

  return {
    category: insight.category,
    avgPrice: insight.avgPrice ?? undefined,
    minPrice: insight.minPrice ?? undefined,
    maxPrice: insight.maxPrice ?? undefined,
    avgTimeline: insight.avgTimeline ?? undefined,
    demandTrend: insight.demandTrend,
    metadata: insight.metadata as Record<string, unknown> | undefined,
  };
}

/**
 * UpdateMarketInsights — daily cron job
 * Analyzes recent RFQs and quotes to compute:
 *  - Conversion rate (quotes / RFQs)
 *  - Demand trend (comparing this week vs last week)
 *  - Success rate (won quotes / total quotes)
 */
export async function updateMarketInsights(): Promise<void> {
  const categories = await prisma.rfqMemory.findMany({
    select: { category: true },
    distinct: ['category'],
  });

  for (const { category } of categories) {
    const [rfqMemories, quoteMemories] = await Promise.all([
      prisma.rfqMemory.findMany({
        where: { category },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
      prisma.quoteMemory.findMany({
        where: { rfqId: { in: rfqMemories.map(r => r.rfqId) } },
      }),
    ]);

    if (rfqMemories.length === 0) continue;

    const totalRFQs = rfqMemories.length;
    const totalQuotes = quoteMemories.length;
    const wonQuotes = quoteMemories.filter(q => q.status === 'WON').length;

    const conversionRate = totalRFQs > 0 ? totalQuotes / totalRFQs : 0;
    const successRate = totalQuotes > 0 ? wonQuotes / totalQuotes : 0;

    // Demand trend: compare count in last 7 days vs previous 7 days
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 86400000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 86400000);

    const recentRFQs = rfqMemories.filter(r => r.createdAt >= weekAgo).length;
    const olderRFQs = rfqMemories.filter(
      r => r.createdAt >= twoWeeksAgo && r.createdAt < weekAgo
    ).length;

    let demandTrend: 'RISING' | 'STABLE' | 'DECLINING' = 'STABLE';
    if (recentRFQs > olderRFQs * 1.2) demandTrend = 'RISING';
    else if (recentRFQs < olderRFQs * 0.8) demandTrend = 'DECLINING';

    const prices = quoteMemories.map(q => q.price);
    const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : undefined;

    await prisma.marketInsight.upsert({
      where: { category },
      update: {
        rfqCount: totalRFQs,
        quoteCount: totalQuotes,
        conversionRate,
        successRate,
        avgPrice,
        demandTrend,
        lastUpdated: new Date(),
      },
      create: {
        category,
        rfqCount: totalRFQs,
        quoteCount: totalQuotes,
        conversionRate,
        successRate,
        avgPrice,
        demandTrend,
      },
    });
  }
}

// ─── Cron Route ──────────────────────────────────────────────────────────────

export async function dailyInsightsCron(): Promise<{ updated: number; errors: number }> {
  const categories = await prisma.rfqMemory.findMany({
    select: { category: true },
    distinct: ['category'],
  });

  let updated = 0;
  let errors = 0;

  for (const { category } of categories) {
    try {
      const [rfqMemories, quoteMemories] = await Promise.all([
        prisma.rfqMemory.findMany({
          where: { category },
          orderBy: { createdAt: 'desc' },
          take: 100,
        }),
        prisma.quoteMemory.findMany({
          where: { rfqId: { in: rfqMemories.map(r => r.rfqId) } },
        }),
      ]);

      if (rfqMemories.length === 0) continue;

      const totalQuotes = quoteMemories.length;
      const wonQuotes = quoteMemories.filter(q => q.status === 'WON').length;
      const conversionRate = totalQuotes / rfqMemories.length;
      const successRate = totalQuotes > 0 ? wonQuotes / totalQuotes : 0;

      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 86400000);
      const twoWeeksAgo = new Date(now.getTime() - 14 * 86400000);

      const recentRFQs = rfqMemories.filter(r => r.createdAt >= weekAgo).length;
      const olderRFQs = rfqMemories.filter(
        r => r.createdAt >= twoWeeksAgo && r.createdAt < weekAgo
      ).length;

      let demandTrend: 'RISING' | 'STABLE' | 'DECLINING' = 'STABLE';
      if (recentRFQs > olderRFQs * 1.2) demandTrend = 'RISING';
      else if (recentRFQs < olderRFQs * 0.8) demandTrend = 'DECLINING';

      const prices = quoteMemories.map(q => q.price);
      const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : null;

      await prisma.marketInsight.upsert({
        where: { category },
        update: {
          rfqCount: rfqMemories.length,
          quoteCount: totalQuotes,
          conversionRate,
          successRate,
          avgPrice,
          demandTrend,
          lastUpdated: new Date(),
        },
        create: {
          category,
          rfqCount: rfqMemories.length,
          quoteCount: totalQuotes,
          conversionRate,
          successRate,
          avgPrice,
          demandTrend,
        },
      });

      updated++;
    } catch {
      errors++;
    }
  }

  return { updated, errors };
}

/** Non-blocking Company DNA sync after Elephant Memory write (Layer 11). */
export async function refreshCompanyDnaFromRfq(userId: string): Promise<void> {
  try {
    const { syncCompanyDna } = await import('@/lib/company-dna/engine');
    await syncCompanyDna(userId, false);
  } catch {
    /* DNA tables may not exist until migration runs */
  }
}
