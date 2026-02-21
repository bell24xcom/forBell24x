import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get RFQ ID from URL
    const id = request.nextUrl.pathname.split('/').pop();

    if (!id) {
      return NextResponse.json(
        { error: 'RFQ ID is required' },
        { status: 400 }
      );
    }

    // Fetch RFQ with user info
    const rfq = await prisma.rFQ.findUnique({
      where: { id, isPublic: true },
      include: {
        user: {
          select: { name: true, company: true, location: true },
        },
      },
    });

    if (!rfq) {
      return NextResponse.json(
        { error: 'RFQ not found or not public' },
        { status: 404 }
      );
    }

    // Increment view count
    await prisma.rFQ.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    return NextResponse.json({
      success: true,
      rfq: {
        id: rfq.id,
        title: rfq.title,
        category: rfq.category,
        description: rfq.description,
        quantity: rfq.quantity,
        unit: rfq.unit,
        maxBudget: rfq.maxBudget,
        timeline: rfq.timeline,
        urgency: rfq.urgency,
        location: rfq.location,
        createdAt: rfq.createdAt,
        views: rfq.views,
        user: rfq.user,
      },
    });
  } catch (error) {
    console.error('Error fetching RFQ:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}