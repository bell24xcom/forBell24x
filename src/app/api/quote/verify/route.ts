/**
 * GET /api/quote/verify?token=...
 *
 * Server-side verification for the signed quote-link tokens minted by
 * lib/quote-token.ts (createQuoteToken). The public /quote/[token] page
 * must never decode a token itself — it calls this route and trusts only
 * what the route returns.
 */
import { NextRequest, NextResponse } from 'next/server';
import { verifyQuoteToken } from '@/lib/quote-token';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  const payload = verifyQuoteToken(token);

  if (!payload) {
    return NextResponse.json({ success: false, error: 'Invalid or expired quote link.' }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    rfqId: payload.rfqId,
    supplierId: payload.supplierId,
  });
}
