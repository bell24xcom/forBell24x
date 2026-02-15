import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface RFQAnalysis {
  marketPrice: { min: number; max: number; avg: number };
  supplierRisk: { score: number; factors: string[] };
  competitorPrices: { range: number[]; sources: string[] };
  demandForecast: { trend: 'up' | 'down' | 'stable'; factor: number };
  negotiationSuggestions: string[];
  successProbability: number;
}

interface ComplexRFQ {
  id: string;
  products: Array<{
    name: string;
    quantity: number;
    specifications: Record<string, any>;
    budget: number;
  }>;
  suppliers: string[];
  timeline: string;
  location: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export const analyzeComplexRFQ = async (rfq: ComplexRFQ): Promise<RFQAnalysis> => {
  try {
    // 1. Market Analysis for each product
    const marketAnalyses = await Promise.all(
      rfq.products.map(async (product) => {
        const marketData = await getMarketPrice(product.name, product.specifications);
        const demandData = await getDemandForecast(product.name);
        const competitorData = await getCompetitorPrices(product.name);
        
        return {
          product: product.name,
          marketPrice: marketData,
          demand: demandData,
          competitors: competitorData,
          riskScore: calculateRiskScore(marketData, demandData, competitorData)
        };
      })
    );

    // 2. Supplier Risk Assessment
    const supplierRisks = await Promise.all(
      rfq.suppliers.map(async (supplierId) => {
        const supplier = await prisma.user.findUnique({
          where: { id: supplierId },
          include: { 
            products: true,
            transactions: true,
            rfqResponses: true
          }
        });

        return {
          supplierId,
          riskScore: calculateSupplierRisk(supplier),
          reliability: supplier?.rfqResponses?.length || 0,
          rating: supplier?.rating || 0,
          responseTime: calculateAverageResponseTime(supplier?.rfqResponses || [])
        };
      })
    );

    // 3. Negotiation Strategy Generation
    const negotiationStrategy = generateNegotiationStrategy({
      marketAnalyses,
      supplierRisks,
      timeline: rfq.timeline,
      priority: rfq.priority,
      totalBudget: rfq.products.reduce((sum, p) => sum + p.budget, 0)
    });

    // 4. Success Probability Calculation
    const successProbability = calculateSuccessProbability({
      marketAnalyses,
      supplierRisks,
      negotiationStrategy,
      urgency: rfq.priority === 'urgent' ? 1.2 : 1.0
    });

    return {
      marketPrice: aggregateMarketPrices(marketAnalyses),
      supplierRisk: aggregateSupplierRisks(supplierRisks),
      competitorPrices: aggregateCompetitorPrices(marketAnalyses),
      demandForecast: aggregateDemandForecast(marketAnalyses),
      negotiationSuggestions: negotiationStrategy.suggestions,
      successProbability
    };

  } catch (error) {
    console.error('Complex RFQ analysis failed:', error);
    throw new Error('Failed to analyze complex RFQ');
  }
};

const getMarketPrice = async (productName: string, specs: Record<string, any>) => {
  // Simulate market data API call
  const basePrice = 45000; // Base price per ton
  const specMultiplier = Object.keys(specs).length * 0.1;
  const marketVolatility = Math.random() * 0.2; // ±10% market fluctuation
  
  return {
    min: basePrice * (1 - marketVolatility),
    max: basePrice * (1 + marketVolatility),
    avg: basePrice * (1 + specMultiplier)
  };
};

const getDemandForecast = async (productName: string) => {
  // Simulate demand forecasting
  const trends = ['up', 'down', 'stable'];
  const trend = trends[Math.floor(Math.random() * trends.length)];
  const factor = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
  
  return { trend, factor };
};

const getCompetitorPrices = async (productName: string) => {
  // Simulate competitor price analysis
  const basePrice = 45000;
  const competitors = [
    basePrice * 0.95, // 5% below
    basePrice * 1.05, // 5% above
    basePrice * 0.98, // 2% below
    basePrice * 1.02  // 2% above
  ];
  
  return {
    range: competitors,
    sources: ['Supplier A', 'Supplier B', 'Supplier C', 'Supplier D']
  };
};

const calculateRiskScore = (marketData: any, demandData: any, competitorData: any) => {
  const marketVolatility = (marketData.max - marketData.min) / marketData.avg;
  const demandStability = demandData.trend === 'stable' ? 0.1 : 0.3;
  const competitionIntensity = competitorData.range.length > 3 ? 0.2 : 0.1;
  
  return Math.min(1, marketVolatility + demandStability + competitionIntensity);
};

const calculateSupplierRisk = (supplier: any) => {
  if (!supplier) return 0.5;
  
  const factors = [
    supplier.rating / 5, // Rating factor
    Math.min(1, supplier.rfqResponses?.length / 10), // Experience factor
    supplier.transactions?.length > 0 ? 0.1 : 0.3, // Transaction history
    supplier.verified ? 0.1 : 0.2 // Verification status
  ];
  
  return factors.reduce((sum, factor) => sum + factor, 0) / factors.length;
};

const calculateAverageResponseTime = (responses: any[]) => {
  if (responses.length === 0) return 24; // Default 24 hours
  
  const responseTimes = responses.map(r => {
    const created = new Date(r.createdAt);
    const responded = new Date(r.respondedAt || Date.now());
    return (responded.getTime() - created.getTime()) / (1000 * 60 * 60); // Hours
  });
  
  return responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
};

const generateNegotiationStrategy = (data: any) => {
  const suggestions = [];
  
  // Price-based suggestions
  if (data.totalBudget > 1000000) {
    suggestions.push('Consider bulk discount of 5-10% for large order');
  }
  
  // Timeline-based suggestions
  if (data.timeline === 'urgent') {
    suggestions.push('Offer premium for faster delivery');
  }
  
  // Supplier-based suggestions
  const highRiskSuppliers = data.supplierRisks.filter((s: any) => s.riskScore > 0.7);
  if (highRiskSuppliers.length > 0) {
    suggestions.push('Request additional guarantees from high-risk suppliers');
  }
  
  // Market-based suggestions
  const avgDemandFactor = data.marketAnalyses.reduce((sum: number, m: any) => sum + m.demand.factor, 0) / data.marketAnalyses.length;
  if (avgDemandFactor > 1.1) {
    suggestions.push('Market demand is high - consider locking prices early');
  }
  
  return { suggestions };
};

const calculateSuccessProbability = (data: any) => {
  const factors = [
    data.supplierRisks.reduce((sum: number, s: any) => sum + (1 - s.riskScore), 0) / data.supplierRisks.length, // Supplier reliability
    data.marketAnalyses.reduce((sum: number, m: any) => sum + (1 - m.riskScore), 0) / data.marketAnalyses.length, // Market stability
    data.urgency === 1.2 ? 0.8 : 1.0, // Urgency factor
    data.negotiationStrategy.suggestions.length > 0 ? 1.1 : 1.0 // Strategy availability
  ];
  
  return Math.min(1, factors.reduce((sum, factor) => sum + factor, 0) / factors.length);
};

const aggregateMarketPrices = (marketAnalyses: any[]) => {
  const allPrices = marketAnalyses.flatMap(m => [m.marketPrice.min, m.marketPrice.max, m.marketPrice.avg]);
  return {
    min: Math.min(...allPrices),
    max: Math.max(...allPrices),
    avg: allPrices.reduce((sum, price) => sum + price, 0) / allPrices.length
  };
};

const aggregateSupplierRisks = (supplierRisks: any[]) => {
  const avgRisk = supplierRisks.reduce((sum, s) => sum + s.riskScore, 0) / supplierRisks.length;
  const riskFactors = supplierRisks
    .filter(s => s.riskScore > 0.7)
    .map(s => `Supplier ${s.supplierId}: High risk due to limited history`);
  
  return {
    score: avgRisk,
    factors: riskFactors
  };
};

const aggregateCompetitorPrices = (marketAnalyses: any[]) => {
  const allCompetitorPrices = marketAnalyses.flatMap(m => m.competitors.range);
  return {
    range: allCompetitorPrices,
    sources: marketAnalyses.flatMap(m => m.competitors.sources)
  };
};

const aggregateDemandForecast = (marketAnalyses: any[]) => {
  const trends = marketAnalyses.map(m => m.demand.trend);
  const factors = marketAnalyses.map(m => m.demand.factor);
  
  const avgFactor = factors.reduce((sum, factor) => sum + factor, 0) / factors.length;
  const dominantTrend = trends.filter(t => t === 'up').length > trends.length / 2 ? 'up' : 
                       trends.filter(t => t === 'down').length > trends.length / 2 ? 'down' : 'stable';
  
  return {
    trend: dominantTrend,
    factor: avgFactor
  };
};

export const generateNegotiationReport = async (rfqId: string) => {
  const rfq = await prisma.rFQ.findUnique({
    where: { id: rfqId },
    include: {
      products: true,
      responses: {
        include: {
          supplier: true
        }
      }
    }
  });

  if (!rfq) throw new Error('RFQ not found');

  const analysis = await analyzeComplexRFQ({
    id: rfq.id,
    products: rfq.products.map(p => ({
      name: p.name,
      quantity: p.quantity,
      specifications: p.specifications as Record<string, any>,
      budget: p.budget
    })),
    suppliers: rfq.responses.map(r => r.supplierId),
    timeline: rfq.deadline,
    location: rfq.location,
    priority: rfq.priority as any
  });

  return {
    rfqId,
    analysis,
    recommendations: analysis.negotiationSuggestions,
    successProbability: analysis.successProbability,
    nextSteps: generateNextSteps(analysis)
  };
};

const generateNextSteps = (analysis: RFQAnalysis) => {
  const steps = [];
  
  if (analysis.successProbability > 0.8) {
    steps.push('Proceed with current strategy - high success probability');
  } else if (analysis.successProbability > 0.6) {
    steps.push('Consider adjusting pricing strategy');
    steps.push('Request additional supplier quotes');
  } else {
    steps.push('Review market conditions');
    steps.push('Consider alternative suppliers');
    steps.push('Adjust timeline if possible');
  }
  
  return steps;
}; 
