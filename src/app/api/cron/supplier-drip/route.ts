import { NextRequest, NextResponse } from 'next/server';
import { getDripsDue, logDripSent } from '@/lib/supplier-drip-engine';
import { verifyCronSecret } from '@/lib/cronAuth';

export const dynamic = 'force-dynamic';

async function run(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('[CRON_START] /api/cron/supplier-drip');
    const due = await getDripsDue();

    // Log each drip as sent (idempotent — won't re-log if already exists)
    await Promise.allSettled(due.map(d => logDripSent(d.supplierId, d.dripType)));

    const day3  = due.filter(d => d.dripType === 'day3').length;
    const day7  = due.filter(d => d.dripType === 'day7').length;
    const day14 = due.filter(d => d.dripType === 'day14').length;

    console.log('[CRON_END] /api/cron/supplier-drip', { total: due.length, day3, day7, day14 });

    return NextResponse.json({
      success: true,
      total: due.length,
      day3,
      day7,
      day14,
      // wa.me links returned for operator to click if needed
      drips: due.map(d => ({
        supplierId: d.supplierId,
        name: d.name,
        company: d.company,
        dripType: d.dripType,
        waLink: d.waLink,
      })),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API_ERROR] /api/cron/supplier-drip', error instanceof Error ? error.message : error);
    return NextResponse.json({ success: false, error: 'Cron failed' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) { return run(request); }
export async function POST(request: NextRequest) { return run(request); }
