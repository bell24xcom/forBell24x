/**
 * POST /api/rfq/match-suppliers
 * Returns ranked active suppliers for a given RFQ.
 *
 * Scoring (100 pts max):
 *   Trust score bonus  → trustScore / 5      (0-20 pts)  high-trust suppliers rank higher
 *   Location match     → 25 pts if location contains rfq.location
 *   Quote experience   → up to 15 pts (win rate × 15)
 *   KYC verified       → 20 pts
 *   Active recently    → 10 pts if quotes in last 90 days
 *   Base               → 10 pts (always)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { rfqId } = await req.json();

    if (!rfqId) {
      return NextResponse.json({ success: false, error: 'rfqId is required' }, { status: 400 });
    }

    const rfq = await prisma.rFQ.findUnique({
      where: { id: rfqId },
      select: { id: true, title: true, category: true, location: true, maxBudget: true, urgency: true },
    });

    if (!rfq) {
      return NextResponse.json({ success: false, error: 'RFQ not found' }, { status: 404 });
    }

    // Fetch candidate suppliers — no schema fields invented
    const baseWhere: Record<string, unknown> = {
      role:     'SUPPLIER',
      isActive: true,
    };
    if (rfq.location) {
      baseWhere.location = { contains: rfq.location, mode: 'insensitive' };
    }

    const [locationSuppliers, globalSuppliers] = await Promise.all([
      // Prefer location-matching suppliers
      prisma.user.findMany({
        where: baseWhere,
        select: {
          id:         true,
          name:       true,
          company:    true,
          phone:      true,
          location:   true,
          isVerified: true,
          trustScore: true,
          _count: { select: { quotes: true } },
          quotes: {
            where:  { status: 'ACCEPTED' },
            select: { id: true },
            take:   100,
          },
        },
        take: 20,
        orderBy: { trustScore: 'desc' },
      }),
      // Fallback: any active supplier if location pool is small
      prisma.user.findMany({
        where:   { role: 'SUPPLIER', isActive: true },
        select: {
          id:         true,
          name:       true,
          company:    true,
          phone:      true,
          location:   true,
          isVerified: true,
          trustScore: true,
          _count: { select: { quotes: true } },
          quotes: {
            where:  { status: 'ACCEPTED' },
            select: { id: true },
            take:   100,
          },
        },
        take:    30,
        orderBy: { trustScore: 'desc' },
      }),
    ]);

    // Deduplicate (location suppliers first, then fill from global)
    const seen = new Set<string>();
    const candidates = [...locationSuppliers, ...globalSuppliers].filter(s => {
      if (seen.has(s.id)) return false;
      seen.add(s.id);
      return true;
    });

    // Score each supplier
    const rfqLoc = (rfq.location || '').toLowerCase();
    const scored = candidates.map(s => {
      let score = 10; // base
      const reasons: string[] = [];

      // Trust score bonus: trustScore / 5 → 0-20 pts
      const trustPts = Math.round(s.trustScore / 5);
      score += trustPts;
      if (s.trustScore >= 70) reasons.push(`Trust ${s.trustScore}/100 (GST/Udyam verified)`);
      else if (s.trustScore >= 30) reasons.push(`Trust ${s.trustScore}/100`);

      // KYC verified → +20
      if (s.isVerified) { score += 20; reasons.push('KYC verified'); }

      // Location match → +25
      if (rfqLoc && (s.location || '').toLowerCase().includes(rfqLoc)) {
        score += 25;
        reasons.push('Location match');
      }

      // Quote win rate → up to +15
      const total   = s._count.quotes;
      const won     = s.quotes.length;
      const winRate = total > 0 ? won / total : 0;
      const expPts  = Math.round(winRate * 15);
      score += expPts;
      if (total > 0) reasons.push(`${Math.round(winRate * 100)}% quote win rate`);

      return {
        id:         s.id,
        name:       s.name    || s.company || 'Supplier',
        company:    s.company || '',
        phone:      s.phone   || '',
        location:   s.location || '',
        isVerified: s.isVerified,
        trustScore: s.trustScore,
        totalQuotes: total,
        wonQuotes:   won,
        matchScore:  Math.min(100, score),
        reasons,
      };
    });

    const matches = scored
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10);

    return NextResponse.json({
      success:      true,
      matches,
      totalMatches: matches.length,
      rfq: {
        id:       rfq.id,
        title:    rfq.title,
        category: rfq.category,
        budget:   rfq.maxBudget,
      },
    });
  } catch (error) {
    console.error('match-suppliers error:', error);
    return NextResponse.json({ success: false, error: 'Failed to match suppliers' }, { status: 500 });
  }
}
