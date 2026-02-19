import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { aiClient } from '@/lib/ai-client';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const token =
      request.cookies.get('auth-token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ success: false, error: 'Invalid session' }, { status: 401 });
    }

    const body = await request.json();
    const { rfqId, category, location, budget } = body;

    let rfqTitle = '';
    let rfqCategory = category || '';
    let rfqLocation = location || '';
    let rfqBudget = budget || 0;

    // If rfqId provided, load RFQ data
    if (rfqId) {
      const rfq = await prisma.rFQ.findUnique({
        where: { id: rfqId },
        select: { title: true, category: true, location: true, maxBudget: true },
      });
      if (!rfq) {
        return NextResponse.json({ success: false, error: 'RFQ not found' }, { status: 404 });
      }
      rfqTitle = rfq.title;
      rfqCategory = rfq.category || rfqCategory;
      rfqLocation = rfq.location || rfqLocation;
      rfqBudget = rfq.maxBudget || rfqBudget;
    }

    if (!rfqCategory) {
      return NextResponse.json(
        { success: false, error: 'category is required' },
        { status: 400 }
      );
    }

    // Fetch active verified suppliers
    const suppliers = await prisma.user.findMany({
      where: {
        role: 'SUPPLIER',
        isActive: true,
      },
      select: {
        id:         true,
        name:       true,
        company:    true,
        location:   true,
        isVerified: true,
        trustScore: true,   // 0-100 — used in match scoring
        quotes: {
          select: { status: true },
          take: 50,
        },
      },
      take: 30,
    });

    if (suppliers.length === 0) {
      return NextResponse.json({ success: true, matches: [] });
    }

    // Build supplier summaries for AI + fallback scoring
    const supplierSummaries = suppliers.map(s => {
      const total       = s.quotes.length;
      const won         = s.quotes.filter(q => q.status === 'ACCEPTED').length;
      const successRate = total > 0 ? Math.round((won / total) * 100) : 0;
      return {
        id:          s.id,
        name:        s.name    || s.company || 'Supplier',
        company:     s.company || '',
        location:    s.location || 'Unknown',
        isVerified:  s.isVerified,
        trustScore:  s.trustScore,  // 0-100
        totalQuotes: total,
        wonQuotes:   won,
        successRate,
      };
    });

    // Ask AI to rank top 5
    let rankedIds: string[] = [];
    const reasonMap: Record<string, string> = {};

    try {
      const prompt = [
        `You are a B2B procurement matching engine. Given this RFQ:`,
        `- Title: "${rfqTitle || rfqCategory}"`,
        `- Category: ${rfqCategory}`,
        `- Location preference: ${rfqLocation || 'Any'}`,
        `- Budget: ₹${rfqBudget || 'Not specified'}`,
        ``,
        `Supplier pool:`,
        ...supplierSummaries.map((s, i) =>
          `${i + 1}. ID:${s.id} | ${s.company || s.name} | Loc:${s.location} | Verified:${s.isVerified} | Trust:${s.trustScore}/100 | SuccessRate:${s.successRate}%`
        ),
        ``,
        `Trust score indicates: 70+ = GST/Udyam verified (high credibility). Weight it heavily.`,
        `Return JSON array of top 5: [{"id":"...","reason":"..."},...]`,
      ].join('\n');

      const aiResponse = await aiClient.createChatCompletion('text', [
        { role: 'system', content: 'You are a B2B supplier matching assistant. Always return valid JSON.' },
        { role: 'user', content: prompt },
      ], { maxTokens: 600, temperature: 0.5 });

      const content = aiResponse.choices?.[0]?.message?.content || '';
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed: Array<{ id: string; reason: string }> = JSON.parse(jsonMatch[0]);
        rankedIds = parsed.map(p => p.id);
        parsed.forEach(p => { reasonMap[p.id] = p.reason; });
      }
    } catch (aiErr) {
      console.warn('AI ranking unavailable, using algorithmic fallback:', aiErr);
    }

    // ── Algorithmic fallback — trust score integrated ──────────────────────
    // rankScore formula:
    //   successRate / 100   → 0–1   (win rate)
    //   isVerified ? 1 : 0  → 0 or 1
    //   trustScore / 20     → 0–5   (up to +5 bonus for high-trust suppliers)
    //   location match      → +0.5
    if (rankedIds.length === 0) {
      rankedIds = supplierSummaries
        .map(s => ({
          id: s.id,
          rankScore:
            s.successRate / 100 +
            (s.isVerified ? 1 : 0) +
            s.trustScore / 20 +
            (rfqLocation && s.location.toLowerCase().includes(rfqLocation.toLowerCase()) ? 0.5 : 0),
        }))
        .sort((a, b) => b.rankScore - a.rankScore)
        .slice(0, 5)
        .map(s => s.id);
    }

    const matches = rankedIds
      .slice(0, 5)
      .map((id, rank) => {
        const s = supplierSummaries.find(x => x.id === id);
        if (!s) return null;
        // Trust bonus: up to +5 on top of base score
        const base       = s.isVerified ? 90 : 75;
        const trustBonus = Math.round(s.trustScore / 20);
        return {
          supplier:   s,
          matchScore: Math.max(0, base + trustBonus - rank * 5),
          reason:     reasonMap[id] || `Matches ${rfqCategory} requirements · Trust ${s.trustScore}/100`,
        };
      })
      .filter(Boolean);

    return NextResponse.json({ success: true, matches });
  } catch (error) {
    console.error('Smart matching error:', error);
    return NextResponse.json({ success: false, error: 'Smart matching failed' }, { status: 500 });
  }
}
