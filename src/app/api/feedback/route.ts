import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

/**
 * POST /api/feedback
 * Captures supplier/buyer feedback. Auth optional — guests can submit too.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, message, rating, rfqId, role, page } = body;

    if (!message || message.trim().length < 5) {
      return NextResponse.json({ success: false, error: 'Message too short' }, { status: 400 });
    }

    if (!type || !['suggestion', 'bug', 'praise', 'friction'].includes(type)) {
      return NextResponse.json({ success: false, error: 'Invalid feedback type' }, { status: 400 });
    }

    // Optional auth
    const token =
      request.cookies.get('auth-token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');
    const payload = token ? verifyToken(token) : null;

    await prisma.feedback.create({
      data: {
        userId: payload?.userId ?? null,
        rfqId: rfqId ?? null,
        role: role ?? null,
        type,
        rating: rating ? Math.min(5, Math.max(1, Number(rating))) : null,
        message: message.trim().slice(0, 2000),
        page: page ?? null,
      },
    });

    return NextResponse.json({ success: true, message: 'Feedback received. Thank you!' });
  } catch (error) {
    console.error('[Feedback] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to save feedback' }, { status: 500 });
  }
}

/**
 * GET /api/feedback — admin only, returns recent feedback
 */
export async function GET(request: NextRequest) {
  try {
    const token =
      request.cookies.get('auth-token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');
    const payload = token ? verifyToken(token) : null;
    if (!payload) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const feedback = await prisma.feedback.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const summary = {
      total: feedback.length,
      byType: feedback.reduce((acc, f) => {
        acc[f.type] = (acc[f.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      avgRating: feedback.filter(f => f.rating).reduce((s, f) => s + (f.rating ?? 0), 0) /
        (feedback.filter(f => f.rating).length || 1),
    };

    return NextResponse.json({ success: true, feedback, summary });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch feedback' }, { status: 500 });
  }
}
