/**
 * GET  /api/admin/feature-flags    — list all flags
 * PATCH /api/admin/feature-flags   — toggle { id, enabled }
 * Protected — requires admin-token cookie.
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, isErrorResponse } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (isErrorResponse(auth)) return auth;

  try {
    const flags = await prisma.featureFlag.findMany({ orderBy: { key: 'asc' } });
    return NextResponse.json({ success: true, flags });
  } catch (error) {
    console.error('[FeatureFlags] GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load flags' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const auth = requireAdmin(req);
  if (isErrorResponse(auth)) return auth;

  try {
    const { id, enabled } = await req.json();
    if (!id || typeof enabled !== 'boolean') {
      return NextResponse.json({ success: false, error: 'Missing id or enabled' }, { status: 400 });
    }
    const updated = await prisma.featureFlag.update({
      where: { id },
      data:  { enabled },
    });
    return NextResponse.json({ success: true, flag: updated });
  } catch (error) {
    console.error('[FeatureFlags] PATCH error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update flag' }, { status: 500 });
  }
}
