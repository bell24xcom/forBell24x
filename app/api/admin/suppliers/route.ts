/**
 * GET /api/admin/suppliers?page=1&search=&category=&active=
 * Returns real supplier data from Prisma.
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
    const page     = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
    const limit    = 25;
    const search   = searchParams.get('search') ?? '';
    const category = searchParams.get('category') ?? '';
    const activeOnly = searchParams.get('active') === 'true';

    const where: Record<string, unknown> = {
      role: 'SUPPLIER',
      ...(activeOnly ? { isActive: true } : {}),
      ...(search ? {
        OR: [
          { name:    { contains: search, mode: 'insensitive' } },
          { company: { contains: search, mode: 'insensitive' } },
          { phone:   { contains: search, mode: 'insensitive' } },
          { email:   { contains: search, mode: 'insensitive' } },
        ],
      } : {}),
    };

    const [suppliers, total, stats] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id:          true,
          name:        true,
          company:     true,
          phone:       true,
          email:       true,
          trustScore:  true,
          isActive:    true,
          isClaimed:   true,
          plan:        true,
          preferences: true,
          createdAt:   true,
          _count: {
            select: {
              quotes:         true,
              supplierDeals:  true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip:  (page - 1) * limit,
        take:  limit,
      }),
      prisma.user.count({ where }),
      prisma.user.aggregate({
        where: { role: 'SUPPLIER' },
        _count: { _all: true },
      }),
    ]);

    // Also get counts by active/inactive
    const [activeCount, withPhone, highTrust] = await Promise.all([
      prisma.user.count({ where: { role: 'SUPPLIER', isActive: true } }),
      prisma.user.count({ where: { role: 'SUPPLIER', phone: { not: null } } }),
      prisma.user.count({ where: { role: 'SUPPLIER', trustScore: { gte: 70 } } }),
    ]);

    return NextResponse.json({
      success: true,
      suppliers: suppliers.map(s => {
        const prefs = s.preferences as Record<string, unknown> | null;
        const cats  = (prefs?.categories as string[]) ?? (prefs?.category ? [prefs.category as string] : []);
        return {
          id:          s.id,
          name:        s.name ?? '—',
          company:     s.company ?? null,
          phone:       s.phone ?? null,
          email:       s.email ?? null,
          trustScore:  s.trustScore,
          isActive:    s.isActive,
          isClaimed:   s.isClaimed,
          plan:        s.plan,
          categories:  cats,
          quoteCount:  s._count.quotes,
          dealCount:   s._count.supplierDeals,
          joinedAt:    s.createdAt.toISOString(),
        };
      }),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      stats: {
        total:       stats._count._all,
        active:      activeCount,
        withPhone,
        highTrust,
      },
    });
  } catch (error) {
    console.error('[Suppliers API] error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load suppliers' }, { status: 500 });
  }
}
