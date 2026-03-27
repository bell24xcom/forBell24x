import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic';

/**
 * GET /api/n8n/analytics/dashboard - Get N8N scraping and marketing analytics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dateRange = searchParams.get('dateRange') || '30d'
    
    const startDate = new Date(Date.now() - getDateRangeMs(dateRange))

    // Get scraping analytics
    const scrapingStats = await getScrapingAnalytics(startDate)
    
    // Get claim analytics
    const claimStats = await getClaimAnalytics(startDate)
    
    // Get marketing analytics
    const marketingStats = await getMarketingAnalytics(startDate)
    
    // Get revenue projections
    const revenueProjections = await getRevenueProjections()

    return NextResponse.json({
      success: true,
      analytics: {
        scraping: scrapingStats,
        claims: claimStats,
        marketing: marketingStats,
        revenue: revenueProjections,
        summary: {
          totalCompaniesScraped: scrapingStats.totalScraped,
          totalClaims: claimStats.totalClaims,
          claimRate: claimStats.claimRate,
          totalRevenue: revenueProjections.monthlyRecurringRevenue * 12, // Annual revenue from MRR
          monthlyRecurringRevenue: revenueProjections.monthlyRecurringRevenue
        }
      }
    })

  } catch (error) {
    console.error('N8N Analytics API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}

/**
 * Get scraping analytics
 */
async function getScrapingAnalytics(startDate: Date) {
  const totalScraped = await prisma.scrapedCompany.count()
  
  const scrapedByDate = await prisma.scrapedCompany.groupBy({
    by: ['scrapedAt'],
    where: {
      scrapedAt: { gte: startDate }
    },
    _count: {
      id: true
    },
    orderBy: {
      scrapedAt: 'asc'
    }
  })

  const scrapedBySource = await prisma.scrapedCompany.groupBy({
    by: ['source'],
    _count: {
      id: true
    }
  })

  const scrapedByCategory = await prisma.scrapedCompany.groupBy({
    by: ['category'],
    _count: {
      id: true
    },
    orderBy: {
      _count: {
        id: 'desc'
      }
    },
    take: 10
  })

  return {
    totalScraped,
    scrapedByDate: scrapedByDate.map(item => ({
      date: item.scrapedAt.toISOString().split('T')[0],
      count: item._count.id
    })),
    scrapedBySource: scrapedBySource.map(item => ({
      source: item.source,
      count: item._count.id
    })),
    topCategories: scrapedByCategory.map(item => ({
      category: item.category,
      count: item._count.id
    }))
  }
}

/**
 * Get claim analytics
 */
async function getClaimAnalytics(startDate: Date) {
  const totalClaims = await prisma.companyClaim.count()
  
  const claimsByDate = await prisma.companyClaim.groupBy({
    by: ['claimedAt'],
    where: {
      claimedAt: { gte: startDate }
    },
    _count: {
      id: true
    },
    orderBy: {
      claimedAt: 'asc'
    }
  })

  const claimsByStatus = await prisma.companyClaim.groupBy({
    by: ['status'],
    _count: {
      id: true
    }
  })

  const claimsByCategory = await prisma.companyClaim.findMany({
    include: {
      scrapedCompany: {
        select: {
          category: true
        }
      }
    }
  })

  const categoryClaims = claimsByCategory.reduce((acc, claim) => {
    const category = claim.scrapedCompany.category
    acc[category] = (acc[category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const totalScraped = await prisma.scrapedCompany.count()
  const claimRate = totalScraped > 0 ? (totalClaims / totalScraped) * 100 : 0

  return {
    totalClaims,
    claimRate: parseFloat(claimRate.toFixed(2)),
    claimsByDate: claimsByDate.map(item => ({
      date: item.claimedAt.toISOString().split('T')[0],
      count: item._count.id
    })),
    claimsByStatus: claimsByStatus.map(item => ({
      status: item.status,
      count: item._count.id
    })),
    claimsByCategory: Object.entries(categoryClaims).map(([category, count]) => ({
      category,
      count
    })).sort((a, b) => b.count - a.count).slice(0, 10)
  }
}

/**
 * Get marketing analytics
 */
async function getMarketingAnalytics(startDate: Date) {
  const totalCampaigns = await prisma.marketingCampaign.count()
  
  const campaignsByType = await prisma.marketingCampaign.groupBy({
    by: ['campaignType'],
    _count: {
      id: true
    }
  })

  const campaignsByDate = await prisma.marketingCampaign.groupBy({
    by: ['createdAt'],
    where: {
      createdAt: { gte: startDate }
    },
    _count: {
      id: true
    },
    orderBy: {
      createdAt: 'asc'
    }
  })

  // Calculate campaign performance
  const campaigns = await prisma.marketingCampaign.findMany({
    include: {
      responses: true
    }
  })

  const campaignPerformance = campaigns.map(campaign => {
    const stats = campaign.stats as any
    const responses = campaign.responses
    
    return {
      id: campaign.id,
      campaignType: campaign.campaignType,
      totalSent: stats.totalSent || 0,
      delivered: stats.delivered || 0,
      opened: stats.opened || 0,
      clicked: stats.clicked || 0,
      claimed: stats.claimed || 0,
      converted: stats.converted || 0,
      deliveryRate: stats.totalSent > 0 ? (stats.delivered / stats.totalSent) * 100 : 0,
      openRate: stats.delivered > 0 ? (stats.opened / stats.delivered) * 100 : 0,
      clickRate: stats.opened > 0 ? (stats.clicked / stats.opened) * 100 : 0,
      claimRate: stats.delivered > 0 ? (stats.claimed / stats.delivered) * 100 : 0,
      conversionRate: stats.totalSent > 0 ? (stats.converted / stats.totalSent) * 100 : 0
    }
  })

  return {
    totalCampaigns,
    campaignsByType: campaignsByType.map(item => ({
      type: item.campaignType,
      count: item._count.id
    })),
    campaignsByDate: campaignsByDate.map(item => ({
      date: item.createdAt.toISOString().split('T')[0],
      count: item._count.id
    })),
    campaignPerformance,
    averageMetrics: {
      deliveryRate: campaignPerformance.reduce((sum, c) => sum + c.deliveryRate, 0) / campaignPerformance.length || 0,
      openRate: campaignPerformance.reduce((sum, c) => sum + c.openRate, 0) / campaignPerformance.length || 0,
      clickRate: campaignPerformance.reduce((sum, c) => sum + c.clickRate, 0) / campaignPerformance.length || 0,
      claimRate: campaignPerformance.reduce((sum, c) => sum + c.claimRate, 0) / campaignPerformance.length || 0,
      conversionRate: campaignPerformance.reduce((sum, c) => sum + c.conversionRate, 0) / campaignPerformance.length || 0
    }
  }
}

/**
 * Get revenue projections
 */
async function getRevenueProjections() {
  const totalClaims = await prisma.companyClaim.count()
  const verifiedClaims = await prisma.companyClaim.count({
    where: { status: 'VERIFIED' }
  })

  // Revenue projections based on your strategy
  const freeLifetimeBasicValue = 12000 // ₹12,000 per company
  const freePremiumMonthsValue = 18000 // ₹18,000 for 6 months
  const premiumMonthlyRate = 3000 // ₹3,000 per month
  
  // 30% of verified claims subscribe to premium after free period
  const expectedPremiumSubscribers = Math.floor(verifiedClaims * 0.3)
  
  // Revenue calculations
  const totalValueGiven = totalClaims * (freeLifetimeBasicValue + freePremiumMonthsValue)
  const monthlyRecurringRevenue = expectedPremiumSubscribers * premiumMonthlyRate
  const annualRecurringRevenue = monthlyRecurringRevenue * 12
  
  // Projections for different claim rates
  const projections = {
    '2%': {
      expectedClaims: Math.floor(totalClaims * 0.02),
      mrr: Math.floor(totalClaims * 0.02 * 0.3 * premiumMonthlyRate),
      arr: Math.floor(totalClaims * 0.02 * 0.3 * premiumMonthlyRate * 12)
    },
    '3%': {
      expectedClaims: Math.floor(totalClaims * 0.03),
      mrr: Math.floor(totalClaims * 0.03 * 0.3 * premiumMonthlyRate),
      arr: Math.floor(totalClaims * 0.03 * 0.3 * premiumMonthlyRate * 12)
    },
    '5%': {
      expectedClaims: Math.floor(totalClaims * 0.05),
      mrr: Math.floor(totalClaims * 0.05 * 0.3 * premiumMonthlyRate),
      arr: Math.floor(totalClaims * 0.05 * 0.3 * premiumMonthlyRate * 12)
    }
  }

  return {
    totalClaims,
    verifiedClaims,
    expectedPremiumSubscribers,
    totalValueGiven,
    monthlyRecurringRevenue,
    annualRecurringRevenue,
    projections,
    roi: {
      investment: totalValueGiven,
      expectedReturn: annualRecurringRevenue,
      paybackPeriod: totalValueGiven > 0 ? (totalValueGiven / monthlyRecurringRevenue) : 0
    }
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
