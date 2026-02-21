import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, extractToken } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Extract and verify token
    const token = extractToken(request.headers.get('authorization'), request.cookies.get('auth-token')?.value);
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const userId = payload.userId;

    // Get escrow transactions for user (both buyer and supplier)
    const escrows = await prisma.escrowTransaction.findMany({
      where: {
        OR: [
          { buyerId: userId },
          { supplierId: userId },
        ],
      },
      include: {
        buyer: { select: { name: true, company: true } },
        supplier: { select: { name: true, company: true } },
        quote: {
          include: {
            rfq: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      escrows: escrows.map((escrow) => ({
        id: escrow.id,
        buyerId: escrow.buyerId,
        supplierId: escrow.supplierId,
        quoteId: escrow.quoteId,
        amount: escrow.amount,
        description: escrow.description,
        status: escrow.status,
        createdAt: escrow.createdAt,
        buyer: escrow.buyer,
        supplier: escrow.supplier,
        quote: {
          id: escrow.quote.id,
          rfqId: escrow.quote.rfqId,
          rfq: {
            id: escrow.quote.rfq.id,
            title: escrow.quote.rfq.title,
            category: escrow.quote.rfq.category,
            description: escrow.quote.rfq.description,
          },
        },
      })),
    });
  } catch (error) {
    console.error('Error fetching escrow transactions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Extract and verify token
    const token = extractToken(request.headers.get('authorization'), request.cookies.get('auth-token')?.value);
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const userId = payload.userId;

    // Parse request body
    const body = await request.json();
    const { quoteId, amount, description } = body;

    if (!quoteId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get quote details
    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: {
        rfq: true,
        supplier: { select: { id: true, name: true, company: true } },
      },
    });

    if (!quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }

    // Check if user is the buyer
    if (quote.rfq.createdBy !== userId) {
      return NextResponse.json(
        { error: 'Only the buyer can create escrow' },
        { status: 403 }
      );
    }

    // Create escrow transaction
    const escrow = await prisma.escrowTransaction.create({
      data: {
        buyerId: userId,
        supplierId: quote.supplierId,
        quoteId,
        amount,
        description: description || `Escrow for quote ${quoteId}`,
        status: 'HELD',
      },
    });

    return NextResponse.json({
      success: true,
      escrow: {
        id: escrow.id,
        buyerId: escrow.buyerId,
        supplierId: escrow.supplierId,
        quoteId: escrow.quoteId,
        amount: escrow.amount,
        description: escrow.description,
        status: escrow.status,
        createdAt: escrow.createdAt,
      },
    });
  } catch (error) {
    console.error('Error creating escrow transaction:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Extract and verify token
    const token = extractToken(request.headers.get('authorization'), request.cookies.get('auth-token')?.value);
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const userId = payload.userId;

    // Parse request body
    const body = await request.json();
    const { escrowId, action } = body;

    if (!escrowId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate action
    if (!['RELEASE', 'REFUND'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    // Get escrow transaction
    const escrow = await prisma.escrowTransaction.findUnique({
      where: { id: escrowId },
      include: {
        buyer: true,
        supplier: true,
        quote: {
          include: {
            rfq: true,
          },
        },
      },
    });

    if (!escrow) {
      return NextResponse.json(
        { error: 'Escrow not found' },
        { status: 404 }
      );
    }

    // Check if user is the buyer
    if (escrow.buyerId !== userId) {
      return NextResponse.json(
        { error: 'Only the buyer can release or refund escrow' },
        { status: 403 }
      );
    }

    // Update escrow status
    const updatedEscrow = await prisma.escrowTransaction.update({
      where: { id: escrowId },
      data: { status: action },
    });

    return NextResponse.json({
      success: true,
      escrow: {
        id: updatedEscrow.id,
        buyerId: updatedEscrow.buyerId,
        supplierId: updatedEscrow.supplierId,
        quoteId: updatedEscrow.quoteId,
        amount: updatedEscrow.amount,
        description: updatedEscrow.description,
        status: updatedEscrow.status,
        createdAt: updatedEscrow.createdAt,
      },
    });
  } catch (error) {
    console.error('Error updating escrow transaction:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}