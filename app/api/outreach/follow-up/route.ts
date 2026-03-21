import { NextRequest, NextResponse } from 'next/server';
import { getFollowUpsDue, logFollowUpSent, FollowUpType } from '@/lib/follow-up-engine';

export const dynamic = 'force-dynamic';

/** GET /api/outreach/follow-up — list all follow-ups due today */
export async function GET(_request: NextRequest) {
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

/** POST /api/outreach/follow-up — mark a follow-up as sent */
export async function POST(request: NextRequest) {
  try {
    const { supplierId, rfqId, type } = await request.json();
    if (!supplierId || !rfqId || !type) {
      return NextResponse.json({ success: false, error: 'Missing supplierId, rfqId, or type' }, { status: 400 });
    }
    await logFollowUpSent(supplierId, rfqId, type as FollowUpType);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[FollowUp] POST error:', error);
    return NextResponse.json({ success: false, error: 'Failed to log follow-up' }, { status: 500 });
  }
}
