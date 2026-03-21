/**
 * GET /api/admin/outreach-stats?days=30
 * Returns outreach + drip + follow-up campaign metrics from InteractionMemory.
 * Protected — requires admin-token cookie.
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, isErrorResponse } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

const OUTREACH_ACTIONS = [
  'outreach_sent',
  'follow_up_1_sent',
  'follow_up_2_sent',
  'drip_day3_sent',
  'drip_day7_sent',
  'drip_day14_sent',
  'subscription_activated',
  'whatsapp_click',
] as const;

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (isErrorResponse(auth)) return auth;

  try {
    const days  = Math.min(90, Math.max(1, parseInt(req.nextUrl.searchParams.get('days') ?? '30')));
    const since = new Date(Date.now() - days * 86400000);

    const [actionCounts, recentEvents, uniqueReached, conversionChain] = await Promise.all([

      // Count per action type in period
      prisma.interactionMemory.groupBy({
        by: ['actionType'],
        where: {
          actionType: { in: [...OUTREACH_ACTIONS] },
          createdAt:  { gte: since },
        },
        _count: { _all: true },
      }),

      // Last 30 outreach events
      prisma.interactionMemory.findMany({
        where: {
          actionType: { in: [...OUTREACH_ACTIONS] },
          createdAt:  { gte: since },
        },
        select: { actionType: true, userId: true, metadata: true, createdAt: true, source: true },
        orderBy: { createdAt: 'desc' },
        take: 30,
      }),

      // Unique suppliers reached via outreach_sent
      prisma.interactionMemory.findMany({
        where: { actionType: 'outreach_sent', createdAt: { gte: since } },
        select: { userId: true },
        distinct: ['userId'],
      }),

      // Full conversion chain: outreach → follow_up → drip → subscription (all-time)
      prisma.interactionMemory.groupBy({
        by: ['actionType'],
        where: { actionType: { in: [...OUTREACH_ACTIONS] } },
        _count: { _all: true },
      }),
    ]);

    const countMap = Object.fromEntries(
      actionCounts.map(a => [a.actionType, a._count._all])
    );
    const allTimeMap = Object.fromEntries(
      conversionChain.map(a => [a.actionType, a._count._all])
    );

    // Conversion funnel (period)
    const outreachSent      = countMap['outreach_sent']        ?? 0;
    const followUp1         = countMap['follow_up_1_sent']     ?? 0;
    const followUp2         = countMap['follow_up_2_sent']     ?? 0;
    const drip3             = countMap['drip_day3_sent']       ?? 0;
    const drip7             = countMap['drip_day7_sent']       ?? 0;
    const drip14            = countMap['drip_day14_sent']      ?? 0;
    const subscriptions     = countMap['subscription_activated'] ?? 0;
    const waClicks          = countMap['whatsapp_click']       ?? 0;

    const conversionRate = outreachSent > 0
      ? ((subscriptions / outreachSent) * 100).toFixed(1)
      : '0.0';

    return NextResponse.json({
      success: true,
      days,
      period: {
        outreachSent,
        followUp1,
        followUp2,
        drip3,
        drip7,
        drip14,
        subscriptions,
        waClicks,
        uniqueSuppliersReached: uniqueReached.length,
        conversionRate,
      },
      allTime: {
        outreachSent:   allTimeMap['outreach_sent']           ?? 0,
        followUp1:      allTimeMap['follow_up_1_sent']        ?? 0,
        followUp2:      allTimeMap['follow_up_2_sent']        ?? 0,
        drip3:          allTimeMap['drip_day3_sent']          ?? 0,
        drip7:          allTimeMap['drip_day7_sent']          ?? 0,
        drip14:         allTimeMap['drip_day14_sent']         ?? 0,
        subscriptions:  allTimeMap['subscription_activated']  ?? 0,
      },
      recentEvents: recentEvents.map(e => ({
        actionType: e.actionType,
        userId:     e.userId,
        source:     e.source,
        metadata:   e.metadata,
        createdAt:  e.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('[OutreachStats] error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load outreach stats' }, { status: 500 });
  }
}
