import { NextRequest, NextResponse } from 'next/server';
import { getFollowUpsDue, logFollowUpSent, FollowUpType } from '@/lib/follow-up-engine';
import { requireAdmin, isErrorResponse } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const VALID_FOLLOWUP_TYPES: FollowUpType[] = ['day2', 'day5'];

/** GET /api/outreach/follow-up — list all follow-ups due today (admin only) */
export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if (isErrorResponse(auth)) return auth;

  try {
    const due = await getFollowUpsDue();
    return NextResponse.json({
      success: true,
      total: due.length,
      day2: due.filter(d => d.followUpType === 'day2').length,
      day5: due.filter(d => d.followUpType === 'day5').length,
      followUps: due,
    });
  } catch (error) {
    console.error('[FollowUp] GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load follow-ups' }, { status: 500 });
  }
}

/** POST /api/outreach/follow-up — mark a follow-up as sent (admin only) */
export async function POST(request: NextRequest) {
  const auth = requireAdmin(request);
  if (isErrorResponse(auth)) return auth;

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ success: false, error: 'Malformed request body' }, { status: 400 });
  }

  const { supplierId, rfqId, type } = body;
  if (!supplierId || typeof supplierId !== 'string' || !rfqId || typeof rfqId !== 'string') {
    return NextResponse.json({ success: false, error: 'Missing supplierId or rfqId' }, { status: 400 });
  }
  if (!type || !VALID_FOLLOWUP_TYPES.includes(type)) {
    return NextResponse.json({ success: false, error: 'Invalid type' }, { status: 400 });
  }

  try {
    const [supplier, rfq] = await Promise.all([
      prisma.user.findUnique({ where: { id: supplierId }, select: { id: true } }),
      prisma.rFQ.findUnique({ where: { id: rfqId }, select: { id: true } }),
    ]);
    if (!supplier) {
      return NextResponse.json({ success: false, error: 'Supplier not found' }, { status: 404 });
    }
    if (!rfq) {
      return NextResponse.json({ success: false, error: 'RFQ not found' }, { status: 404 });
    }

    await logFollowUpSent(supplierId, rfqId, type as FollowUpType);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[FollowUp] POST error:', error);
    return NextResponse.json({ success: false, error: 'Failed to log follow-up' }, { status: 500 });
  }
}
