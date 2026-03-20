import { NextRequest, NextResponse } from 'next/server';
import { analyzeUserBehavior } from '@/lib/behavior-engine';

export const dynamic = 'force-dynamic';

async function run(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = request.headers.get('authorization');
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    console.log('[Cron] Starting behavior analysis...');
    const result = await analyzeUserBehavior(30);
    console.log('[Cron] Behavior analysis complete:', result);
    return NextResponse.json({ success: true, ...result, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('[Cron] analyze-behavior failed:', error);
    return NextResponse.json({ success: false, error: 'Cron failed' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) { return run(request); }
export async function POST(request: NextRequest) { return run(request); }
