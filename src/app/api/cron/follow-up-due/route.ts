import { NextRequest, NextResponse } from 'next/server';
import { getFollowUpsDue } from '@/lib/follow-up-engine';
import { verifyCronSecret } from '@/lib/cronAuth';

export const dynamic = 'force-dynamic';

async function run(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('[CRON_START] /api/cron/follow-up-due');
    const due = await getFollowUpsDue();
    const day2 = due.filter(d => d.followUpType === 'day2').length;
    const day5 = due.filter(d => d.followUpType === 'day5').length;
    console.log('[CRON_END] /api/cron/follow-up-due', { total: due.length, day2, day5 });
    return NextResponse.json({
      success: true,
      total: due.length,
      day2,
      day5,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API_ERROR] /api/cron/follow-up-due', error instanceof Error ? error.message : error);
    return NextResponse.json({ success: false, error: 'Cron failed' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) { return run(request); }
export async function POST(request: NextRequest) { return run(request); }
