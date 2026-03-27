import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const INSFORGE_URL = process.env.INSFORGE_URL;
  const INSFORGE_API_KEY = process.env.INSFORGE_API_KEY;

  if (!INSFORGE_URL || !INSFORGE_API_KEY) {
    return NextResponse.json({ error: 'InsForge configuration missing' }, { status: 500 });
  }

  try {
    const response = await fetch(`${INSFORGE_URL}/rest/v1/rfqs?order=created_at.desc`, {
      method: 'GET',
      headers: {
        'apikey': INSFORGE_API_KEY,
        'Authorization': `Bearer ${INSFORGE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`InsForge API returned ${response.status}`);
    }

    const rfqs = await response.json();
    return NextResponse.json(rfqs);
  } catch (error: any) {
    console.error('[Admin RFQ Fetch] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
