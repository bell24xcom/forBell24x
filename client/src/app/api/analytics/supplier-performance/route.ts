import { NextResponse } from 'next/server';

export async function GET() {
  // Mock data for supplier performance
  const supplierPerformance = {
    total: 3421,
    active: 2897,
    verified: 2156,
    avgRating: 4.2,
    topPerformers: 156
  };

  return NextResponse.json(supplierPerformance);
}
