/**
 * GET /api/rfq/live
 * Returns real RFQs from DB for admin management view.
 * Replaces previous mock-only implementation.
 *
 * Query params:
 *   ?limit=50       max results (capped at 100)
 *   ?status=ACTIVE  filter by status
 *   ?search=steel   search in title/category
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit  = Math.min(100, parseInt(searchParams.get('limit') || '50'));
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: Record<string, unknown> = {};
    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }
    if (search) {
      where.OR = [
        { title:    { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [rfqs, total] = await Promise.all([
      prisma.rFQ.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id:          true,
          title:       true,
          description: true,
          category:    true,
          urgency:     true,
          status:      true,
          minBudget:   true,
          maxBudget:   true,
          estimatedValue: true,
          location:    true,
          views:       true,
          createdAt:   true,
          expiresAt:   true,
          acceptedAt:  true,
          user: {
            select: {
              name:    true,
              company: true,
              phone:   true,
              location: true,
            },
          },
          _count: { select: { quotes: true } },
        },
      }),
      prisma.rFQ.count({ where }),
    ]);

    const now = new Date();
    const data = rfqs.map(r => ({
      id:       r.id,
      title:    r.title,
      category: r.category,
      urgency:  r.urgency,
      status:   r.status,
      budget:   r.estimatedValue ?? r.maxBudget ?? r.minBudget ?? 0,
      minBudget: r.minBudget,
      maxBudget: r.maxBudget,
      currency: 'INR',
      type:     'text', // voice/video not in pilot
      location: r.location,
      views:    r.views,
      quotes:   r._count.quotes,
      buyer: {
        name:     r.user.company || r.user.name || 'Unknown',
        location: r.user.location || r.location || '',
        phone:    r.user.phone,
      },
      createdAt:  r.createdAt.toISOString(),
      expiresAt:  r.expiresAt?.toISOString() ?? null,
      acceptedAt: r.acceptedAt?.toISOString() ?? null,
      timeAgo:    getTimeAgo(r.createdAt, now),
      isLive:     true,
      lastUpdated: now.toISOString(),
    }));

    return NextResponse.json({
      success:   true,
      data,
      total,
      timestamp: now.toISOString(),
    });

  } catch (error) {
    console.error('Error fetching live RFQs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch RFQs' },
      { status: 500 }
    );
  }
}

function getTimeAgo(date: Date, now = new Date()): string {
  const diffMs  = now.getTime() - date.getTime();
  const mins    = Math.floor(diffMs / 60000);
  const hours   = Math.floor(diffMs / 3600000);
  const days    = Math.floor(diffMs / 86400000);
  if (mins  < 60)  return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  return `${days}d ago`;
}
