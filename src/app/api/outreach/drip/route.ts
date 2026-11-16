import { NextRequest, NextResponse } from 'next/server';
import { getDripsDue, logDripSent, DripType } from '@/lib/supplier-drip-engine';
import { requireAdmin, isErrorResponse } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

// Both methods require an admin session — see docs/audits/TASK39A8_SUPPLIER_DRIP_CONTAINMENT.md

/** GET /api/outreach/drip — list all onboarding drips due today (admin only) */
export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if (isErrorResponse(auth)) return auth;

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

/** POST /api/outreach/drip — operator confirms they personally sent a drip (admin only) */
export async function POST(request: NextRequest) {
  const auth = requireAdmin(request);
  if (isErrorResponse(auth)) return auth;

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
