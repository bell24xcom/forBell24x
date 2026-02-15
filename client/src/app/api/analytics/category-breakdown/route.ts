import { NextResponse } from 'next/server';

export async function GET() {
  // Mock data for category breakdown
  const categoryBreakdown = [
    { category: 'Electronics', rfqCount: 234, avgBudget: 125000, successRate: 89.2, supplierCount: 156 },
    { category: 'Automotive', rfqCount: 189, avgBudget: 89000, successRate: 85.7, supplierCount: 134 },
    { category: 'Machinery', rfqCount: 156, avgBudget: 234000, successRate: 82.1, supplierCount: 98 },
    { category: 'Chemicals', rfqCount: 123, avgBudget: 67000, successRate: 88.6, supplierCount: 87 },
    { category: 'Textiles', rfqCount: 98, avgBudget: 45000, successRate: 91.3, supplierCount: 76 },
    { category: 'Pharmaceuticals', rfqCount: 87, avgBudget: 156000, successRate: 86.9, supplierCount: 65 }
  ];

  return NextResponse.json(categoryBreakdown);
}
