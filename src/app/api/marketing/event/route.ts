import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const INSFORGE_URL = process.env.INSFORGE_URL;
  const INSFORGE_API_KEY = process.env.INSFORGE_API_KEY;

  try {
    const { rfq_id, supplier_id, event_type } = await req.json();

    await fetch(`${INSFORGE_URL}/rest/v1/outreach_events`, {
      method: 'POST',
      headers: {
        'apikey': INSFORGE_API_KEY!,
        'Authorization': `Bearer ${INSFORGE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([{
        rfq_id,
        supplier_id,
        event_type, // 'viewed'
        created_at: new Date().toISOString()
      }])
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
