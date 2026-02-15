import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rfqId = searchParams.get('rfqId');
    const supplierId = searchParams.get('supplierId');
    const status = searchParams.get('status');

    const where: any = {};

    if (rfqId) where.rfqId = rfqId;
    if (supplierId) where.supplierId = supplierId;
    if (status) where.status = status;

    const quotes = await prisma.quote.findMany({
      where,
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            company: true,
            rating: true,
            verified: true,
            location: true
          }
        },
        rfq: {
          select: {
            id: true,
            title: true,
            category: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ quotes });

  } catch (error) {
    console.error('Error fetching quotes:', error);
    return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { 
      rfqId, 
      supplierId, 
      price, 
      quantity, 
      deliveryTime, 
      terms, 
      validity, 
      notes 
    } = await req.json();

    if (!rfqId || !supplierId || !price) {
      return NextResponse.json({ 
        error: 'RFQ ID, Supplier ID, and Price are required' 
      }, { status: 400 });
    }

    // Check if quote already exists
    const existingQuote = await prisma.quote.findFirst({
      where: {
        rfqId,
        supplierId
      }
    });

    if (existingQuote) {
      return NextResponse.json({ 
        error: 'Quote already submitted for this RFQ' 
      }, { status: 400 });
    }

    const quote = await prisma.quote.create({
      data: {
        rfqId,
        supplierId,
        price: parseFloat(price),
        quantity: parseInt(quantity) || 1,
        deliveryTime,
        terms,
        validity: parseInt(validity) || 30,
        notes,
        status: 'PENDING'
      },
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            company: true,
            rating: true,
            verified: true
          }
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      quote 
    });

  } catch (error) {
    console.error('Error creating quote:', error);
    return NextResponse.json({ error: 'Failed to create quote' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { quoteId, status, selectedReason } = await req.json();

    if (!quoteId || !status) {
      return NextResponse.json({ 
        error: 'Quote ID and status are required' 
      }, { status: 400 });
    }

    const quote = await prisma.quote.update({
      where: { id: quoteId },
      data: { 
        status,
        selectedReason: selectedReason || null
      },
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            company: true
          }
        }
      }
    });

    // If quote is selected, mark others as rejected
    if (status === 'SELECTED') {
      await prisma.quote.updateMany({
        where: {
          rfqId: quote.rfqId,
          id: { not: quoteId }
        },
        data: { status: 'REJECTED' }
      });
    }

    return NextResponse.json({ 
      success: true, 
      quote 
    });

  } catch (error) {
    console.error('Error updating quote:', error);
    return NextResponse.json({ error: 'Failed to update quote' }, { status: 500 });
  }
}
