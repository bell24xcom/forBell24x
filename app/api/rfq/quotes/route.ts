/**
 * GET  /api/rfq/quotes?rfqId=&supplierId=&status=
 * POST /api/rfq/quotes  — create a quote (supplier)
 * PUT  /api/rfq/quotes  — accept/reject a quote (buyer)
 *
 * Uses only fields that exist in the Prisma schema.
 * Supplier trustScore is included in GET so buyers can see it.
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { onQuoteAccepted, onQuoteRejected, checkDailyLimit } from '@/lib/orchestration';
import { sanitizeString, sanitizeText, safePositiveFloat } from '@/lib/sanitize';

export const dynamic = 'force-dynamic';

const SUPPLIER_SELECT = {
  id:         true,
  name:       true,
  company:    true,
  location:   true,
  isVerified: true,   // KYC status
  trustScore: true,   // 0-100 — shown to buyers
} as const;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rfqId      = searchParams.get('rfqId');
    const supplierId = searchParams.get('supplierId');
    const status     = searchParams.get('status');

    const where: Record<string, unknown> = {};
    if (rfqId)      where.rfqId      = rfqId;
    if (supplierId) where.supplierId = supplierId;
    if (status)     where.status     = status;

    const quotes = await prisma.quote.findMany({
      where,
      include: {
        supplier: { select: SUPPLIER_SELECT },
        rfq:      { select: { id: true, title: true, category: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, quotes });
  } catch (error) {
    console.error('rfq/quotes GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch quotes' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { rfqId, supplierId } = body;

    if (!rfqId || !supplierId || body.price == null) {
      return NextResponse.json(
        { success: false, error: 'rfqId, supplierId, and price are required' },
        { status: 400 }
      );
    }

    const price = safePositiveFloat(body.price);
    if (!price) {
      return NextResponse.json(
        { success: false, error: 'Price must be a positive number' },
        { status: 400 }
      );
    }

    // Rate limit: max 20 quotes per day per supplier
    const limitCheck = await checkDailyLimit(supplierId, 'quote', 20);
    if (!limitCheck.allowed) {
      return NextResponse.json(
        { success: false, error: `Daily quote limit reached (${limitCheck.count}/${limitCheck.limit}). Try again tomorrow.` },
        { status: 429 }
      );
    }

    // Prevent duplicate quotes (one per supplier per RFQ)
    const existing = await prisma.quote.findFirst({ where: { rfqId, supplierId } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'You have already submitted a quote for this RFQ' },
        { status: 409 }
      );
    }

    // Verify RFQ is still open
    const rfq = await prisma.rFQ.findUnique({ where: { id: rfqId }, select: { status: true } });
    if (!rfq) {
      return NextResponse.json({ success: false, error: 'RFQ not found' }, { status: 404 });
    }
    if (!['ACTIVE', 'QUOTED'].includes(rfq.status)) {
      return NextResponse.json(
        { success: false, error: `This RFQ is no longer accepting quotes (status: ${rfq.status})` },
        { status: 409 }
      );
    }

    const quote = await prisma.quote.create({
      data: {
        rfqId,
        supplierId,
        price,
        quantity:    sanitizeString(String(body.quantity || '1'), 50),
        timeline:    sanitizeString(String(body.timeline  || ''), 100),
        description: sanitizeText(body.description, 1000) || null,
        terms:       sanitizeText(body.terms,       500)  || null,
        status:      'PENDING',
      },
      include: { supplier: { select: SUPPLIER_SELECT } },
    });

    // Update RFQ status to QUOTED (fire-and-forget)
    prisma.rFQ.update({
      where: { id: rfqId, status: 'ACTIVE' },
      data:  { status: 'QUOTED' },
    }).catch(() => {}); // ignore if already QUOTED

    return NextResponse.json({ success: true, quote });
  } catch (error) {
    console.error('rfq/quotes POST error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create quote' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { quoteId, status, buyerId } = await req.json();

    if (!quoteId || !status) {
      return NextResponse.json(
        { success: false, error: 'quoteId and status are required' },
        { status: 400 }
      );
    }

    const validStatuses = ['PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: `Invalid status. Use: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // Load quote with full context before updating
    const quoteWithCtx = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: {
        rfq:      { select: { id: true, title: true, createdBy: true } },
        supplier: { select: { id: true, name: true, email: true } },
      },
    });
    if (!quoteWithCtx) {
      return NextResponse.json({ success: false, error: 'Quote not found' }, { status: 404 });
    }

    const quote = await prisma.quote.update({
      where: { id: quoteId },
      data:  { status, isAccepted: status === 'ACCEPTED' },
      include: { supplier: { select: SUPPLIER_SELECT } },
    });

    // On ACCEPT: lock RFQ + reject all others + trigger orchestration
    if (status === 'ACCEPTED') {
      await Promise.all([
        prisma.quote.updateMany({
          where: { rfqId: quote.rfqId, id: { not: quoteId } },
          data:  { status: 'REJECTED' },
        }),
        prisma.rFQ.update({
          where: { id: quote.rfqId },
          data:  { status: 'ACCEPTED', acceptedAt: new Date() },
        }),
      ]);

      // Fire orchestration (fire-and-forget)
      const effectiveBuyerId = buyerId || quoteWithCtx.rfq.createdBy;
      Promise.all([
        prisma.user.findUnique({ where: { id: effectiveBuyerId }, select: { id: true, name: true } }),
      ]).then(([buyer]) => {
        if (!buyer) return;
        onQuoteAccepted(
          { id: quoteWithCtx.id, price: quoteWithCtx.price },
          { id: quoteWithCtx.rfq.id, title: quoteWithCtx.rfq.title },
          quoteWithCtx.supplier,
          { id: buyer.id, name: buyer.name }
        );
      }).catch(err => console.error('[Orchestration] quotes PUT accept:', err));
    }

    // On REJECT: fire rejection notification
    if (status === 'REJECTED') {
      onQuoteRejected(
        { id: quoteWithCtx.id, price: quoteWithCtx.price },
        { id: quoteWithCtx.rfq.id, title: quoteWithCtx.rfq.title },
        quoteWithCtx.supplier
      ).catch(err => console.error('[Orchestration] quotes PUT reject:', err));
    }

    return NextResponse.json({ success: true, quote });
  } catch (error) {
    console.error('rfq/quotes PUT error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update quote' }, { status: 500 });
  }
}
