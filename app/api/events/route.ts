import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

const VALID_EVENTS = new Set([
  'page_view',
  'rfq_viewed',
  'rfq_created',
  'supplier_clicked',
  'quote_started',
  'quote_submitted',
  'payment_started',
  'payment_success',
  'feedback_submitted',
  'view', 'click', 'quote', 'bookmark', 'share', // legacy compat
]);

/**
 * POST /api/events
 * Lightweight event ingestion for behavior tracking.
 * Writes to InteractionMemory (existing table).
 *
 * Body: { event, sessionId, rfqId?, metadata? }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event, sessionId, rfqId, metadata } = body;

    if (!event || !VALID_EVENTS.has(event)) {
      return NextResponse.json({ success: false, error: 'Invalid event type' }, { status: 400 });
    }

    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'sessionId required' }, { status: 400 });
    }

    // Optional auth
    const token =
      request.cookies.get('auth-token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');
    const payload = token ? verifyToken(token) : null;

    // Fire-and-forget write — don't block the response
    prisma.interactionMemory.create({
      data: {
        actionType: event,
        sessionId,
        rfqId: rfqId ?? null,
        userId: payload?.userId ?? null,
        source: 'marketplace',
        metadata: metadata ?? null,
      },
    }).catch(e => console.error('[Events] Write failed:', e));

    return NextResponse.json({ success: true });
  } catch (error) {
    // Never crash the caller — events are non-critical
    console.error('[Events] Error:', error);
    return NextResponse.json({ success: true }); // silent
  }
}
