/**
 * GET /api/stats/public
 * Returns live platform stats for homepage display.
 * No authentication required — public endpoint.
 * Results cached for 60s via Next.js revalidate.
 */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 60; // cache 60 seconds

export async function GET() {
  try {
    const [suppliers, totalRFQs, categories] = await Promise.all([
      prisma.user.count({ where: { role: 'SUPPLIER', isActive: true } }),
      prisma.rFQ.count({ where: { status: { in: ['ACTIVE', 'QUOTED', 'ACCEPTED', 'COMPLETED'] } } }),
      prisma.category.count({ where: { isActive: true } }),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        suppliers,
        rfqs:       totalRFQs,
        categories: categories || 19, // fallback if table empty
      },
    });
  } catch {
    // Fail gracefully — homepage still shows (with fallback values)
    return NextResponse.json({
      success: true,
      stats: { suppliers: 0, rfqs: 0, categories: 19 },
    });
  }
}
