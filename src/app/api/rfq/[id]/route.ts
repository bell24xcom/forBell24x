import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const param = request.nextUrl.pathname.split('/').pop();

    if (!param) {
      return NextResponse.json({ error: 'RFQ ID is required' }, { status: 400 });
    }

    // Look up by id first, then fall back to slug
    const rfq = await prisma.rFQ.findFirst({
      where: {
        isPublic: true,
        OR: [
          { id: param },
          { slug: param },
        ],
      },
      include: {
        user: {
          select: { name: true, company: true, location: true },
        },
      },
    });

    if (!rfq) {
      console.log(`[RFQ] Not found: param="${param}"`);
      return NextResponse.json({ error: 'RFQ not found or not public' }, { status: 404 });
    }

    // Increment view count (fire-and-forget)
    prisma.rFQ.update({
      where: { id: rfq.id },
      data: { views: { increment: 1 } },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      rfq: {
        id:          rfq.id,
        slug:        rfq.slug,
        title:       rfq.title,
        category:    rfq.category,
        description: rfq.description,
        quantity:    rfq.quantity,
        unit:        rfq.unit,
        maxBudget:   rfq.maxBudget,
        timeline:    rfq.timeline,
        urgency:     rfq.urgency,
        location:    rfq.location,
        createdAt:   rfq.createdAt,
        views:       rfq.views,
        user:        rfq.user,
      },
    });
  } catch (error) {
    console.error('[RFQ] Error fetching RFQ:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
