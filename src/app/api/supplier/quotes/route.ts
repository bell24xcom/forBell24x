import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';
import { notifyQuoteCreated } from '@/lib/quote-notify-runtime';
import { storeQuote } from '@/lib/memory-engine';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const status = request.nextUrl.searchParams.get('status');
    const rfqId = request.nextUrl.searchParams.get('rfqId');
    const page = parseInt(request.nextUrl.searchParams.get('page') || '1');
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '20');

    const where: any = { supplierId: user.userId };
    if (status) where.status = status;
    if (rfqId) where.rfqId = rfqId;

    const [quotes, total] = await Promise.all([
      prisma.quote.findMany({
        where,
        include: {
          rfq: {
            include: {
              user: { select: { name: true, company: true, location: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.quote.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      quotes: quotes.map((q) => ({
        id: q.id,
        rfqId: q.rfqId,
        rfq: q.rfq ? {
          id: q.rfq.id,
          title: q.rfq.title,
          category: q.rfq.category,
          description: q.rfq.description,
          quantity: q.rfq.quantity,
          budget: q.rfq.maxBudget,
          timeline: q.rfq.timeline,
          urgency: q.rfq.urgency,
          location: q.rfq.location,
          buyer: q.rfq.user,
        } : null,
        price: q.price,
        quantity: q.quantity,
        deliveryDays: q.deliveryDays,
        notes: q.notes,
        timeline: q.timeline,
        description: q.description,
        terms: q.terms,
        status: q.status,
        createdAt: q.createdAt,
      })),
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error('[supplier/quotes GET]', error);
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
    const { rfqId, price, deliveryDays, notes, terms, quantity, timeline, description } = body;

    if (!rfqId || !price) {
      return NextResponse.json({ error: 'RFQ ID and price are required' }, { status: 400 });
    }

    // Validate RFQ exists and is open for quoting.
    // OPEN: default status for voice-created RFQs (src/app/api/voice-rfq/save/route.ts).
    // ACTIVE: default status for text-created RFQs (src/app/api/rfq/create/route.ts).
    // QUOTED: already has at least one quote but still accepts more.
    const rfq = await prisma.rFQ.findFirst({
      where: { id: rfqId, isPublic: true, status: { in: ['OPEN', 'ACTIVE', 'QUOTED'] } },
    });

    if (!rfq) {
      return NextResponse.json({ error: 'RFQ not found or not active' }, { status: 404 });
    }

    // Prevent quoting on own RFQ
    if (rfq.createdBy === user.userId) {
      return NextResponse.json({ error: 'Cannot quote on your own RFQ' }, { status: 400 });
    }

    // Check duplicate
    const existing = await prisma.quote.findFirst({
      where: { rfqId, supplierId: user.userId },
    });
    if (existing) {
      return NextResponse.json({ error: 'You have already quoted on this RFQ' }, { status: 400 });
    }

    const quote = await prisma.quote.create({
      data: {
        rfqId,
        supplierId: user.userId,
        price: parseFloat(String(price)),
        quantity: quantity || rfq.quantity || '1',
        deliveryDays: deliveryDays ? parseInt(String(deliveryDays)) : null,
        notes: notes || null,
        timeline: timeline || (deliveryDays ? `${deliveryDays} days` : null),
        description: description || notes || null,
        terms: terms || null,
        status: 'PENDING',
      },
    });

    // ── Elephant Memory: store quote in episodic memory ──
    storeQuote({
      rfqId,
      supplierId: user.userId,
      price: parseFloat(String(price)),
      quantity: quantity || rfq.quantity || '1',
      status: 'PENDING',
    }).catch(err => console.error('[Memory] storeQuote error:', err));

    // Update RFQ status to QUOTED if it was ACTIVE
    await prisma.rFQ.update({
      where: { id: rfqId },
      data: { status: 'QUOTED' },
    }).catch(() => {}); // Ignore if already updated

    // MA-01: one helper alerts the buyer (in-app notification + email + n8n) and skips seeded/demo RFQs.
    // Previously this route sent only an email and never created the in-app QUOTE_RECEIVED notification.
    notifyQuoteCreated(quote.id, 'supplier-quotes');

    return NextResponse.json({
      success: true,
      quote: {
        id: quote.id,
        rfqId: quote.rfqId,
        price: quote.price,
        deliveryDays: quote.deliveryDays,
        notes: quote.notes,
        status: quote.status,
        createdAt: quote.createdAt,
      },
    });
  } catch (error) {
    console.error('[supplier/quotes POST]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
