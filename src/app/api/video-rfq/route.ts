import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { storeRFQ, extractRFQMeta } from '@/lib/memory-engine';
import { agentZero } from '@/lib/agents/agent-zero';
import { verifyToken } from '@/lib/jwt';

// "₹2.5L" / "₹50,000" / "100000" / "2L - 5L" → integer
function extractBudgetNumber(budgetStr: string): number {
  if (!budgetStr || budgetStr === 'To be discussed' || budgetStr === 'Not specified') return 0;
  const match = budgetStr.match(/([\d.,]+)\s*(L|lakh|lakhs)?/i);
  if (!match) return 0;
  const num = parseFloat(match[1].replace(/,/g, ''));
  const multiplier = match[2] ? 100000 : 1;
  return isNaN(num) ? 0 : Math.round(num * multiplier);
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const videoFile = formData.get('video') as File | null;
    const additionalContext = (formData.get('context') as string) || '';
    // Mobile's Video RFQ screen lets the user edit extracted fields before
    // saving (no update endpoint exists for an already-saved RFQ), so it
    // opts out of the auto-save below and finalizes via /api/rfq/create
    // instead. Web's VideoRFQ.tsx doesn't send this and keeps auto-save.
    const skipSave = formData.get('save') === 'false';

    if (!videoFile) {
      return NextResponse.json({ success: false, error: 'Video file is required' }, { status: 400 });
    }

    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey || groqKey === 'your-groq-api-key-here') {
      return NextResponse.json(
        { success: false, error: 'Server transcription unavailable: GROQ_API_KEY not configured' },
        { status: 503 },
      );
    }

    const videoBuffer = Buffer.from(await videoFile.arrayBuffer());
    console.log('[VideoRFQ] Received video:', videoFile.size, 'bytes, type:', videoFile.type);

    // Groq Whisper's hard limit is 25MB. The full video (not just its audio
    // track) is uploaded here, so anything beyond a short clip can exceed
    // this well before the recording is "too long" in any meaningful sense.
    // Reject early with an accurate message instead of letting Groq's 4xx
    // get relabeled as a generic "no audio track" error below.
    const GROQ_WHISPER_MAX_BYTES = 25 * 1024 * 1024;
    if (videoBuffer.length > GROQ_WHISPER_MAX_BYTES) {
      return NextResponse.json(
        {
          success: false,
          error: `Video is too large (${(videoBuffer.length / (1024 * 1024)).toFixed(1)}MB). Please record a shorter clip — the limit is 25MB.`,
        },
        { status: 413 },
      );
    }

    // STEP 1 — Transcribe with Groq Whisper. Whisper accepts webm and decodes
    // the audio track on its side, so we can ship the recording as-is.
    let transcription = '';
    try {
      const fd = new FormData();
      fd.append('file', new Blob([videoBuffer], { type: videoFile.type || 'video/webm' }), videoFile.name || 'video.webm');
      fd.append('model', 'whisper-large-v3');
      fd.append('response_format', 'json');

      const whisperRes = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${groqKey}` },
        body: fd,
      });

      if (!whisperRes.ok) {
        const errText = await whisperRes.text();
        console.error('[VideoRFQ] Whisper failed:', whisperRes.status, errText);
        return NextResponse.json(
          {
            success: false,
            error: `Audio transcription failed (${whisperRes.status}). The video may have no audio track — check that your microphone is enabled when recording.`,
          },
          { status: 502 },
        );
      }

      transcription = ((await whisperRes.json()) as any).text || '';
      console.log('[VideoRFQ] Whisper transcription:', transcription.substring(0, 200));
    } catch (e) {
      console.error('[VideoRFQ] Whisper exception:', e);
      return NextResponse.json(
        { success: false, error: 'Audio transcription failed: ' + String(e) },
        { status: 502 },
      );
    }

    if (transcription.trim().length < 10) {
      return NextResponse.json(
        {
          success: false,
          error: 'Could not extract speech from the video. Please re-record with the microphone enabled and speak clearly about the product.',
          transcription,
        },
        { status: 400 },
      );
    }

    // STEP 2 — Extract structured RFQ with Groq Llama (same prompt shape as voice-rfq)
    const extractionPrompt = `Extract RFQ details from this requirement. Return ONLY valid JSON, no markdown.

Text: "${transcription}${additionalContext ? `\n\nAdditional context: ${additionalContext}` : ''}"

Rules:
- If the text is unclear or doesn't describe a product, set category to "Other" and title to null.
- Match category strictly to what's said. Do NOT guess.
- Examples: "cotton t-shirts" → "Apparel & Clothing"; "steel pipes" → "Metals & Alloys".

JSON (all fields required, use null if not mentioned):
{
  "title": "concise product name 5-10 words or null",
  "description": "1-2 sentence summary of what they need",
  "category": "Other | Apparel & Clothing | Textiles & Garments | Metals & Alloys | Electronics & Electricals | Machinery & Equipment | Chemicals & Petrochemicals | Construction & Real Estate | Food & Beverages | Pharmaceuticals & Healthcare | Automotive & Transport | Plastics & Rubber | Paper & Printing | Agriculture & Farming | IT & Telecom | Furniture & Wood | Safety & Security",
  "quantity": "e.g. '1000 pieces' or 'To be discussed'",
  "unit": "pieces/kg/tons/meters/liters/boxes/units",
  "budget": "e.g. '₹50,000' or 'To be discussed'",
  "timeline": "e.g. '2 weeks' or '1 month'",
  "specifications": ["spec1", "spec2"],
  "location": "city or 'Not specified'",
  "urgency": "low/medium/high"
}`;

    let extracted: any = {};
    try {
      const llmRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.1-70b-versatile',
          messages: [{ role: 'user', content: extractionPrompt }],
          max_tokens: 600,
          temperature: 0.1,
        }),
      });

      if (!llmRes.ok) throw new Error(`Groq LLM ${llmRes.status}`);
      const llmData = await llmRes.json();
      const content = llmData.choices?.[0]?.message?.content || '';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON in LLM response');
      extracted = JSON.parse(jsonMatch[0]);
      console.log('[VideoRFQ] LLM extraction:', extracted);
    } catch (e) {
      console.error('[VideoRFQ] Extraction failed, returning transcription only:', e);
      // Don't fake the title/category — leave them null so the UI prompts the user to fill in.
      extracted = {};
    }

    const processedRFQ = {
      title: extracted.title || null,
      description: extracted.description || transcription,
      category: extracted.category || null,
      quantity: extracted.quantity || 'To be discussed',
      unit: extracted.unit || 'units',
      budget: extracted.budget || 'To be discussed',
      timeline: extracted.timeline || '2 weeks',
      specifications: extracted.specifications || [],
      visualFeatures: [],
      location: extracted.location || 'Not specified',
      urgency: extracted.urgency || 'medium',
      aiPowered: true,
      aiModel: 'Groq Whisper + Llama 3.1 70B',
    };

    // Optional auth
    const token =
      request.cookies.get('auth-token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');
    const authPayload = token ? verifyToken(token) : null;
    const userId = authPayload?.userId ?? null;

    const urgencyMap: Record<string, 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'> = {
      low: 'LOW', medium: 'NORMAL', high: 'HIGH', urgent: 'URGENT',
    };
    const urgency = urgencyMap[String(processedRFQ.urgency).toLowerCase()] ?? 'NORMAL';

    let savedRFQId: string | null = null;
    if (!skipSave && processedRFQ.title && processedRFQ.category) {
      try {
        const savedRFQ = await prisma.rFQ.create({
          data: {
            title: processedRFQ.title,
            description: processedRFQ.description,
            category: processedRFQ.category,
            quantity: processedRFQ.quantity,
            unit: processedRFQ.unit,
            maxBudget: extractBudgetNumber(processedRFQ.budget) || null,
            location: processedRFQ.location !== 'Not specified' ? processedRFQ.location : null,
            timeline: processedRFQ.timeline,
            urgency,
            type: 'VIDEO',
            status: 'OPEN',
            isSeeded: false,
            createdBy: userId,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        });
        savedRFQId = savedRFQ.id;
        console.log('[VideoRFQ] Saved to DB:', savedRFQ.id);

        // Memory + Agent (fire-and-forget)
        const meta = extractRFQMeta({
          id: savedRFQ.id,
          title: savedRFQ.title,
          category: savedRFQ.category,
          description: savedRFQ.description,
          quantity: savedRFQ.quantity,
          location: savedRFQ.location,
          maxBudget: savedRFQ.maxBudget,
          minBudget: null,
        });
        storeRFQ({
          ...meta,
          companyId: userId ?? undefined,
          metadata: { ...meta.metadata, via: 'video', source: 'video_rfq' },
        }).catch((e) => console.error('[VideoRFQ] storeRFQ error:', e));
        agentZero({ ...savedRFQ, urgency: savedRFQ.urgency as string }).catch((e) =>
          console.error('[VideoRFQ] agentZero error:', e),
        );
      } catch (dbErr) {
        console.error('[VideoRFQ] DB save failed:', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      rfqId: savedRFQId,
      transcription,
      extractedInfo: {
        title: processedRFQ.title,
        description: processedRFQ.description,
        category: processedRFQ.category,
        subcategory: processedRFQ.category,
        quantity: parseInt(processedRFQ.quantity) || 0,
        unit: processedRFQ.unit,
        budget: extractBudgetNumber(processedRFQ.budget),
        currency: 'INR',
        location: processedRFQ.location,
        deliveryDeadline: processedRFQ.timeline,
        priority: processedRFQ.urgency,
        specifications: processedRFQ.specifications,
        requirements: processedRFQ.visualFeatures,
        aiPowered: processedRFQ.aiPowered,
        aiModel: processedRFQ.aiModel,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API_ERROR] /api/video-rfq', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { success: false, error: 'Failed to process video', retryable: true },
      { status: 500 },
    );
  }
}
