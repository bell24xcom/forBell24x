import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for scraped company data
const ScrapedCompanySchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  website: z.string().url().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  category: z.string(),
  subcategory: z.string().optional(),
  source: z.enum(['indiamart', 'justdial', 'tradeindia', 'exportersindia']),
  sourceUrl: z.string().url(),
  description: z.string().optional(),
  employeeCount: z.string().optional(),
  establishedYear: z.string().optional(),
  annualTurnover: z.string().optional(),
  gstNumber: z.string().optional(),
  cinNumber: z.string().optional(),
  isVerified: z.boolean().default(false),
  trustScore: z.number().min(0).max(100).default(0),
  scrapedAt: z.date().default(() => new Date())
})

/**
 * POST /api/n8n/scraping/companies - Store scraped company data
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = ScrapedCompanySchema.parse(body)

    // Check if company already exists
    const existingCompany = await prisma.scrapedCompany.findFirst({
      where: {
        OR: [
          { name: validatedData.name },
          { email: validatedData.email },
          { phone: validatedData.phone },
          { website: validatedData.website }
        ]
      }
    })

    if (existingCompany) {
      return NextResponse.json({
        success: false,
        message: 'Company already exists',
        companyId: existingCompany.id
      })
    }

    // Create new scraped company
    const company = await prisma.scrapedCompany.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        website: validatedData.website,
        address: validatedData.address,
        city: validatedData.city,
        state: validatedData.state,
        category: validatedData.category,
        subcategory: validatedData.subcategory,
        source: validatedData.source.toUpperCase() as any,
        sourceUrl: validatedData.sourceUrl,
        description: validatedData.description,
        employeeCount: validatedData.employeeCount,
        establishedYear: validatedData.establishedYear,
        annualTurnover: validatedData.annualTurnover,
        gstNumber: validatedData.gstNumber,
        cinNumber: validatedData.cinNumber,
        isVerified: validatedData.isVerified,
        trustScore: validatedData.trustScore,
        scrapedAt: validatedData.scrapedAt,
        status: 'SCRAPED',
        claimStatus: 'UNCLAIMED'
      }
    })

    // Calculate trust score based on available data
    const trustScore = calculateTrustScore(validatedData)
    
    // Update trust score
    await prisma.scrapedCompany.update({
      where: { id: company.id },
      data: { trustScore }
    })

    return NextResponse.json({
      success: true,
      message: 'Company data stored successfully',
      companyId: company.id,
      trustScore
    })

  } catch (error) {
    console.error('Scraping API Error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to store company data' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/n8n/scraping/companies - Get companies for scraping
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') || 'UNCLAIMED'

    const companies = await prisma.scrapedCompany.findMany({
      where: {
        ...(category && { category }),
        status: status as any
      },
      take: limit,
      orderBy: {
        trustScore: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      companies,
      total: companies.length
    })

  } catch (error) {
    console.error('Get companies API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch companies' },
      { status: 500 }
    )
  }
}

/**
 * Calculate trust score based on available data
 */
function calculateTrustScore(data: any): number {
  let score = 0
  
  // Basic information (40 points)
  if (data.name) score += 10
  if (data.email) score += 10
  if (data.phone) score += 10
  if (data.website) score += 10
  
  // Business information (30 points)
  if (data.address) score += 10
  if (data.gstNumber) score += 10
  if (data.cinNumber) score += 10
  
  // Additional details (30 points)
  if (data.employeeCount) score += 10
  if (data.annualTurnover) score += 10
  if (data.description) score += 10
  
  return Math.min(score, 100)
}
