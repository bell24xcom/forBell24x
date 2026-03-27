import { NextResponse } from 'next/server';

export async function GET() {
  // Mock data for response time analysis
  const responseTimeAnalysis = {
    avgResponseTime: 2.4,
    responseTimeDistribution: [
      { range: '0-1 days', count: 456, percentage: 39.4 },
      { range: '1-2 days', count: 298, percentage: 25.7 },
      { range: '2-3 days', count: 187, percentage: 16.1 },
      { range: '3-5 days', count: 134, percentage: 11.6 },
      { range: '5+ days', count: 83, percentage: 7.2 }
    ]
  };

  return NextResponse.json(responseTimeAnalysis);
}
