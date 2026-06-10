import { NextRequest, NextResponse } from 'next/server';
import { getInsforge, isInsforgeConfigured } from '@/lib/insforge';

export const dynamic = 'force-dynamic';

const DEGRADED = (reason: string) =>
  NextResponse.json({
    rfqs: [], stats: { totalRfqs: 0, activeRfqs: 0, categoryTrends: {} },
    pagination: { page: 1, limit: 20, total: 0, pages: 0 },
    serviceDegraded: true,
    reason,
  });

async function runRuleEngine(rfq: any) {
  const client = getInsforge();
  if (!client) return null;
  try {
    const { data: rules, error } = await client
      .from('campaign_rules')
      .select('*')
      .eq('is_active', true)
      .eq('category', rfq.category)
      .eq('urgency', rfq.urgency);

    if (error || !rules || rules.length === 0) return null;

    const rule    = rules[0];
    const message = rule.template_text
      .replace('{{category}}', rfq.category || '')
      .replace('{{urgency}}',  rfq.urgency  || '')
      .replace('{{text}}',     rfq.rfq_text || '');

    const outreachRes = await fetch(
      `${process.env.NEXTAUTH_URL}/api/admin/marketing/outreach`,
      {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ rfqId: rfq.id, message, type: rule.action_type }),
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
  if (!isInsforgeConfigured()) return DEGRADED('InsForge not configured');

  const client = getInsforge();
  if (!client) return DEGRADED('InsForge client unavailable');

  try {
    const { searchParams } = new URL(req.url);
    const page     = parseInt(searchParams.get('page')  || '1');
    const limit    = parseInt(searchParams.get('limit') || '20');
    const status   = searchParams.get('status');
    const category = searchParams.get('category');
    const offset   = (page - 1) * limit;

    const { data: statsData, error: statsError } = await client
      .from('rfqs')
      .select('status, category');

    if (statsError) {
      console.error('[Marketing GET] stats error:', statsError.message);
      return DEGRADED(statsError.message);
    }

    const totalRfqs  = (statsData ?? []).length;
    const activeRfqs = (statsData ?? []).filter(
      r => r.status === 'new' || r.status === 'sent' || r.status === 'matched'
    ).length;

    const categoryTrends = (statsData ?? []).reduce((acc: Record<string, number>, curr: any) => {
      const key = curr.category || 'Uncategorized';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    let query = client
      .from('rfqs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status)   query = query.eq('status', status);
    if (category) query = query.ilike('category', `%${category}%`);

    const { data: rfqs, count, error: rfqsError } = await query;

    if (rfqsError) {
      console.error('[Marketing GET] rfqs error:', rfqsError.message);
      return DEGRADED(rfqsError.message);
    }

    return NextResponse.json({
      rfqs:  rfqs ?? [],
      stats: { totalRfqs, activeRfqs, categoryTrends },
      pagination: { page, limit, total: count || 0, pages: Math.ceil((count || 0) / limit) },
    });
  } catch (error: any) {
    console.error('[Marketing GET]', error);
    return DEGRADED(error?.message || 'Unknown error');
  }
}

export async function POST(req: NextRequest) {
  if (!isInsforgeConfigured()) return DEGRADED('InsForge not configured');
  const client = getInsforge();
  if (!client) return DEGRADED('InsForge client unavailable');

  try {
    const body = await req.json();
    const { data, error } = await client.from('rfqs').insert([body]).select().single();
    if (error) throw error;
    await runRuleEngine(data);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!isInsforgeConfigured()) return DEGRADED('InsForge not configured');
  const client = getInsforge();
  if (!client) return DEGRADED('InsForge client unavailable');

  try {
    const { id, status, rfq_text, category, urgency } = await req.json();
    if (!id) throw new Error('Missing id');

    const updateData: Record<string, unknown> = {};
    if (status)   updateData.status   = status;
    if (rfq_text) updateData.rfq_text = rfq_text;
    if (category) updateData.category = category;
    if (urgency)  updateData.urgency  = urgency;

    const { data, error } = await client.from('rfqs').update(updateData).eq('id', id).select().single();
    if (error) throw error;

    if (category || urgency) await runRuleEngine(data);

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
