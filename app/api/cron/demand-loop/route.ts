import { NextRequest, NextResponse } from 'next/server';
import { runDailyDemandLoop } from '@/lib/demand-engine';

export const dynamic = 'force-dynamic';

async function run(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get('authorization');
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    console.log('[Cron] Starting daily demand loop...');
    const result = await runDailyDemandLoop();
    console.log('[Cron] Demand loop complete:', result);
    return NextResponse.json({ success: true, ...result, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('[Cron] demand-loop failed:', error);
    return NextResponse.json({ success: false, error: 'Cron failed' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) { return run(request); }
export async function POST(request: NextRequest) { return run(request); }
