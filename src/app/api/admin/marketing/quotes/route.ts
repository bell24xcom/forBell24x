import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, isErrorResponse } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (isErrorResponse(auth)) return auth;

  try {
    const quotes = await prisma.quote.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
      select: {
        id: true, rfqId: true, supplierId: true,
        price: true, deliveryDays: true,
        description: true, status: true, createdAt: true,
      },
    });

    // Map to the shape expected by /admin/marketing page
    return NextResponse.json(
      quotes.map(q => ({
        id:           q.id,
        rfq_id:       q.rfqId       ?? '',
        supplier_id:  q.supplierId  ?? '',
        price:        String(q.price),
        delivery_days: q.deliveryDays ?? 0,
        message:      q.description  ?? '',
        status:       q.status.toLowerCase(),
        created_at:   q.createdAt.toISOString(),
      }))
    );
  } catch (error: any) {
    console.error('[Admin Marketing Quotes]', error);
    return NextResponse.json([]);
  }
}
