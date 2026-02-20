import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(request.url);
  const page     = parseInt(searchParams.get('page')     || '1');
  const limit    = parseInt(searchParams.get('limit')    || '50');
  const severity = searchParams.get('severity'); // error | warn | critical
  const route    = searchParams.get('route');

  const skip  = (page - 1) * limit;
  const where: any = {};
  if (severity) where.severity = severity;
  if (route)    where.route    = { contains: route, mode: 'insensitive' };

  const [logs, total] = await Promise.all([
    prisma.errorLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.errorLog.count({ where }),
  ]);

  // Group counts by severity for the summary bar
  const [criticalCount, errorCount, warnCount] = await Promise.all([
    prisma.errorLog.count({ where: { severity: 'critical' } }),
    prisma.errorLog.count({ where: { severity: 'error' } }),
    prisma.errorLog.count({ where: { severity: 'warn' } }),
  ]);

  return NextResponse.json({
    logs,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    summary: { critical: criticalCount, error: errorCount, warn: warnCount },
  });
}

export async function DELETE(request: NextRequest) {
  const auth = requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (id) {
    await prisma.errorLog.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Log deleted' });
  }

  // Clear all older than 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const { count } = await prisma.errorLog.deleteMany({
    where: { createdAt: { lt: thirtyDaysAgo } },
  });

  return NextResponse.json({ success: true, message: `Cleared ${count} old logs` });
}
