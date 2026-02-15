import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const now = new Date();
    const { searchParams } = new URL(req.url);
    const timeRange = searchParams.get('range') || '7d';

    // Mock analytics data
    const analytics = {
      metrics: {
        totalUsers: 1247,
        activeSuppliers: 89,
        totalRevenue: 2450000,
        systemHealth: 99.2,
        aiAccuracy: 94.2,
        fraudDetection: 98.1,
        uptime: 99.9,
        performanceScore: 96.8,
        recentLeads: 156,
        recentRfqs: 89
      },
      growth: {
        userGrowth: 12.5,
        revenueGrowth: 18.3,
        leadGrowth: 15.2,
        supplierGrowth: 8.7
      },
      timeRange,
      lastUpdated: now.toISOString()
    };

    return NextResponse.json(analytics);
    
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch analytics data' 
    }, { status: 500 });
  }
}
