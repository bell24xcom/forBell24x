import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/jwt';

const prisma = new PrismaClient();
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const token =
      request.cookies.get('auth-token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) return NextResponse.json({ success: false, error: 'Auth required' }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ success: false, error: 'Invalid session' }, { status: 401 });

    const rfqs = await prisma.rFQ.findMany({
      where: { createdBy: payload.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        quotes: { select: { id: true, status: true, price: true } },
      },
    });

    return NextResponse.json({
      success: true,
      rfqs: rfqs.map(r => ({
        id: r.id,
        title: r.title,
        category: r.category,
        status: r.status,
        urgency: r.urgency,
        quantity: r.quantity,
        unit: r.unit,
        minBudget: r.minBudget,
        maxBudget: r.maxBudget,
        timeline: r.timeline,
        createdAt: r.createdAt.toISOString(),
        expiresAt: r.expiresAt?.toISOString(),
        quotesCount: r.quotes.length,
        estimatedValue: r.estimatedValue,
      })),
    });
  } catch (error) {
    console.error('Dashboard RFQs error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load RFQs' }, { status: 500 });
  }
}
