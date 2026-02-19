/**
 * Admin Control Panel API
 * GET  /api/admin/control-panel — plan feature definitions + plan distribution stats
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PLANS, isValidGST, isValidUdyam } from '@/lib/plans';
import { requireAdmin, isErrorResponse } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if (isErrorResponse(auth)) return auth;

  try {
    // Plan distribution from real DB
    const planDist = await prisma.user.groupBy({
      by: ['plan'],
      _count: { _all: true },
      _avg: { trustScore: true },
    });

    const planStats = Object.fromEntries(
      planDist.map(p => [p.plan, {
        count: p._count._all,
        avgTrustScore: Math.round(p._avg.trustScore ?? 0),
      }])
    );

    // KYC completion stats
    const [gstCount, udyamCount, bothCount, verifiedCount] = await Promise.all([
      prisma.user.count({ where: { gstNumber: { not: null } } }),
      prisma.user.count({ where: { udyamNumber: { not: null } } }),
      prisma.user.count({ where: { gstNumber: { not: null }, udyamNumber: { not: null } } }),
      prisma.user.count({ where: { isVerified: true } }),
    ]);

    // Trust score distribution
    const [score0_30, score31_60, score61_80, score81_100] = await Promise.all([
      prisma.user.count({ where: { trustScore: { lte: 30 } } }),
      prisma.user.count({ where: { trustScore: { gt: 30, lte: 60 } } }),
      prisma.user.count({ where: { trustScore: { gt: 60, lte: 80 } } }),
      prisma.user.count({ where: { trustScore: { gt: 80 } } }),
    ]);

    return NextResponse.json({
      success: true,
      plans: PLANS,
      planStats: {
        FREE:       planStats['FREE']       ?? { count: 0, avgTrustScore: 0 },
        PRO:        planStats['PRO']        ?? { count: 0, avgTrustScore: 0 },
        ENTERPRISE: planStats['ENTERPRISE'] ?? { count: 0, avgTrustScore: 0 },
      },
      kyc: {
        gstProvided:   gstCount,
        udyamProvided: udyamCount,
        bothProvided:  bothCount,
        verified:      verifiedCount,
      },
      trustDistribution: {
        '0-30':   score0_30,
        '31-60':  score31_60,
        '61-80':  score61_80,
        '81-100': score81_100,
      },
      validators: {
        gstExample:   '27AAPFU0939F1ZV',
        udyamExample: 'UDYAM-MH-03-0123456',
        gstPattern:   '^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$',
        udyamPattern: '^UDYAM-[A-Z]{2}-\\d{2}-\\d{7}$',
      },
    });
  } catch (error) {
    console.error('Control panel GET error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch control panel data' }, { status: 500 });
  }
}
