import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const INSFORGE_URL = process.env.INSFORGE_URL;
  const INSFORGE_API_KEY = process.env.INSFORGE_API_KEY;

  try {
    const { deal_id, reviewer_id, reviewer_type, rating, feedback } = await req.json();

    // 1. Verify Deal Status and Participants
    const dealRes = await fetch(`${INSFORGE_URL}/rest/v1/deals?id=eq.${deal_id}`, {
      headers: { 'apikey': INSFORGE_API_KEY!, 'Authorization': `Bearer ${INSFORGE_API_KEY}` }
    });
    const deals = await dealRes.json();
    const deal = deals[0];

    if (!deal) throw new Error('Deal not found');
    if (deal.status !== 'completed') throw new Error('Reviews only allowed after deal completion');

    // Determine reviewee
    const reviewee_id = reviewer_type === 'buyer' ? deal.supplier_id : deal.buyer_id;

    // 2. Prevent Duplicate Reviews
    const existingRes = await fetch(`${INSFORGE_URL}/rest/v1/marketplace_reviews?deal_id=eq.${deal_id}&reviewer_id=eq.${reviewer_id}`, {
      headers: { 'apikey': INSFORGE_API_KEY!, 'Authorization': `Bearer ${INSFORGE_API_KEY}` }
    });
    const existing = await existingRes.json();
    if (existing.length > 0) throw new Error('You have already reviewed this deal');

    // 3. Submit Review
    await fetch(`${INSFORGE_URL}/rest/v1/marketplace_reviews`, {
      method: 'POST',
      headers: { 
        'apikey': INSFORGE_API_KEY!, 
        'Authorization': `Bearer ${INSFORGE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([{
        deal_id,
        reviewer_id,
        reviewee_id,
        reviewer_type,
        rating,
        feedback
      }])
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
