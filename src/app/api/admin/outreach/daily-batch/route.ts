import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, isErrorResponse } from '@/lib/admin-auth';
import { randomUUID } from 'crypto';
import { SITE_URL } from '@/lib/site-url';
import { buildClaimWhatsAppMessage } from '@/src/lib/outreach/waMessage';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const auth = requireAdmin(request);
  if (isErrorResponse(auth)) return auth;

  try {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

    const suppliers = await prisma.user.findMany({
      where: {
        role: 'SUPPLIER',
        isClaimed: false,
        outreachCount: { lt: 3 },
        OR: [
          { lastOutreachAt: null },
          { lastOutreachAt: { lt: twoDaysAgo } },
        ],
        phone: { not: null },
      },
      orderBy: { trustScore: 'desc' },
      take: 20,
      select: {
        id: true,
        name: true,
        company: true,
        phone: true,
        email: true,
        location: true,
        trustScore: true,
        outreachCount: true,
      },
    });

    if (suppliers.length === 0) {
      return NextResponse.json({
        success: true,
        count: 0,
        message: 'No eligible suppliers — all contacted recently or all claimed.',
        suppliers: [],
      });
    }

    const results = [];

    for (const supplier of suppliers) {
      const token = randomUUID();
      const claimLink = `${SITE_URL}/claim/${token}`;
      const phone = supplier.phone?.replace(/\D/g, '').slice(-10) || '';
      // company falls back to the person's name (not a generic placeholder)
      // for display purposes — the message text itself uses
      // buildClaimWhatsAppMessage(), which never quotes a fallback string.
      const companyName = supplier.company || supplier.name || null;

      const msg = encodeURIComponent(buildClaimWhatsAppMessage(companyName, claimLink));

      const waLink = phone.length === 10
        ? `https://wa.me/91${phone}?text=${msg}`
        : null;

      await prisma.user.update({
        where: { id: supplier.id },
        data: {
          claimToken: token,
          claimSentAt: new Date(),
          outreachCount: { increment: 1 },
          lastOutreachAt: new Date(),
        },
      });

      results.push({
        id: supplier.id,
        name: supplier.name,
        company: companyName,
        phone: supplier.phone,
        email: supplier.email,
        location: supplier.location,
        trustScore: supplier.trustScore,
        claimLink,
        waLink,
      });
    }

    return NextResponse.json({
      success: true,
      count: results.length,
      suppliers: results,
    });
  } catch (error) {
    console.error('Daily batch error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to generate batch' },
      { status: 500 }
    );
  }
}
