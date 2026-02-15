import { NextResponse } from 'next/server';

export async function GET() {
  // Mock data for monthly trends
  const monthlyTrends = [
    { month: 'Jan 2024', rfqCount: 89, avgBudget: 98000, supplierCount: 234, successRate: 85.2 },
    { month: 'Feb 2024', rfqCount: 92, avgBudget: 102000, supplierCount: 241, successRate: 86.7 },
    { month: 'Mar 2024', rfqCount: 95, avgBudget: 108000, supplierCount: 248, successRate: 87.1 },
    { month: 'Apr 2024', rfqCount: 98, avgBudget: 115000, supplierCount: 256, successRate: 88.3 },
    { month: 'May 2024', rfqCount: 101, avgBudget: 122000, supplierCount: 263, successRate: 89.1 },
    { month: 'Jun 2024', rfqCount: 104, avgBudget: 128000, supplierCount: 271, successRate: 89.8 }
  ];

  return NextResponse.json(monthlyTrends);
}
