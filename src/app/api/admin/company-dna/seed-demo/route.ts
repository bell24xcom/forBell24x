import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isErrorResponse } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { syncCompanyDna } from '@/lib/company-dna/engine';

export const dynamic = 'force-dynamic';

/** Seeds Digitex Studio demo DNA on first available supplier (or specified userId). */
export async function POST(request: NextRequest) {
  const auth = requireAdmin(request);
  if (isErrorResponse(auth)) return auth;

  try {
    const body = await request.json().catch(() => ({}));
    let userId = body.userId as string | undefined;

    if (!userId) {
      const user = await prisma.user.findFirst({
        where: { role: 'SUPPLIER', isActive: true },
        orderBy: { createdAt: 'asc' },
        select: { id: true },
      });
      if (!user) {
        return NextResponse.json({ error: 'No supplier user found to attach demo DNA' }, { status: 404 });
      }
      userId = user.id;
    }

    const profile = await syncCompanyDna(userId, true);
    return NextResponse.json({ success: true, userId, profile });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Demo seed failed' },
      { status: 500 },
    );
  }
}
