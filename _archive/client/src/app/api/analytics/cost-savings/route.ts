import { NextResponse } from 'next/server';

export async function GET() {
  // Mock data for cost savings
  const costSavings = {
    totalSavings: 2847000,
    monthlySavings: 237250,
    yearOverYear: 23.5,
    topCategories: [
      { category: 'Electronics', savings: 890000, percentage: 31.3 },
      { category: 'Automotive', savings: 567000, percentage: 19.9 },
      { category: 'Machinery', savings: 423000, percentage: 14.9 },
      { category: 'Chemicals', savings: 298000, percentage: 10.5 }
    ]
  };

  return NextResponse.json(costSavings);
}
