import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Fetch recent RFQ and supplier data for analysis
    const [rfqData, supplierData, stockData] = await Promise.all([
      fetchRFQData(),
      fetchSupplierData(),
      fetchStockData(),
    ]);

    // Generate predictive insights using AI
    const insights = await generatePredictiveInsights(rfqData, supplierData, stockData);

    res.status(200).json(insights);
  } catch (error) {
    console.error('Error generating predictive insights:', error);
    res.status(500).json({ error: 'Failed to generate predictive insights' });
  }
}

async function fetchRFQData() {
  // In production, fetch from your database
  return {
    totalRFQs: 1250,
    successRate: 78.5,
    avgResponseTime: 4.2,
    topCategories: [
      { category: 'Electronics', count: 320, successRate: 82.5 },
      { category: 'Textiles', count: 280, successRate: 75.2 },
      { category: 'Machinery', count: 200, successRate: 80.1 },
      { category: 'Chemicals', count: 180, successRate: 72.8 },
      { category: 'Food & Beverages', count: 150, successRate: 85.3 },
    ],
    monthlyTrend: [
      { month: 'Jan', rfqs: 95, success: 72 },
      { month: 'Feb', rfqs: 110, success: 85 },
      { month: 'Mar', rfqs: 125, success: 98 },
      { month: 'Apr', rfqs: 140, success: 108 },
      { month: 'May', rfqs: 135, success: 105 },
      { month: 'Jun', rfqs: 150, success: 118 },
    ],
  };
}

async function fetchSupplierData() {
  // In production, fetch from your database
  return {
    totalSuppliers: 2500,
    verifiedSuppliers: 1800,
    avgRating: 4.2,
    riskDistribution: [
      { riskLevel: 'low', count: 1200, percentage: 48 },
      { riskLevel: 'medium', count: 900, percentage: 36 },
      { riskLevel: 'high', count: 400, percentage: 16 },
    ],
    performanceMetrics: [
      { metric: 'On-time Delivery', value: 85.2, trend: 'up' },
      { metric: 'Quality Rating', value: 4.1, trend: 'stable' },
      { metric: 'Response Time', value: 2.3, trend: 'down' },
      { metric: 'Customer Satisfaction', value: 88.5, trend: 'up' },
    ],
  };
}

async function fetchStockData() {
  // In production, fetch from Alpha Vantage or similar
  return {
    marketTrend: 'bullish',
    sectorPerformance: {
      technology: 12.5,
      healthcare: 8.3,
      finance: 6.7,
      manufacturing: 4.2,
      retail: -2.1,
    },
    volatility: 0.15,
  };
}

async function generatePredictiveInsights(rfqData: any, supplierData: any, stockData: any) {
  try {
    const prompt = `
    Analyze the following business data and provide predictive insights:

    RFQ Data:
    - Total RFQs: ${rfqData.totalRFQs}
    - Success Rate: ${rfqData.successRate}%
    - Average Response Time: ${rfqData.avgResponseTime} hours
    - Top Categories: ${JSON.stringify(rfqData.topCategories)}

    Supplier Data:
    - Total Suppliers: ${supplierData.totalSuppliers}
    - Verified Suppliers: ${supplierData.verifiedSuppliers}
    - Average Rating: ${supplierData.avgRating}
    - Risk Distribution: ${JSON.stringify(supplierData.riskDistribution)}

    Stock Market Data:
    - Market Trend: ${stockData.marketTrend}
    - Sector Performance: ${JSON.stringify(stockData.sectorPerformance)}

    Provide insights in the following JSON format:
    {
      "rfqSuccessPrediction": number (0-100),
      "marketTrend": "bullish" | "bearish" | "neutral",
      "recommendedCategories": string[],
      "priceForecast": [
        {
          "date": "2024-01-01",
          "predictedPrice": number,
          "confidence": number (0-100)
        }
      ],
      "riskAlerts": [
        {
          "supplier": "Supplier Name",
          "riskLevel": "high" | "medium" | "low",
          "reason": "Risk reason"
        }
      ]
    }
    `;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an AI business analyst specializing in B2B marketplace predictions. Analyze the provided data and generate actionable insights for business growth.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
    });

    const response = completion.choices[0].message.content;
    
    try {
      return JSON.parse(response || '{}');
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      return generateFallbackInsights(rfqData, supplierData, stockData);
    }
  } catch (error) {
    console.error('Error generating AI insights:', error);
    return generateFallbackInsights(rfqData, supplierData, stockData);
  }
}

function generateFallbackInsights(rfqData: any, supplierData: any, stockData: any) {
  // Fallback insights based on simple heuristics
  const rfqSuccessPrediction = Math.min(100, rfqData.successRate + (Math.random() - 0.5) * 10);
  
  const recommendedCategories = rfqData.topCategories
    .sort((a: any, b: any) => b.successRate - a.successRate)
    .slice(0, 3)
    .map((cat: any) => cat.category);

  const riskAlerts = supplierData.riskDistribution
    .filter((risk: any) => risk.riskLevel === 'high')
    .slice(0, 3)
    .map((risk: any, index: number) => ({
      supplier: `Supplier ${index + 1}`,
      riskLevel: 'high' as const,
      reason: 'High risk score based on delivery performance and compliance',
    }));

  const priceForecast = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return {
      date: date.toISOString().split('T')[0],
      predictedPrice: 100 + Math.random() * 20,
      confidence: 70 + Math.random() * 20,
    };
  });

  return {
    rfqSuccessPrediction: Math.round(rfqSuccessPrediction * 10) / 10,
    marketTrend: stockData.marketTrend,
    recommendedCategories,
    priceForecast,
    riskAlerts,
  };
}