import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveQuoteIdentityFromToken } from '@/lib/quote-token';
import { isQuotableRfqStatus } from '@/lib/rfq-quotable-status';

export const dynamic = 'force-dynamic';

/**
 * POST /api/marketing/quote
 *
 * Security fix (PR61 remediation). This endpoint previously trusted
 * client-supplied `rfq_id`/`supplier_id` fields directly, with no proof
 * the caller ever received the signed quote link for that (rfq, supplier)
 * pair — anyone could submit a quote as any supplier for any RFQ by
 * guessing or enumerating ids. It now requires the signed `token` minted
 * by createQuoteToken() (the same token embedded in the WhatsApp/email
 * quote link — see lib/orchestration.ts's quoteLink) and derives the
 * (rfqId, supplierId) pair ONLY from that verified token via
 * resolveQuoteIdentityFromToken(). Any `rfq_id`/`supplier_id` present in
 * the request body is ignored — it is never read.
 *
 * PR63: also verifies the RFQ still exists and is in a quoteable status —
 * see lib/rfq-quotable-status.ts for the allow-list and rationale.
 */
export async function POST(req: NextRequest) {
  const INSFORGE_URL = process.env.INSFORGE_URL;
  const INSFORGE_API_KEY = process.env.INSFORGE_API_KEY;
  const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;

  try {
    const body = await req.json().catch(() => ({}));

    const identity = resolveQuoteIdentityFromToken(body?.token);
    if (!identity) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired quote link. Please request a new link.' },
        { status: 401 }
      );
    }
    const { rfqId, supplierId } = identity;

    const rfq = await prisma.rFQ.findUnique({ where: { id: rfqId }, select: { status: true } });
    if (!rfq) {
      return NextResponse.json({ success: false, error: 'RFQ not found.' }, { status: 404 });
    }
    if (!isQuotableRfqStatus(rfq.status)) {
      return NextResponse.json(
        { success: false, error: `This RFQ is no longer accepting quotes (status: ${rfq.status}).` },
        { status: 409 }
      );
    }

    const { price, delivery_days, message } = body;
    if (!price) {
      return NextResponse.json({ success: false, error: 'Missing required field: price' }, { status: 400 });
    }

    const parsedPrice = typeof price === 'number' ? price : parseFloat(price);
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      return NextResponse.json({ success: false, error: 'price must be a positive number' }, { status: 400 });
    }
    const parsedDeliveryDays = delivery_days ? parseInt(delivery_days, 10) : 7;

    // 1. Primary persistence — rfqId/supplierId come ONLY from the verified
    //    token above, never from the request body.
    const quote = await prisma.quote.create({
      data: {
        rfqId,
        supplierId,
        price: parsedPrice,
        deliveryDays: parsedDeliveryDays,
        description: message || undefined,
        quantity: body.quantity || '1',
        status: 'PENDING',
      },
    });

    // Audit log — fire-and-forget, never blocks the response. Records who
    // (the token-verified supplierId) quoted what (rfqId) via this public
    // endpoint, independent of anything the client claimed in the body.
    prisma.interactionMemory
      .create({
        data: {
          rfqId,
          userId: supplierId,
          actionType: 'quote_submitted_via_signed_link',
          source: 'marketing_quote_api',
          metadata: { quoteId: quote.id, price: parsedPrice, deliveryDays: parsedDeliveryDays },
        },
      })
      .catch((err) => console.error('[Quote-API] audit log failed:', err));

    // 2. Optional InsForge sync (best-effort, non-blocking)
    if (INSFORGE_URL && INSFORGE_API_KEY) {
      try {
        const quotePayload = {
          rfq_id: rfqId,
          supplier_id: supplierId,
          price: parsedPrice,
          delivery_days: parsedDeliveryDays,
          message,
          status: 'pending',
          created_at: new Date().toISOString(),
        };

        await fetch(`${INSFORGE_URL}/rest/v1/quotes`, {
          method: 'POST',
          headers: {
            apikey: INSFORGE_API_KEY,
            Authorization: `Bearer ${INSFORGE_API_KEY}`,
            'Content-Type': 'application/json',
            Prefer: 'return=representation',
          },
          body: JSON.stringify([quotePayload]),
        });

        await fetch(`${INSFORGE_URL}/rest/v1/rfqs?id=eq.${rfqId}`, {
          method: 'PATCH',
          headers: {
            apikey: INSFORGE_API_KEY,
            Authorization: `Bearer ${INSFORGE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'quoted' }),
        });
      } catch (insforgeErr) {
        console.warn('[Quote-API] InsForge sync non-fatal:', insforgeErr);
      }
    }

    // 3. Trigger Notification Webhook (Notify Admin/Buyer)
    if (N8N_WEBHOOK_URL) {
      fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'quote_submitted',
          rfq_id: rfqId,
          quote_id: quote.id,
          price: parsedPrice,
        }),
      }).catch(console.error);
    }

    return NextResponse.json({ success: true, quote_id: quote.id });
  } catch (error: any) {
    console.error('[Quote-API] Error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
