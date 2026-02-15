import { NextRequest, NextResponse } from 'next/server'
// NextAuth removed - using mobile OTP authentication
import { prisma } from '@/lib/auth'
import { rateLimit } from '@/lib/rate-limit'
import { z } from 'zod'
import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Validation schemas
const CreateRFQSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional(),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unit: z.string().optional(),
  specifications: z.record(z.any()).optional(),
  budget: z.number().min(0).optional(),
  currency: z.string().default('INR'),
  deadline: z.string().datetime().optional(),
  urgency: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  audioFile: z.string().url().optional(),
  videoFile: z.string().url().optional(),
  transcript: z.string().optional(),
})

const UpdateRFQSchema = z.object({
  title: z.string().min(5).optional(),
  description: z.string().min(10).optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  quantity: z.number().min(1).optional(),
  unit: z.string().optional(),
  specifications: z.record(z.any()).optional(),
  budget: z.number().min(0).optional(),
  currency: z.string().optional(),
  deadline: z.string().datetime().optional(),
  urgency: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  status: z.enum(['OPEN', 'CLOSED', 'CANCELLED', 'COMPLETED']).optional(),
})

/**
 * Process voice/video RFQ using AI
 */
async function processVoiceRFQ(audioFile?: string, videoFile?: string, transcript?: string) {
  try {
    if (!audioFile && !videoFile && !transcript) {
      return null
    }

    let processedTranscript = transcript

    // If audio file provided, transcribe it
    if (audioFile && !transcript) {
      try {
        const response = await openai.audio.transcriptions.create({
          file: audioFile as any,
          model: 'whisper-1',
          language: 'en', // Can be made dynamic based on user preference
        })
        processedTranscript = response.text
      } catch (error) {
        console.error('Audio transcription error:', error)
        throw new Error('Failed to process audio file')
      }
    }

    // If video file provided, extract audio and transcribe
    if (videoFile && !transcript) {
      try {
        // Note: This would require video processing service
        // For now, we'll assume the video contains audio that can be extracted
        const response = await openai.audio.transcriptions.create({
          file: videoFile as any,
          model: 'whisper-1',
          language: 'en',
        })
        processedTranscript = response.text
      } catch (error) {
        console.error('Video transcription error:', error)
        throw new Error('Failed to process video file')
      }
    }

    // Use AI to extract structured information from transcript
    if (processedTranscript) {
      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `You are an AI assistant that extracts structured information from RFQ descriptions. 
              Extract the following information from the given text:
              - Product/service category
              - Quantity and unit
              - Technical specifications
              - Budget range (if mentioned)
              - Urgency level
              - Deadline (if mentioned)
              
              Return the information in JSON format.`,
            },
            {
              role: 'user',
              content: processedTranscript,
            },
          ],
          temperature: 0.1,
        })

        const extractedInfo = JSON.parse(completion.choices[0].message.content || '{}')
        return {
          transcript: processedTranscript,
          extractedInfo,
        }
      } catch (error) {
        console.error('AI processing error:', error)
        return {
          transcript: processedTranscript,
          extractedInfo: {},
        }
      }
    }

    return null
  } catch (error) {
    console.error('Voice RFQ processing error:', error)
    throw error
  }
}

/**
 * GET /api/rfq - Get all RFQs with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const { allowed, response } = await rateLimit(request, { windowMs: 60000, max: 100 })
    if (!allowed) return response!

    // Check authentication
    // Check authentication (simplified for mobile OTP)
    // TODO: Implement proper mobile OTP authentication check

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const status = searchParams.get('status') || ''
    const urgency = searchParams.get('urgency') || ''
    const myRFQs = searchParams.get('my') === 'true'

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { transcript: { contains: search, mode: 'insensitive' } },
      ]
    }
    
    if (category) {
      where.category = category
    }
    
    if (status) {
      where.status = status
    }
    
    if (urgency) {
      where.urgency = urgency
    }

    // Filter by user's RFQs if requested
    if (myRFQs) {
      where.buyerId = 'mock-user-id' // TODO: Get from JWT token
    }

    // Get RFQs with pagination
    const [rfqs, total] = await Promise.all([
      prisma.rFQ.findMany({
        where,
        include: {
          buyer: {
            select: {
              id: true,
              name: true,
              email: true,
              company: {
                select: {
                  id: true,
                  name: true,
                  //// Field doesn't exist in Company model
                },
              },
            },
          },
          company: {
            select: {
              id: true,
              name: true,
              //// Field doesn't exist in Company model
            },
          },
          quotes: {
            select: {
              id: true,
              price: true,
              status: true,
              createdAt: true,
              supplier: {
                select: {
                  id: true,
                  name: true,
                  company: {
                    select: {
                      id: true,
                      name: true,
                      //// Field doesn't exist in Company model
                    },
                  },
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
          _count: {
            select: {
              quotes: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.rFQ.count({ where }),
    ])

    return NextResponse.json({
      rfqs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })

  } catch (error) {
    console.error('Error fetching RFQs:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/rfq - Create new RFQ
 */
export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const { allowed, response } = await rateLimit(request, { windowMs: 60000, max: 10 })
    if (!allowed) return response!

    // Check authentication
    // Check authentication (simplified for mobile OTP)
    // TODO: Implement proper mobile OTP authentication check

    // Parse and validate request body
    const body = await request.json()
    const validatedData = CreateRFQSchema.parse(body)

    // Process voice/video RFQ if provided
    let voiceData = null
    if (validatedData.audioFile || validatedData.videoFile || validatedData.transcript) {
      voiceData = await processVoiceRFQ(
        validatedData.audioFile,
        validatedData.videoFile,
        validatedData.transcript
      )
    }

    // Merge AI-extracted information with user input
    const finalData = {
      ...validatedData,
      ...(voiceData?.extractedInfo || {}),
      transcript: voiceData?.transcript || validatedData.transcript,
    }

    // Create RFQ
    const rfq = await prisma.rFQ.create({
      data: {
        title: finalData.title,
        description: finalData.description,
        category: finalData.category,
        subcategory: finalData.subcategory,
        quantity: finalData.quantity,
        unit: finalData.unit,
        specifications: finalData.specifications || {},
        budget: finalData.budget,
        currency: finalData.currency,
        deadline: finalData.deadline ? new Date(finalData.deadline) : null,
        urgency: finalData.urgency,
        status: 'OPEN',
        buyerId: 'mock-user-id', // TODO: Get from JWT token
        companyId: 'mock-company-id', // TODO: Get from JWT token
        audioFile: validatedData.audioFile,
        videoFile: validatedData.videoFile,
        transcript: finalData.transcript,
      },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            company: {
              select: {
                id: true,
                name: true,
                //// Field doesn't exist in Company model
              },
            },
          },
        },
        company: {
          select: {
            id: true,
            name: true,},
        },
        _count: {
          select: {
            quotes: true,
          },
        },
      },
    })

    // Log RFQ creation
    await prisma.auditLog.create({
      data: {
        userId: 'mock-user-id', // TODO: Get from JWT token
        action: 'RFQ_CREATED',
        details: {
          rfqId: rfq.id,
          title: rfq.title,
          category: rfq.category,
          urgency: rfq.urgency,
          hasVoice: !!rfq.audioFile || !!rfq.videoFile,
          timestamp: new Date().toISOString(),
        },
      },
    })

    // TODO: Send notifications to relevant suppliers
    // TODO: Trigger AI matching algorithm

    return NextResponse.json(
      { rfq, message: 'RFQ created successfully' },
      { status: 201 }
    )

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating RFQ:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
