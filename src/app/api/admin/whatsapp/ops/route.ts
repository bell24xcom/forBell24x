/**
 * GET /api/admin/whatsapp/ops
 * Read-only ops data for the WhatsApp Operations Dashboard.
 * Aggregates webhook delivery records + template env configuration.
 * Does not send messages or modify WhatsApp integration state.
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, isErrorResponse } from '@/lib/admin-auth';
import { extractDeliveryStatuses } from '@/src/lib/whatsapp/webhook';

export const dynamic = 'force-dynamic';

const WA_ACTION_TYPES = [
  'day1_wa_sent',
  'outreach_sent',
  'follow_up_1_sent',
  'follow_up_2_sent',
  'drip_day3_sent',
  'drip_day7_sent',
  'drip_day14_sent',
  'whatsapp_click',
] as const;

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (isErrorResponse(auth)) return auth;

  try {
    const days = Math.min(90, Math.max(1, parseInt(req.nextUrl.searchParams.get('days') ?? '7', 10)));
    const since = new Date(Date.now() - days * 86400000);
    const oneDayAgo = new Date(Date.now() - 86400000);

    const rfqTemplate = process.env.META_WHATSAPP_RFQ_TEMPLATE?.trim() || '';
    const rfqTemplateLang = process.env.META_WHATSAPP_RFQ_TEMPLATE_LANG?.trim() || 'en';
    const claimTemplate = process.env.META_WHATSAPP_CLAIM_TEMPLATE?.trim() || '';

    const [webhookRows, providerFailures24h, recentProviderFailures, recentOutreachEvents] =
      await Promise.all([
        prisma.webhook.findMany({
          where: {
            eventType: 'meta_whatsapp_delivery_status',
            createdAt: { gte: since },
          },
          orderBy: { createdAt: 'desc' },
          take: 50,
          select: { id: true, payload: true, createdAt: true, status: true },
        }),
        prisma.providerFailure.count({ where: { createdAt: { gte: oneDayAgo } } }),
        prisma.providerFailure.findMany({
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            provider: true,
            endpoint: true,
            errorCode: true,
            errorMessage: true,
            phoneOrRecipient: true,
            createdAt: true,
          },
        }),
        prisma.interactionMemory.findMany({
          where: {
            actionType: { in: [...WA_ACTION_TYPES] },
            createdAt: { gte: since },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
          select: { actionType: true, userId: true, source: true, createdAt: true },
        }),
      ]);

    const deliverySummary = { sent: 0, delivered: 0, read: 0, failed: 0, total: 0 };
    const recentDeliveries: Array<{
      messageId: string;
      status: string;
      recipientRedacted: string;
      timestamp: string;
      loggedAt: string;
    }> = [];

    for (const row of webhookRows) {
      const statuses = extractDeliveryStatuses(row.payload);
      for (const s of statuses) {
        deliverySummary.total += 1;
        if (s.status === 'sent') deliverySummary.sent += 1;
        else if (s.status === 'delivered') deliverySummary.delivered += 1;
        else if (s.status === 'read') deliverySummary.read += 1;
        else if (s.status === 'failed') deliverySummary.failed += 1;

        if (recentDeliveries.length < 15) {
          recentDeliveries.push({
            messageId: s.messageId,
            status: s.status,
            recipientRedacted: s.recipientRedacted,
            timestamp: s.timestamp,
            loggedAt: row.createdAt.toISOString(),
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      days,
      templates: {
        rfq: {
          configured: rfqTemplate.length > 0,
          name: rfqTemplate || null,
          language: rfqTemplateLang,
        },
        claim: {
          configured: claimTemplate.length > 0,
          name: claimTemplate || null,
        },
      },
      deliverySummary,
      recentDeliveries,
      webhookEventsLogged: webhookRows.length,
      providerFailures24h,
      recentProviderFailures: recentProviderFailures.map((f) => ({
        id: f.id,
        provider: f.provider,
        endpoint: f.endpoint,
        errorCode: f.errorCode,
        errorMessage: f.errorMessage,
        phoneOrRecipient: f.phoneOrRecipient,
        createdAt: f.createdAt.toISOString(),
      })),
      recentOutreachEvents: recentOutreachEvents.map((e) => ({
        actionType: e.actionType,
        userId: e.userId,
        source: e.source,
        createdAt: e.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('[WhatsApp Ops API] error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load WhatsApp ops data' }, { status: 500 });
  }
}
