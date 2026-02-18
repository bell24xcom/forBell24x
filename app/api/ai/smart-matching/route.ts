import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/jwt';
import { aiClient } from '@/lib/ai-client';

const prisma = new PrismaClient();

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
        id: true,
        name: true,
        company: true,
        location: true,
        isVerified: true,
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

    // Build supplier summaries for AI
    const supplierSummaries = suppliers.map(s => {
      const total = s.quotes.length;
      const won = s.quotes.filter(q => q.status === 'ACCEPTED').length;
      const rate = total > 0 ? Math.round((won / total) * 100) : 0;
      return {
        id: s.id,
        name: s.name || s.company || 'Supplier',
        company: s.company || '',
        location: s.location || 'Unknown',
        isVerified: s.isVerified,
        totalQuotes: total,
        wonQuotes: won,
        successRate: rate,
      };
    });

    // Ask AI to rank top 5
    let rankedIds: string[] = [];
    const reasonMap: Record<string, string> = {};

    try {
      const prompt = `You are a B2B procurement matching engine. Given this RFQ:\n- Title: "${rfqTitle || rfqCategory}"\n- Category: ${rfqCategory}\n- Location preference: ${rfqLocation || 'Any'}\n- Budget: ₹${rfqBudget || 'Not specified'}\n\nSupplier pool:\n${supplierSummaries.map((s, i) => `${i + 1}. ID:${s.id} | ${s.company || s.name} | Loc:${s.location} | Verified:${s.isVerified} | SuccessRate:${s.successRate}%`).join('\n')}\n\nReturn a JSON array of top 5 supplier IDs with reasons:\n[{"id":"...","reason":"..."},...]`;

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

    // Fallback: sort by successRate if AI failed
    if (rankedIds.length === 0) {
      rankedIds = supplierSummaries
        .sort((a, b) => {
          const locA = a.location.toLowerCase().includes(rfqLocation.toLowerCase()) ? 1 : 0;
          const locB = b.location.toLowerCase().includes(rfqLocation.toLowerCase()) ? 1 : 0;
          return (b.isVerified ? 1 : 0) + b.successRate / 100 + locB -
                 ((a.isVerified ? 1 : 0) + a.successRate / 100 + locA);
        })
        .slice(0, 5)
        .map(s => s.id);
    }

    const matches = rankedIds
      .slice(0, 5)
      .map(id => {
        const s = supplierSummaries.find(x => x.id === id);
        if (!s) return null;
        return {
          supplier: s,
          matchScore: s.isVerified ? 90 - rankedIds.indexOf(id) * 5 : 75 - rankedIds.indexOf(id) * 5,
          reason: reasonMap[id] || `Matches ${rfqCategory} category requirements`,
        };
      })
      .filter(Boolean);

    return NextResponse.json({ success: true, matches });
  } catch (error) {
    console.error('Smart matching error:', error);
    return NextResponse.json({ success: false, error: 'Smart matching failed' }, { status: 500 });
  }
}
