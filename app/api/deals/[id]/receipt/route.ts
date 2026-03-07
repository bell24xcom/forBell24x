import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await authenticate(request);
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const deal = await prisma.deal.findUnique({
      where: { id: params.id },
      include: {
        buyer:    { select: { name: true, company: true, gstNumber: true, phone: true, email: true } },
        supplier: { select: { name: true, company: true, gstNumber: true, phone: true, email: true } },
        rfq:      { select: { title: true, category: true, description: true } },
        quote:    { select: { deliveryDays: true, terms: true, timeline: true } },
      },
    });

    if (!deal) return NextResponse.json({ success: false, error: 'Deal not found' }, { status: 404 });

    // Verify user is buyer or supplier
    if (deal.buyerId !== user.userId && deal.supplierId !== user.userId) {
      return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
    }

    // Get escrow wallet transactions linked to this deal
    const escrowTxns = await prisma.walletTransaction.findMany({
      where: { reference: deal.id },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ success: true, deal, escrowTxns });
  } catch (error) {
    console.error('Receipt error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch receipt' }, { status: 500 });
  }
}
