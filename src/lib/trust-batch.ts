/**
 * Trust Score batch recompute — uses existing User.trustScore field (no schema changes).
 *
 * Formula (CLAUDE.md Trade Confidence Score):
 *  30% Payment History + 20% On-time Delivery + 15% Response Speed
 *  + 15% Repeat Orders + 10% Dispute Rate + 10% Verification Strength
 */

import { prisma } from '@/lib/prisma';

export interface TrustBatchResult {
  processed: number;
  updated: number;
  skipped: number;
  errors: string[];
}

interface SupplierMetrics {
  paymentScore: number;
  deliveryScore: number;
  responseScore: number;
  repeatScore: number;
  disputeScore: number;
  verificationScore: number;
}

function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(n)));
}

function computeTrustScore(m: SupplierMetrics): number {
  return clamp(
    m.paymentScore * 0.3 +
      m.deliveryScore * 0.2 +
      m.responseScore * 0.15 +
      m.repeatScore * 0.15 +
      m.disputeScore * 0.1 +
      m.verificationScore * 0.1,
  );
}

async function metricsForSupplier(userId: string): Promise<SupplierMetrics> {
  const [user, txns, deals, quotes, reviews] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { isVerified: true, isClaimed: true, gstNumber: true, udyamNumber: true, createdAt: true },
    }),
    prisma.transaction.findMany({
      where: { supplierId: userId },
      select: { status: true },
    }),
    prisma.deal.findMany({
      where: { supplierId: userId },
      select: { status: true, buyerId: true },
    }),
    prisma.quote.findMany({
      where: { supplierId: userId },
      select: { createdAt: true, rfq: { select: { createdAt: true } } },
      take: 50,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.review.findMany({
      where: { revieweeId: userId },
      select: { rating: true },
    }),
  ]);

  if (!user) {
    return { paymentScore: 0, deliveryScore: 0, responseScore: 0, repeatScore: 0, disputeScore: 50, verificationScore: 0 };
  }

  // Payment history: % completed transactions
  const completed = txns.filter((t) => t.status === 'COMPLETED').length;
  const paymentScore = txns.length === 0 ? 0 : clamp((completed / txns.length) * 100);

  // On-time delivery: completed deals ratio
  const completedDeals = deals.filter((d) => d.status === 'COMPLETED' || d.status === 'ACTIVE').length;
  const deliveryScore = deals.length === 0 ? 0 : clamp((completedDeals / deals.length) * 100);

  // Response speed: avg hours from RFQ to quote (faster = higher)
  let responseScore = 0;
  const responseHours: number[] = [];
  for (const q of quotes) {
    if (q.rfq?.createdAt) {
      const hrs = (q.createdAt.getTime() - q.rfq.createdAt.getTime()) / 3_600_000;
      if (hrs >= 0) responseHours.push(hrs);
    }
  }
  if (responseHours.length > 0) {
    const avgHrs = responseHours.reduce((a, b) => a + b, 0) / responseHours.length;
    responseScore = clamp(100 - avgHrs * 2); // 0h=100, 50h=0
  }

  // Repeat orders: unique buyers with >1 deal
  const buyerCounts = new Map<string, number>();
  for (const d of deals) buyerCounts.set(d.buyerId, (buyerCounts.get(d.buyerId) ?? 0) + 1);
  const repeatBuyers = Array.from(buyerCounts.values()).filter((c) => c > 1).length;
  const repeatScore = deals.length === 0 ? 0 : clamp((repeatBuyers / Math.max(1, buyerCounts.size)) * 100);

  // Dispute rate: inverse of low ratings (rating < 3 treated as dispute signal)
  const lowRatings = reviews.filter((r) => r.rating < 3).length;
  const disputeScore = reviews.length === 0 ? 70 : clamp(100 - (lowRatings / reviews.length) * 100);

  // Verification strength
  let verificationScore = 0;
  if (user.isClaimed) verificationScore += 30;
  if (user.isVerified) verificationScore += 30;
  if (user.gstNumber) verificationScore += 20;
  if (user.udyamNumber) verificationScore += 20;
  verificationScore = clamp(verificationScore);

  return { paymentScore, deliveryScore, responseScore, repeatScore, disputeScore, verificationScore };
}

/** Batch recompute trustScore for suppliers. Preserves event-driven floor (never lowers below current if claimed). */
export async function batchRecomputeTrustScores(options?: {
  limit?: number;
  onlyDiscovered?: boolean;
}): Promise<TrustBatchResult> {
  const limit = options?.limit ?? 500;
  const result: TrustBatchResult = { processed: 0, updated: 0, skipped: 0, errors: [] };

  const where: Record<string, unknown> = { role: 'SUPPLIER' };
  if (options?.onlyDiscovered) {
    where.OR = [
      { importedFrom: { startsWith: 'discovery:' } },
      { importedFrom: 'admin_import' },
    ];
  }

  const suppliers = await prisma.user.findMany({
    where,
    select: { id: true, trustScore: true, isClaimed: true },
    take: limit,
    orderBy: { updatedAt: 'desc' },
  });

  for (const supplier of suppliers) {
    result.processed++;
    try {
      const metrics = await metricsForSupplier(supplier.id);
      let newScore = computeTrustScore(metrics);

      // Preserve event-driven floors: claimed suppliers keep minimum 30
      if (supplier.isClaimed) newScore = Math.max(newScore, 30);
      // Never lower below current stored score (event bumps are authoritative)
      newScore = Math.max(newScore, supplier.trustScore);

      if (newScore !== supplier.trustScore) {
        await prisma.user.update({
          where: { id: supplier.id },
          data: { trustScore: newScore },
        });
        result.updated++;
      } else {
        result.skipped++;
      }
    } catch (err) {
      result.errors.push(`${supplier.id}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return result;
}
