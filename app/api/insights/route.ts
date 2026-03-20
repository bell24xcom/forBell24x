import { NextResponse } from 'next/server';
import { getPlatformInsights } from '@/lib/behavior-engine';

export const dynamic = 'force-dynamic';

/**
 * GET /api/insights
 * Returns human-readable behavioral signals + market trends.
 * Used by admin dashboard and optionally Agent Zero.
 */
export async function GET() {
  try {
    const insights = await getPlatformInsights();
    return NextResponse.json({ success: true, ...insights, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('[Insights] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load insights' }, { status: 500 });
  }
}
