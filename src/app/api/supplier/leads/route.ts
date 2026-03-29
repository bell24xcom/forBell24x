import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

/**
 * GET /api/supplier/leads
 *
 * Returns public, active RFQs as "leads" for suppliers to browse.
 * Buyer contact details are hidden by default; suppliers can unlock via /api/leads/unlock.
 */
export async function GET(request: NextRequest) {
  try {
    const token =
      request.cookies.get('auth-token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }

    const supplierId = payload.userId;

    // Fetch public, open RFQs
    const rfqs = await prisma.rFQ.findMany({
      where: {
        isPublic: true,
        status: { in: ['OPEN', 'ACTIVE'] },
        NOT: { createdBy: supplierId }, // Don't show supplier's own RFQs
      },
      include: {
        user: { select: { name: true, company: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // Check which RFQs this supplier has unlocked (stored in LeadSupplier using rfqId as leadId)
    const unlockedLeads = await prisma.leadSupplier.findMany({
      where: { supplierId, unlocked: true },
      select: { leadId: true },
    });
    const unlockedSet = new Set(unlockedLeads.map(l => l.leadId));

    // Fetch supplier's credit balance
    const userCredits = await prisma.userCredits.findUnique({
      where: { userId: supplierId },
    });

    const leads = rfqs.map(rfq => {
      const isUnlocked = unlockedSet.has(rfq.id);
      return {
        id: rfq.id,
        category: rfq.category || 'General',
        product: rfq.title,
        quantity: rfq.quantity,
        budget: rfq.maxBudget ? Number(rfq.maxBudget) : null,
        buyerName: isUnlocked ? (rfq.user?.name || 'Buyer') : '••• •••••',
        buyerCompany: isUnlocked ? (rfq.user?.company || null) : '••••••• •••',
        buyerEmail: null, // Not stored on RFQ user select
        buyerPhone: null,
        description: rfq.description,
        urgency: rfq.urgency,
        location: rfq.location,
        status: 'new',
        createdAt: rfq.createdAt.toISOString(),
        contactHidden: !isUnlocked,
        unlocked: isUnlocked,
      };
    });

    return NextResponse.json({
      success: true,
      leads,
      credits: userCredits?.credits ?? 0,
    });
  } catch (error) {
    console.error('[Supplier Leads] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
  }
}
