import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { requireAdmin, isErrorResponse } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

// No messaging provider is wired into this route — see docs/audits/TASK39A8_SUPPLIER_DRIP_CONTAINMENT.md
export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if (isErrorResponse(auth)) return auth;

  try {
    const { rfq_id, supplier, step, channel_override } = await req.json();

    if (!rfq_id || !supplier || typeof supplier !== 'object' || !supplier.id) {
      return NextResponse.json(
        { success: false, error: 'Missing rfq_id or supplier.id' },
        { status: 400 },
      );
    }

    // Channel selection and message templating are harmless to compute and
    // return for inspection — they are not a delivery claim by themselves.
    const channel = channel_override || (supplier.phone ? 'whatsapp' : 'email');
    const templates: Record<number, string> = {
      0: `Hi ${supplier.name}, new RFQ for ${supplier.category}! View here: {{link}}`,
      1: `Gentle reminder: RFQ for ${supplier.category} is still open. Check details: {{link}}`,
      2: `URGENT: Buyer is making a decision soon for ${supplier.category}. Submit your quote: {{link}}`,
      3: `Last chance: Final request for quote. Don't miss this deal: {{link}}`,
    };
    const token = btoa(JSON.stringify({ rfq_id, supplier_id: supplier.id }));
    const link = `${process.env.NEXTAUTH_URL}/quote/${token}`;
    const content = (templates[step] || templates[0]).replace('{{link}}', link);

    logger.info(`[Outreach] No provider configured — not sending ${channel} step ${step} to ${supplier.id}`);

    return NextResponse.json({
      success: false,
      status: 'not_configured',
      channel,
      step,
      content,
      message: 'No messaging provider is connected to this route. Nothing was sent and nothing was recorded as sent.',
    });
  } catch (error: any) {
    logger.error('Outreach API Error', { error: error.message });
    return NextResponse.json({ success: false, status: 'failed', error: error.message }, { status: 500 });
  }
}
