import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge';

export const dynamic = 'force-dynamic';

// ── Rule Matching Engine ──────────────────────────────────────────────────
async function runRuleEngine(rfq: any) {
  try {
    const { data: rules, error } = await insforge.client!
      .from('campaign_rules')
      .select('*')
      .eq('is_active', true)
      .eq('category', rfq.category)
      .eq('urgency', rfq.urgency);

    if (error || !rules || rules.length === 0) return null;

    // Trigger outreach for the first matching rule
    const rule = rules[0];
    const message = rule.template_text
      .replace('{{category}}', rfq.category || '')
      .replace('{{urgency}}', rfq.urgency || '')
      .replace('{{text}}', rfq.rfq_text || '');

    // Call outreach API
    // (In a real app, this should be done in a background task)
    const outreachRes = await fetch(`${process.env.NEXTAUTH_URL}/api/admin/marketing/outreach`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rfqId: rfq.id, message, type: rule.action_type })
    });

    const outreachData = await outreachRes.json();
    return outreachData;
  } catch (err) {
    console.error('[RuleEngine] Execution failed:', err);
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    
    const offset = (page - 1) * limit;

    const { data: statsData, error: statsError } = await insforge.client!
      .from('rfqs')
      .select('status, category');

    if (statsError) throw statsError;

    const totalRfqs = statsData.length;
    const activeRfqs = statsData.filter(r => r.status === 'new' || r.status === 'sent' || r.status === 'matched').length;
    
    const categoryTrends = statsData.reduce((acc: any, curr: any) => {
      acc[curr.category || 'Uncategorized'] = (acc[curr.category || 'Uncategorized'] || 0) + 1;
      return acc;
    }, {});

    let query = insforge.client!
      .from('rfqs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) query = query.eq('status', status);
    if (category) query = query.ilike('category', `%${category}%`);

    const { data: rfqs, count, error: rfqsError } = await query;

    if (rfqsError) throw rfqsError;

    return NextResponse.json({
      rfqs,
      stats: { totalRfqs, activeRfqs, categoryTrends },
      pagination: {
        page, limit, total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { data, error } = await insforge.client!
      .from('rfqs')
      .insert([body])
      .select()
      .single();

    if (error) throw error;

    // Automatic Rule Check
    await runRuleEngine(data);

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, status, rfq_text, category, urgency } = await req.json();
    if (!id) throw new Error('Missing id');

    const updateData: any = {};
    if (status) updateData.status = status;
    if (rfq_text) updateData.rfq_text = rfq_text;
    if (category) updateData.category = category;
    if (urgency) updateData.urgency = urgency;

    const { data, error } = await insforge.client!
      .from('rfqs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // If category or urgency changed, re-run rules
    if (category || urgency) {
      await runRuleEngine(data);
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
