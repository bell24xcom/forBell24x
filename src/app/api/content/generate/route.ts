import { NextRequest, NextResponse } from 'next/server';
import { generateContent } from '@/lib/demand-engine';

export const dynamic = 'force-dynamic';

/**
 * GET /api/content/generate?rfqId=xxx
 * Returns ready-to-post LinkedIn, WhatsApp, Twitter, blog content for an RFQ.
 */
export async function GET(request: NextRequest) {
  const rfqId = new URL(request.url).searchParams.get('rfqId');
  if (!rfqId) {
    return NextResponse.json({ success: false, error: 'rfqId required' }, { status: 400 });
  }

  const content = await generateContent(rfqId);
  if (!content) {
    return NextResponse.json({ success: false, error: 'RFQ not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, rfqId, content });
}
