import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

/**
 * GET /api/dashboard/deals
 *
 * Returns deals for both buyers and suppliers using the Deal model.
 */
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
      return NextResponse.json({ success: false, error: 'Invalid or expired session' }, { status: 401 });
    }

    const userId = payload.userId;

    // Fetch deals where user is buyer or supplier
    const deals = await prisma.deal.findMany({
      where: {
        OR: [
          { buyerId: userId },
          { supplierId: userId },
        ],
      },
      include: {
        rfq: { select: { id: true, title: true } },
        quote: { select: { id: true, deliveryDays: true, timeline: true } },
        buyer: { select: { id: true, name: true, company: true } },
        supplier: { select: { id: true, name: true, company: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const mapped = deals.map(deal => {
      const isBuyer = deal.buyerId === userId;
      const other = isBuyer ? deal.supplier : deal.buyer;
      const otherParty = other.company || other.name || (isBuyer ? 'Supplier' : 'Buyer');

      // Map deal status to progress status
      const statusMap: Record<string, string> = {
        'ACTIVE': 'QUOTE_ACCEPTED',
        'PAYMENT_PENDING': 'PAYMENT_PENDING',
        'PAID': 'PAID',
        'SHIPPING': 'SHIPPING',
        'DELIVERED': 'DELIVERED',
        'COMPLETED': 'COMPLETED',
      };

      return {
        id: deal.id,
        rfqTitle: deal.rfq.title,
        otherParty,
        amount: deal.price,
        status: statusMap[deal.status] || 'QUOTE_ACCEPTED',
        timeline: deal.quote?.deliveryDays ? `${deal.quote.deliveryDays} days` : (deal.quote?.timeline || 'Not specified'),
        createdAt: deal.createdAt.toISOString(),
        role: isBuyer ? 'buyer' : 'supplier',
      };
    });

    return NextResponse.json({
      success: true,
      deals: mapped,
      total: mapped.length,
    });
  } catch (error) {
    console.error('Error fetching deals:', error);
    return NextResponse.json({ success: false, error: 'Failed to load deals' }, { status: 500 });
  }
}
