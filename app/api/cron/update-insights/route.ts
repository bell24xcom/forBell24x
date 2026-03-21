import { NextRequest, NextResponse } from 'next/server';
import { dailyInsightsCron } from '@/lib/memory-engine';

export const dynamic = 'force-dynamic';

async function runCron(request: NextRequest) {
  // Verify cron secret if configured
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    console.log('[CRON_START] /api/cron/update-insights');
    const result = await dailyInsightsCron();
    console.log('[CRON_END] /api/cron/update-insights', JSON.stringify(result));
    return NextResponse.json({ success: true, ...result, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('[API_ERROR] /api/cron/update-insights', error instanceof Error ? error.message : error);
    return NextResponse.json({ success: false, error: 'Cron failed' }, { status: 500 });
  }
}

// GET for Vercel cron scheduler
export async function GET(request: NextRequest) {
  return runCron(request);
}

// POST for manual admin trigger
export async function POST(request: NextRequest) {
  return runCron(request);
}
