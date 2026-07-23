import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, isErrorResponse } from '@/lib/admin-auth';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// POST /api/admin/rfqs — action-dispatched, admin-only.
//
// action: 'submit-concierge-quote'
// Staff enters a real quote, obtained off-platform (phone/WhatsApp/email)
// from a real, identifiable supplier, on that supplier's behalf — for
// bootstrapping liquidity before a supplier is actively self-serving on
// the platform. This must NEVER be used for fabricated suppliers or
// invented prices: the referenced supplier must be a real User record
// with real contact info, and sourcingNote is a mandatory audit trail
// (who was contacted, when, how). Quotes created this way are tagged
// source: CONCIERGE_SOURCED and must stay excluded from organic
// engagement/SEO counts — see the isSeeded convention used elsewhere
// (sitemap.ts, /api/activity, /api/analytics/funnel, /api/admin/stats)
// for the pattern this follows.
export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if (isErrorResponse(auth)) return auth;

  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'submit-concierge-quote') {
      return submitConciergeQuote(body, auth.userId);
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Error in admin RFQs POST:', error);
    return NextResponse.json({ error: 'Request failed' }, { status: 500 });
  }
}

async function submitConciergeQuote(
  body: {
    rfqId?: string;
    supplierId?: string;
    price?: number;
    quantity?: string;
    terms?: string;
    timeline?: string;
    deliveryDays?: number;
    notes?: string;
    sourcingNote?: string;
  },
  adminUserId: string,
) {
  const { rfqId, supplierId, price, quantity, terms, timeline, deliveryDays, notes, sourcingNote } = body;

  if (!rfqId || !supplierId || price == null) {
    return NextResponse.json(
      { error: 'rfqId, supplierId, and price are required' },
      { status: 400 },
    );
  }

  if (!sourcingNote || sourcingNote.trim().length < 10) {
    return NextResponse.json(
      {
        error:
          'sourcingNote is required and must describe how this real quote was obtained ' +
          '(e.g. "Phone call 2026-07-20 with Mr. Sharma, Apparel Solutions Inc, +9198xxxxxxx")',
      },
      { status: 400 },
    );
  }

  const [rfq, supplier] = await Promise.all([
    prisma.rFQ.findUnique({ where: { id: rfqId }, select: { id: true, quantity: true } }),
    prisma.user.findUnique({
      where: { id: supplierId },
      select: { id: true, phone: true, email: true, company: true },
    }),
  ]);

  if (!rfq) {
    return NextResponse.json({ error: 'RFQ not found' }, { status: 404 });
  }

  if (!supplier) {
    return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
  }

  // Guard against attributing a quote to a placeholder/unidentified profile —
  // a real off-platform quote must be traceable to a real, reachable company.
  if (!supplier.phone && !supplier.email) {
    return NextResponse.json(
      {
        error:
          'Supplier profile has no phone or email on file. Concierge quotes must be ' +
          'attributed to a real, reachable supplier — import or create their profile ' +
          'with real contact details first.',
      },
      { status: 422 },
    );
  }

  const quote = await prisma.quote.create({
    data: {
      rfqId,
      supplierId,
      price,
      quantity: quantity || rfq.quantity || '1',
      terms: terms || null,
      timeline: timeline || null,
      deliveryDays: deliveryDays ?? null,
      notes: notes || null,
      status: 'PENDING',
      source: 'CONCIERGE_SOURCED',
      sourcedByUserId: adminUserId === 'system' ? null : adminUserId,
      sourcingNote: sourcingNote.trim(),
    },
  });

  return NextResponse.json({
    success: true,
    quote,
    message: `Concierge-sourced quote recorded for ${supplier.company || supplierId}. ` +
      'Remember: this must be shown to the buyer as staff-sourced, not organic supplier activity.',
  });
}

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (isErrorResponse(auth)) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const [rfqs, totalCount] = await Promise.all([
      prisma.rFQ.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          },
          quotes: {
            select: {
              id: true,
              price: true,
              status: true,
              supplier: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              },
              deal: {
                select: {
                  id: true,
                  status: true
                }
              }
            }
          },
          _count: {
            select: { quotes: true }
          }
        }
      }),
      prisma.rFQ.count({ where })
    ]);

    const stats = await Promise.all([
      prisma.rFQ.count({ where: { status: { in: ['ACTIVE', 'OPEN'] } } }),
      prisma.rFQ.count({ where: { status: 'COMPLETED' } }),
      prisma.rFQ.count({ where: { status: 'CANCELLED' } }),
      prisma.rFQ.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      })
    ]);

    return NextResponse.json({
      rfqs,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      },
      stats: {
        totalRfqs: totalCount,
        activeRfqs: stats[0],
        completedRfqs: stats[1],
        cancelledRfqs: stats[2],
        newRfqsThisWeek: stats[3]
      }
    });

  } catch (error) {
    console.error('Error fetching RFQs:', error);
    return NextResponse.json({
      error: 'Failed to fetch RFQs'
    }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { rfqId, updates } = await req.json();

    if (!rfqId) {
      return NextResponse.json({
        error: 'RFQ ID is required'
      }, { status: 400 });
    }

    const updatedRfq = await prisma.rFQ.update({
      where: { id: rfqId },
      data: updates,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: { quotes: true }
        }
      }
    });

    return NextResponse.json({
      rfq: updatedRfq,
      message: 'RFQ updated successfully'
    });

  } catch (error) {
    console.error('Error updating RFQ:', error);
    return NextResponse.json({
      error: 'Failed to update RFQ'
    }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rfqId = searchParams.get('rfqId');

    if (!rfqId) {
      return NextResponse.json({
        error: 'RFQ ID is required'
      }, { status: 400 });
    }

    const updatedRfq = await prisma.rFQ.update({
      where: { id: rfqId },
      data: { status: 'CANCELLED' },
      select: {
        id: true,
        title: true,
        status: true
      }
    });

    return NextResponse.json({
      rfq: updatedRfq,
      message: 'RFQ cancelled successfully'
    });

  } catch (error) {
    console.error('Error cancelling RFQ:', error);
    return NextResponse.json({
      error: 'Failed to cancel RFQ'
    }, { status: 500 });
  }
}
