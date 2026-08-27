/**
 * GET /api/admin/transaction-evidence
 *
 * VS-SPRINT-FIRST-TRANSACTION-04 — Phase 5
 *
 * Returns structured evidence for every deal journey on the platform.
 * This is the raw material for Trade Intelligence once real transactions exist.
 *
 * For each deal, captures:
 *   - RFQ ID, Supplier ID, Buyer ID, Quote ID
 *   - Unlock Timestamp (from LeadSupplier)
 *   - Quote Timestamp
 *   - Acceptance Timestamp (quote.updatedAt when status became ACCEPTED)
 *   - Deal Timestamp
 *   - Payment Timestamp (from Transaction linked to deal)
 *
 * Admin only. No AI. No ranking. Evidence capture only.
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, isErrorResponse } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (isErrorResponse(auth)) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(100, parseInt(searchParams.get('limit') || '50'));
    const offset = parseInt(searchParams.get('offset') || '0');

    // Fetch deals with all related evidence
    const deals = await prisma.deal.findMany({
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
      include: {
        rfq:      { select: { id: true, title: true, category: true, isSeeded: true, createdAt: true } },
        quote:    { select: { id: true, price: true, status: true, createdAt: true, updatedAt: true } },
        buyer:    { select: { id: true, name: true, phone: true, verificationStatus: true } },
        supplier: { select: { id: true, name: true, company: true, trustScore: true, verificationStatus: true } },
      },
    });

    const totalDeals = await prisma.deal.count();

    // For each deal, look up:
    //   - LeadSupplier unlock record (leadId = rfqId, supplierId = deal.supplierId)
    //   - Transaction record referencing this deal
    const dealIds    = deals.map(d => d.id);
    const rfqIds     = deals.map(d => d.rfqId);
    const supplierIds = deals.map(d => d.supplierId);

    const [unlockRecords, transactions] = await Promise.all([
      prisma.leadSupplier.findMany({
        where: {
          OR: rfqIds.map((rfqId, i) => ({ leadId: rfqId, supplierId: supplierIds[i] })),
          unlocked: true,
        },
        select: { leadId: true, supplierId: true, unlockedAt: true },
      }),
      prisma.transaction.findMany({
        where: {
          // Transactions may reference deal ID in various fields — check common patterns
          OR: [
            { reference: { in: dealIds } },
            { description: { contains: dealIds[0] || 'nomatch' } },
          ],
        },
        select: { id: true, reference: true, status: true, createdAt: true, amount: true },
      }).catch(() => [] as any[]), // Transaction table structure may vary — never block evidence
    ]);

    // Build lookup maps
    const unlockMap = new Map(
      unlockRecords.map(u => [`${u.leadId}:${u.supplierId}`, u.unlockedAt]),
    );
    const txMap = new Map(
      transactions.map((t: any) => [t.reference, t]),
    );

    const evidence = deals.map(d => {
      const unlockKey = `${d.rfqId}:${d.supplierId}`;
      const tx = txMap.get(d.id);

      return {
        // Identity
        dealId:      d.id,
        rfqId:       d.rfqId,
        rfqTitle:    d.rfq?.title ?? null,
        rfqCategory: d.rfq?.category ?? null,
        isSeeded:    d.rfq?.isSeeded ?? false,
        buyerId:     d.buyerId,
        buyerName:   d.buyer?.name ?? null,
        supplierId:  d.supplierId,
        supplierName: d.supplier?.company || d.supplier?.name || null,
        supplierTrustScore: d.supplier?.trustScore ?? null,
        quoteId:     d.quoteId,
        quotePrice:  d.quote ? Number(d.quote.price) : null,
        dealValue:   Number(d.price),
        dealStatus:  d.status,

        // Timestamps — the raw evidence chain
        rfqCreatedAt:        d.rfq?.createdAt?.toISOString() ?? null,
        unlockTimestamp:     unlockMap.get(unlockKey)?.toISOString() ?? null,
        quoteTimestamp:      d.quote?.createdAt?.toISOString() ?? null,
        acceptanceTimestamp: d.quote?.status === 'ACCEPTED' ? d.quote.updatedAt?.toISOString() ?? null : null,
        dealTimestamp:       d.createdAt.toISOString(),
        paymentTimestamp:    tx?.createdAt?.toISOString() ?? null,
        paymentStatus:       tx?.status ?? null,
        paymentAmount:       tx?.amount ? Number(tx.amount) : null,

        // Computed intervals (seconds) — null if timestamps missing
        unlockToQuoteSeconds:
          unlockMap.get(unlockKey) && d.quote?.createdAt
            ? Math.round((new Date(d.quote.createdAt).getTime() - new Date(unlockMap.get(unlockKey)!).getTime()) / 1000)
            : null,
        quoteToAcceptanceSeconds:
          d.quote?.createdAt && d.quote?.updatedAt && d.quote?.status === 'ACCEPTED'
            ? Math.round((new Date(d.quote.updatedAt).getTime() - new Date(d.quote.createdAt).getTime()) / 1000)
            : null,
        dealToPaymentSeconds:
          tx?.createdAt
            ? Math.round((new Date(tx.createdAt).getTime() - new Date(d.createdAt).getTime()) / 1000)
            : null,
      };
    });

    return NextResponse.json({
      success: true,
      totalDeals,
      returned: evidence.length,
      offset,
      limit,
      evidence,
      // Summary for quick founder view
      summary: {
        totalDeals,
        realDeals: evidence.filter(e => !e.isSeeded).length,
        dealsWithPayment: evidence.filter(e => e.paymentTimestamp).length,
        dealsWithUnlock: evidence.filter(e => e.unlockTimestamp).length,
        avgQuoteToAcceptanceHours: (() => {
          const valid = evidence.filter(e => e.quoteToAcceptanceSeconds !== null);
          if (!valid.length) return null;
          return Math.round(valid.reduce((s, e) => s + e.quoteToAcceptanceSeconds!, 0) / valid.length / 3600 * 10) / 10;
        })(),
      },
    });
  } catch (error) {
    console.error('[transaction-evidence] error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch evidence' }, { status: 500 });
  }
}
