import { NextRequest, NextResponse } from 'next/server';
import { getDripsDue, logDripSent, DripType } from '@/lib/supplier-drip-engine';

export const dynamic = 'force-dynamic';

/** GET /api/outreach/drip — list all onboarding drips due today */
export async function GET(_request: NextRequest) {
  try {
    const due = await getDripsDue();
    return NextResponse.json({
      success: true,
      total: due.length,
      day3:  due.filter(d => d.dripType === 'day3').length,
      day7:  due.filter(d => d.dripType === 'day7').length,
      day14: due.filter(d => d.dripType === 'day14').length,
      drips: due,
    });
  } catch (error) {
    console.error('[Drip] GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load drips' }, { status: 500 });
  }
}

/** POST /api/outreach/drip — mark a drip as sent */
export async function POST(request: NextRequest) {
  try {
    const { supplierId, dripType } = await request.json();
    if (!supplierId || !dripType) {
      return NextResponse.json({ success: false, error: 'Missing supplierId or dripType' }, { status: 400 });
    }
    await logDripSent(supplierId, dripType as DripType);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Drip] POST error:', error);
    return NextResponse.json({ success: false, error: 'Failed to log drip' }, { status: 500 });
  }
}
