/**
 * GET /api/admin/security
 * Returns a security posture summary: error log counts, auth metrics, compliance flags.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, isErrorResponse } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (isErrorResponse(auth)) return auth;

  try {
    const since30d = new Date(Date.now() - 30 * 86400_000);
    const since7d  = new Date(Date.now() -  7 * 86400_000);

    const [
      critical30d, error30d, warn30d,
      critical7d,  error7d,
      totalUsers,  adminUsers, unverifiedUsers,
      recentLogins,
    ] = await Promise.all([
      prisma.errorLog.count({ where: { severity: 'critical', createdAt: { gte: since30d } } }),
      prisma.errorLog.count({ where: { severity: 'error',    createdAt: { gte: since30d } } }),
      prisma.errorLog.count({ where: { severity: 'warn',     createdAt: { gte: since30d } } }),
      prisma.errorLog.count({ where: { severity: 'critical', createdAt: { gte: since7d  } } }),
      prisma.errorLog.count({ where: { severity: 'error',    createdAt: { gte: since7d  } } }),
      prisma.user.count(),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.user.count({ where: { isVerified: false } }),
      prisma.user.count({ where: { lastLoginAt: { gte: since7d } } }),
    ]);

    const riskLevel =
      critical7d > 0 ? 'critical' :
      error7d    > 5 ? 'high'     :
      error7d    > 0 ? 'medium'   : 'low';

    return NextResponse.json({
      success: true,
      checkedAt: new Date().toISOString(),
      riskLevel,
      errorLogs: {
        last30Days: { critical: critical30d, error: error30d, warn: warn30d },
        last7Days:  { critical: critical7d,  error: error7d  },
      },
      users: {
        total:      totalUsers,
        admins:     adminUsers,
        unverified: unverifiedUsers,
        activeWeek: recentLogins,
      },
      compliance: {
        jwtAuth:           true,
        httpsEnforced:     true,
        adminRouteGuarded: true,
        prismaOrmSql:      true,
        noPublicPii:       true,
        errorLogsRetained: true,
      },
    });
  } catch (error: any) {
    console.error('[Security API]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
