import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateSecureId } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const INSFORGE_URL = process.env.INSFORGE_URL;
  const INSFORGE_API_KEY = process.env.INSFORGE_API_KEY;
  const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;

  try {
    const body = await req.json();
    const { rfq_id, supplier_id, price, delivery_days, message } = body;

    if (!rfq_id || !price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const parsedPrice = typeof price === 'number' ? price : parseFloat(price);
    const parsedDeliveryDays = delivery_days ? parseInt(delivery_days, 10) : 7;

    // 1. Primary persistence: Save Quote to PostgreSQL via Prisma
    const quote = await prisma.quote.create({
      data: {
        rfqId: rfq_id,
        supplierId: supplier_id || undefined,
        price: parsedPrice,
        deliveryDays: parsedDeliveryDays,
        description: message || undefined,
        quantity: body.quantity || '1',
        status: 'PENDING',
      },
    });

    // 2. Optional InsForge sync (best-effort, non-blocking)
    if (INSFORGE_URL && INSFORGE_API_KEY) {
      try {
        const quotePayload = {
          rfq_id,
          supplier_id,
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

        await fetch(`${INSFORGE_URL}/rest/v1/rfqs?id=eq.${rfq_id}`, {
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
          rfq_id,
          quote_id: quote.id,
          price: parsedPrice,
        }),
      }).catch(console.error);
    }

    return NextResponse.json({ success: true, quote_id: quote.id });
  } catch (error: any) {
    console.error('[Quote-API] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
