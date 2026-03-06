/**
 * GET  /api/rfq/quotes?rfqId=xxx  — list quotes for an RFQ (buyer view)
 * PUT  /api/rfq/quotes            — accept/reject a quote (buyer) + auto-create Deal
 * POST /api/rfq/quotes            — create a quote (supplier)
 */
import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

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

    const quotes = await prisma.quote.findMany({
      where: { rfqId },
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            company: true,
            email: true,
            phone: true,
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
      // Use a transaction for atomicity
      const result = await prisma.$transaction(async (tx) => {
        // 1. Accept this quote
        const accepted = await tx.quote.update({
          where: { id: quoteId },
          data: { status: 'ACCEPTED', isAccepted: true },
        });

        // 2. Reject all other pending quotes for this RFQ
        await tx.quote.updateMany({
          where: {
            rfqId: quote.rfqId!,
            id: { not: quoteId },
            status: 'PENDING',
          },
          data: { status: 'REJECTED' },
        });

        // 3. Create Deal
        const deal = await tx.deal.create({
          data: {
            rfqId: quote.rfqId!,
            quoteId: quoteId,
            buyerId: user.userId,
            supplierId: quote.supplierId!,
            price: quote.price,
            status: 'ACTIVE',
          },
        });

        // 4. Update RFQ status
        await tx.rFQ.update({
          where: { id: quote.rfqId! },
          data: { status: 'ACCEPTED', acceptedAt: new Date() },
        });

        // 5. Escrow lock: deduct deal amount from buyer wallet if sufficient balance
        const buyerWallet = await tx.wallet.findUnique({ where: { userId: user.userId } });
        let dealStatus = 'ACTIVE';
        if (buyerWallet && buyerWallet.balance >= quote.price) {
          await tx.wallet.update({
            where: { userId: user.userId },
            data: { balance: { decrement: quote.price } },
          });
          await tx.walletTransaction.create({
            data: {
              walletId: buyerWallet.id,
              type: 'ESCROW_LOCK',
              amount: quote.price,
              description: `Escrow locked for: ${quote.rfq?.title || 'RFQ'}`,
              reference: deal.id,
            },
          });
          dealStatus = 'ESCROW_LOCKED';
          await tx.deal.update({
            where: { id: deal.id },
            data: { status: 'ESCROW_LOCKED' },
          });
        }

        return { accepted, deal: { ...deal, status: dealStatus } };
      });

      const escrowLocked = result.deal.status === 'ESCROW_LOCKED';
      return NextResponse.json({
        success: true,
        quote: { id: result.accepted.id, status: result.accepted.status },
        deal: { id: result.deal.id, price: result.deal.price, status: result.deal.status },
        message: escrowLocked
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
