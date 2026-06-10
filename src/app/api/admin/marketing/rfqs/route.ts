import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const INSFORGE_URL     = process.env.INSFORGE_URL;
  const INSFORGE_API_KEY = process.env.INSFORGE_API_KEY;

  if (!INSFORGE_URL || !INSFORGE_API_KEY) {
    return NextResponse.json({ rfqs: [], serviceDegraded: true, reason: 'InsForge not configured' });
  }

  try {
    const response = await fetch(`${INSFORGE_URL}/rest/v1/rfqs?order=created_at.desc`, {
      method: 'GET',
      headers: {
        apikey:          INSFORGE_API_KEY,
        Authorization:   `Bearer ${INSFORGE_API_KEY}`,
        'Content-Type':  'application/json',
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      console.warn(`[Admin RFQ Fetch] InsForge returned ${response.status}`);
      return NextResponse.json({
        rfqs: [],
        serviceDegraded: true,
        reason: `InsForge returned ${response.status}`,
      });
    }

    const rfqs = await response.json();
    return NextResponse.json(Array.isArray(rfqs) ? rfqs : []);
  } catch (error: any) {
    const isTimeout = error?.name === 'TimeoutError' || error?.name === 'AbortError';
    console.error('[Admin RFQ Fetch]', error?.message);
    return NextResponse.json({
      rfqs: [],
      serviceDegraded: true,
      reason: isTimeout ? 'InsForge timed out (5s)' : error?.message,
    });
  }
}
