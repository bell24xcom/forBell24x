/**
 * Daily Trust Score batch recompute cron.
 * GET/POST /api/cron/trust-scores
 */
import { NextRequest, NextResponse } from 'next/server';
import { verifyCronSecret } from '@/lib/cronAuth';
import { batchRecomputeTrustScores } from '@/src/lib/trust-batch';

export const dynamic = 'force-dynamic';

async function runCron(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('[CRON_START] /api/cron/trust-scores');
    const result = await batchRecomputeTrustScores({ limit: 500 });
    console.log('[CRON_END] /api/cron/trust-scores', JSON.stringify(result));
    return NextResponse.json({ success: true, ...result, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('[API_ERROR] /api/cron/trust-scores', error instanceof Error ? error.message : error);
    return NextResponse.json({ success: false, error: 'Cron failed' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return runCron(request);
}

export async function POST(request: NextRequest) {
  return runCron(request);
}
