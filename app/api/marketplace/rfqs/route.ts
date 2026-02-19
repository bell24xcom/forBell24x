import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const dynamic = 'force-dynamic';

/**
 * GET /api/marketplace/rfqs
 *
 * Public marketplace — list active RFQs for suppliers to browse.
 *
 * Query params:
 *   ?category=xxx       Filter by category (partial, case-insensitive)
 *   ?location=xxx       Filter by location
 *   ?search=xxx         Full-text search on title + description
 *   ?minBudget=xxx      Minimum budget filter
 *   ?maxBudget=xxx      Maximum budget filter
 *   ?urgency=HIGH       Filter by urgency (LOW|NORMAL|HIGH|URGENT)
 *   ?page=1             Pagination (default 1)
 *   ?limit=20           Results per page (max 50)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const location = searchParams.get('location');
    const search = searchParams.get('search');
    const minBudget = searchParams.get('minBudget');
    const maxBudget = searchParams.get('maxBudget');
    const urgency = searchParams.get('urgency');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, parseInt(searchParams.get('limit') || '20'));
    const skip = (page - 1) * limit;

    const where: Parameters<typeof prisma.rFQ.findMany>[0]['where'] = {
      status: 'ACTIVE',
      isPublic: true,
    };

    if (category) {
      where.category = { contains: category, mode: 'insensitive' };
    }

    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (urgency && ['LOW', 'NORMAL', 'HIGH', 'URGENT'].includes(urgency.toUpperCase())) {
      where.urgency = urgency.toUpperCase() as 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
    }

    if (minBudget) {
      where.maxBudget = { gte: parseFloat(minBudget) };
    }

    if (maxBudget) {
      where.minBudget = { lte: parseFloat(maxBudget) };
    }

    const [rfqs, total] = await Promise.all([
      prisma.rFQ.findMany({
        where,
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          category: true,
          quantity: true,
          unit: true,
          minBudget: true,
          maxBudget: true,
          timeline: true,
          urgency: true,
          location: true,
          tags: true,
          status: true,
          priority: true,
          estimatedValue: true,
          createdAt: true,
          expiresAt: true,
          _count: { select: { quotes: true } },
        },
      }),
      prisma.rFQ.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      rfqs,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Marketplace RFQs GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load marketplace' }, { status: 500 });
  }
}
