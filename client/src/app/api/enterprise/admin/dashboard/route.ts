import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Mock data for admin dashboard
    const mockData = {
      status: 'success',
      platform: {
        totalUsers: 1250,
        totalSuppliers: 847,
        totalBuyers: 403,
        totalTransactions: 2341,
        totalRevenue: 12500000, // ₹1.25Cr
        activeRFQs: 156
      },
      system: {
        database: 'healthy',
        api: 'operational',
        uptime: 86400, // 24 hours in seconds
        memory: {
          used: '2.1GB',
          total: '4GB',
          percentage: 52.5
        },
        region: 'Mumbai (BOM1)'
      },
      revenue: {
        total: 12500000,
        monthly: 2100000,
        growth: 15.8,
        topCategories: [
          {
            category: 'Manufacturing',
            revenue: 4500000,
            growth: 22.5
          },
          {
            category: 'Electronics',
            revenue: 3200000,
            growth: 18.3
          },
          {
            category: 'Textiles',
            revenue: 2800000,
            growth: 12.7
          },
          {
            category: 'Chemicals',
            revenue: 2000000,
            growth: 8.9
          }
        ]
      }
    };

    return NextResponse.json(mockData);
  } catch (error) {
    console.error('Admin dashboard API error:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Failed to fetch admin dashboard data' 
      },
      { status: 500 }
    );
  }
}
