/**
 * POST /api/rfq/complete
 *
 * Buyer confirms that an ACCEPTED deal was completed.
 * Sets RFQ → COMPLETED, boosts supplier trust score, fires orchestration.
 *
 * Body: { rfqId: string }
 * Auth: JWT cookie or Authorization header (buyer only)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, extractToken } from '@/lib/jwt';
import { onDealCompleted } from '@/lib/orchestration';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Auth
    const token = extractToken(
      request.headers.get('authorization'),
      request.cookies.get('auth-token')?.value
    );
    if (!token) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    let payload;
    try {
      payload = verifyToken(token);
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid or expired session' }, { status: 401 });
    }

    const { rfqId } = await request.json();
    if (!rfqId) {
      return NextResponse.json({ success: false, error: 'rfqId is required' }, { status: 400 });
    }

    // Load RFQ with accepted quote and supplier
    const rfq = await prisma.rFQ.findUnique({
      where: { id: rfqId },
      include: {
        quotes: {
          where: { isAccepted: true },
          include: {
            supplier: { select: { id: true, name: true, email: true } },
          },
          take: 1,
        },
      },
    });

    if (!rfq) {
      return NextResponse.json({ success: false, error: 'RFQ not found' }, { status: 404 });
    }

    // Only the buyer (RFQ creator) can confirm completion
    if (rfq.createdBy !== payload.userId) {
      return NextResponse.json({ success: false, error: 'Only the buyer can confirm deal completion' }, { status: 403 });
    }

    // RFQ must be in ACCEPTED status to be marked complete
    if (rfq.status !== 'ACCEPTED' && rfq.status !== 'IN_PROGRESS') {
      return NextResponse.json(
        { success: false, error: `Cannot complete RFQ with status: ${rfq.status}` },
        { status: 409 }
      );
    }

    const acceptedQuote = rfq.quotes[0];
    if (!acceptedQuote) {
      return NextResponse.json({ success: false, error: 'No accepted quote found for this RFQ' }, { status: 400 });
    }

    // Fetch buyer info
    const buyer = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, name: true },
    });

    // Fire orchestration (fire-and-forget — already marks COMPLETED + updates trust)
    onDealCompleted(
      { id: rfq.id, title: rfq.title },
      acceptedQuote.supplier,
      { id: payload.userId, name: buyer?.name ?? null }
    ).catch(err => console.error('[API] onDealCompleted error:', err));

    return NextResponse.json({
      success: true,
      message: 'Deal confirmed as complete. Thank you!',
      rfqId: rfq.id,
    });
  } catch (error) {
    console.error('POST /api/rfq/complete error:', error);
    return NextResponse.json({ success: false, error: 'Failed to confirm deal completion' }, { status: 500 });
  }
}
