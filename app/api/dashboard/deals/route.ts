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

/**
 * PATCH /api/dashboard/deals
 *
 * Advance a deal's status:
 * - Buyer:    ACTIVE → PAYMENT_PENDING (trigger), PAYMENT_PENDING → PAID (wallet debit)
 * - Supplier: PAID → SHIPPING, SHIPPING → DELIVERED
 * - Either:   DELIVERED → COMPLETED
 */
export async function PATCH(request: NextRequest) {
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
    const { dealId, action } = await request.json();

    if (!dealId || !action) {
      return NextResponse.json({ success: false, error: 'dealId and action are required' }, { status: 400 });
    }

    const deal = await prisma.deal.findUnique({
      where: { id: dealId },
      include: { rfq: { select: { title: true } } },
    });

    if (!deal) {
      return NextResponse.json({ success: false, error: 'Deal not found' }, { status: 404 });
    }

    const isBuyer = deal.buyerId === userId;
    const isSupplier = deal.supplierId === userId;

    if (!isBuyer && !isSupplier) {
      return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
    }

    // --- Action: buyer pays from wallet ---
    if (action === 'pay_wallet') {
      if (!isBuyer) {
        return NextResponse.json({ success: false, error: 'Only the buyer can pay' }, { status: 403 });
      }
      if (deal.status !== 'ACTIVE' && deal.status !== 'PAYMENT_PENDING') {
        return NextResponse.json({ success: false, error: 'Deal is not awaiting payment' }, { status: 400 });
      }

      // Check wallet balance
      const wallet = await prisma.wallet.findUnique({ where: { userId } });
      if (!wallet || wallet.balance < deal.price) {
        return NextResponse.json({
          success: false,
          error: `Insufficient wallet balance. Need ₹${deal.price.toLocaleString('en-IN')}, have ₹${(wallet?.balance || 0).toLocaleString('en-IN')}`,
        }, { status: 400 });
      }

      // Debit buyer wallet + advance deal status atomically
      await prisma.$transaction([
        prisma.walletTransaction.create({
          data: {
            walletId: wallet.id,
            type: 'DEBIT',
            amount: deal.price,
            description: `Payment for: ${deal.rfq.title}`,
            reference: deal.id,
          },
        }),
        prisma.wallet.update({
          where: { id: wallet.id },
          data: { balance: { decrement: deal.price } },
        }),
        prisma.deal.update({
          where: { id: deal.id },
          data: { status: 'PAID' },
        }),
      ]);

      return NextResponse.json({
        success: true,
        message: `₹${deal.price.toLocaleString('en-IN')} paid. Supplier has been notified.`,
        newStatus: 'PAID',
      });
    }

    // --- Action: supplier marks as shipped ---
    if (action === 'mark_shipped') {
      if (!isSupplier) {
        return NextResponse.json({ success: false, error: 'Only the supplier can mark as shipped' }, { status: 403 });
      }
      if (deal.status !== 'PAID') {
        return NextResponse.json({ success: false, error: 'Payment must be completed before shipping' }, { status: 400 });
      }

      await prisma.deal.update({ where: { id: deal.id }, data: { status: 'SHIPPING' } });

      return NextResponse.json({ success: true, message: 'Order marked as shipped.', newStatus: 'SHIPPING' });
    }

    // --- Action: buyer confirms delivery ---
    if (action === 'confirm_delivery') {
      if (!isBuyer) {
        return NextResponse.json({ success: false, error: 'Only the buyer can confirm delivery' }, { status: 403 });
      }
      if (deal.status !== 'SHIPPING') {
        return NextResponse.json({ success: false, error: 'Order is not in shipping status' }, { status: 400 });
      }

      await prisma.deal.update({ where: { id: deal.id }, data: { status: 'DELIVERED' } });

      return NextResponse.json({ success: true, message: 'Delivery confirmed!', newStatus: 'DELIVERED' });
    }

    // --- Action: either party closes the deal ---
    if (action === 'complete') {
      if (deal.status !== 'DELIVERED') {
        return NextResponse.json({ success: false, error: 'Deal must be delivered before completing' }, { status: 400 });
      }

      await prisma.deal.update({ where: { id: deal.id }, data: { status: 'COMPLETED' } });

      return NextResponse.json({ success: true, message: 'Deal completed!', newStatus: 'COMPLETED' });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Error updating deal:', error);
    return NextResponse.json({ success: false, error: 'Failed to update deal' }, { status: 500 });
  }
}
