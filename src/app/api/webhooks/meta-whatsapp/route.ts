/**
 * Meta WhatsApp Cloud API webhook — readiness endpoint (H6-12).
 *
 * GET  — Meta's subscription verification handshake (hub.mode / hub.verify_token / hub.challenge).
 * POST — inbound delivery-status / message events.
 *
 * As of H6-12, META_WHATSAPP_WEBHOOK_VERIFY_TOKEN and META_WHATSAPP_APP_SECRET
 * are NOT configured in this deployment. Both handlers therefore reject
 * (403 / 401) rather than trust unverified traffic — this endpoint is
 * readiness infrastructure only, not yet activated in Meta's dashboard.
 *
 * No business action (RFQ update, notification, etc.) is triggered from
 * this route — it only normalizes and logs delivery-status events.
 */
import { NextRequest, NextResponse } from 'next/server';
import { verifyHandshake, verifySignature, extractDeliveryStatuses } from '@/src/lib/whatsapp/webhook';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get('hub.mode');
  const verifyToken = req.nextUrl.searchParams.get('hub.verify_token');
  const challenge = req.nextUrl.searchParams.get('hub.challenge');

  const echoed = verifyHandshake(mode, verifyToken, challenge);
  if (echoed === null) {
    return new NextResponse('Forbidden', { status: 403 });
  }
  return new NextResponse(echoed, { status: 200 });
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-hub-signature-256');

  if (!verifySignature(rawBody, signature)) {
    // Not configured, or signature mismatch — never process unverified payloads.
    return NextResponse.json({ error: 'Signature verification failed or not configured' }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const statuses = extractDeliveryStatuses(payload);
  if (statuses.length > 0) {
    logger.info('[meta-whatsapp webhook] delivery statuses received', { count: statuses.length });
  }

  // Idempotent no-op: readiness only. No DB write, no business action.
  // A future sprint wires this into a delivery-status store once the
  // integration is live and a storage decision has been made.
  return NextResponse.json({ received: true, statusCount: statuses.length });
}
