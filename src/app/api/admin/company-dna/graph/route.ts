import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isErrorResponse } from '@/lib/admin-auth';
import { getDnaGraphForUser } from '@/lib/company-dna/engine';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if (isErrorResponse(auth)) return auth;

  const userId = request.nextUrl.searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ error: 'userId query param required' }, { status: 400 });
  }

  const graph = await getDnaGraphForUser(userId);
  if (!graph) {
    return NextResponse.json({ error: 'No DNA graph. Sync profile first.' }, { status: 404 });
  }

  return NextResponse.json({ success: true, graph });
}
