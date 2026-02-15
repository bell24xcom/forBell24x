import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for company claim
const CompanyClaimSchema = z.object({
  scrapedCompanyId: z.string(),
  claimedBy: z.string().email(),
  claimedByName: z.string().min(1),
  claimedByPhone: z.string().min(10),
  claimedByRole: z.string().min(1),
  verificationMethod: z.enum(['email', 'phone', 'both']),
  companyDocuments: z.array(z.string()).optional(),
  additionalInfo: z.string().optional()
})

/**
 * POST /api/n8n/claim/company - Claim a scraped company profile
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = CompanyClaimSchema.parse(body)

    // Check if company exists and is claimable
    const scrapedCompany = await prisma.scrapedCompany.findUnique({
      where: { id: validatedData.scrapedCompanyId }
    })

    if (!scrapedCompany) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      )
    }

    if (scrapedCompany.claimStatus === 'CLAIMED') {
      return NextResponse.json(
        { error: 'Company already claimed' },
        { status: 400 }
      )
    }

    // Create claim record
    const claim = await prisma.companyClaim.create({
      data: {
        scrapedCompanyId: validatedData.scrapedCompanyId,
        claimedBy: validatedData.claimedBy,
        claimedByName: validatedData.claimedByName,
        claimedByPhone: validatedData.claimedByPhone,
        claimedByRole: validatedData.claimedByRole,
        verificationMethod: validatedData.verificationMethod.toUpperCase() as any,
        companyDocuments: validatedData.companyDocuments || [],
        additionalInfo: validatedData.additionalInfo,
        status: 'PENDING',
        benefits: {
          freeLifetimeBasic: true,
          freePremiumMonths: 6,
          earlyUserBadge: true,
          prioritySupport: true
        }
      }
    })

    // Update scraped company status
    await prisma.scrapedCompany.update({
      where: { id: validatedData.scrapedCompanyId },
      data: {
        claimStatus: 'CLAIMED',
        claimedAt: new Date(),
        claimId: claim.id
      }
    })

    // Send verification email/SMS
    await sendVerification(validatedData.claimedBy, validatedData.claimedByPhone, claim.id)

    return NextResponse.json({
      success: true,
      message: 'Company claim submitted successfully',
      claimId: claim.id,
      benefits: {
        freeLifetimeBasic: true,
        freePremiumMonths: 6,
        earlyUserBadge: true,
        prioritySupport: true,
        totalValue: '₹30,000'
      }
    })

  } catch (error) {
    console.error('Company claim API Error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to process company claim' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/n8n/claim/company - Get claim status
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const claimId = searchParams.get('claimId')
    const email = searchParams.get('email')

    if (!claimId && !email) {
      return NextResponse.json(
        { error: 'Claim ID or email required' },
        { status: 400 }
      )
    }

    const claim = await prisma.companyClaim.findFirst({
      where: {
        ...(claimId && { id: claimId }),
        ...(email && { claimedBy: email })
      },
      include: {
        scrapedCompany: true
      }
    })

    if (!claim) {
      return NextResponse.json(
        { error: 'Claim not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      claim: {
        id: claim.id,
        status: claim.status,
        claimedBy: claim.claimedBy,
        claimedByName: claim.claimedByName,
        claimedAt: claim.claimedAt,
        benefits: claim.benefits,
        company: {
          name: claim.scrapedCompany.name,
          category: claim.scrapedCompany.category,
          city: claim.scrapedCompany.city,
          state: claim.scrapedCompany.state
        }
      }
    })

  } catch (error) {
    console.error('Get claim API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch claim status' },
      { status: 500 }
    )
  }
}

/**
 * Send verification email/SMS
 */
async function sendVerification(email: string, phone: string, claimId: string) {
  try {
    // Send email verification
    const emailResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/send-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        template: 'company-claim-verification',
        data: {
          claimId,
          verificationUrl: `${process.env.NEXTAUTH_URL}/verify-claim/${claimId}`
        }
      })
    })

    // Send SMS verification
    const smsResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/sms/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone,
        template: 'company-claim-verification',
        data: {
          claimId,
          verificationUrl: `${process.env.NEXTAUTH_URL}/verify-claim/${claimId}`
        }
      })
    })

    console.log('Verification sent:', { emailResponse: emailResponse.ok, smsResponse: smsResponse.ok })
  } catch (error) {
    console.error('Failed to send verification:', error)
  }
}
