import { NextResponse } from 'next/server';

export async function GET() {
  // Mock data for RFQ metrics
  const rfqMetrics = {
    total: 1247,
    open: 89,
    closed: 1158,
    pending: 23,
    avgResponseTime: 2.4,
    successRate: 87.3
  };

  return NextResponse.json(rfqMetrics);
}
