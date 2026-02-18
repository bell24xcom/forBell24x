import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

// Public marketplace RFQ listing — no auth required, suppliers browse these
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')));
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

    // Build Prisma where clause — only public RFQs for the marketplace
    const where: Record<string, unknown> = {
      isPublic: true,
    };

    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    } else {
      // Default: show ACTIVE and QUOTED RFQs in marketplace
      where.status = { in: ['ACTIVE', 'QUOTED'] };
    }

    if (category && category !== 'all') {
      where.category = { contains: category, mode: 'insensitive' };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Validate sortBy to prevent injection
    const allowedSortFields = ['createdAt', 'updatedAt', 'estimatedValue', 'priority', 'views'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const [rfqs, total] = await Promise.all([
      prisma.rFQ.findMany({
        where,
        orderBy: { [safeSortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          quotes: { select: { id: true } },
          user: {
            select: {
              id: true,
              name: true,
              company: true,
              location: true,
            },
          },
        },
      }),
      prisma.rFQ.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      rfqs: rfqs.map(rfq => ({
        id: rfq.id,
        title: rfq.title,
        category: rfq.category,
        description: rfq.description,
        quantity: rfq.quantity,
        unit: rfq.unit,
        minBudget: rfq.minBudget,
        maxBudget: rfq.maxBudget,
        timeline: rfq.timeline,
        status: rfq.status,
        urgency: rfq.urgency,
        location: rfq.location,
        tags: rfq.tags,
        priority: rfq.priority,
        estimatedValue: rfq.estimatedValue,
        views: rfq.views,
        createdAt: rfq.createdAt.toISOString(),
        expiresAt: rfq.expiresAt?.toISOString() ?? null,
        quotes: rfq.quotes.length,
        buyer: rfq.user,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      filters: { category, status, search, sortBy: safeSortBy, sortOrder },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching RFQ list:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch RFQs' },
      { status: 500 }
    );
  }
}
