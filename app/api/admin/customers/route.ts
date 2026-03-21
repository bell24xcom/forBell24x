/**
 * GET /api/admin/customers?page=1&search=
 * Returns buyers — users who have posted at least one RFQ.
 * Protected — requires admin-token cookie.
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, isErrorResponse } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (isErrorResponse(auth)) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const page    = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
    const limit   = 25;
    const search  = searchParams.get('search') ?? '';

    const where: Record<string, unknown> = {
      rfqs: { some: {} },     // only users who have at least 1 RFQ
      ...(search ? {
        OR: [
          { name:    { contains: search, mode: 'insensitive' } },
          { company: { contains: search, mode: 'insensitive' } },
          { phone:   { contains: search, mode: 'insensitive' } },
          { email:   { contains: search, mode: 'insensitive' } },
        ],
      } : {}),
    };

    const [customers, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id:          true,
          name:        true,
          company:     true,
          phone:       true,
          email:       true,
          isActive:    true,
          plan:        true,
          createdAt:   true,
          lastLoginAt: true,
          _count: {
            select: {
              rfqs:         true,
              buyerDeals:   true,
            },
          },
          // Get their most recent RFQ for last-activity
          rfqs: {
            select: { category: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
        skip:  (page - 1) * limit,
        take:  limit,
      }),
      prisma.user.count({ where }),
    ]);

    // Total unique buyers (all-time)
    const [totalBuyers, totalRfqs] = await Promise.all([
      prisma.user.count({ where: { rfqs: { some: {} } } }),
      prisma.rFQ.count(),
    ]);
    const activeBuyers = await prisma.user.count({
      where: {
        rfqs:     { some: {} },
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      customers: customers.map(c => ({
        id:           c.id,
        name:         c.name ?? '—',
        company:      c.company ?? null,
        phone:        c.phone ?? null,
        email:        c.email ?? null,
        isActive:     c.isActive,
        plan:         c.plan,
        rfqCount:     c._count.rfqs,
        dealCount:    c._count.buyerDeals,
        lastCategory: c.rfqs[0]?.category ?? null,
        lastRfqAt:    c.rfqs[0]?.createdAt?.toISOString() ?? null,
        lastLoginAt:  c.lastLoginAt?.toISOString() ?? null,
        joinedAt:     c.createdAt.toISOString(),
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      stats: {
        totalBuyers,
        activeBuyers,
        totalRfqs,
      },
    });
  } catch (error) {
    console.error('[Customers API] error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load customers' }, { status: 500 });
  }
}
