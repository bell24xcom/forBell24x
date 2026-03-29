import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token =
      request.cookies.get('auth-token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }

    const deal = await prisma.deal.findUnique({
      where: { id: params.id },
      include: {
        rfq: { select: { title: true } },
        quote: { select: { deliveryDays: true, timeline: true } },
        supplier: { select: { name: true, company: true } },
      },
    });

    if (!deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    // Only buyer or supplier on the deal can view it
    if (deal.buyerId !== payload.userId && deal.supplierId !== payload.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      deal: {
        id: deal.id,
        deal_value: deal.price,
        delivery_days: deal.quote?.deliveryDays ?? null,
        timeline: deal.quote?.timeline ?? null,
        rfq_title: deal.rfq.title,
        supplier_name: deal.supplier?.company || deal.supplier?.name || 'Supplier',
        status: deal.status,
      },
    });
  } catch (error) {
    console.error('[Deal] Error fetching deal:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
