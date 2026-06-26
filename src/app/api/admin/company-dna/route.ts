import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isErrorResponse } from '@/lib/admin-auth';
import { listCompanyDnaProfiles, syncCompanyDna, getCompanyDnaProfile } from '@/lib/company-dna/engine';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if (isErrorResponse(auth)) return auth;

  const userId = request.nextUrl.searchParams.get('userId');
  if (userId) {
    const profile = await getCompanyDnaProfile(userId);
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found. Run sync first.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, profile });
  }

  const profiles = await listCompanyDnaProfiles();
  return NextResponse.json({ success: true, profiles });
}

export async function POST(request: NextRequest) {
  const auth = requireAdmin(request);
  if (isErrorResponse(auth)) return auth;

  try {
    const body = await request.json().catch(() => ({}));
    const { userId, demo } = body;
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }
    const profile = await syncCompanyDna(userId, !!demo);
    return NextResponse.json({ success: true, profile });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Sync failed' },
      { status: 500 },
    );
  }
}
