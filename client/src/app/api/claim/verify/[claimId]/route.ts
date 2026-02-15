import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for claim verification
const ClaimVerificationSchema = z.object({
  verificationCode: z.string().min(1),
  verificationMethod: z.enum(['email', 'phone', 'both'])
})

// Required for static export - generate static params for dynamic routes
export async function generateStaticParams() {
  // For static export, we'll return an empty array since this is an API route
  // In production, this would be handled by server-side rendering
  return []
}

/**
 * POST /api/claim/verify/[claimId] - Verify company claim
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { claimId: string } }
) {
  try {
    const { claimId } = params
    const body = await request.json()
    const validatedData = ClaimVerificationSchema.parse(body)

    // Find the claim
    const claim = await prisma.companyClaim.findUnique({
      where: { id: claimId },
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

    if (claim.status === 'VERIFIED') {
      return NextResponse.json(
        { error: 'Claim already verified' },
        { status: 400 }
      )
    }

    // Verify the code
    if (claim.verificationCode !== validatedData.verificationCode) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      )
    }

    // Update verification status
    const updateData: any = {
      status: 'VERIFIED',
      verifiedAt: new Date(),
      isEmailVerified: validatedData.verificationMethod === 'email' || validatedData.verificationMethod === 'both',
      isPhoneVerified: validatedData.verificationMethod === 'phone' || validatedData.verificationMethod === 'both'
    }

    const verifiedClaim = await prisma.companyClaim.update({
      where: { id: claimId },
      data: updateData,
      include: {
        scrapedCompany: true
      }
    })

    // Activate early user benefits
    await activateEarlyUserBenefits(claimId)

    // Send welcome email
    await sendWelcomeEmail(claim.claimedBy, claim.scrapedCompany)

    // Trigger onboarding workflow
    await triggerOnboardingWorkflow(claimId)

    return NextResponse.json({
      success: true,
      message: 'Claim verified successfully!',
      claim: {
        id: verifiedClaim.id,
        status: verifiedClaim.status,
        benefits: verifiedClaim.benefits,
        company: {
          name: verifiedClaim.scrapedCompany.name,
          category: verifiedClaim.scrapedCompany.category
        }
      }
    })

  } catch (error) {
    console.error('Claim verification error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to verify claim' },
      { status: 500 }
    )
  }
}

/**
 * Activate early user benefits
 */
async function activateEarlyUserBenefits(claimId: string) {
  try {
    const benefits = {
      freeLifetimeBasic: true,
      freePremiumMonths: 6,
      earlyUserBadge: true,
      prioritySupport: true,
      activatedAt: new Date(),
      totalValue: 30000 // ₹30,000
    }

    await prisma.companyClaim.update({
      where: { id: claimId },
      data: {
        benefits: benefits
      }
    })

    // Create user account with benefits
    const claim = await prisma.companyClaim.findUnique({
      where: { id: claimId },
      include: { scrapedCompany: true }
    })

    if (claim) {
      // Create user with early user benefits
      await prisma.user.create({
        data: {
          email: claim.claimedBy,
          name: claim.claimedByName,
          role: 'SUPPLIER',
          isActive: true,
          isVerified: true,
          lastLoginAt: new Date(),
          profile: {
            create: {
              firstName: claim.claimedByName.split(' ')[0],
              lastName: claim.claimedByName.split(' ').slice(1).join(' '),
              phone: claim.claimedByPhone,
              designation: claim.claimedByRole
            }
          },
          company: {
            create: {
              name: claim.scrapedCompany.name,
              email: claim.scrapedCompany.email,
              phone: claim.scrapedCompany.phone,
              website: claim.scrapedCompany.website,
              address: claim.scrapedCompany.address,
              city: claim.scrapedCompany.city,
              state: claim.scrapedCompany.state,
              category: claim.scrapedCompany.category,
              subcategory: claim.scrapedCompany.subcategory,
              description: claim.scrapedCompany.description,
              establishedYear: claim.scrapedCompany.establishedYear,
              employeeCount: claim.scrapedCompany.employeeCount,
              annualTurnover: claim.scrapedCompany.annualTurnover,
              gstNumber: claim.scrapedCompany.gstNumber,
              cinNumber: claim.scrapedCompany.cinNumber,
              size: 'SMALL',
              type: 'SUPPLIER',
              isVerified: true,
              isActive: true,
              earlyUserBenefits: benefits
            }
          }
        }
      })
    }

    console.log(`Early user benefits activated for claim ${claimId}`)
  } catch (error) {
    console.error('Failed to activate early user benefits:', error)
  }
}

/**
 * Send welcome email
 */
async function sendWelcomeEmail(email: string, company: any) {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/email/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: email,
        subject: `🎉 Welcome to Bell24h - Your ${company.name} Profile is Now Live!`,
        template: 'welcome-early-user',
        data: {
          companyName: company.name,
          category: company.category,
          benefits: {
            freeLifetimeBasic: true,
            freePremiumMonths: 6,
            earlyUserBadge: true,
            prioritySupport: true,
            totalValue: '₹30,000'
          },
          dashboardUrl: `${process.env.NEXTAUTH_URL}/dashboard`,
          supportEmail: 'support@bell24h.com'
        }
      })
    })

    if (response.ok) {
      console.log(`Welcome email sent to ${email}`)
    }
  } catch (error) {
    console.error('Failed to send welcome email:', error)
  }
}

/**
 * Trigger onboarding workflow
 */
async function triggerOnboardingWorkflow(claimId: string) {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/n8n/integration/webhook/onboarding`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'process_claim',
        claimData: {
          id: claimId,
          status: 'VERIFIED'
        },
        userData: {
          onboardingStep: 'profile_setup',
          nextStep: 'product_upload'
        }
      })
    })

    if (response.ok) {
      console.log(`Onboarding workflow triggered for claim ${claimId}`)
    }
  } catch (error) {
    console.error('Failed to trigger onboarding workflow:', error)
  }
}
