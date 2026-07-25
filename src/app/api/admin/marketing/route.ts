import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, isErrorResponse } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

const DEGRADED = (reason: string) =>
  NextResponse.json({
    rfqs: [], stats: { totalRfqs: 0, activeRfqs: 0, categoryTrends: {} },
    pagination: { page: 1, limit: 20, total: 0, pages: 0 },
    serviceDegraded: true,
    reason,
  });

// InsForge used lowercase status strings ('new','sent','matched').
// Map those to Prisma RFQStatus enum values.
function toStatusEnum(s?: string | null): string | undefined {
  if (!s) return undefined;
  const map: Record<string, string> = {
    new: 'ACTIVE', sent: 'QUOTED', matched: 'QUOTED',
  };
  return map[s.toLowerCase()] ?? s.toUpperCase();
}

async function runRuleEngine(rfq: any) {
  try {
    const rule = await prisma.campaignRule.findFirst({
      where: {
        isActive: true,
        category: rfq.category,
        urgency:  String(rfq.urgency ?? '').toUpperCase(),
      },
    });
    if (!rule) return null;

    const message = rule.templateText
      .replace('{{category}}', rfq.category   || '')
      .replace('{{urgency}}',  rfq.urgency    || '')
      .replace('{{text}}',     rfq.description || rfq.requirements || '');

    const outreachRes = await fetch(
      `${process.env.NEXTAUTH_URL}/api/admin/marketing/outreach`,
      {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ rfqId: rfq.id, message, type: rule.actionType }),
        signal:  AbortSignal.timeout(5000),
      }
    );
    return outreachRes.ok ? await outreachRes.json() : null;
  } catch (err) {
    console.error('[RuleEngine]', err);
    return null;
  }
}

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (isErrorResponse(auth)) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const page     = parseInt(searchParams.get('page')  || '1');
    const limit    = parseInt(searchParams.get('limit') || '20');
    const status   = searchParams.get('status');
    const category = searchParams.get('category');
    const offset   = (page - 1) * limit;

    const where: any = {};
    if (status)   where.status   = toStatusEnum(status);
    if (category) where.category = { contains: category, mode: 'insensitive' };

    const [total, rfqs, allRfqs] = await Promise.all([
      prisma.rFQ.count({ where }),
      prisma.rFQ.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.rFQ.findMany({ select: { status: true, category: true } }),
    ]);

    const activeStatuses = new Set(['ACTIVE', 'OPEN', 'QUOTED']);
    const activeRfqs = allRfqs.filter(r => activeStatuses.has(r.status)).length;
    const categoryTrends = allRfqs.reduce((acc: Record<string, number>, r) => {
      const key = r.category || 'Uncategorized';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({
      rfqs,
      stats: { totalRfqs: total, activeRfqs, categoryTrends },
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    console.error('[Marketing GET]', error);
    return DEGRADED(error?.message || 'Unknown error');
  }
}

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if (isErrorResponse(auth)) return auth;

  try {
    const body = await req.json();
    const { rfq_text, status, urgency, category, ...rest } = body;

    const rfq = await prisma.rFQ.create({
      data: {
        title:       body.title || (rfq_text ?? '').slice(0, 80) || 'Untitled',
        description: rfq_text ?? body.description ?? null,
        category:    category  || 'General',
        quantity:    body.quantity || '1',
        status:      (toStatusEnum(status) ?? 'ACTIVE') as any,
        urgency:     (urgency ? urgency.toUpperCase() : 'NORMAL') as any,
      },
    });

    await runRuleEngine(rfq);
    return NextResponse.json({ success: true, data: rfq });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const auth = requireAdmin(req);
  if (isErrorResponse(auth)) return auth;

  try {
    const { id, status, rfq_text, category, urgency } = await req.json();
    if (!id) throw new Error('Missing id');

    const updateData: any = {};
    if (status)   updateData.status      = toStatusEnum(status);
    if (rfq_text) updateData.description = rfq_text;
    if (category) updateData.category    = category;
    if (urgency)  updateData.urgency     = urgency.toUpperCase();

    const rfq = await prisma.rFQ.update({ where: { id }, data: updateData });

    if (category || urgency) await runRuleEngine(rfq);

    return NextResponse.json({ success: true, data: rfq });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
