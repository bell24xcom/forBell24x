import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

/**
 * GET /api/dashboard/deals
 *
 * Returns unified deal tracking for both buyers and suppliers.
 * A "deal" is created when a buyer accepts a supplier's quote.
 *
 * Status flow:
 *   QUOTE_ACCEPTED → PAYMENT_PENDING → PAID → SHIPPING → DELIVERED → COMPLETED
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user from cookie or Authorization header
    const token =
      request.cookies.get('auth-token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    const userId = payload.userId;

    // Fetch accepted quotes for this user (as buyer or supplier)
    const quotes = await prisma.quote.findMany({
      where: {
        status: 'ACCEPTED',
        OR: [
          { supplierId: userId }, // User is the supplier
          { rfq: { createdBy: userId } }, // User is the buyer
        ],
      },
      include: {
        rfq: {
          select: {
            id: true,
            title: true,
            createdBy: true,
            user: { select: { name: true, company: true } },
          },
        },
        supplier: {
          select: {
            id: true,
            name: true,
            company: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 50,
    });

    // Transform to deal format
    const deals = quotes.map(quote => {
      const isBuyer = quote.rfq.createdBy === userId;
      const otherParty = isBuyer
        ? (quote.supplier.company || quote.supplier.name || 'Supplier')
        : (quote.rfq.user.company || quote.rfq.user.name || 'Buyer');

      // Determine deal status based on quote data
      // In a real app, you'd have a separate Transaction/Deal table with status tracking
      // For now, we'll derive status from quote fields
      let status: 'QUOTE_ACCEPTED' | 'PAYMENT_PENDING' | 'PAID' | 'SHIPPING' | 'DELIVERED' | 'COMPLETED' = 'QUOTE_ACCEPTED';

      // You can extend this logic when you add transaction tracking fields
      // For example: if quote has paymentCompletedAt, status = 'PAID'
      // if quote has shippedAt, status = 'SHIPPING', etc.

      return {
        id: quote.id,
        rfqTitle: quote.rfq.title,
        otherParty,
        amount: parseFloat(quote.price),
        status,
        timeline: quote.deliveryDays ? `${quote.deliveryDays} days` : 'Not specified',
        createdAt: quote.updatedAt?.toISOString() || quote.createdAt.toISOString(),
      };
    });

    return NextResponse.json({
      success: true,
      deals,
      total: deals.length,
    });
  } catch (error) {
    console.error('Error fetching deals:', error);
    const { errorLogger } = await import('@/lib/errorLogger');
    errorLogger.critical(error, { route: '/api/dashboard/deals' });
    return NextResponse.json(
      { success: false, error: 'Failed to load deals' },
      { status: 500 }
    );
  }
}
