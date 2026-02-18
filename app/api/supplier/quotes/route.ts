import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/jwt';
import { onQuoteSubmitted } from '@/lib/orchestration';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const token =
      request.cookies.get('auth-token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ success: false, error: 'Invalid session' }, { status: 401 });
    }

    const supplierId = payload.userId;
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, parseInt(searchParams.get('limit') || '10'));
    const status = searchParams.get('status') || '';
    const skip = (page - 1) * limit;

    const where = {
      supplierId,
      ...(status ? { status: status as 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' } : {}),
    };

    const [quotes, total] = await Promise.all([
      prisma.quote.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          rfq: {
            select: {
              id: true,
              title: true,
              category: true,
              quantity: true,
              timeline: true,
              status: true,
              createdAt: true,
              user: { select: { name: true, company: true } },
            },
          },
        },
      }),
      prisma.quote.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      quotes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: skip + limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Supplier quotes GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load quotes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token =
      request.cookies.get('auth-token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ success: false, error: 'Invalid session' }, { status: 401 });
    }

    const supplierId = payload.userId;
    const body = await request.json();
    const { rfqId, price, quantity, timeline, description, terms } = body;

    if (!rfqId || !price || !quantity || !timeline) {
      return NextResponse.json(
        { success: false, error: 'rfqId, price, quantity, and timeline are required' },
        { status: 400 }
      );
    }

    // Verify RFQ exists and is public/active
    const rfq = await prisma.rFQ.findFirst({
      where: { id: rfqId, isPublic: true, status: 'ACTIVE' },
    });
    if (!rfq) {
      return NextResponse.json(
        { success: false, error: 'RFQ not found or not open for quotes' },
        { status: 404 }
      );
    }

    // Check if supplier already quoted this RFQ
    const existing = await prisma.quote.findFirst({ where: { rfqId, supplierId } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'You have already submitted a quote for this RFQ' },
        { status: 409 }
      );
    }

    const quote = await prisma.quote.create({
      data: {
        rfqId,
        supplierId,
        price: parseFloat(price),
        quantity: String(quantity),
        timeline,
        description: description || null,
        terms: terms || null,
        status: 'PENDING',
      },
      include: {
        rfq: { select: { id: true, title: true, createdBy: true } },
      },
    });

    // Fire orchestration in background
    Promise.all([
      prisma.user.findUnique({ where: { id: supplierId }, select: { id: true, name: true, company: true, email: true } }),
      prisma.user.findUnique({ where: { id: quote.rfq.createdBy }, select: { id: true, name: true, email: true } }),
    ]).then(([supplier, buyer]) => {
      if (!supplier || !buyer) return;
      onQuoteSubmitted(
        { id: quote.id, price: quote.price, timeline: quote.timeline },
        { id: quote.rfq.id, title: quote.rfq.title, createdBy: quote.rfq.createdBy },
        { id: supplier.id, name: supplier.name, company: supplier.company, email: supplier.email },
        { id: buyer.id, name: buyer.name, email: buyer.email }
      );
    }).catch(err => console.error('[Orchestration] onQuoteSubmitted error:', err));

    return NextResponse.json({ success: true, quote }, { status: 201 });
  } catch (error) {
    console.error('Supplier quotes POST error:', error);
    return NextResponse.json({ success: false, error: 'Failed to submit quote' }, { status: 500 });
  }
}
