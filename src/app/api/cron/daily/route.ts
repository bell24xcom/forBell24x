import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const CRON_SECRET = process.env.CRON_SECRET;
const BASE_URL    = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vyaparsethu.com';

function authorized(req: NextRequest): boolean {
  if (!CRON_SECRET) return true;
  return req.headers.get('authorization') === `Bearer ${CRON_SECRET}`;
}

async function callCron(path: string): Promise<{ path: string; ok: boolean; body: unknown }> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: CRON_SECRET ? { authorization: `Bearer ${CRON_SECRET}` } : {},
      signal: AbortSignal.timeout(55_000),
    });
    const body = await res.json().catch(() => null);
    return { path, ok: res.ok, body };
  } catch (err) {
    return { path, ok: false, body: err instanceof Error ? err.message : String(err) };
  }
}

async function run(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const isMonday = new Date().getUTCDay() === 1;

  const jobs: string[] = [
    '/api/cron/expire-rfqs',
    '/api/cron/supplier-drip',
    '/api/cron/follow-up-due',
  ];
  if (isMonday) jobs.push('/api/cron/weekly-digest');

  // Run sequentially so DB load is spread and logs are ordered
  const results: { path: string; ok: boolean; body: unknown }[] = [];
  for (const path of jobs) {
    results.push(await callCron(path));
  }

  const allOk = results.every(r => r.ok);
  console.log('[CRON/DAILY]', JSON.stringify({ isMonday, results }));

  return NextResponse.json({ success: allOk, isMonday, results }, { status: allOk ? 200 : 207 });
}

export async function GET(req: NextRequest)  { return run(req); }
export async function POST(req: NextRequest) { return run(req); }
