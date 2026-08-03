import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizeProducts, type SupplierPreferences } from '@/src/lib/supplier-products';
import { getTrustScore } from '@/src/lib/trust-score';

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
          trustScore: true,
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
    const trustScore = getTrustScore(userRecord);

    const preferences = userRecord.preferences as SupplierPreferences | null;
    const products = normalizeProducts(preferences?.products);
    const description = preferences?.description;

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
        description: description ?? null,
        products,
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
