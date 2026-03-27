export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    // Get URL parameters
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    // Query RFQ and quote data for predictive analytics
    const rfqData = await prisma.rFQ.findMany({
      where: category ? { category: category } : {},
      select: {
        id: true,
        category: true,
        quantity: true,
        budget: true,
        createdAt: true,
        status: true
      },
      take: 100,
      orderBy: { createdAt: 'desc' }
    });

    const quoteData = await prisma.quote.findMany({
      include: {
        rfq: {
          select: {
            category: true,
            quantity: true,
            budget: true
          }
        }
      },
      take: 100,
      orderBy: { createdAt: 'desc' }
    });

    // Simple predictive algorithms
    const predictions = {
      // Market demand prediction
      demandPrediction: calculateDemandPrediction(rfqData),

      // Price trend prediction
      priceTrend: calculatePriceTrends(rfqData, quoteData),

      // Category growth prediction
      categoryGrowth: calculateCategoryGrowth(),

      // Supply probability prediction
      supplyProbability: calculateSupplyProbability(quoteData),

      metadata: {
        totalRFQs: rfqData.length,
        totalQuotes: quoteData.length,
        analyzedCategory: category || 'All categories',
        predictionDate: new Date().toISOString()
      }
    };

    return NextResponse.json({
      success: true,
      data: predictions
    });

  } catch (error) {
    console.error('Predictive analytics error:', error);
    return NextResponse.json({
      error: 'Failed to generate predictive analytics',
      success: false
    }, { status: 500 });
  }
}

function calculateDemandPrediction(rfqData: any[]) {
  // Simple trend analysis based on RFQ volume over time
  const monthGroups = rfqData.reduce((acc, rfq) => {
    const month = new Date(rfq.createdAt).toISOString().slice(0, 7); // YYYY-MM
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});

  const months = Object.keys(monthGroups).sort();
  const values = months.map(month => monthGroups[month]);

  // Calculate trend (simple linear regression slope)
  if (months.length < 2) return { trend: 'stable', confidence: 0 };

  const n = months.length;
  let sumXY = 0, sumX = 0, sumY = 0, sumX2 = 0;

  months.forEach((month, i) => {
    const x = i;
    const y = values[i];
    sumXY += x * y;
    sumX += x;
    sumY += y;
    sumX2 += x * x;
  });

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const trend = slope > 0.5 ? 'increasing' : slope < -0.5 ? 'decreasing' : 'stable';

  return {
    trend,
    confidence: Math.min(Math.abs(slope) / 5, 1), // Normalize to 0-1
    monthsAnalyzed: n,
    monthlyAverage: Math.round(sumY / n)
  };
}

function calculatePriceTrends(rfqData: any[], quoteData: any[]) {
  // Analyze price trends from quotes
  const validPrices = quoteData
    .filter(q => q.price && q.price > 0)
    .map(q => q.price);

  if (validPrices.length === 0) {
    return { averagePrice: 0, trend: 'insufficient_data', confidence: 0 };
  }

  const averagePrice = validPrices.reduce((a, b) => a + b, 0) / validPrices.length;

  // Price variability
  const variance = validPrices.reduce((sum, price) => {
    return sum + Math.pow(price - averagePrice, 2);
  }, 0) / validPrices.length;

  const volatility = Math.sqrt(variance) / averagePrice;

  return {
    averagePrice: Number(averagePrice.toFixed(2)),
    volatility: Number(volatility.toFixed(3)),
    volatility_level: volatility > 0.2 ? 'high' : volatility > 0.1 ? 'medium' : 'low',
    sampleSize: validPrices.length,
    priceRange: {
      min: Math.min(...validPrices),
      max: Math.max(...validPrices)
    }
  };
}

function calculateCategoryGrowth() {
  // Mock growth predictions - replace with real data analysis
  return {
    topGrowingCategories: [
      { category: 'Electronics', growth: 15.2 },
      { category: 'Machinery', growth: 12.8 },
      { category: 'Chemicals', growth: 9.5 },
      { category: 'Construction', growth: 8.1 },
      { category: 'Textiles', growth: -2.1 }
    ],
    nextQuarterPrediction: 'positive',
    marketSentiment: 'bullish'
  };
}

function calculateSupplyProbability(quoteData: any[]) {
  // Calculate response rate and supply availability
  if (quoteData.length === 0) {
    return { responseRate: 0, supplyConfidence: 'unknown' };
  }

  // In a real scenario, this would compare RFQs to quotes
  // For now, we'll use quote data as a proxy
  const avgResponseTime = 2.5; // days (mock)
  const successRate = 0.75; // 75% success rate (mock)

  return {
    responseRate: successRate,
    averageResponseTime: avgResponseTime,
    supplyConfidence: successRate > 0.8 ? 'high' : successRate > 0.6 ? 'medium' : 'low',
    demandCoverage: successRate * 100 // percentage
  };
}
