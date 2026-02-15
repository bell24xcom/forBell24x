import { NextRequest, NextResponse } from 'next/server';

// Test API for Autonomous System
// Provides mock data for testing the admin dashboard
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testType = searchParams.get('type') || 'all';

    console.log(`🧪 Testing autonomous system: ${testType}`);

    const mockData = {
      scraping: {
        totalCompanies: 4000,
        categoriesCompleted: 400,
        lastScraped: new Date().toISOString(),
        nextScheduled: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
        systemHealth: 'EXCELLENT',
        activeScraping: true,
        companiesToday: 150,
        categoriesToday: 15
      },
      marketing: {
        totalCampaigns: 25,
        messagesSent: 1250,
        successRate: 95.5,
        totalValue: 37500,
        smsSent: 800,
        emailsSent: 450,
        whatsappSent: 0,
        activeCampaigns: 3,
        conversionRate: 12.5
      },
      claims: {
        totalClaims: 45,
        earlyUsers: 42,
        totalValue: 1260000, // ₹12.6L in benefits distributed
        conversionRate: 3.5,
        pendingClaims: 3,
        processedClaims: 42,
        averageClaimValue: 30000, // ₹30K per claim
        founderMembers: 42
      },
      revenue: {
        projectedAnnual: 15100000, // ₹15.1L
        monthlyTarget: 1258333, // ₹12.5L per month
        currentMonth: 375000, // ₹3.75L this month
        growthRate: 25.5,
        roi: 350
      }
    };

    let responseData: any = mockData;

    if (testType === 'scraping') {
      responseData = { scraping: mockData.scraping };
    } else if (testType === 'marketing') {
      responseData = { marketing: mockData.marketing };
    } else if (testType === 'claims') {
      responseData = { claims: mockData.claims };
    } else if (testType === 'revenue') {
      responseData = { revenue: mockData.revenue };
    }

    return NextResponse.json({
      success: true,
      message: 'Autonomous system test data loaded successfully',
      data: responseData,
      timestamp: new Date().toISOString(),
      systemStatus: 'ACTIVE'
    });

  } catch (error) {
    console.error('❌ Test API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to load test data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST endpoint to simulate system actions
export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json();

    console.log(`🎯 Simulating autonomous system action: ${action}`);

    let result = {};

    switch (action) {
      case 'start_scraping':
        result = {
          message: 'Autonomous scraping started successfully',
          companiesScraped: 10,
          categoriesProcessed: 1,
          duration: '6 hours',
          nextRun: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString()
        };
        break;

      case 'send_marketing':
        result = {
          message: 'Marketing campaign sent successfully',
          messagesSent: data?.targetCount || 100,
          successRate: 95.5,
          campaignId: `campaign_${Date.now()}`,
          estimatedReach: data?.targetCount || 100
        };
        break;

      case 'process_claim':
        result = {
          message: 'Company claim processed successfully',
          claimId: `claim_${Date.now()}`,
          benefits: {
            freeLifetimeBasic: 12000,
            sixMonthsPremium: 18000,
            totalValue: 30000
          },
          status: 'ACTIVE'
        };
        break;

      case 'update_analytics':
        result = {
          message: 'Analytics updated successfully',
          metrics: {
            totalCompanies: 4000,
            totalCampaigns: 25,
            totalClaims: 45,
            totalRevenue: 15100000
          },
          timestamp: new Date().toISOString()
        };
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Action simulated successfully',
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Test Action Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to simulate action',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
