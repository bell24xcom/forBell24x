/**
 * POST /api/review/submit
 * Buyer or supplier reviews the other party on a COMPLETED deal.
 * Identity is derived from the verified session token only — never from
 * client-supplied reviewer fields.
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const token =
      request.cookies.get('auth-token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ success: false, error: 'Invalid or expired session' }, { status: 401 });
    }

    const userId = payload.userId;
    const { dealId, rating, comment } = await request.json();

    if (!dealId || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'dealId and a rating between 1 and 5 are required' },
        { status: 400 }
      );
    }

    const deal = await prisma.deal.findUnique({ where: { id: dealId } });
    if (!deal) {
      return NextResponse.json({ success: false, error: 'Deal not found' }, { status: 404 });
    }

    const isBuyer = deal.buyerId === userId;
    const isSupplier = deal.supplierId === userId;
    if (!isBuyer && !isSupplier) {
      return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
    }

    if (deal.status !== 'COMPLETED') {
      return NextResponse.json(
        { success: false, error: 'Reviews are only allowed after the deal is completed' },
        { status: 400 }
      );
    }

    const revieweeId = isBuyer ? deal.supplierId : deal.buyerId;

    const existing = await prisma.review.findUnique({
      where: { dealId_reviewerId: { dealId, reviewerId: userId } },
    });
    if (existing) {
      return NextResponse.json({ success: false, error: 'You have already reviewed this deal' }, { status: 400 });
    }

    const review = await prisma.$transaction(async (tx) => {
      const created = await tx.review.create({
        data: { dealId, reviewerId: userId, revieweeId, rating, comment: comment || null },
      });

      // Same increment-then-clamp pattern used elsewhere for trust score
      // (src/app/api/supplier/onboarding/route.ts): nudge relative to a
      // neutral 3-star rating, then keep the score within [0, 100].
      const delta = rating - 3;
      const updated = await tx.user.update({
        where: { id: revieweeId },
        data: { trustScore: { increment: delta } },
        select: { trustScore: true },
      });
      if (updated.trustScore > 100) {
        await tx.user.update({ where: { id: revieweeId }, data: { trustScore: 100 } });
      } else if (updated.trustScore < 0) {
        await tx.user.update({ where: { id: revieweeId }, data: { trustScore: 0 } });
      }

      return created;
    });

    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.error('POST /api/review/submit error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
