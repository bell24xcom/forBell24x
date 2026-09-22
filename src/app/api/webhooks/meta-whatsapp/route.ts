/**
 * Meta WhatsApp Cloud API webhook.
 *
 * GET  — Meta's subscription verification handshake (hub.mode / hub.verify_token / hub.challenge).
 * POST — inbound delivery-status / message events.
 *
 * Both handlers reject (403 / 401) whenever META_WHATSAPP_WEBHOOK_VERIFY_TOKEN
 * / META_WHATSAPP_APP_SECRET are unset — never trusts unverified traffic.
 * Confirmed live and correctly signature-gated in production this session
 * (real delivery-status rows exist in the `webhooks` table).
 *
 * No RFQ/notification business action is triggered from this route. It
 * normalizes and logs delivery-status events, updates OutreachRecipient
 * state, and (Part C — WhatsApp Certification) correlates each event back
 * to the WhatsAppSendLog row that recorded the original send, by
 * meta_message_id.
 */
import { NextRequest, NextResponse } from 'next/server';
import { verifyHandshake, verifySignature, extractDeliveryStatuses } from '@/src/lib/whatsapp/webhook';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';

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

  // 1. Audit log raw verified webhook payload
  try {
    await prisma.webhook.create({
      data: {
        eventType: 'meta_whatsapp_delivery_status',
        payload: (payload as object) ?? {},
        status: 'processed',
      },
    });
  } catch (dbErr) {
    logger.warn('[meta-whatsapp webhook] failed to log raw webhook to db', { err: dbErr });
  }

  const statuses = extractDeliveryStatuses(payload);
  if (statuses.length > 0) {
    logger.info('[meta-whatsapp webhook] delivery statuses received', { count: statuses.length });

    // 2. Persist delivery lifecycle status to outreach recipients if matched
    for (const s of statuses) {
      try {
        const stateMapping =
          s.status === 'delivered' ? 'DELIVERED' :
          s.status === 'read' ? 'DELIVERED' :
          s.status === 'failed' ? 'FAILED' : 'SENT';

        await prisma.outreachRecipient.updateMany({
          where: { providerMessageId: s.messageId },
          data: {
            state: stateMapping,
            deliveredAt: s.status === 'delivered' || s.status === 'read' ? new Date(s.timestamp) : undefined,
            failedAt: s.status === 'failed' ? new Date(s.timestamp) : undefined,
          },
        });
      } catch (recipientErr) {
        logger.warn('[meta-whatsapp webhook] failed to update recipient state', { messageId: s.messageId, err: recipientErr });
      }

      // 3. WhatsApp Certification (Part C) — correlate back to the send-side
      // log by meta_message_id. Fire-and-forget: a missing/unmatched log
      // row (e.g. the RFQ send path predates this feature) must never make
      // this route fail or delay its 200 response to Meta.
      const firstError = s.errors[0];
      prisma.whatsAppSendLog
        .updateMany({
          where: { metaMessageId: s.messageId },
          data: {
            deliveryStatus: s.status,
            deliveredAt: s.status === 'delivered' ? new Date(s.timestamp) : undefined,
            readAt: s.status === 'read' ? new Date(s.timestamp) : undefined,
            failedAt: s.status === 'failed' ? new Date(s.timestamp) : undefined,
            failureReason: firstError
              ? `${firstError.code ?? ''} ${firstError.title ?? ''}: ${firstError.details ?? firstError.message ?? ''}`.trim()
              : undefined,
          },
        })
        .catch((err) => logger.warn('[meta-whatsapp webhook] failed to update WhatsAppSendLog', { messageId: s.messageId, err }));
    }
  }

  return NextResponse.json({ received: true, statusCount: statuses.length });
}
