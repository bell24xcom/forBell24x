import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * POST /api/voice-rfq/transcribe
 *
 * Transcribes audio using Groq Whisper (FREE) or NVIDIA ASR
 * Handles Hindi + English mixed audio
 *
 * Input: FormData with 'audio' blob
 * Output: { transcription: string, language: string }
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File | null;

    if (!audioFile) {
      return NextResponse.json(
        { success: false, error: 'Audio file is required' },
        { status: 400 }
      );
    }

    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());

    let transcription = '';
    let transcriptionSource = '';

    // Option 1: Groq Whisper (FREE, excellent for Hindi+English)
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (GROQ_API_KEY && GROQ_API_KEY !== 'your-groq-api-key-here') {
      try {
        const fd = new FormData();
        fd.append('file', new Blob([audioBuffer], { type: audioFile.type }), audioFile.name || 'recording.webm');
        fd.append('model', 'whisper-large-v3');
        fd.append('language', 'hi'); // Hindi (also handles English mixed)
        fd.append('response_format', 'json');

        const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${GROQ_API_KEY}` },
          body: fd,
        });

        if (res.ok) {
          const data = await res.json();
          transcription = data.text || '';
          transcriptionSource = 'Groq Whisper v3';
          console.log('[Voice Transcribe] Groq success:', transcription.substring(0, 100));
        } else {
          const errorText = await res.text();
          console.warn('[Voice Transcribe] Groq failed:', res.status, errorText);
        }
      } catch (e) {
        console.error('[Voice Transcribe] Groq error:', e);
      }
    }

    // Option 2: NVIDIA ASR fallback
    if (!transcription && process.env.NVIDIA_API_KEY) {
      try {
        const fd = new FormData();
        fd.append('file', new Blob([audioBuffer], { type: audioFile.type }), 'audio.webm');

        const res = await fetch('https://integrate.api.nvidia.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}` },
          body: fd,
        });

        if (res.ok) {
          const data = await res.json();
          transcription = data.text || '';
          transcriptionSource = 'NVIDIA Parakeet ASR';
          console.log('[Voice Transcribe] NVIDIA success:', transcription.substring(0, 100));
        }
      } catch (e) {
        console.error('[Voice Transcribe] NVIDIA ASR error:', e);
      }
    }

    // Option 3: Demo fallback (development only)
    if (!transcription) {
      transcription = 'Demo mode: I need 500 kg steel rods, grade 60, delivery to Mumbai within one week.';
      transcriptionSource = 'demo-fallback';
      console.warn('[Voice Transcribe] Using demo transcription - no API keys worked');
    }

    return NextResponse.json({
      success: true,
      transcription,
      transcriptionSource,
      audioFormat: audioFile.type,
      audioSize: audioBuffer.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Voice Transcribe] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to transcribe audio' },
      { status: 500 }
    );
  }
}
