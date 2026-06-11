import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, isErrorResponse } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (isErrorResponse(auth)) return auth;

  const page   = Math.max(1, parseInt(req.nextUrl.searchParams.get('page') ?? '1'));
  const limit  = Math.min(100, parseInt(req.nextUrl.searchParams.get('limit') ?? '50'));
  const action = req.nextUrl.searchParams.get('action');

  const where: any = {};
  if (action) where.action = action;

  const [items, total] = await Promise.all([
    prisma.dataAccessLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.dataAccessLog.count({ where }),
  ]);

  return NextResponse.json({ success: true, items, total, page, limit });
}
