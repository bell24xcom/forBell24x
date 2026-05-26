import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * POST /api/voice-rfq/transcribe
 *
 * COMBINED: Transcribes audio + Extracts structured RFQ in ONE call
 * Uses Groq Whisper v3 (handles Hindi + English)
 *
 * Input: FormData with 'audio' blob
 * Output: { transcription, extractedData }
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const groqKey = process.env.GROQ_API_KEY;

    // Validation
    if (!audioFile) {
      return NextResponse.json(
        { success: false, error: 'No audio file provided' },
        { status: 400 }
      );
    }

    if (!groqKey || groqKey === 'your-groq-api-key-here') {
      console.error('[Voice RFQ] GROQ_API_KEY not configured properly');
      return NextResponse.json(
        {
          success: false,
          error: 'Groq API key not configured',
          debug: { groqKeyPresent: !!groqKey, groqKeyValid: groqKey !== 'your-groq-api-key-here' }
        },
        { status: 500 }
      );
    }

    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
    console.log('[Voice RFQ] Processing audio:', audioBuffer.length, 'bytes');

    // STEP 1: Transcribe with Groq Whisper v3
    let transcription = '';
    try {
      const fd = new FormData();
      fd.append('file', new Blob([audioBuffer], { type: 'audio/webm' }), 'audio.webm');
      fd.append('model', 'whisper-large-v3');
      fd.append('response_format', 'json');

      const groqRes = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${groqKey}` },
        body: fd,
      });

      if (!groqRes.ok) {
        const errorText = await groqRes.text();
        console.error('[Voice RFQ] Groq Whisper failed:', groqRes.status, errorText);
        throw new Error(`Groq Whisper returned ${groqRes.status}`);
      }

      const groqData = await groqRes.json();
      transcription = groqData.text || '';
      console.log('[Voice RFQ] Transcription success:', transcription.substring(0, 100));

      if (!transcription) {
        throw new Error('Groq returned empty transcription');
      }

      // Reject unusably short transcriptions — almost certainly the
      // mic captured silence/noise and Whisper hallucinated a word or two.
      // Don't generate a garbage RFQ from "you" / "uh" / "ok".
      if (transcription.trim().length < 10) {
        return NextResponse.json(
          {
            success: false,
            error: 'Recording too short or unclear. Please speak for at least 5 seconds describing what you need (product, quantity, location).',
            transcription,
            debug: { stage: 'transcription_too_short', length: transcription.trim().length },
          },
          { status: 400 },
        );
      }
    } catch (transcriptionError) {
      console.error('[Voice RFQ] Transcription error:', transcriptionError);
      return NextResponse.json(
        {
          success: false,
          error: 'Transcription failed: ' + String(transcriptionError),
          debug: { stage: 'transcription', groqKeyPresent: true }
        },
        { status: 500 }
      );
    }

    // STEP 2: Extract structured RFQ with Groq LLM
    let extractedData: any = null;
    try {
      const extractionPrompt = `Extract RFQ details from this requirement. Return ONLY valid JSON, no markdown, no extra text.

Text: "${transcription}"

Rules:
- If the text is unclear, ambiguous, or doesn't clearly describe a product/service the user wants to buy, set category to "Other" and product to null.
- Match the category strictly to what the user said. Do NOT guess. If unsure, use "Other".
- Examples: "cotton t-shirts" → "Apparel & Clothing"; "steel pipes" → "Metals & Alloys"; "LED bulbs" → "Electronics & Electricals".

JSON format (all fields required, use null if not mentioned):
{
  "product": "specific product name (e.g. 'Cotton T-Shirts', 'Steel Pipes') or null if unclear",
  "quantity": number or null,
  "unit": "kg/tons/pieces/meters/liters/boxes/units" or null,
  "location": "city" or null,
  "urgency": "urgent/1_week/2_weeks/1_month/flexible",
  "category": "Other | Apparel & Clothing | Textiles & Garments | Metals & Alloys | Electronics & Electricals | Machinery & Equipment | Chemicals & Petrochemicals | Construction & Real Estate | Food & Beverages | Pharmaceuticals & Healthcare | Automotive & Transport | Plastics & Rubber | Paper & Printing | Agriculture & Farming | IT & Telecom | Furniture & Wood | Safety & Security",
  "specifications": "specs or null",
  "budgetMin": number or null,
  "budgetMax": number or null
}`;

      const llmRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-70b-versatile',
          messages: [{ role: 'user', content: extractionPrompt }],
          max_tokens: 500,
          temperature: 0.1,
        }),
      });

      if (!llmRes.ok) {
        const errorText = await llmRes.text();
        console.error('[Voice RFQ] Groq LLM failed:', llmRes.status, errorText);
        throw new Error(`Groq LLM returned ${llmRes.status}`);
      }

      const llmData = await llmRes.json();
      const content = llmData.choices?.[0]?.message?.content || '';
      console.log('[Voice RFQ] LLM raw response:', content.substring(0, 200));

      // Extract JSON from response (handles markdown code blocks)
      const cleaned = content.replace(/```json\n?|\n?```/g, '').trim();
      extractedData = JSON.parse(cleaned);

      console.log('[Voice RFQ] Extraction success:', extractedData);
    } catch (extractionError) {
      console.error('[Voice RFQ] Extraction error:', extractionError);
      // Return a minimal fallback — do NOT use the raw transcription as a
      // product name (it leaks "you" / partial words into the title) and do
      // NOT pick a category. Force the user to fill these in manually.
      extractedData = {
        product: null,
        quantity: null,
        unit: null,
        location: null,
        urgency: 'flexible',
        category: null,
        specifications: null,
        budgetMin: null,
        budgetMax: null,
      };
    }

    return NextResponse.json({
      success: true,
      transcription,
      transcriptionSource: 'Groq Whisper v3',
      extractedData,
      aiModel: 'Groq Llama 3.1 70B',
      timestamp: new Date().toISOString(),
      debug: {
        groqKeyPresent: true,
        audioSize: audioBuffer.length,
        transcriptionLength: transcription.length,
      },
    });
  } catch (error) {
    console.error('[Voice RFQ] Fatal error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Processing failed: ' + String(error),
        debug: { stage: 'unknown' }
      },
      { status: 500 }
    );
  }
}
