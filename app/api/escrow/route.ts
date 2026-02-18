import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/jwt';

const prisma = new PrismaClient();
export const dynamic = 'force-dynamic';

// GET — list all escrow transactions for the logged-in user
export async function GET(request: NextRequest) {
  try {
    const token =
      request.cookies.get('auth-token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ success: false, error: 'Invalid session' }, { status: 401 });
    const userId = payload.userId;

    // Escrow transactions = any transaction where escrowId is set
    const escrows = await prisma.transaction.findMany({
      where: {
        escrowId: { not: null },
        OR: [{ buyerId: userId }, { supplierId: userId }],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        rfq:   { select: { id: true, title: true, category: true } },
        quote: { select: { id: true, price: true } },
        buyer: { select: { name: true, company: true } },
        supplier: { select: { name: true, company: true } },
      },
    });

    return NextResponse.json({ success: true, escrows });
  } catch (error) {
    console.error('Escrow GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load escrow' }, { status: 500 });
  }
}

// POST — create an escrow hold linked to a quote
export async function POST(request: NextRequest) {
  try {
    const token =
      request.cookies.get('auth-token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ success: false, error: 'Invalid session' }, { status: 401 });
    const userId = payload.userId;

    const { quoteId } = await request.json();
    if (!quoteId) return NextResponse.json({ success: false, error: 'quoteId required' }, { status: 400 });

    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: { rfq: { select: { id: true, createdBy: true } } },
    });
    if (!quote) return NextResponse.json({ success: false, error: 'Quote not found' }, { status: 404 });
    if (quote.rfq.createdBy !== userId) return NextResponse.json({ success: false, error: 'Only buyer can initiate escrow' }, { status: 403 });

    const escrowId = `escrow_${Date.now()}`;

    const txn = await prisma.transaction.create({
      data: {
        rfqId: quote.rfqId,
        quoteId: quote.id,
        buyerId: userId,
        supplierId: quote.supplierId,
        amount: quote.price,
        currency: 'INR',
        status: 'PENDING',
        escrowId,
        metadata: { heldAt: new Date().toISOString() },
      },
    });

    return NextResponse.json({ success: true, escrow: txn }, { status: 201 });
  } catch (error) {
    console.error('Escrow POST error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create escrow' }, { status: 500 });
  }
}

// PUT — buyer releases or refunds an escrow
export async function PUT(request: NextRequest) {
  try {
    const token =
      request.cookies.get('auth-token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ success: false, error: 'Invalid session' }, { status: 401 });
    const userId = payload.userId;

    const { transactionId, action } = await request.json();
    if (!transactionId || !action) return NextResponse.json({ success: false, error: 'transactionId and action required' }, { status: 400 });
    if (!['release', 'refund'].includes(action)) return NextResponse.json({ success: false, error: 'action must be release or refund' }, { status: 400 });

    const txn = await prisma.transaction.findUnique({ where: { id: transactionId } });
    if (!txn) return NextResponse.json({ success: false, error: 'Transaction not found' }, { status: 404 });
    if (txn.buyerId !== userId) return NextResponse.json({ success: false, error: 'Only buyer can release/refund escrow' }, { status: 403 });
    if (!txn.escrowId) return NextResponse.json({ success: false, error: 'Not an escrow transaction' }, { status: 400 });

    const updated = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: action === 'release' ? 'COMPLETED' : 'REFUNDED',
        metadata: { ...((txn.metadata as object) ?? {}), [action + 'dAt']: new Date().toISOString() },
      },
    });

    return NextResponse.json({ success: true, transaction: updated });
  } catch (error) {
    console.error('Escrow PUT error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update escrow' }, { status: 500 });
  }
}
