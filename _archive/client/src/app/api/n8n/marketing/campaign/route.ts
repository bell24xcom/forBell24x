import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for marketing campaign
const MarketingCampaignSchema = z.object({
  campaignType: z.enum(['email', 'sms', 'whatsapp']),
  targetCompanies: z.array(z.string()),
  templateId: z.string(),
  message: z.string().min(1),
  subject: z.string().optional(),
  scheduledAt: z.date().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium')
})

/**
 * POST /api/n8n/marketing/campaign - Create marketing campaign
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = MarketingCampaignSchema.parse(body)

    // Create campaign record
    const campaign = await prisma.marketingCampaign.create({
      data: {
        campaignType: validatedData.campaignType.toUpperCase() as any,
        targetCompanies: validatedData.targetCompanies,
        templateId: validatedData.templateId,
        message: validatedData.message,
        subject: validatedData.subject,
        scheduledAt: validatedData.scheduledAt || new Date(),
        priority: validatedData.priority?.toUpperCase() as any,
        status: 'SCHEDULED',
        stats: {
          totalSent: 0,
          delivered: 0,
          opened: 0,
          clicked: 0,
          claimed: 0,
          converted: 0
        }
      }
    })

    // Process campaign based on type
    if (validatedData.campaignType === 'sms') {
      await processSMSCampaign(campaign.id, validatedData.targetCompanies, validatedData.message)
    } else if (validatedData.campaignType === 'email') {
      await processEmailCampaign(campaign.id, validatedData.targetCompanies, validatedData.message, validatedData.subject)
    }

    return NextResponse.json({
      success: true,
      message: 'Marketing campaign created successfully',
      campaignId: campaign.id,
      status: 'SCHEDULED'
    })

  } catch (error) {
    console.error('Marketing campaign API Error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create marketing campaign' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/n8n/marketing/campaign - Get campaign analytics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const campaignId = searchParams.get('campaignId')
    const dateRange = searchParams.get('dateRange') || '7d'

    if (campaignId) {
      // Get specific campaign
      const campaign = await prisma.marketingCampaign.findUnique({
        where: { id: campaignId },
        include: {
          responses: true
        }
      })

      if (!campaign) {
        return NextResponse.json(
          { error: 'Campaign not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        campaign: {
          id: campaign.id,
          campaignType: campaign.campaignType,
          status: campaign.status,
          stats: campaign.stats,
          createdAt: campaign.createdAt,
          responses: campaign.responses
        }
      })
    } else {
      // Get campaign analytics
      const campaigns = await prisma.marketingCampaign.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - getDateRangeMs(dateRange))
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      const analytics = calculateCampaignAnalytics(campaigns)

      return NextResponse.json({
        success: true,
        analytics: {
          totalCampaigns: campaigns.length,
          totalSent: campaigns.reduce((sum, c) => sum + (c.stats as any).totalSent, 0),
          totalDelivered: campaigns.reduce((sum, c) => sum + (c.stats as any).delivered, 0),
          totalOpened: campaigns.reduce((sum, c) => sum + (c.stats as any).opened, 0),
          totalClicked: campaigns.reduce((sum, c) => sum + (c.stats as any).clicked, 0),
          totalClaimed: campaigns.reduce((sum, c) => sum + (c.stats as any).claimed, 0),
          totalConverted: campaigns.reduce((sum, c) => sum + (c.stats as any).converted, 0),
          campaigns: campaigns.map(c => ({
            id: c.id,
            campaignType: c.campaignType,
            status: c.status,
            stats: c.stats,
            createdAt: c.createdAt
          }))
        }
      })
    }

  } catch (error) {
    console.error('Get campaign API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch campaign data' },
      { status: 500 }
    )
  }
}

/**
 * Process SMS campaign
 */
async function processSMSCampaign(campaignId: string, targetCompanies: string[], message: string) {
  try {
    const companies = await prisma.scrapedCompany.findMany({
      where: {
        id: { in: targetCompanies },
        phone: { not: null }
      }
    })

    for (const company of companies) {
      try {
        // Send SMS via MSG91
        const smsResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/sms/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phone: company.phone,
            message: personalizeMessage(message, company),
            template: 'company-claim'
          })
        })

        if (smsResponse.ok) {
          // Update campaign stats
          await prisma.marketingCampaign.update({
            where: { id: campaignId },
            data: {
              stats: {
                totalSent: { increment: 1 },
                delivered: { increment: 1 }
              }
            }
          })

          // Create response record
          await prisma.marketingResponse.create({
            data: {
              campaignId,
              companyId: company.id,
              responseType: 'SMS_SENT',
              status: 'DELIVERED',
              message: personalizeMessage(message, company)
            }
          })
        }
      } catch (error) {
        console.error(`Failed to send SMS to ${company.name}:`, error)
      }
    }

    // Update campaign status
    await prisma.marketingCampaign.update({
      where: { id: campaignId },
      data: { status: 'COMPLETED' }
    })

  } catch (error) {
    console.error('SMS campaign processing error:', error)
    await prisma.marketingCampaign.update({
      where: { id: campaignId },
      data: { status: 'FAILED' }
    })
  }
}

/**
 * Process Email campaign
 */
async function processEmailCampaign(campaignId: string, targetCompanies: string[], message: string, subject?: string) {
  try {
    const companies = await prisma.scrapedCompany.findMany({
      where: {
        id: { in: targetCompanies },
        email: { not: null }
      }
    })

    for (const company of companies) {
      try {
        // Send email via Resend
        const emailResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/email/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: company.email,
            subject: subject || `Claim Your FREE Bell24h Profile - ${company.name}`,
            template: 'company-claim-email',
            data: {
              companyName: company.name,
              category: company.category,
              message: personalizeMessage(message, company),
              claimUrl: `${process.env.NEXTAUTH_URL}/claim/${company.id}`
            }
          })
        })

        if (emailResponse.ok) {
          // Update campaign stats
          await prisma.marketingCampaign.update({
            where: { id: campaignId },
            data: {
              stats: {
                totalSent: { increment: 1 },
                delivered: { increment: 1 }
              }
            }
          })

          // Create response record
          await prisma.marketingResponse.create({
            data: {
              campaignId,
              companyId: company.id,
              responseType: 'EMAIL_SENT',
              status: 'DELIVERED',
              message: personalizeMessage(message, company)
            }
          })
        }
      } catch (error) {
        console.error(`Failed to send email to ${company.name}:`, error)
      }
    }

    // Update campaign status
    await prisma.marketingCampaign.update({
      where: { id: campaignId },
      data: { status: 'COMPLETED' }
    })

  } catch (error) {
    console.error('Email campaign processing error:', error)
    await prisma.marketingCampaign.update({
      where: { id: campaignId },
      data: { status: 'FAILED' }
    })
  }
}

/**
 * Personalize message with company data
 */
function personalizeMessage(message: string, company: any): string {
  return message
    .replace(/\[Company\]/g, company.name)
    .replace(/\[Category\]/g, company.category)
    .replace(/\[City\]/g, company.city || '')
    .replace(/\[State\]/g, company.state || '')
    .replace(/\[Website\]/g, company.website || '')
}

/**
 * Calculate campaign analytics
 */
function calculateCampaignAnalytics(campaigns: any[]) {
  const totalSent = campaigns.reduce((sum, c) => sum + (c.stats as any).totalSent, 0)
  const totalDelivered = campaigns.reduce((sum, c) => sum + (c.stats as any).delivered, 0)
  const totalClaimed = campaigns.reduce((sum, c) => sum + (c.stats as any).claimed, 0)

  return {
    deliveryRate: totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0,
    claimRate: totalDelivered > 0 ? (totalClaimed / totalDelivered) * 100 : 0,
    conversionRate: totalSent > 0 ? (totalClaimed / totalSent) * 100 : 0
  }
}

/**
 * Get date range in milliseconds
 */
function getDateRangeMs(dateRange: string): number {
  const ranges = {
    '1d': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
    '90d': 90 * 24 * 60 * 60 * 1000
  }
  return ranges[dateRange as keyof typeof ranges] || ranges['7d']
}
