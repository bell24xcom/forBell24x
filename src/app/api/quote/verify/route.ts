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
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  const payload = verifyQuoteToken(token);

  if (!payload) {
    return NextResponse.json({ success: false, error: 'Invalid or expired quote link.' }, { status: 401 });
  }

  // Marketplace Certification Sprint, Part D: lets the supplier quote page
  // display the RFQ's title/category/video without decoding the token
  // itself — this route remains the only trusted source, per its own
  // header note. Best-effort only: a lookup failure must never block
  // quote submission, so fall back to nulls rather than fail the request.
  const rfq = await prisma.rFQ
    .findUnique({
      where: { id: payload.rfqId },
      select: { title: true, category: true, location: true, videoUrl: true },
    })
    .catch(() => null);

  return NextResponse.json({
    success: true,
    rfqId: payload.rfqId,
    supplierId: payload.supplierId,
    rfq: rfq
      ? { title: rfq.title, category: rfq.category, location: rfq.location, videoUrl: rfq.videoUrl }
      : null,
  });
}
