import { NextRequest, NextResponse } from 'next/server';
import { Prisma, RFQStatus, RFQUrgency } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function asEnum<T extends Record<string, string>>(e: T, v: string | null): T[keyof T] | undefined {
  if (!v) return undefined;
  const up = v.toUpperCase();
  return (Object.values(e) as string[]).includes(up) ? (up as T[keyof T]) : undefined;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')));
    const search = searchParams.get('search')?.trim() || '';
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const urgency = searchParams.get('urgency');

    const where: Prisma.RFQWhereInput = { isPublic: true };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ];
    }

    const statusEnum = status && status !== 'all' ? asEnum(RFQStatus, status) : undefined;
    if (statusEnum) where.status = statusEnum;
    else if (!status || status === 'all') where.status = RFQStatus.ACTIVE;

    if (category && category !== 'all') {
      where.category = { equals: category, mode: 'insensitive' };
    }

    const urgencyEnum = urgency && urgency !== 'all' ? asEnum(RFQUrgency, urgency) : undefined;
    if (urgencyEnum) where.urgency = urgencyEnum;

    const [total, rows] = await Promise.all([
      prisma.rFQ.count({ where }),
      prisma.rFQ.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { id: true, name: true, company: true } },
          _count: { select: { quotes: true } },
        },
      }),
    ]);

    const rfqs = rows.map(r => ({
      id: r.id,
      title: r.title,
      description: r.description,
      category: r.category,
      budget: r.maxBudget ?? r.minBudget ?? null,
      quantity: r.quantity,
      timeline: r.timeline,
      urgency: r.urgency,
      status: r.status,
      buyerId: r.createdBy,
      buyer: r.user
        ? { id: r.user.id, name: r.user.name, company: r.user.company }
        : null,
      responses: r._count.quotes,
      views: r.views,
      location: r.location,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));

    const totalPages = Math.max(1, Math.ceil(total / limit));
    return NextResponse.json({
      rfqs,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('[GET /api/rfqs] error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

// POST is deprecated — use POST /api/rfq/create (auth + Zod validation + orchestration).
export async function POST() {
  return NextResponse.json(
    { success: false, error: 'Use POST /api/rfq/create' },
    { status: 410 },
  );
}
