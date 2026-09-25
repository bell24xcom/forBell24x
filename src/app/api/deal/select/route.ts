import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/src/lib/auth-helpers';
import { acceptQuote } from '@/lib/quote-acceptance';
import { z } from 'zod';

const SelectDealSchema = z.object({
  quoteId: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const user = getAuthenticatedUser(req);

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Please log in' }, { status: 401 });
    }

    const body = await req.json();
    const { quoteId } = SelectDealSchema.parse(body);

    // Shared acceptance path: ownership / self-accept / PENDING / existing-deal
    // guards, Deal creation, RFQ lock, competing-quote rejection, notifications
    // and life events all live in lib/quote-acceptance.ts.
    const result = await acceptQuote({ quoteId, actor: { id: user.id, role: user.role }, source: 'deal-select' });

    if (!result.ok) {
      return NextResponse.json(
        { success: false, error: result.error, code: result.code },
        { status: result.status },
      );
    }

    return NextResponse.json({ success: true, deal: result.deal }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('Deal Selection Error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
