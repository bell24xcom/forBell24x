/**
 * GET /api/admin/acquisition?range=1d|7d|30d
 * Powers the /admin/acquisition dashboard — funnel, page breakdown, category intent.
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, isErrorResponse } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

function rangeToMs(range: string): number {
  const map: Record<string, number> = { '1d': 1, '7d': 7, '30d': 30 };
  return (map[range] ?? 7) * 24 * 60 * 60 * 1000;
}

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (isErrorResponse(auth)) return auth;

  const range = req.nextUrl.searchParams.get('range') || '7d';
  const since = new Date(Date.now() - rangeToMs(range));

  try {
    // Pull all interaction memory events in the range
    const events = await prisma.interactionMemory.findMany({
      where: { createdAt: { gte: since } },
      select: { actionType: true, source: true, metadata: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });

    // ── Funnel totals ──
    const modal_open           = events.filter(e => e.actionType === 'modal_open').length;
    const otp_sent             = events.filter(e => e.actionType === 'otp_sent').length;
    const registration_complete = events.filter(e => e.actionType === 'registration_complete').length;

    const conversionRate    = modal_open > 0 ? ((registration_complete / modal_open) * 100).toFixed(1) : '0.0';
    const otpToRegistration = otp_sent   > 0 ? ((registration_complete / otp_sent)   * 100).toFixed(1) : '0.0';

    // ── By page (source) ──
    const pageMap: Record<string, { modal_open: number; otp_sent: number; registration_complete: number }> = {};
    for (const e of events) {
      const src = e.source || 'unknown';
      if (!pageMap[src]) pageMap[src] = { modal_open: 0, otp_sent: 0, registration_complete: 0 };
      if (e.actionType === 'modal_open')            pageMap[src].modal_open++;
      if (e.actionType === 'otp_sent')              pageMap[src].otp_sent++;
      if (e.actionType === 'registration_complete') pageMap[src].registration_complete++;
    }
    const byPage = Object.entries(pageMap)
      .map(([source, counts]) => ({ source, ...counts }))
      .sort((a, b) => b.modal_open - a.modal_open);

    // ── By category + city (from metadata) ──
    const catMap: Record<string, number> = {};
    for (const e of events) {
      if (e.actionType !== 'modal_open') continue;
      const meta = e.metadata as Record<string, string> | null;
      const cat  = meta?.category || '';
      const city = meta?.city     || '';
      if (!cat && !city) continue;
      const key = `${cat}||${city}`;
      catMap[key] = (catMap[key] || 0) + 1;
    }
    const byCategory = Object.entries(catMap)
      .map(([key, count]) => {
        const [category, city] = key.split('||');
        return { category, city, count };
      })
      .sort((a, b) => b.count - a.count);

    // ── Recent registrations ──
    const recentRegistrations = events
      .filter(e => e.actionType === 'registration_complete')
      .slice(0, 20)
      .map(e => ({
        source:    e.source || '',
        createdAt: e.createdAt.toISOString(),
        metadata:  (e.metadata as Record<string, unknown>) || {},
      }));

    return NextResponse.json({
      funnel: { modal_open, otp_sent, registration_complete, conversionRate, otpToRegistration },
      byPage,
      byCategory,
      recentRegistrations,
      range,
      since: since.toISOString(),
    });
  } catch (error) {
    console.error('[acquisition]', error);
    return NextResponse.json({ error: 'Failed to load acquisition data' }, { status: 500 });
  }
}
