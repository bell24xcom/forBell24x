/**
 * POST /api/trigger-voice-agent
 * Triggers a Bolna.ai qualification call for a buyer lead.
 * Uses Sarvam STT/TTS for Hindi/Hinglish support.
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isErrorResponse } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

interface TriggerVoiceBody {
  buyer_phone:     string;
  buyer_name:      string;
  target_category: string;
}

export async function POST(request: NextRequest) {
  const auth = requireAdmin(request);
  if (isErrorResponse(auth)) return auth;

  const BOLNA_API_KEY = process.env.BOLNA_API_KEY;
  const BOLNA_AGENT_ID = process.env.BOLNA_AGENT_ID;

  if (!BOLNA_API_KEY || !BOLNA_AGENT_ID) {
    return NextResponse.json(
      { success: false, message: 'Bolna.ai not configured — set BOLNA_API_KEY and BOLNA_AGENT_ID' },
      { status: 503 },
    );
  }

  let body: TriggerVoiceBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid JSON body' }, { status: 400 });
  }

  const { buyer_phone, buyer_name, target_category } = body;

  if (!buyer_phone || !buyer_name || !target_category) {
    return NextResponse.json(
      { success: false, message: 'buyer_phone, buyer_name, and target_category are required' },
      { status: 400 },
    );
  }

  // Normalize phone: ensure +91 prefix
  const phone = buyer_phone.startsWith('+') ? buyer_phone : `+91${buyer_phone.replace(/\D/g, '')}`;

  const systemPrompt = `You are Sethu, the automated trade assistant for VyaparSethu.com.
Speak in conversational Hinglish (mix of Hindi and English).
Your goal:
1. Greet ${buyer_name} warmly and introduce yourself.
2. Explain they have active buyer interest in ${target_category} on VyaparSethu.
3. Ask: "Aapka approximate budget kya hai?" and note their response.
4. Ask: "Kya aap abhi ek verified supplier se directly baat karna chahenge?"
5. If yes, say you will connect them to a verified supplier shortly and end the call.
6. If no, thank them and say they can post requirements at vyaparsethu.com.
Keep responses under 30 words per turn. Be warm, professional, and brief.`;

  try {
    const bolnaRes = await fetch(`https://api.bolna.dev/call`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${BOLNA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agent_id:      BOLNA_AGENT_ID,
        recipient_phone_no: phone,
        user_data: { buyer_name, target_category },
        agent_config: {
          llm_agent: {
            agent_welcome_message: `Namaste ${buyer_name} ji, main Sethu bol raha hoon VyaparSethu.com se.`,
            system_prompt: systemPrompt,
          },
          transcriber: {
            model:    'sarvam-stt',
            language: 'hi',
            keywords: ['VyaparSethu', 'supplier', 'buyer', target_category],
          },
          synthesizer: {
            provider:      'sarvam',
            provider_config: { voice: 'bulbul', model: 'bulbul:v1' },
            stream:         true,
          },
        },
      }),
    });

    const result = await bolnaRes.json();

    if (!bolnaRes.ok) {
      console.error('[VoiceAgent] Bolna error:', result);
      return NextResponse.json(
        { success: false, message: result.message ?? 'Bolna.ai call failed' },
        { status: bolnaRes.status },
      );
    }

    return NextResponse.json({
      success:    true,
      call_id:    result.call_id ?? result.id,
      status:     result.status ?? 'initiated',
      phone,
      category:   target_category,
    });
  } catch (error) {
    console.error('[VoiceAgent] error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
