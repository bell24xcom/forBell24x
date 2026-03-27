import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const token =
      request.cookies.get('auth-token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');

    console.log('[Dashboard Quotes] Token present:', !!token);

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Not logged in. Please log in to view quotes.' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    console.log('[Dashboard Quotes] Token verified:', !!payload, 'UserID:', payload?.userId);

    if (!payload || !payload.userId) {
      return NextResponse.json(
        { success: false, error: 'Invalid session. Please log in again.' },
        { status: 401 }
      );
    }

    console.log('[Dashboard Quotes] Fetching quotes for user:', payload.userId);

    const quotes = await prisma.quote.findMany({
      where: { rfq: { createdBy: payload.userId } },
      orderBy: { createdAt: 'desc' },
      include: {
        rfq: { select: { title: true, category: true } },
        supplier: { select: { name: true, company: true, phone: true, trustScore: true, isVerified: true } },
      },
    });

    console.log('[Dashboard Quotes] Found:', quotes.length, 'quotes');

    return NextResponse.json({
      success: true,
      quotes: quotes.map(q => ({
        id: q.id,
        rfqTitle: q.rfq.title,
        rfqCategory: q.rfq.category,
        supplierId: q.supplierId,
        supplierName: q.supplier.name,
        supplierCompany: q.supplier.company,
        supplierTrustScore: q.supplier.trustScore,
        supplierVerified: q.supplier.isVerified,
        price: q.price,
        quantity: q.quantity,
        timeline: q.timeline,
        status: q.status,
        isAccepted: q.status === 'ACCEPTED', // Derived from status
        createdAt: q.createdAt.toISOString(),
      })),
    });
  } catch (error: any) {
    console.error('[Dashboard Quotes] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to load quotes: ' + (error.message || 'Unknown error'),
        debug: { errorName: error.name, errorMessage: error.message }
      },
      { status: 500 }
    );
  }
}
