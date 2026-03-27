import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const INSFORGE_URL = process.env.INSFORGE_URL;
  const INSFORGE_API_KEY = process.env.INSFORGE_API_KEY;

  try {
    const response = await fetch(`${INSFORGE_URL}/rest/v1/quotes?order=created_at.desc`, {
      method: 'GET',
      headers: {
        'apikey': INSFORGE_API_KEY!,
        'Authorization': `Bearer ${INSFORGE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) throw new Error('Fetch failed');
    const quotes = await response.json();
    return NextResponse.json(quotes);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
