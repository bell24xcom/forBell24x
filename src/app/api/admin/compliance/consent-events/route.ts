import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, isErrorResponse } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (isErrorResponse(auth)) return auth;

  const page  = Math.max(1, parseInt(req.nextUrl.searchParams.get('page') ?? '1'));
  const limit = Math.min(100, parseInt(req.nextUrl.searchParams.get('limit') ?? '50'));
  const purpose  = req.nextUrl.searchParams.get('purpose');
  const granted  = req.nextUrl.searchParams.get('granted');

  const where: any = {};
  if (purpose) where.purpose = purpose;
  if (granted !== null && granted !== '') where.granted = granted === 'true';

  const [items, total] = await Promise.all([
    prisma.consentEvent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.consentEvent.count({ where }),
  ]);

  await prisma.dataAccessLog.create({
    data: { adminUserId: auth.userId, action: 'VIEW', entity: 'ConsentEvent', entityId: 'list' },
  }).catch(() => {});

  return NextResponse.json({ success: true, items, total, page, limit });
}
