/**
 * H6-13 — Company Profile Claim Outreach: campaign list + create.
 * GET  — list campaigns with recipient-state aggregate counts.
 * POST — create a campaign. Always created DRAFT — LIVE is unreachable here.
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isErrorResponse } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { createCampaign, findCandidateCompanies } from '@/src/lib/outreach/campaignService';
import { renderClaimTemplate, DEFAULT_CLAIM_TEMPLATE } from '@/src/lib/outreach/messageTemplate';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (isErrorResponse(auth)) return auth;

  // ?candidates=1 — Admin UI's "select eligible businesses" picker (Phase 12).
  if (req.nextUrl.searchParams.get('candidates') === '1') {
    const limit = Number(req.nextUrl.searchParams.get('limit')) || 50;
    const candidates = await findCandidateCompanies(limit);
    return NextResponse.json({ success: true, candidates });
  }

  const campaigns = await prisma.outreachCampaign.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { recipients: true } } },
  });

  const withCounts = await Promise.all(
    campaigns.map(async (c) => {
      const grouped = await prisma.outreachRecipient.groupBy({
        by: ['state'],
        where: { campaignId: c.id },
        _count: { _all: true },
      });
      const counts = Object.fromEntries(grouped.map(g => [g.state, g._count._all]));
      return { ...c, recipientCounts: counts };
    })
  );

  return NextResponse.json({ success: true, campaigns: withCounts });
}

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if (isErrorResponse(auth)) return auth;

  const body = await req.json().catch(() => ({}));
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const channel = body.channel;
  const description = typeof body.description === 'string' ? body.description.trim() : undefined;
  const messageTemplate = typeof body.messageTemplate === 'string' && body.messageTemplate.trim()
    ? body.messageTemplate.trim()
    : DEFAULT_CLAIM_TEMPLATE;

  if (!name) return NextResponse.json({ success: false, error: 'name is required' }, { status: 400 });
  if (!['WHATSAPP', 'EMAIL', 'SMS'].includes(channel)) {
    return NextResponse.json({ success: false, error: 'channel must be WHATSAPP, EMAIL, or SMS' }, { status: 400 });
  }

  // Fail fast on an unsendable template rather than letting a bad campaign
  // reach dry-run before the operator discovers the truthfulness violation.
  const preview = renderClaimTemplate(messageTemplate, { company_name: 'Example Co', claim_url: 'https://example.test/claim/x' });
  if (!preview.ok) {
    return NextResponse.json({ success: false, error: 'Invalid message template', details: preview.errors }, { status: 400 });
  }

  const campaign = await createCampaign({
    name, description, channel, messageTemplate,
    createdBy: auth.userId,
  });

  return NextResponse.json({ success: true, campaign });
}
