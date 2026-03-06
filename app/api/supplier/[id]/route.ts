import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supplierId = params.id;

    const [userRecord, wonQuotes, totalQuotes, dealsCompleted] = await Promise.all([
      prisma.user.findUnique({
        where: { id: supplierId },
        select: {
          id: true,
          name: true,
          company: true,
          location: true,
          gstNumber: true,
          createdAt: true,
          preferences: true,
          _count: { select: { quotes: true } },
        },
      }),
      prisma.quote.count({ where: { supplierId, status: 'ACCEPTED' } }),
      prisma.quote.count({ where: { supplierId } }),
      prisma.deal.count({ where: { supplierId, status: 'COMPLETED' } }),
    ]);

    if (!userRecord) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
    }

    // Profile completeness
    let profileComplete = 0;
    if (userRecord.name) profileComplete += 20;
    if (userRecord.company) profileComplete += 20;
    if (userRecord.gstNumber) profileComplete += 20;
    if (userRecord.location) profileComplete += 20;
    profileComplete += 20; // base for being registered

    const gstVerified = !!userRecord.gstNumber;
    const responseRate = totalQuotes > 0 ? Math.round((wonQuotes / totalQuotes) * 100) : 0;

    let trustScore = 0;
    trustScore += gstVerified ? 30 : 0;
    trustScore += Math.round(profileComplete * 0.25);
    trustScore += totalQuotes > 0 ? Math.min(Math.round((wonQuotes / totalQuotes) * 25), 25) : 0;
    trustScore += Math.min(dealsCompleted * 4, 20);

    const preferences = userRecord.preferences as { categories?: string[]; cities?: string[] } | null;

    return NextResponse.json({
      success: true,
      supplier: {
        id: userRecord.id,
        name: userRecord.name,
        company: userRecord.company,
        location: userRecord.location,
        gstVerified,
        trustScore,
        profileComplete,
        responseRate,
        dealsCompleted,
        wonQuotes,
        totalQuotes,
        createdAt: userRecord.createdAt,
        preferences: {
          categories: preferences?.categories || [],
          cities: preferences?.cities || [],
        },
      },
    });
  } catch (error) {
    console.error('Public supplier API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
