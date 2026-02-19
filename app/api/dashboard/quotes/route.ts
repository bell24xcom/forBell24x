import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const token =
      request.cookies.get('auth-token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) return NextResponse.json({ success: false, error: 'Auth required' }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ success: false, error: 'Invalid session' }, { status: 401 });

    const quotes = await prisma.quote.findMany({
      where: { rfq: { createdBy: payload.userId } },
      orderBy: { createdAt: 'desc' },
      include: {
        rfq: { select: { title: true, category: true } },
        supplier: { select: { name: true, company: true, phone: true, trustScore: true, isVerified: true } },
      },
    });

    return NextResponse.json({
      success: true,
      quotes: quotes.map(q => ({
        id: q.id,
        rfqTitle: q.rfq.title,
        rfqCategory: q.rfq.category,
        supplierName:       q.supplier.name,
        supplierCompany:    q.supplier.company,
        supplierTrustScore: q.supplier.trustScore,   // shown to buyer
        supplierVerified:   q.supplier.isVerified,
        price: q.price,
        quantity: q.quantity,
        timeline: q.timeline,
        status: q.status,
        isAccepted: q.isAccepted,
        createdAt: q.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Dashboard quotes error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load quotes' }, { status: 500 });
  }
}
