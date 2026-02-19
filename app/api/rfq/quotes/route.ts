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
    const { rfqId, supplierId, price, quantity, timeline, description, terms } = await req.json();

    if (!rfqId || !supplierId || price == null) {
      return NextResponse.json(
        { success: false, error: 'rfqId, supplierId, and price are required' },
        { status: 400 }
      );
    }

    // Prevent duplicate quotes
    const existing = await prisma.quote.findFirst({ where: { rfqId, supplierId } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Quote already submitted for this RFQ' },
        { status: 409 }
      );
    }

    const quote = await prisma.quote.create({
      data: {
        rfqId,
        supplierId,
        price:       parseFloat(price),
        quantity:    String(quantity || '1'),
        timeline:    String(timeline || ''),
        description: description || null,
        terms:       terms       || null,
        status:      'PENDING',
      },
      include: { supplier: { select: SUPPLIER_SELECT } },
    });

    return NextResponse.json({ success: true, quote });
  } catch (error) {
    console.error('rfq/quotes POST error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create quote' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { quoteId, status } = await req.json();

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

    const quote = await prisma.quote.update({
      where: { id: quoteId },
      data:  { status, isAccepted: status === 'ACCEPTED' },
      include: { supplier: { select: SUPPLIER_SELECT } },
    });

    // Accept one → reject all others on the same RFQ
    if (status === 'ACCEPTED') {
      await prisma.quote.updateMany({
        where: { rfqId: quote.rfqId, id: { not: quoteId } },
        data:  { status: 'REJECTED' },
      });
    }

    return NextResponse.json({ success: true, quote });
  } catch (error) {
    console.error('rfq/quotes PUT error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update quote' }, { status: 500 });
  }
}
