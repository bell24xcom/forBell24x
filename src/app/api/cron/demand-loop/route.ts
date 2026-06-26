import { NextRequest, NextResponse } from 'next/server';
import { runDailyDemandLoop } from '@/lib/demand-engine';
import { verifyCronSecret } from '@/lib/cronAuth';

export const dynamic = 'force-dynamic';

async function run(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('[CRON_START] /api/cron/demand-loop');
    const result = await runDailyDemandLoop();
    console.log('[CRON_END] /api/cron/demand-loop', JSON.stringify(result));
    return NextResponse.json({ success: true, ...result, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('[API_ERROR] /api/cron/demand-loop', error instanceof Error ? error.message : error);
    return NextResponse.json({ success: false, error: 'Cron failed' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) { return run(request); }
export async function POST(request: NextRequest) { return run(request); }
