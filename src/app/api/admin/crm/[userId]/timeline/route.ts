/**
 * Per-company CRM Journey timeline API
 * GET /api/admin/crm/[userId]/timeline
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isErrorResponse } from '@/lib/admin-auth';
import { buildCrmJourney } from '@/src/lib/crm/company-timeline';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } },
) {
  const auth = requireAdmin(req);
  if (isErrorResponse(auth)) return auth;

  try {
    const limit = Math.min(200, parseInt(req.nextUrl.searchParams.get('limit') || '100', 10));
    const journey = await buildCrmJourney(params.userId, limit);
    if (!journey) {
      return NextResponse.json({ success: false, message: 'Company not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, ...journey });
  } catch (error) {
    console.error('[CRM timeline GET]', error);
    return NextResponse.json({ success: false, message: 'Failed to load timeline' }, { status: 500 });
  }
}
