import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, isErrorResponse, AdminPayload } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

async function resolveAdminUserId(auth: AdminPayload): Promise<string | null> {
  if (auth.userId && auth.userId !== 'system') return auth.userId;
  // Static M2M token path — fall back to first admin user in DB
  const admin = await prisma.user.findFirst({
    where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
    select: { id: true },
    orderBy: { createdAt: 'asc' },
  });
  return admin?.id ?? null;
}

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (isErrorResponse(auth)) return auth;

  const userId = await resolveAdminUserId(auth);
  if (!userId) return NextResponse.json({ success: true, state: {} });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { preferences: true },
  });

  const prefs = user?.preferences as Record<string, unknown> | null;
  const state = (prefs?.flowTestState as Record<string, boolean> | undefined) ?? {};
  return NextResponse.json({ success: true, state });
}

export async function PATCH(req: NextRequest) {
  const auth = requireAdmin(req);
  if (isErrorResponse(auth)) return auth;

  const body  = await req.json().catch(() => ({}));
  const state = body.state as Record<string, boolean> | undefined;
  if (!state || typeof state !== 'object' || Array.isArray(state)) {
    return NextResponse.json({ success: false, error: 'state must be a plain object' }, { status: 400 });
  }

  const userId = await resolveAdminUserId(auth);
  if (!userId) return NextResponse.json({ success: false, error: 'Admin user not found' }, { status: 404 });

  const user    = await prisma.user.findUnique({ where: { id: userId }, select: { preferences: true } });
  const existing = (user?.preferences as Record<string, unknown> | null) ?? {};

  await prisma.user.update({
    where: { id: userId },
    data: { preferences: { ...existing, flowTestState: state } },
  });

  return NextResponse.json({ success: true });
}
