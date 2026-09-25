import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isErrorResponse } from '@/lib/admin-auth';
import { acceptQuote } from '@/lib/quote-acceptance';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if (isErrorResponse(auth)) return auth;

  try {
    const { rfqId, quoteId } = await req.json();
    if (!rfqId || !quoteId) {
      return NextResponse.json({ error: 'rfqId and quoteId required' }, { status: 400 });
    }

    // Same acceptance path as the buyer routes. The RFQ ends ACCEPTED (not
    // CLOSED) like every other acceptance; see lib/quote-acceptance.ts.
    const result = await acceptQuote({
      quoteId,
      expectedRfqId: rfqId,
      actor: { id: auth.userId, role: 'ADMIN' },
      source: 'admin-select-quote',
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error, code: result.code }, { status: result.status });
    }

    return NextResponse.json({ success: true, dealId: result.deal.id });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Selection failed';
    console.error('[Admin Marketing select-quote]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
