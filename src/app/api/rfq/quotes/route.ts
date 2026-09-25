/**
 * GET  /api/rfq/quotes?rfqId=xxx  — list quotes for an RFQ (buyer view)
 * PUT  /api/rfq/quotes            — accept/reject a quote (buyer) + auto-create Deal
 * POST /api/rfq/quotes            — create a quote (supplier)
 */
import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';
import { acceptQuote } from '@/lib/quote-acceptance';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const rfqId = request.nextUrl.searchParams.get('rfqId');
    if (!rfqId) {
      return NextResponse.json({ error: 'RFQ ID is required' }, { status: 400 });
    }

    const rfq = await prisma.rFQ.findUnique({
      where: { id: rfqId },
      select: { createdBy: true },
    });
    if (!rfq) {
      return NextResponse.json({ error: 'RFQ not found' }, { status: 404 });
    }
    if (rfq.createdBy !== user.userId && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: only the RFQ owner can view its quotes' }, { status: 403 });
    }

    const quotes = await prisma.quote.findMany({
      where: { rfqId },
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            company: true,
            trustScore: true,
            location: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      quotes: quotes.map((q) => ({
        id: q.id,
        rfqId: q.rfqId,
        supplier: q.supplier,
        price: q.price,
        quantity: q.quantity,
        deliveryDays: q.deliveryDays,
        notes: q.notes,
        timeline: q.timeline,
        description: q.description,
        terms: q.terms,
        status: q.status,
        isAccepted: q.isAccepted,
        createdAt: q.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching quotes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { quoteId, action } = body;

    if (!quoteId || !action || !['accept', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request. Need quoteId and action (accept/reject)' }, { status: 400 });
    }

    // Get quote with RFQ details
    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: {
        rfq: { select: { id: true, createdBy: true, title: true } },
      },
    });

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    // Only the RFQ owner (buyer) can accept/reject
    if (quote.rfq?.createdBy !== user.userId) {
      return NextResponse.json({ error: 'Only the RFQ owner can accept/reject quotes' }, { status: 403 });
    }

    if (quote.status !== 'PENDING') {
      return NextResponse.json({ error: `Quote is already ${quote.status.toLowerCase()}` }, { status: 400 });
    }

    if (action === 'accept') {
      // Shared acceptance path (lib/quote-acceptance.ts): Deal, RFQ lock, competing
      // quote rejection, notifications (including the supplier email) and audit
      // trail. Escrow lock stays specific to this route and runs in the same transaction.
      const result = await acceptQuote({
        quoteId,
        actor: { id: user.userId, role: user.role },
        source: 'rfq-quotes',
        lockEscrow: true,
      });

      if (!result.ok) {
        return NextResponse.json({ error: result.error, code: result.code }, { status: result.status });
      }

      return NextResponse.json({
        success: true,
        quote: { id: result.quote.id, status: result.quote.status },
        deal: { id: result.deal.id, price: result.deal.price, status: result.deal.status },
        message: result.escrowLocked
          ? `Quote accepted! ₹${result.deal.price.toLocaleString('en-IN')} held in escrow until delivery.`
          : 'Quote accepted! Deal created — add funds to your wallet to pay.',
      });
    } else {
      // Reject
      const rejected = await prisma.quote.update({
        where: { id: quoteId },
        data: { status: 'REJECTED' },
      });

      return NextResponse.json({
        success: true,
        quote: { id: rejected.id, status: rejected.status },
        message: 'Quote rejected',
      });
    }
  } catch (error) {
    console.error('Error updating quote:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { rfqId, price, quantity, timeline, description, terms, deliveryDays, notes } = body;

    if (!rfqId || !price) {
      return NextResponse.json({ error: 'RFQ ID and price are required' }, { status: 400 });
    }

    const rfq = await prisma.rFQ.findFirst({
      where: { id: rfqId, isPublic: true },
    });
    if (!rfq) {
      return NextResponse.json({ error: 'RFQ not found' }, { status: 404 });
    }

    const quote = await prisma.quote.create({
      data: {
        rfqId,
        supplierId: user.userId,
        price: parseFloat(String(price)),
        quantity: quantity || rfq.quantity || '1',
        timeline: timeline || (deliveryDays ? `${deliveryDays} days` : null),
        deliveryDays: deliveryDays ? parseInt(String(deliveryDays)) : null,
        notes: notes || null,
        description: description || notes || null,
        terms: terms || null,
        status: 'PENDING',
      },
    });

    return NextResponse.json({
      success: true,
      quote: {
        id: quote.id,
        rfqId: quote.rfqId,
        price: quote.price,
        status: quote.status,
        createdAt: quote.createdAt,
      },
    });
  } catch (error) {
    console.error('Error creating quote:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
