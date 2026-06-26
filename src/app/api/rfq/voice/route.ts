import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/jwt';
import { voiceProcessingService } from '@/lib/ai/voice-processing';
import { prisma } from '@/lib/prisma';
import { storeRFQ, extractRFQMeta } from '@/lib/memory-engine';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if AI service is configured
    if (!process.env.NVIDIA_API_KEY) {
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 503 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { audioBase64, audioFormat, language = 'hi' } = body;

    if (!audioBase64 || typeof audioBase64 !== 'string') {
      return NextResponse.json(
        { error: 'Audio data is required' },
        { status: 400 }
      );
    }

    // Process voice RFQ
    const result = await voiceProcessingService.processVoiceRFQ({
      audioBase64,
      audioFormat,
      language,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to process voice RFQ' },
        { status: 500 }
      );
    }

    // Save RFQ to database
    const rfq = await prisma.rFQ.create({
      data: {
        title: result.rfq?.title || 'RFQ Request',
        category: result.rfq?.category || 'General',
        description: result.rfq?.description || result.transcript,
        quantity: result.rfq?.quantity || 1,
        createdBy: user.userId,
        status: 'PENDING',
      },
    });

    try {
      const meta = extractRFQMeta({
        id: rfq.id,
        title: rfq.title,
        category: rfq.category,
        description: rfq.description,
        quantity: String(rfq.quantity),
        location: null,
        maxBudget: null,
        minBudget: null,
      });
      await storeRFQ({
        ...meta,
        companyId: user.userId,
        metadata: { ...meta.metadata, via: 'voice', source: 'rfq_voice' },
      });
    } catch {
      /* non-blocking */
    }

    return NextResponse.json({
      success: true,
      rfq: {
        id: rfq.id,
        title: rfq.title,
        category: rfq.category,
        description: rfq.description,
        quantity: rfq.quantity,
      },
      transcript: result.transcript,
    });
  } catch (error) {
    console.error('Voice RFQ processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}