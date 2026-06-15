/**
 * GET /api/insforge/status
 *
 * Previously checked InsForge connectivity.
 * InsForge project was paused (Jun 2026); campaign_rules migrated to Neon.
 * Now returns Neon/Prisma connectivity status so existing monitoring dashboards
 * continue to get a useful health signal from this endpoint.
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Lightweight ping — count campaign rules (new table, fast)
    const ruleCount = await prisma.campaignRule.count();

    return NextResponse.json({
      connected:  true,
      configured: true,
      provider:   'neon-postgresql',
      message:    'Marketing automation is running on Neon PostgreSQL (migrated from InsForge Jun 2026).',
      campaignRules: ruleCount,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      {
        connected:  false,
        configured: true,
        provider:   'neon-postgresql',
        message:    `Database connection error: ${message}`,
      },
      { status: 503 }
    );
  }
}
