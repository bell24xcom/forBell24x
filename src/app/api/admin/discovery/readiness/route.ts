/**
 * Discovery Readiness board API (runtime probes)
 * GET /api/admin/discovery/readiness
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isErrorResponse } from '@/lib/admin-auth';
import {
  buildDiscoveryReadinessBoard,
  discoveryReadinessScoreFromBoard,
} from '@/src/lib/discovery/readiness-probe';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (isErrorResponse(auth)) return auth;

  try {
    const board = await buildDiscoveryReadinessBoard();
    const summary = discoveryReadinessScoreFromBoard(board);
    return NextResponse.json({ success: true, readiness: board, summary });
  } catch (error) {
    console.error('[Discovery Readiness GET]', error);
    return NextResponse.json({ success: false, error: 'Failed to load readiness board' }, { status: 500 });
  }
}
