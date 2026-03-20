import { NextRequest, NextResponse } from 'next/server';
import { storeRFQ } from '@/lib/memory-engine';

/**
 * API Route to sync Guest RFQs with Elephant Memory and trigger Agent Zero (Test Mode)
 */
export async function POST(req: NextRequest) {
  try {
    const meta = await req.json();

    // 1. Store in Elephant Memory (Episodic Layer)
    // We force source: 'guest' and isTemporary: true for safety
    const safeMeta = {
      ...meta,
      metadata: {
        ...meta.metadata,
        source: 'guest',
        isTemporary: true,
      }
    };

    await storeRFQ(safeMeta);
    console.log(`[SMOKE-TEST] Memory: ${safeMeta.rfqId} - Stored guest intent.`);

    // 2. Trigger Agent Zero (TEST MODE)
    const agentMode = process.env.AGENT_MODE || 'test';
    console.log(`[SMOKE-TEST] Strategy: Scout - Mode: ${agentMode}`);

    // In a real implementation, we would call the Agent service here.
    const agentInsights = {
      rfqId: safeMeta.rfqId,
      status: 'scouting',
      mode: agentMode,
      foundSuppliers: 5 + Math.floor(Math.random() * 10),
      avgPrice: meta.priceRange || 'Competitive',
      timestamp: new Date().toISOString()
    };

    if (agentMode === 'test') {
      console.log(`[SMOKE-TEST] Messenger: BLOCKED-TEST-MODE - No external outreach triggered.`);
    }
    
    return NextResponse.json({ 
      success: true, 
      insights: agentInsights,
      message: "Agent Zero is scouting matching suppliers in 'test' mode."
    });
  } catch (error) {
    console.error('Guest RFQ Sync Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to sync guest RFQ' }, { status: 500 });
  }
}
