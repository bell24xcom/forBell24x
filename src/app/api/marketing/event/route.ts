import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isErrorResponse } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

const MAX_FIELD_LENGTH = 200;

function isValidField(v: unknown): v is string {
  return typeof v === 'string' && v.length > 0 && v.length <= MAX_FIELD_LENGTH;
}

/** POST /api/marketing/event — admin only. No known caller exists in this
 * repository today (see TASK 39A-10B investigation); gated rather than left
 * public since there is no workflow to design a public version around. */
export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if (isErrorResponse(auth)) return auth;

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ success: false, error: 'Malformed request body' }, { status: 400 });
  }

  const { rfq_id, supplier_id, event_type } = body;
  if (!isValidField(rfq_id) || !isValidField(supplier_id) || !isValidField(event_type)) {
    return NextResponse.json({ success: false, error: 'Missing or invalid rfq_id, supplier_id, or event_type' }, { status: 400 });
  }

  const INSFORGE_URL = process.env.INSFORGE_URL;
  const INSFORGE_API_KEY = process.env.INSFORGE_API_KEY;
  if (!INSFORGE_URL || !INSFORGE_API_KEY) {
    console.error('[MarketingEvent] INSFORGE_URL or INSFORGE_API_KEY is not configured');
    return NextResponse.json({ success: false, error: 'Event tracking is not configured' }, { status: 503 });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    let response: Response;
    try {
      response = await fetch(`${INSFORGE_URL}/rest/v1/outreach_events`, {
        method: 'POST',
        headers: {
          apikey: INSFORGE_API_KEY,
          Authorization: `Bearer ${INSFORGE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([{
          rfq_id,
          supplier_id,
          event_type,
          created_at: new Date().toISOString(),
        }]),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      console.error('[MarketingEvent] InsForge rejected the write', response.status);
      return NextResponse.json({ success: false, error: 'Failed to record event' }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[MarketingEvent] InsForge call failed', error instanceof Error ? error.message : error);
    return NextResponse.json({ success: false, error: 'Failed to record event' }, { status: 502 });
  }
}
