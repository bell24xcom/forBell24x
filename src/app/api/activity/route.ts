import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/activity
 * Returns recent marketplace activity for the live ticker.
 * Aggregates: new RFQs, new quotes, accepted deals.
 */
export async function GET(request: NextRequest) {
  try {
    const limit = 15;
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // last 7 days

    const [recentRFQs, recentQuotes, recentDeals] = await Promise.all([
      prisma.rFQ.findMany({
        where: { createdAt: { gte: since }, isSeeded: false, isPublic: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { id: true, title: true, category: true, location: true, urgency: true, createdAt: true },
      }),
      prisma.quote.findMany({
        // Exclude concierge-sourced quotes — the public ticker must never
        // present staff-facilitated activity as organic supplier engagement.
        where: { createdAt: { gte: since }, source: 'SELF_SUBMITTED' },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          price: true,
          createdAt: true,
          rfq: { select: { title: true, category: true } },
          supplier: { select: { company: true, location: true } },
        },
      }),
      prisma.quote.findMany({
        where: { status: 'ACCEPTED', updatedAt: { gte: since }, source: 'SELF_SUBMITTED' },
        orderBy: { updatedAt: 'desc' },
        take: 5,
        select: {
          id: true,
          price: true,
          updatedAt: true,
          rfq: { select: { title: true, category: true } },
          supplier: { select: { company: true, location: true } },
        },
      }),
    ]);

    const activities: { text: string; ts: Date; type: string }[] = [];

    recentRFQs.forEach(r => {
      const loc = r.location ? ` · ${r.location}` : '';
      const urgency = r.urgency === 'URGENT' ? '🔴 URGENT: ' : '';
      activities.push({
        text: `${urgency}New RFQ: ${r.title} (${r.category})${loc}`,
        ts: r.createdAt,
        type: 'rfq',
      });
    });

    recentQuotes.forEach(q => {
      const company = q.supplier?.company ?? 'A supplier';
      const cat = q.rfq?.category ?? '';
      const loc = q.supplier?.location ? ` ${q.supplier.location}` : '';
      const price = q.price ? ` ₹${Number(q.price).toLocaleString('en-IN')}` : '';
      activities.push({
        text: `📦 ${company}${loc} quoted${price} for ${cat} RFQ`,
        ts: q.createdAt,
        type: 'quote',
      });
    });

    recentDeals.forEach(d => {
      const company = d.supplier?.company ?? 'Supplier';
      const title = d.rfq?.title ?? 'RFQ';
      const price = d.price ? ` ₹${Number(d.price).toLocaleString('en-IN')}` : '';
      activities.push({
        text: `✅ Deal closed: ${title} with ${company}${price}`,
        ts: d.updatedAt,
        type: 'deal',
      });
    });

    // Sort all events by time, newest first, cap at limit
    const sorted = activities
      .sort((a, b) => b.ts.getTime() - a.ts.getTime())
      .slice(0, limit)
      .map(a => ({ text: a.text, type: a.type, ago: timeAgo(a.ts) }));

    return NextResponse.json({ success: true, activities: sorted, count: sorted.length });
  } catch (error) {
    console.error('[Activity] Error:', error);
    return NextResponse.json({ success: false, activities: [] });
  }
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
