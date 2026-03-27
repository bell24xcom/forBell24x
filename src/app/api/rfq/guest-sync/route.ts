import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { storeRFQ } from '@/lib/memory-engine';
import { agentZero } from '@/lib/agents/agent-zero';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.title && !body.category) {
      return NextResponse.json(
        { success: false, error: 'title or category is required' },
        { status: 400 }
      );
    }

    const rfq = await prisma.rFQ.create({
      data: {
        title: body.title || 'Guest RFQ',
        description: body.description || '',
        category: body.category || 'General',
        quantity: body.quantity || 'To be discussed',
        location: body.location || body.city || null,
        type: body.data?.type === 'video' ? 'VIDEO' : 'TEXT',
        status: 'OPEN',
        isSeeded: false,
        // No createdBy — guest submission
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    // Store in memory with source tag (fire-and-forget)
    storeRFQ({
      rfqId: rfq.id,
      title: rfq.title,
      category: rfq.category,
      quantity: rfq.quantity,
      location: rfq.location ?? undefined,
      metadata: { source: 'guest', type: body.data?.type ?? 'text' },
    }).catch((e: unknown) => console.error('[GuestSync] storeRFQ error:', e));

    console.log('[GuestSync] RFQ stored:', rfq.id);

    // Agent Zero only in live mode — blocked in test/dev
    if (process.env.AGENT_MODE === 'live') {
      agentZero({
        id: rfq.id,
        title: rfq.title,
        category: rfq.category,
        location: rfq.location,
        maxBudget: null,
        quantity: rfq.quantity,
        timeline: null,
        urgency: 'NORMAL',
        isSeeded: false,
      }).catch((e: unknown) => console.error('[GuestSync] agentZero error:', e));
    } else {
      console.log('[SMOKE-TEST] GuestSync: AGENT_MODE=test — agentZero skipped');
    }

    return NextResponse.json({ success: true, rfqId: rfq.id });
  } catch (error) {
    console.error('[GuestSync] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to sync guest RFQ' },
      { status: 500 }
    );
  }
}
