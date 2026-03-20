import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/outreach/generate
 * Returns ready-to-send WhatsApp + email messages for top suppliers per category.
 * Designed for MANUAL activation — copy-paste to reach first real suppliers.
 *
 * Query params:
 *   category — filter by category (optional)
 *   limit    — max suppliers per category (default 10)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filterCategory = searchParams.get('category');
    const limit = Math.min(50, parseInt(searchParams.get('limit') || '10'));

    // Get live RFQs to match against
    const liveRFQs = await prisma.rFQ.findMany({
      where: { status: 'OPEN', isSeeded: false, isPublic: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: { id: true, title: true, category: true, location: true, maxBudget: true, quantity: true, urgency: true },
    });

    if (liveRFQs.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No live RFQs found. Create some RFQs first.',
        outreach: [],
      });
    }

    // Group RFQs by category
    const rfqsByCategory = liveRFQs.reduce((acc, rfq) => {
      if (!acc[rfq.category]) acc[rfq.category] = [];
      acc[rfq.category].push(rfq);
      return acc;
    }, {} as Record<string, typeof liveRFQs>);

    const categories = filterCategory
      ? [filterCategory]
      : Object.keys(rfqsByCategory);

    // Find top suppliers (by trustScore, active, claimed)
    const suppliers = await prisma.user.findMany({
      where: {
        role: 'SUPPLIER',
        isClaimed: true,
        isActive: true,
        OR: [{ phone: { not: null } }, { email: { not: null } }],
      },
      orderBy: { trustScore: 'desc' },
      take: 200,
      select: {
        id: true,
        name: true,
        company: true,
        phone: true,
        email: true,
        location: true,
        trustScore: true,
      },
    });

    // Build outreach packets per category
    const outreach = categories.map(category => {
      const categoryRFQs = rfqsByCategory[category] || liveRFQs.slice(0, 3);
      const topRFQ = categoryRFQs[0];
      const topSuppliers = suppliers.slice(0, limit);

      const messages = topSuppliers.map(s => {
        const name = s.name ?? s.company ?? 'there';
        const budget = topRFQ.maxBudget
          ? ` Budget: ₹${Number(topRFQ.maxBudget).toLocaleString('en-IN')}.`
          : '';
        const loc = topRFQ.location ? ` Location: ${topRFQ.location}.` : '';
        const link = `https://www.bell24h.com/rfq/${topRFQ.id}`;

        const whatsapp = `Hi ${name}, we have a live RFQ for *${topRFQ.title}* (${category}).${budget}${loc} Quote directly here — no fees: ${link}`;

        const email = {
          subject: `New RFQ Opportunity: ${topRFQ.title} — Bell24h`,
          body: `Hi ${name},\n\nA buyer on Bell24h is looking for ${topRFQ.title} in ${category}.\n\nQuantity: ${topRFQ.quantity || 'To be discussed'}${budget}${loc}\n\nYou can view full details and submit your quote here:\n${link}\n\nThis is free to quote during our beta phase.\n\n— Bell24h Team\nhttps://www.bell24h.com`,
        };

        const waLink = s.phone
          ? `https://wa.me/91${s.phone.replace(/\D/g, '')}?text=${encodeURIComponent(whatsapp)}`
          : null;

        return {
          supplierId: s.id,
          name: s.name ?? 'Unknown',
          company: s.company ?? 'Unknown',
          phone: s.phone,
          email: s.email,
          location: s.location,
          trustScore: s.trustScore,
          whatsapp,
          waLink,
          email: email,
        };
      });

      return {
        category,
        rfqCount: categoryRFQs.length,
        featuredRFQ: { id: topRFQ.id, title: topRFQ.title, link: `https://www.bell24h.com/rfq/${topRFQ.id}` },
        suppliers: messages,
      };
    });

    return NextResponse.json({
      success: true,
      generated: new Date().toISOString(),
      totalSuppliers: suppliers.length,
      totalLiveRFQs: liveRFQs.length,
      outreach,
      tip: 'Copy whatsapp messages and send manually. Use waLink to open WhatsApp directly.',
    });
  } catch (error) {
    console.error('[Outreach] Generate error:', error);
    return NextResponse.json({ success: false, error: 'Failed to generate outreach' }, { status: 500 });
  }
}
