import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isErrorResponse } from '@/lib/admin-auth';
import { generateMorningBrief } from '@/src/lib/bom/morning-brief';
import { projectBomFromLifeEvents } from '@/src/lib/bom/projections';
import { computeBusinessGenome } from '@/src/lib/bom/genome-score';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if (isErrorResponse(auth)) return auth;

  const userId = request.nextUrl.searchParams.get('userId');
  const useAi = request.nextUrl.searchParams.get('ai') === '1';

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  try {
    const brief = await generateMorningBrief(userId, useAi);
    const projection = await projectBomFromLifeEvents(userId);
    const genome = computeBusinessGenome(projection);

    return NextResponse.json({ success: true, brief, genome });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Brief failed' },
      { status: 500 },
    );
  }
}
