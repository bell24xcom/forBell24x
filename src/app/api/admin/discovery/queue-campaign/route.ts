/**
 * Discovery → Campaign bridge
 * POST /api/admin/discovery/queue-campaign
 * Body: { campaignId: string, companyIds: string[] }
 *
 * Queues discovered suppliers into a DRAFT outreach campaign.
 * Does not invoke WhatsApp send logic.
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isErrorResponse } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { addRecipients } from '@/src/lib/outreach/campaignService';
import { logDiscoveryEvent } from '@/src/lib/discovery/events';
import { DISCOVERY_IMPORTED_FROM_PREFIX } from '@/src/lib/discovery/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if (isErrorResponse(auth)) return auth;

  try {
    const body = await req.json().catch(() => ({}));
    const campaignId = typeof body.campaignId === 'string' ? body.campaignId : '';
    const companyIds: string[] = Array.isArray(body.companyIds) ? body.companyIds.filter((id: unknown) => typeof id === 'string') : [];

    if (!campaignId) {
      return NextResponse.json({ success: false, error: 'campaignId is required' }, { status: 400 });
    }
    if (companyIds.length === 0) {
      return NextResponse.json({ success: false, error: 'companyIds array is required' }, { status: 400 });
    }
    if (companyIds.length > 200) {
      return NextResponse.json({ success: false, error: 'Maximum 200 companies per request' }, { status: 400 });
    }

    const campaign = await prisma.outreachCampaign.findUnique({ where: { id: campaignId } });
    if (!campaign) {
      return NextResponse.json({ success: false, error: 'Campaign not found' }, { status: 404 });
    }
    if (campaign.status !== 'DRAFT') {
      return NextResponse.json(
        { success: false, error: `Campaign must be DRAFT (current: ${campaign.status})` },
        { status: 400 },
      );
    }

    // Verify all IDs are discovered suppliers
    const validCompanies = await prisma.user.findMany({
      where: {
        id: { in: companyIds },
        role: 'SUPPLIER',
        OR: [
          { importedFrom: { startsWith: DISCOVERY_IMPORTED_FROM_PREFIX } },
          { importedFrom: 'admin_import' },
        ],
      },
      select: { id: true },
    });
    const validIds = validCompanies.map((c) => c.id);
    if (validIds.length === 0) {
      return NextResponse.json({ success: false, error: 'No valid discovered suppliers in companyIds' }, { status: 400 });
    }

    const result = await addRecipients(campaignId, validIds);
    for (const id of validIds) {
      logDiscoveryEvent('outreach_queued', {
        userId: id,
        metadata: { campaignId, source: 'discovery_queue_bridge' },
      });
    }

    return NextResponse.json({
      success: true,
      campaignId,
      queued: result.added,
      requested: companyIds.length,
      valid: validIds.length,
      message: `Queued ${result.added} suppliers into campaign "${campaign.name}"`,
    });
  } catch (error) {
    console.error('[Discovery queue-campaign]', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Queue failed' },
      { status: 500 },
    );
  }
}
