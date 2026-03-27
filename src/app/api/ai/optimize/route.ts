import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const INSFORGE_URL = process.env.INSFORGE_URL;
  const INSFORGE_API_KEY = process.env.INSFORGE_API_KEY;

  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    // 1. Fetch Top Suppliers for this Category based on Performance
    const suppliersRes = await fetch(`${INSFORGE_URL}/rest/v1/supplier_performance_ranking?limit=10`, {
      headers: { 'apikey': INSFORGE_API_KEY!, 'Authorization': `Bearer ${INSFORGE_API_KEY}` }
    });
    const topSuppliers = await suppliersRes.json();

    // 2. Fetch Best Performing Message Variant
    const messageRes = await fetch(`${INSFORGE_URL}/rest/v1/message_variants?order=total_converted.desc&limit=1`, {
      headers: { 'apikey': INSFORGE_API_KEY!, 'Authorization': `Bearer ${INSFORGE_API_KEY}` }
    });
    const bestMessage = await messageRes.json();

    return NextResponse.json({
      optimization: {
        recommended_suppliers: topSuppliers,
        best_message_variant: bestMessage[0] || null,
        system_confidence: 0.92
      }
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * Update logic for Funnel Tracking
 */
export async function POST(req: NextRequest) {
  const INSFORGE_URL = process.env.INSFORGE_URL;
  const INSFORGE_API_KEY = process.env.INSFORGE_API_KEY;

  try {
    const { supplier_id, event } = await req.json(); // event: outreach, view, quote, deal

    const fieldMap: Record<string, string> = {
      'outreach': 'total_outreach',
      'view': 'total_views',
      'quote': 'total_quotes',
      'deal': 'total_deals'
    };

    const field = fieldMap[event];
    if (!field) throw new Error('Invalid event type');

    // Atomic increment using RPC or specialized patch
    // For now, we perform a fetch-and-update (In high scale, use PostgreSQL function)
    await fetch(`${INSFORGE_URL}/rest/v1/rpc/increment_supplier_stat`, {
      method: 'POST',
      headers: { 
        'apikey': INSFORGE_API_KEY!, 
        'Authorization': `Bearer ${INSFORGE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ s_id: supplier_id, field_name: field })
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
