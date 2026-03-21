import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { checkDailyLimit } from '@/lib/orchestration';
import { storeRFQ, extractRFQMeta } from '@/lib/memory-engine';
import { agentZero } from '@/lib/agents/agent-zero';
import { logEvent } from '@/lib/log-event';

// Save voice-generated RFQ to database
export async function POST(request: NextRequest) {
  try {
    // Get auth token
    const token =
      request.cookies.get('auth-token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Invalid session' },
        { status: 401 }
      );
    }

    // Rate limit: max 10 RFQs per buyer per day (shared limit with text RFQ)
    const limitCheck = await checkDailyLimit(payload.userId, 'rfq', 10);
    if (!limitCheck.allowed) {
      return NextResponse.json(
        { success: false, error: `Daily RFQ limit reached (${limitCheck.count}/${limitCheck.limit}). Try again tomorrow.` },
        { status: 429 }
      );
    }

    const rfqData = await request.json();

    if (!rfqData || !rfqData.title) {
      return NextResponse.json(
        { success: false, error: 'Invalid RFQ data' },
        { status: 400 }
      );
    }

    // Keep quantity as string (Prisma schema is String type)
    const quantity = rfqData.quantity || '1 units';

    // Parse budget from strings like "₹2.5L - ₹3.5L" or "₹50,000" -> numbers
    const budgetStr = rfqData.budget || '';
    const budgetMatch = budgetStr.match(/₹([\d.,]+)(L)?\s*-?\s*₹?([\d.,]+)?(L)?/);
    const parseAmount = (num: string | undefined, hasL: string | undefined) => {
      if (!num) return null;
      const n = parseFloat(num.replace(/,/g, ''));
      return isNaN(n) ? null : n * (hasL ? 100000 : 1);
    };
    const minBudget = budgetMatch ? parseAmount(budgetMatch[1], budgetMatch[2]) : null;
    const maxBudget = budgetMatch ? parseAmount(budgetMatch[3], budgetMatch[4]) : null;

    // Save to database with status OPEN
    const savedRFQ = await prisma.rFQ.create({
      data: {
        title: rfqData.title,
        description: rfqData.description || '',
        category: rfqData.category || 'Other',
        quantity: quantity,
        unit: rfqData.quantity?.replace(/\d+/g, '').trim() || 'units',
        minBudget: minBudget,
        maxBudget: maxBudget,
        timeline: rfqData.timeline || 'flexible',
        urgency: rfqData.timeline === 'urgent' ? 'URGENT' : 'NORMAL',
        status: 'OPEN',
        createdBy: payload.userId,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    // ── Elephant Memory: store in episodic memory ──
    try {
      const meta = extractRFQMeta({
        id: savedRFQ.id,
        title: savedRFQ.title,
        category: savedRFQ.category,
        description: savedRFQ.description,
        quantity: savedRFQ.quantity,
        location: null,
        maxBudget: savedRFQ.maxBudget,
        minBudget: savedRFQ.minBudget,
      });
      await storeRFQ(meta);
    } catch (memErr) {
      console.error('[Memory] storeRFQ error:', memErr);
    }

    logEvent({ type: 'rfq_created', meta: { rfqId: savedRFQ.id, category: savedRFQ.category, via: 'voice' } });

    // Trigger Agent Zero (fire-and-forget)
    agentZero({
      id: savedRFQ.id,
      title: savedRFQ.title,
      category: savedRFQ.category,
      location: null,
      maxBudget: savedRFQ.maxBudget,
      quantity: savedRFQ.quantity,
      timeline: savedRFQ.timeline,
      urgency: savedRFQ.urgency as string,
      isSeeded: false,
    }).catch((e: unknown) => console.error('[VoiceRFQ] agentZero error:', e));

    return NextResponse.json({
      success: true,
      rfq: {
        id: savedRFQ.id,
        title: savedRFQ.title,
        category: savedRFQ.category,
        status: savedRFQ.status,
        createdAt: savedRFQ.createdAt.toISOString(),
      },
      message: 'RFQ saved successfully',
    });
  } catch (error: any) {
    console.error('[API_ERROR] /api/voice-rfq/save', error instanceof Error ? error.message : error);
    const errorMessage = error?.code === 'P2002'
      ? 'Duplicate RFQ entry'
      : error?.code === 'P2003'
      ? 'Invalid reference (user not found)'
      : error?.message || 'Failed to save RFQ';
    return NextResponse.json(
      { success: false, error: errorMessage, code: error?.code, retryable: true },
      { status: 500 }
    );
  }
}
