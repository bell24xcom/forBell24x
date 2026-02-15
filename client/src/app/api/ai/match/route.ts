import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'
import { matchSuppliersToRFQ } from '@/lib/ai-matching-simple'
import { z } from 'zod'

// Validation schema
const MatchSuppliersSchema = z.object({
  rfqId: z.string().min(1, 'RFQ ID is required'),
  maxMatches: z.number().min(1).max(20).default(10),
  minConfidenceScore: z.number().min(0).max(1).default(0.6),
})

/**
 * POST /api/ai/match - AI-powered supplier matching
 */
export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const { allowed, response } = await rateLimit(request, { windowMs: 60000, max: 20 })
    if (!allowed) return response!

    // Authentication check (simplified for mobile OTP)
    // In production, this would check JWT token from mobile OTP

    // Parse and validate request body
    const body = await request.json()
    const validatedData = MatchSuppliersSchema.parse(body)

    const { rfqId, maxMatches, minConfidenceScore } = validatedData

    try {
      // Start AI matching process
      const startTime = Date.now()
      
      const matches = await matchSuppliersToRFQ(rfqId)
      
      const processingTime = Date.now() - startTime

      // Filter matches by confidence score
      const filteredMatches = matches.filter(
        match => match.confidenceScore >= minConfidenceScore
      ).slice(0, maxMatches)

      // Log matching event
      console.log(`AI matching completed for RFQ ${rfqId}: ${filteredMatches.length} matches found in ${processingTime}ms`)

      return NextResponse.json({
        success: true,
        rfqId,
        matches: filteredMatches,
        totalMatches: matches.length,
        filteredMatches: filteredMatches.length,
        processingTime,
        timestamp: new Date().toISOString(),
      })

    } catch (error) {
      console.error('AI matching error:', error)
      
      return NextResponse.json(
        { 
          error: 'AI matching failed',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      )
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('AI matching API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
