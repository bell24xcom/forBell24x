import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/** Map Prisma RFQStatus → lowercase labels used by /admin/marketing UI */
function toUiStatus(status: string): string {
  const map: Record<string, string> = {
    ACTIVE: 'new',
    OPEN: 'new',
    DRAFT: 'new',
    QUOTED: 'quoted',
    ACCEPTED: 'quoted',
    IN_PROGRESS: 'quoted',
    COMPLETED: 'closed',
    CLOSED: 'closed',
    CANCELLED: 'closed',
    EXPIRED: 'closed',
  };
  return map[status] ?? status.toLowerCase();
}

export async function GET() {
  try {
    const rfqs = await prisma.rFQ.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        quantity: true,
        location: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      rfqs.map(r => ({
        id: r.id,
        rfq_text: r.description || r.title,
        category: r.category,
        quantity: r.quantity,
        location: r.location ?? '',
        status: toUiStatus(r.status),
        created_at: r.createdAt.toISOString(),
      }))
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Database error';
    console.error('[Admin Marketing RFQs]', message);
    return NextResponse.json({
      rfqs: [],
      serviceDegraded: true,
      reason: message,
    });
  }
}
