import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isErrorResponse } from '@/lib/admin-auth';
import { getLifeEvents, countLifeEvents } from '@/lib/bom/life-events';
import { projectBomFromLifeEvents } from '@/lib/bom/projections';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if (isErrorResponse(auth)) return auth;

  const userId = request.nextUrl.searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  const [events, total, projection] = await Promise.all([
    getLifeEvents(userId, 50),
    countLifeEvents(userId),
    projectBomFromLifeEvents(userId),
  ]);

  return NextResponse.json({
    success: true,
    total,
    events,
    projection: {
      eventCount: projection.eventCount,
      intents: projection.intents,
      productNames: projection.productNames,
      moduleScores: projection.moduleScores,
      timeline: projection.timeline.slice(-20),
    },
  });
}
