import { NextRequest, NextResponse } from 'next/server'
// NextAuth removed - using mobile OTP authentication
import { rateLimit } from '@/lib/rate-limit'
import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

/**
 * POST /api/voice/process - Process voice/video RFQ using AI
 */
export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const { allowed, response } = await rateLimit(request, { windowMs: 60000, max: 10 })
    if (!allowed) return response!

    // Check authentication (simplified for mobile OTP)
    // TODO: Implement proper mobile OTP authentication check

    // Parse request body (FormData for file uploads)
    const formData = await request.formData()
    const audioFile = formData.get('audioFile') as File
    const videoFile = formData.get('videoFile') as File
    const language = formData.get('language') as string || 'en'

    if (!audioFile && !videoFile) {
      return NextResponse.json(
        { error: 'Audio or video file is required' },
        { status: 400 }
      )
    }

    let transcript = ''
    let processingTime = 0
    const startTime = Date.now()

    try {
      // Process audio file
      if (audioFile) {
        // Convert File to proper format for OpenAI
        const audioBuffer = await audioFile.arrayBuffer()
        const audioBlob = new Blob([audioBuffer], { type: audioFile.type })
        
        const audioResponse = await openai.audio.transcriptions.create({
          file: audioBlob as any,
          model: 'whisper-1',
          language: language,
          response_format: 'verbose_json',
        })
        
        transcript = audioResponse.text
        processingTime = Date.now() - startTime
      }

      // Process video file (extract audio first)
      if (videoFile && !transcript) {
        // Note: In production, you'd need to extract audio from video first
        // For now, we'll assume the video contains audio
        const videoResponse = await openai.audio.transcriptions.create({
          file: videoFile,
          model: 'whisper-1',
          language: language,
          response_format: 'verbose_json',
        })
        
        transcript = videoResponse.text
        processingTime = Date.now() - startTime
      }

      // Use AI to extract structured information from transcript
      const analysis = await analyzeTranscript(transcript)

      // Log processing event
      console.log(`Voice processing completed for user mock-user-id: ${processingTime}ms`)

      return NextResponse.json({
        success: true,
        transcript,
        analysis,
        processingTime,
        language,
        timestamp: new Date().toISOString(),
      })

    } catch (error) {
      console.error('Voice processing error:', error)
      
      return NextResponse.json(
        { 
          error: 'Voice processing failed',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Voice processing API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Analyze transcript using AI to extract RFQ information
 */
async function analyzeTranscript(transcript: string) {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are an AI assistant that extracts structured information from voice transcripts for B2B RFQ (Request for Quote) processing.

          Analyze the given transcript and extract:
          1. Product/service category and subcategory
          2. Quantity and unit of measurement
          3. Technical specifications and requirements
          4. Budget range (if mentioned)
          5. Urgency level (LOW, MEDIUM, HIGH, URGENT)
          6. Delivery timeline (if mentioned)
          7. Quality requirements
          8. Location preferences
          9. Key keywords for supplier matching
          10. Any special requirements or constraints

          Return the analysis in JSON format with the following structure:
          {
            "category": "string",
            "subcategory": "string",
            "quantity": number,
            "unit": "string",
            "specifications": {},
            "budget": number,
            "currency": "string",
            "urgency": "string",
            "deliveryTime": number,
            "qualityRequirements": ["string"],
            "location": "string",
            "keywords": ["string"],
            "specialRequirements": ["string"],
            "confidence": number
          }`,
        },
        {
          role: 'user',
          content: transcript,
        },
      ],
      temperature: 0.1,
    })

    const analysis = JSON.parse(completion.choices[0].message.content || '{}')
    
    return {
      ...analysis,
      originalTranscript: transcript,
      processedAt: new Date().toISOString(),
    }
  } catch (error) {
    console.error('Transcript analysis error:', error)
    return {
      error: 'Failed to analyze transcript',
      originalTranscript: transcript,
      processedAt: new Date().toISOString(),
    }
  }
}
