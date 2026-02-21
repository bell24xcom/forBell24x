import { NextRequest, NextResponse } from 'next/server';
import { jwt } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await jwt.authenticate(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get query parameters
    const status = request.nextUrl.searchParams.get('status');
    const page = parseInt(request.nextUrl.searchParams.get('page') || '1');
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '10');

    // Build query
    const where: any = { supplierId: user.userId };
    if (status) {
      where.status = status;
    }

    // Get quotes
    const quotes = await prisma.quote.findMany({
      where,
      include: {
        rfq: {
          include: {
            user: {
              select: { name: true, company: true, location: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Get total count
    const total = await prisma.quote.count({ where });

    return NextResponse.json({
      success: true,
      quotes: quotes.map((quote) => ({
        id: quote.id,
        rfqId: quote.rfqId,
        rfq: {
          id: quote.rfq.id,
          title: quote.rfq.title,
          category: quote.rfq.category,
          description: quote.rfq.description,
          quantity: quote.rfq.quantity,
          budget: quote.rfq.maxBudget,
          timeline: quote.rfq.timeline,
          urgency: quote.rfq.urgency,
          location: quote.rfq.location,
          user: quote.rfq.user,
        },
        supplierId: quote.supplierId,
        price: quote.price,
        quantity: quote.quantity,
        timeline: quote.timeline,
        description: quote.description,
        terms: quote.terms,
        status: quote.status,
        createdAt: quote.createdAt,
      })),
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error('Error fetching supplier quotes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await jwt.authenticate(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { rfqId, price, quantity, timeline, description, terms } = body;

    if (!rfqId || !price || !quantity || !timeline) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate RFQ exists and is public
    const rfq = await prisma.rFQ.findUnique({
      where: { id: rfqId, isPublic: true },
    });

    if (!rfq) {
      return NextResponse.json(
        { error: 'RFQ not found or not public' },
        { status: 404 }
      );
    }

    // Check if supplier already quoted on this RFQ
    const existingQuote = await prisma.quote.findFirst({
      where: { rfqId, supplierId: user.userId },
    });

    if (existingQuote) {
      return NextResponse.json(
        { error: 'You have already quoted on this RFQ' },
        { status: 400 }
      );
    }

    // Create quote
    const quote = await prisma.quote.create({
      data: {
        rfqId,
        supplierId: user.userId,
        price,
        quantity,
        timeline,
        description,
        terms,
        status: 'PENDING',
      },
    });

    return NextResponse.json({
      success: true,
      quote: {
        id: quote.id,
        rfqId: quote.rfqId,
        supplierId: quote.supplierId,
        price: quote.price,
        quantity: quote.quantity,
        timeline: quote.timeline,
        description: quote.description,
        terms: quote.terms,
        status: quote.status,
        createdAt: quote.createdAt,
      },
    });
  } catch (error) {
    console.error('Error creating supplier quote:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}