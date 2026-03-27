import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for benefits tracking
const BenefitsTrackingSchema = z.object({
  userId: z.string().min(1),
  benefitType: z.enum(['free_lifetime_basic', 'free_premium_months', 'early_user_badge', 'priority_support']),
  action: z.enum(['activated', 'used', 'expired', 'renewed']),
  value: z.number().optional(),
  metadata: z.record(z.any()).optional()
})

/**
 * POST /api/benefits/track - Track early user benefits usage
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = BenefitsTrackingSchema.parse(body)

    const { userId, benefitType, action, value, metadata } = validatedData

    // Create benefits tracking record
    const trackingRecord = await prisma.benefitsTracking.create({
      data: {
        userId,
        benefitType: benefitType.toUpperCase() as any,
        action: action.toUpperCase() as any,
        value: value || 0,
        metadata: metadata || {},
        trackedAt: new Date()
      }
    })

    // Update user benefits status
    await updateUserBenefitsStatus(userId, benefitType, action)

    // Calculate total value used
    const totalValueUsed = await calculateTotalValueUsed(userId)

    return NextResponse.json({
      success: true,
      message: 'Benefits usage tracked successfully',
      data: {
        trackingId: trackingRecord.id,
        benefitType,
        action,
        value,
        totalValueUsed,
        trackedAt: trackingRecord.trackedAt
      }
    })

  } catch (error) {
    console.error('Benefits tracking error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to track benefits usage' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/benefits/track - Get benefits tracking data
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const benefitType = searchParams.get('benefitType')
    const dateRange = searchParams.get('dateRange') || '30d'

    const startDate = new Date(Date.now() - getDateRangeMs(dateRange))

    const whereClause: any = {
      trackedAt: {
        gte: startDate
      }
    }

    if (userId) {
      whereClause.userId = userId
    }

    if (benefitType) {
      whereClause.benefitType = benefitType
    }

    const trackingData = await prisma.benefitsTracking.findMany({
      where: whereClause,
      orderBy: {
        trackedAt: 'desc'
      }
    })

    // Calculate summary statistics
    const summary = await calculateBenefitsSummary(trackingData)

    return NextResponse.json({
      success: true,
      data: {
        tracking: trackingData,
        summary
      }
    })

  } catch (error) {
    console.error('Get benefits tracking error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch benefits tracking data' },
      { status: 500 }
    )
  }
}

/**
 * Update user benefits status
 */
async function updateUserBenefitsStatus(userId: string, benefitType: string, action: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true }
    })

    if (!user) {
      throw new Error('User not found')
    }

    // Update benefits based on action
    switch (action) {
      case 'activated':
        await prisma.user.update({
          where: { id: userId },
          data: {
            isVerified: true,
            updatedAt: new Date()
          }
        })
        break

      case 'used':
        // Track usage in user profile
        if (user.profile) {
          const currentUsage = user.profile.preferences as any || {}
          currentUsage.benefitsUsage = currentUsage.benefitsUsage || {}
          currentUsage.benefitsUsage[benefitType] = (currentUsage.benefitsUsage[benefitType] || 0) + 1

          await prisma.userProfile.update({
            where: { userId },
            data: {
              preferences: currentUsage
            }
          })
        }
        break

      case 'expired':
        // Handle benefit expiration
        await handleBenefitExpiration(userId, benefitType)
        break

      case 'renewed':
        // Handle benefit renewal
        await handleBenefitRenewal(userId, benefitType)
        break
    }

  } catch (error) {
    console.error('Failed to update user benefits status:', error)
  }
}

/**
 * Calculate total value used by user
 */
async function calculateTotalValueUsed(userId: string): Promise<number> {
  try {
    const trackingRecords = await prisma.benefitsTracking.findMany({
      where: {
        userId,
        action: 'USED'
      }
    })

    return trackingRecords.reduce((total, record) => total + (record.value || 0), 0)
  } catch (error) {
    console.error('Failed to calculate total value used:', error)
    return 0
  }
}

/**
 * Calculate benefits summary
 */
async function calculateBenefitsSummary(trackingData: any[]) {
  const summary = {
    totalActivations: 0,
    totalUsage: 0,
    totalValue: 0,
    benefitBreakdown: {} as Record<string, any>,
    userBreakdown: {} as Record<string, any>
  }

  trackingData.forEach(record => {
    // Count activations
    if (record.action === 'activated') {
      summary.totalActivations++
    }

    // Count usage
    if (record.action === 'used') {
      summary.totalUsage++
      summary.totalValue += record.value || 0
    }

    // Benefit type breakdown
    if (!summary.benefitBreakdown[record.benefitType]) {
      summary.benefitBreakdown[record.benefitType] = {
        activations: 0,
        usage: 0,
        value: 0
      }
    }

    if (record.action === 'activated') {
      summary.benefitBreakdown[record.benefitType].activations++
    } else if (record.action === 'used') {
      summary.benefitBreakdown[record.benefitType].usage++
      summary.benefitBreakdown[record.benefitType].value += record.value || 0
    }

    // User breakdown
    if (!summary.userBreakdown[record.userId]) {
      summary.userBreakdown[record.userId] = {
        activations: 0,
        usage: 0,
        value: 0
      }
    }

    if (record.action === 'activated') {
      summary.userBreakdown[record.userId].activations++
    } else if (record.action === 'used') {
      summary.userBreakdown[record.userId].usage++
      summary.userBreakdown[record.userId].value += record.value || 0
    }
  })

  return summary
}

/**
 * Handle benefit expiration
 */
async function handleBenefitExpiration(userId: string, benefitType: string) {
  try {
    // Log expiration
    console.log(`Benefit ${benefitType} expired for user ${userId}`)

    // Send notification about expiration
    await sendBenefitExpirationNotification(userId, benefitType)

    // Update user status if needed
    if (benefitType === 'free_premium_months') {
      await prisma.user.update({
        where: { id: userId },
        data: {
          updatedAt: new Date()
        }
      })
    }

  } catch (error) {
    console.error('Failed to handle benefit expiration:', error)
  }
}

/**
 * Handle benefit renewal
 */
async function handleBenefitRenewal(userId: string, benefitType: string) {
  try {
    // Log renewal
    console.log(`Benefit ${benefitType} renewed for user ${userId}`)

    // Send renewal notification
    await sendBenefitRenewalNotification(userId, benefitType)

  } catch (error) {
    console.error('Failed to handle benefit renewal:', error)
  }
}

/**
 * Send benefit expiration notification
 */
async function sendBenefitExpirationNotification(userId: string, benefitType: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (user?.email) {
      await fetch(`${process.env.NEXTAUTH_URL}/api/marketing/email/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: user.email,
          subject: '⏰ Your Bell24h Benefit is Expiring Soon',
          template: 'benefit-expiration',
          data: {
            benefitType,
            renewalUrl: `${process.env.NEXTAUTH_URL}/benefits/renew/${benefitType}`
          }
        })
      })
    }
  } catch (error) {
    console.error('Failed to send expiration notification:', error)
  }
}

/**
 * Send benefit renewal notification
 */
async function sendBenefitRenewalNotification(userId: string, benefitType: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (user?.email) {
      await fetch(`${process.env.NEXTAUTH_URL}/api/marketing/email/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: user.email,
          subject: '🎉 Your Bell24h Benefit Has Been Renewed!',
          template: 'benefit-renewal',
          data: {
            benefitType
          }
        })
      })
    }
  } catch (error) {
    console.error('Failed to send renewal notification:', error)
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
  return ranges[dateRange as keyof typeof ranges] || ranges['30d']
}
