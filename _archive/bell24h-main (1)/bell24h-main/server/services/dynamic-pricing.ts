import { StockMarketIntegrationService } from './stock-market-integration';
import { RFQModel } from '../models/RFQ';

export class DynamicPricingService {
  static async suggestPrice(rfqId: string) {
    const rfq = await RFQModel.findById(rfqId);
    if (!rfq) throw new Error('RFQ not found');
    const market = await StockMarketIntegrationService.generateMarketInsights(rfq.category);
    // Suggest price based on market and RFQ budget
    const suggested = Math.round((rfq.budget || 100000) * (1 + (market.confidence - 0.5) * 0.2));
    return { suggestedPrice: suggested, marketTrend: market.trend, confidence: market.confidence };
  }

  static async optimizePrice(rfqId: string) {
    const rfq = await RFQModel.findById(rfqId);
    if (!rfq) throw new Error('RFQ not found');
    const market = await StockMarketIntegrationService.generateMarketInsights(rfq.category);
    // Optimize price for best match (mock logic)
    const optimized = Math.round((rfq.budget || 100000) * (1 + (market.confidence - 0.5) * 0.25));
    return { optimizedPrice: optimized, marketTrend: market.trend, confidence: market.confidence };
  }

  static async getMarketBasedPricing(industry: string) {
    const market = await StockMarketIntegrationService.generateMarketInsights(industry);
    // Return a price index for the industry
    return { priceIndex: Math.round(100 * (1 + (market.confidence - 0.5) * 0.1)), marketTrend: market.trend, confidence: market.confidence };
  }
} 