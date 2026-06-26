import { NextRequest, NextResponse } from 'next/server';
import { analyzeUserBehavior } from '@/lib/behavior-engine';
import { verifyCronSecret } from '@/lib/cronAuth';

export const dynamic = 'force-dynamic';

async function run(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('[CRON_START] /api/cron/analyze-behavior');
    const result = await analyzeUserBehavior(30);
    console.log('[CRON_END] /api/cron/analyze-behavior', JSON.stringify(result));
    return NextResponse.json({ success: true, ...result, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('[API_ERROR] /api/cron/analyze-behavior', error instanceof Error ? error.message : error);
    return NextResponse.json({ success: false, error: 'Cron failed' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) { return run(request); }
export async function POST(request: NextRequest) { return run(request); }
