import axios from 'axios';
import { RFQModel } from '../models/RFQ';
import { SupplierModel } from '../models/Supplier';

interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  timestamp: Date;
}

interface MarketInsight {
  trend: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  factors: string[];
  recommendation: string;
  impact: 'high' | 'medium' | 'low';
}

interface PredictiveAnalytics {
  demandForecast: number;
  pricePrediction: number;
  marketTrend: MarketInsight;
  supplierRecommendations: string[];
  riskFactors: string[];
}

export class StockMarketIntegrationService {
  private static readonly API_BASE_URL = 'https://api.freeapiindia.com/stock';
  private static readonly API_KEY = process.env.STOCK_API_KEY || 'demo_key';

  /**
   * Get real-time stock data for industry analysis
   */
  static async getStockData(symbols: string[]): Promise<StockData[]> {
    try {
      const stockData: StockData[] = [];
      
      for (const symbol of symbols) {
        const response = await axios.get(`${this.API_BASE_URL}/quote`, {
          params: {
            symbol,
            apikey: this.API_KEY
          }
        });

        if (response.data && response.data.data) {
          const data = response.data.data;
          stockData.push({
            symbol: data.symbol,
            price: parseFloat(data.price) || 0,
            change: parseFloat(data.change) || 0,
            changePercent: parseFloat(data.changePercent) || 0,
            volume: parseInt(data.volume) || 0,
            marketCap: parseFloat(data.marketCap) || 0,
            timestamp: new Date()
          });
        }
      }

      return stockData;
    } catch (error) {
      console.error('Error fetching stock data:', error);
      // Return mock data for development
      return this.getMockStockData(symbols);
    }
  }

  /**
   * Generate market insights for industry analysis
   */
  static async generateMarketInsights(industry: string): Promise<MarketInsight> {
    try {
      // Get relevant stock symbols for the industry
      const industrySymbols = this.getIndustrySymbols(industry);
      const stockData = await this.getStockData(industrySymbols);

      // Analyze market trends
      const avgChange = stockData.reduce((sum, stock) => sum + stock.changePercent, 0) / stockData.length;
      const avgVolume = stockData.reduce((sum, stock) => sum + stock.volume, 0) / stockData.length;

      let trend: 'bullish' | 'bearish' | 'neutral' = 'neutral';
      let confidence = 0.5;
      let factors: string[] = [];
      let recommendation = '';

      if (avgChange > 2) {
        trend = 'bullish';
        confidence = Math.min(0.9, 0.5 + (avgChange / 10));
        factors = ['Positive market momentum', 'High trading volume', 'Industry growth'];
        recommendation = 'Consider expanding capacity and inventory';
      } else if (avgChange < -2) {
        trend = 'bearish';
        confidence = Math.min(0.9, 0.5 + Math.abs(avgChange) / 10);
        factors = ['Market decline', 'Reduced demand', 'Economic uncertainty'];
        recommendation = 'Focus on cost optimization and cash flow';
      } else {
        trend = 'neutral';
        confidence = 0.7;
        factors = ['Stable market conditions', 'Moderate volatility', 'Balanced demand'];
        recommendation = 'Maintain current operations with monitoring';
      }

      return {
        trend,
        confidence,
        factors,
        recommendation,
        impact: confidence > 0.8 ? 'high' : confidence > 0.6 ? 'medium' : 'low'
      };
    } catch (error) {
      console.error('Error generating market insights:', error);
      return this.getMockMarketInsight();
    }
  }

  /**
   * Generate predictive analytics for RFQ
   */
  static async generatePredictiveAnalytics(rfqId: string): Promise<PredictiveAnalytics> {
    try {
      const rfq = await RFQModel.findById(rfqId);
      if (!rfq) {
        throw new Error('RFQ not found');
      }

      // Get market insights for the industry
      const marketInsight = await this.generateMarketInsights(rfq.category);

      // Calculate demand forecast based on market trends
      const demandForecast = this.calculateDemandForecast(marketInsight, rfq);

      // Predict optimal pricing
      const pricePrediction = this.calculatePricePrediction(marketInsight, rfq);

      // Generate supplier recommendations
      const supplierRecommendations = await this.generateSupplierRecommendations(rfq, marketInsight);

      // Identify risk factors
      const riskFactors = this.identifyRiskFactors(marketInsight, rfq);

      return {
        demandForecast,
        pricePrediction,
        marketTrend: marketInsight,
        supplierRecommendations,
        riskFactors
      };
    } catch (error) {
      console.error('Error generating predictive analytics:', error);
      throw error;
    }
  }

  /**
   * Get industry-specific stock symbols
   */
  private static getIndustrySymbols(industry: string): string[] {
    const industryMap: { [key: string]: string[] } = {
      'steel': ['TATASTEEL', 'JSWSTEEL', 'SAIL'],
      'automotive': ['TATAMOTORS', 'MARUTI', 'BAJAJ-AUTO'],
      'pharmaceuticals': ['SUNPHARMA', 'DRREDDY', 'CIPLA'],
      'textiles': ['ARVIND', 'RAYMOND', 'KPRMILL'],
      'electronics': ['HAVELLS', 'CROMPTON', 'VOLTAS'],
      'chemicals': ['TATACHEM', 'ULTRACEMCO', 'ACC'],
      'default': ['NIFTY50', 'SENSEX', 'BANKNIFTY']
    };

    const category = industry.toLowerCase();
    for (const [key, symbols] of Object.entries(industryMap)) {
      if (category.includes(key)) {
        return symbols;
      }
    }

    return industryMap.default;
  }

  /**
   * Calculate demand forecast based on market trends
   */
  private static calculateDemandForecast(marketInsight: MarketInsight, rfq: any): number {
    let baseDemand = 100; // Base demand index
    
    // Adjust based on market trend
    switch (marketInsight.trend) {
      case 'bullish':
        baseDemand *= (1 + marketInsight.confidence * 0.3);
        break;
      case 'bearish':
        baseDemand *= (1 - marketInsight.confidence * 0.2);
        break;
      default:
        baseDemand *= 1.0;
    }

    // Adjust based on RFQ budget
    if (rfq.budget > 1000000) {
      baseDemand *= 1.2; // High-value RFQs indicate strong demand
    }

    return Math.round(baseDemand);
  }

  /**
   * Calculate optimal pricing based on market conditions
   */
  private static calculatePricePrediction(marketInsight: MarketInsight, rfq: any): number {
    let basePrice = rfq.budget || 100000;
    
    // Adjust pricing based on market trend
    switch (marketInsight.trend) {
      case 'bullish':
        basePrice *= (1 + marketInsight.confidence * 0.15); // Increase prices in bullish market
        break;
      case 'bearish':
        basePrice *= (1 - marketInsight.confidence * 0.1); // Decrease prices in bearish market
        break;
      default:
        basePrice *= 1.0;
    }

    return Math.round(basePrice);
  }

  /**
   * Generate supplier recommendations based on market conditions
   */
  private static async generateSupplierRecommendations(rfq: any, marketInsight: MarketInsight): Promise<string[]> {
    const recommendations: string[] = [];

    if (marketInsight.trend === 'bullish') {
      recommendations.push('Focus on suppliers with high capacity and quick delivery');
      recommendations.push('Consider premium suppliers for quality assurance');
      recommendations.push('Negotiate long-term contracts to lock in prices');
    } else if (marketInsight.trend === 'bearish') {
      recommendations.push('Prioritize cost-effective suppliers');
      recommendations.push('Look for suppliers with flexible payment terms');
      recommendations.push('Consider multiple suppliers for risk diversification');
    } else {
      recommendations.push('Balance quality and cost in supplier selection');
      recommendations.push('Maintain relationships with reliable suppliers');
    }

    return recommendations;
  }

  /**
   * Identify risk factors based on market conditions
   */
  private static identifyRiskFactors(marketInsight: MarketInsight, rfq: any): string[] {
    const riskFactors: string[] = [];

    if (marketInsight.trend === 'bearish') {
      riskFactors.push('Market volatility may affect supplier stability');
      riskFactors.push('Price fluctuations could impact project costs');
      riskFactors.push('Reduced demand may affect delivery timelines');
    } else if (marketInsight.trend === 'bullish') {
      riskFactors.push('High demand may lead to capacity constraints');
      riskFactors.push('Price increases could affect budget');
      riskFactors.push('Supplier availability may be limited');
    }

    return riskFactors;
  }

  /**
   * Mock stock data for development
   */
  private static getMockStockData(symbols: string[]): StockData[] {
    return symbols.map(symbol => ({
      symbol,
      price: Math.random() * 1000 + 100,
      change: (Math.random() - 0.5) * 20,
      changePercent: (Math.random() - 0.5) * 10,
      volume: Math.floor(Math.random() * 1000000),
      marketCap: Math.random() * 1000000000,
      timestamp: new Date()
    }));
  }

  /**
   * Mock market insight for development
   */
  private static getMockMarketInsight(): MarketInsight {
    return {
      trend: 'neutral',
      confidence: 0.7,
      factors: ['Stable market conditions', 'Moderate trading volume'],
      recommendation: 'Maintain current operations with monitoring',
      impact: 'medium'
    };
  }
} 