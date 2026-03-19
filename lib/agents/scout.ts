/**
 * Scout Agent — Supplier Finding
 * ─────────────────────────────
 * Finds relevant suppliers for a given RFQ using memory + database.
 *
 * Strategy:
 * 1. Memory: getSimilarRFQs → past winning suppliers
 * 2. DB: find claimed, active suppliers in category + location
 * 3. Score by trustScore, location match, category match
 */

import { prisma } from '@/lib/prisma';
import { getSimilarRFQs, getMarketInsights } from '@/lib/memory-engine';

export interface Supplier {
  id: string;
  name: string;
  company: string;
  phone?: string;
  email?: string;
  location?: string;
  trustScore: number;
  score: number;
}

export interface FindSuppliersResult {
  suppliers: Supplier[];
  method: 'memory' | 'database' | 'hybrid';
}

/**
 * findSuppliers — main entry point
 * Returns top suppliers for an RFQ, ranked by relevance score
 */
export async function findSuppliers(ctx: {
  rfqId: string;
  title: string;
  category: string;
  location: string;
  maxBudget?: number | null;
  quantity: string;
}): Promise<Supplier[]> {
  const { category, location } = ctx;

  // Try memory first — past winning suppliers
  const similarRFQs = await getSimilarRFQs(category, 10);
  const memorySupplierIds = new Set<string>();

  // Get winning suppliers from similar RFQs
  const winningQuotes = await prisma.quote.findMany({
    where: {
      rfqId: { in: similarRFQs.map(r => r.rfqId) },
      status: 'ACCEPTED',
    },
    select: { supplierId: true },
    take: 20,
  });
  winningQuotes.forEach(q => memorySupplierIds.add(q.supplierId));

  // DB search: claimed suppliers in category
  const dbSuppliers = await prisma.user.findMany({
    where: {
      role: 'SUPPLIER',
      isClaimed: true,
      isActive: true,
      // Note: category is on RFQs, not users — would need product/industry mapping
      // For now, return all claimed suppliers in location
      ...(location && location !== 'Pan India' ? { location } : {}),
    },
    select: {
      id: true,
      name: true,
      company: true,
      phone: true,
      email: true,
      location: true,
      trustScore: true,
    },
    take: 50,
  });

  // Score and rank
  const scored = dbSuppliers.map(s => {
    const memoryBoost = memorySupplierIds.has(s.id) ? 15 : 0;
    const trustBoost = Math.min((s.trustScore ?? 0) / 10, 10); // max +10
    const score = (s.trustScore ?? 0) + memoryBoost + trustBoost;

    return {
      id: s.id,
      name: s.name ?? 'Unknown',
      company: s.company ?? 'Unknown Company',
      phone: s.phone ?? undefined,
      email: s.email ?? undefined,
      location: s.location ?? undefined,
      trustScore: s.trustScore ?? 0,
      score,
    };
  });

  // Sort by score descending, take top 10
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}
