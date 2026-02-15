import { NextResponse } from 'next/server';

export async function GET() {
  // Mock data for market trends
  const marketTrends = [
    {
      category: 'Electronics',
      demandTrend: 'rising',
      priceVolatility: 0.15,
      supplierCompetition: 8.5,
      forecast: {
        nextMonth: 12,
        nextQuarter: 18,
        nextYear: 25
      }
    },
    {
      category: 'Automotive',
      demandTrend: 'stable',
      priceVolatility: 0.08,
      supplierCompetition: 7.2,
      forecast: {
        nextMonth: 5,
        nextQuarter: 8,
        nextYear: 12
      }
    },
    {
      category: 'Pharmaceuticals',
      demandTrend: 'rising',
      priceVolatility: 0.22,
      supplierCompetition: 9.1,
      forecast: {
        nextMonth: 15,
        nextQuarter: 22,
        nextYear: 35
      }
    },
    {
      category: 'Textiles',
      demandTrend: 'falling',
      priceVolatility: 0.12,
      supplierCompetition: 6.8,
      forecast: {
        nextMonth: -3,
        nextQuarter: -8,
        nextYear: -15
      }
    },
    {
      category: 'Machinery',
      demandTrend: 'rising',
      priceVolatility: 0.18,
      supplierCompetition: 7.9,
      forecast: {
        nextMonth: 8,
        nextQuarter: 14,
        nextYear: 22
      }
    },
    {
      category: 'Chemicals',
      demandTrend: 'stable',
      priceVolatility: 0.25,
      supplierCompetition: 8.2,
      forecast: {
        nextMonth: 2,
        nextQuarter: 4,
        nextYear: 8
      }
    }
  ];

  return NextResponse.json(marketTrends);
}
