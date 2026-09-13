import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getVerifiedBuyerIds } from '@/src/lib/rfq/trustBadges';

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
 *   ?includeDemos=true  Include isSeeded RFQs — excluded by default
 *                        (SPRINT-STDV-01 P2: nothing previously filtered
 *                        these out of the supplier-facing list)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const categoriesParam = searchParams.get('categories');
    const location = searchParams.get('location');
    const search = searchParams.get('search');
    const minBudget = searchParams.get('minBudget');
    const maxBudget = searchParams.get('maxBudget');
    const urgency = searchParams.get('urgency');
    const includeDemos = searchParams.get('includeDemos') === 'true';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, parseInt(searchParams.get('limit') || '20'));
    const skip = (page - 1) * limit;

    const where: Prisma.RFQWhereInput = {
      status: { in: ['ACTIVE', 'OPEN'] },
      isPublic: true,
      ...(includeDemos ? {} : { isSeeded: false }),
    };

    if (categoriesParam) {
      const cats = categoriesParam.split(',').filter(Boolean);
      if (cats.length > 0) {
        where.category = { in: cats };
      }
    } else if (category) {
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
          description: true,
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
          type: true,
          createdAt: true,
          expiresAt: true,
          isSeeded: true,
          createdBy: true,
          user: { select: { id: true, name: true, company: true, location: true } },
          _count: { select: { quotes: true } },
        },
      }),
      prisma.rFQ.count({ where }),
    ]);

    // Real, human-reviewed verification — see src/lib/rfq/trustBadges.ts for
    // why this isn't User.isVerified.
    const verifiedIds = await getVerifiedBuyerIds(
      rfqs.map(r => r.user?.id).filter((id): id is string => !!id)
    );

    // Map to frontend-friendly format
    const mapped = rfqs.map(r => ({
      ...r,
      budget: r.maxBudget || r.estimatedValue || 0,
      quotesCount: r._count?.quotes || 0,
      buyer: r.user,
      verifiedBuyer: r.user ? verifiedIds.has(r.user.id) : false,
    }));

    return NextResponse.json({
      success: true,
      rfqs: mapped,
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
