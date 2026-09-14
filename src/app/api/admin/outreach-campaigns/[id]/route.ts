/**
 * H6-13 — Company Profile Claim Outreach: campaign detail + actions.
 * GET  — campaign detail with recipients.
 * POST — action dispatcher (mirrors the H6-12 bulk-wa multi-operation
 *        pattern to avoid growing the route count further — see H6-13
 *        report §D-ENG-05 baseline). body: { action, ...params }
 *
 *   action: 'add-recipients' | 'dry-run' | 'promote' | 'live-send'
 *
 * LIVE is reachable only through 'promote' with an explicit { to: 'LIVE' },
 * and 'live-send' only executes while status is already LIVE — no action
 * here can skip the DRAFT → DRY_RUN → READY → LIVE sequence.
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isErrorResponse } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { addRecipients, runDryRun, promoteCampaign, executeLiveSend } from '@/src/lib/outreach/campaignService';
import type { CampaignStatus } from '@/src/lib/outreach/campaignStateMachine';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAdmin(req);
  if (isErrorResponse(auth)) return auth;

  const campaign = await prisma.outreachCampaign.findUnique({
    where: { id: params.id },
    include: {
      recipients: {
        include: { company: { select: { id: true, company: true, name: true, location: true, isClaimed: true } } },
        orderBy: { createdAt: 'desc' },
        take: 200,
      },
    },
  });

  if (!campaign) return NextResponse.json({ success: false, error: 'Campaign not found' }, { status: 404 });
  return NextResponse.json({ success: true, campaign });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAdmin(req);
  if (isErrorResponse(auth)) return auth;

  const body = await req.json().catch(() => ({}));
  const action = body.action;

  try {
    switch (action) {
      case 'add-recipients': {
        const companyIds: string[] = Array.isArray(body.companyIds) ? body.companyIds.filter((x: unknown) => typeof x === 'string') : [];
        if (companyIds.length === 0) {
          return NextResponse.json({ success: false, error: 'companyIds (non-empty array) required' }, { status: 400 });
        }
        const result = await addRecipients(params.id, companyIds);
        return NextResponse.json({ success: true, ...result });
      }

      case 'dry-run': {
        const summary = await runDryRun(params.id);
        return NextResponse.json({ success: true, summary });
      }

      case 'promote': {
        const to = body.to as CampaignStatus;
        const valid: CampaignStatus[] = ['DRAFT', 'DRY_RUN', 'READY', 'LIVE', 'PAUSED', 'COMPLETED', 'CANCELLED'];
        if (!valid.includes(to)) {
          return NextResponse.json({ success: false, error: `to must be one of ${valid.join(', ')}` }, { status: 400 });
        }
        if (to === 'LIVE' && body.confirm !== true) {
          return NextResponse.json(
            { success: false, error: 'confirm:true is required to promote a campaign to LIVE — this allows real messages to be sent to external recipients.' },
            { status: 400 }
          );
        }
        const campaign = await promoteCampaign(params.id, to, auth.userId);
        return NextResponse.json({ success: true, campaign });
      }

      case 'live-send': {
        if (body.confirm !== true) {
          return NextResponse.json(
            { success: false, error: 'confirm:true is required — this sends real messages to external recipients now.' },
            { status: 400 }
          );
        }
        const campaign = await prisma.outreachCampaign.findUniqueOrThrow({ where: { id: params.id } });
        if (campaign.status !== 'LIVE') {
          return NextResponse.json({ success: false, error: `Campaign must be LIVE to send — current status: ${campaign.status}` }, { status: 409 });
        }
        const summary = await executeLiveSend(params.id);
        return NextResponse.json({ success: true, summary });
      }

      default:
        return NextResponse.json({ success: false, error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : 'Action failed' }, { status: 400 });
  }
}
