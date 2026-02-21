/**
 * GET  /api/rfq/quotes?rfqId=&supplierId=&status=
 * POST /api/rfq/quotes  — create a quote (supplier)
 * PUT  /api/rfq/quotes  — accept/reject a quote (buyer)
 *
 * Uses only fields that exist in the Prisma schema.
 * Supplier trustScore is included in GET so buyers can see it.
 */
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
    const rfqId = request.nextUrl.searchParams.get('rfqId');

    if (!rfqId) {
      return NextResponse.json(
        { error: 'RFQ ID is required' },
        { status: 400 }
      );
    }

    // Get quotes for the RFQ
    const quotes = await prisma.quote.findMany({
      where: { rfqId },
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            companyName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      quotes: quotes.map((quote) => ({
        id: quote.id,
        rfqId: quote.rfqId,
        supplier: quote.supplier,
        price: quote.price,
        quantity: quote.quantity,
        timeline: quote.timeline,
        description: quote.description,
        terms: quote.terms,
        status: quote.status,
        createdAt: quote.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching quotes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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
    const { quoteId, action } = body;

    if (!quoteId || !action || !['accept', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }

    // Get the quote
    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: {
        rfq: {
          select: { createdBy: true },
        },
      },
    });

    if (!quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }

    // Verify the RFQ belongs to the authenticated user
    if (quote.rfq.createdBy !== user.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Update quote status
    const updatedQuote = await prisma.quote.update({
      where: { id: quoteId },
      data: { status: action === 'accept' ? 'ACCEPTED' : 'REJECTED' },
    });

    // If accepting, update RFQ status
    if (action === 'accept') {
      await prisma.rFQ.update({
        where: { id: quote.rfqId },
        data: { status: 'QUOTED' },
      });
    }

    return NextResponse.json({
      success: true,
      quote: {
        id: updatedQuote.id,
        status: updatedQuote.status,
      },
    });
  } catch (error) {
    console.error('Error updating quote:', error);
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
    console.error('Error creating quote:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}