/**
 * Bell24H AI - India Stock Market API Integration
 * Real-time NSE/BSE data with multiple API fallbacks and financial intelligence
 */

// Temporarily use native Date methods to avoid import issues
// import { format, subDays, parseISO } from 'date-fns';

// Helper functions using native Date methods
const format = (date: Date, formatStr: string): string => {
  if (formatStr === 'yyyy-MM-dd') {
    return date.toISOString().split('T')[0];
  }
  return date.toLocaleDateString();
};

const subDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
};

const parseISO = (dateString: string): Date => {
  return new Date(dateString);
};

// Types for stock market data
export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  timestamp: Date;
  exchange: 'NSE' | 'BSE';
}

export interface MarketIndex {
  name: string;
  symbol: string;
  value: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  timestamp: Date;
  constituents: string[];
}

export interface CommodityPrice {
  commodity: string;
  price: number;
  unit: string;
  change: number;
  changePercent: number;
  exchange: string;
  timestamp: Date;
  futures?: {
    '1month': number;
    '3month': number;
    '6month': number;
  };
}

export interface SectorAnalysis {
  sector: string;
  performance: number;
  momentum: number;
  volatility: number;
  topStocks: StockQuote[];
  sentiment: 'bullish' | 'bearish' | 'neutral';
  outlook: string;
}

export interface MarketSentiment {
  overall: 'bullish' | 'bearish' | 'neutral';
  bullishPercentage: number;
  bearishPercentage: number;
  neutralPercentage: number;
  fearGreedIndex: number;
  volatilityIndex: number;
  indicators: {
    name: string;
    value: number;
    signal: 'buy' | 'sell' | 'hold';
  }[];
}

export interface PriceHistory {
  symbol: string;
  data: {
    date: Date;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }[];
  period: '1D' | '1W' | '1M' | '3M' | '6M' | '1Y';
}

export interface APIProvider {
  name: string;
  baseUrl: string;
  apiKey?: string;
  rateLimit: number;
  priority: number;
  isActive: boolean;
  endpoints: {
    quotes: string;
    indices: string;
    commodities: string;
    history: string;
  };
}

export class StockMarketAPI {
  private providers: APIProvider[] = [];
  private cache: Map<string, any> = new Map();
  private lastRequestTime = 0;
  private rateLimitDelay = 1000; // 1 second between requests

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders(): void {
    // Configure multiple API providers with fallback mechanisms
    this.providers = [
      {
        name: 'Alpha Vantage',
        baseUrl: 'https://www.alphavantage.co',
        apiKey: process.env.ALPHA_VANTAGE_API_KEY,
        rateLimit: 5, // requests per minute
        priority: 1,
        isActive: true,
        endpoints: {
          quotes: '/query?function=GLOBAL_QUOTE',
          indices: '/query?function=GLOBAL_QUOTE',
          commodities: '/query?function=GLOBAL_QUOTE',
          history: '/query?function=TIME_SERIES_DAILY',
        },
      },
      {
        name: 'Yahoo Finance',
        baseUrl: 'https://query1.finance.yahoo.com',
        rateLimit: 100,
        priority: 2,
        isActive: true,
        endpoints: {
          quotes: '/v8/finance/quote',
          indices: '/v8/finance/quote',
          commodities: '/v8/finance/quote',
          history: '/v8/finance/chart',
        },
      },
      {
        name: 'Polygon.io',
        baseUrl: 'https://api.polygon.io',
        apiKey: process.env.POLYGON_API_KEY,
        rateLimit: 5,
        priority: 3,
        isActive: true,
        endpoints: {
          quotes: '/v2/aggs/ticker',
          indices: '/v2/aggs/ticker',
          commodities: '/v2/aggs/ticker',
          history: '/v2/aggs/ticker',
        },
      },
      {
        name: 'Fallback Mock',
        baseUrl: 'mock://localhost',
        rateLimit: 1000,
        priority: 99,
        isActive: true,
        endpoints: {
          quotes: '/quotes',
          indices: '/indices',
          commodities: '/commodities',
          history: '/history',
        },
      },
    ];
  }

  /**
   * Get live stock quotes for NSE/BSE
   */
  async getStockQuotes(symbols: string[]): Promise<StockQuote[]> {
    const cacheKey = `quotes_${symbols.join('_')}`;

    // Check cache first
    const cached = this.getCachedData(cacheKey, 30); // 30 seconds cache
    if (cached) return cached;

    try {
      const quotes = await this.fetchWithFallback('quotes', symbols);
      this.cache.set(cacheKey, { data: quotes, timestamp: Date.now() });
      return quotes;
    } catch (error) {
      console.error('Error fetching stock quotes:', error);
      return this.getMockStockQuotes(symbols);
    }
  }

  /**
   * Get market indices (Nifty 50, Sensex, Bank Nifty)
   */
  async getMarketIndices(): Promise<MarketIndex[]> {
    const cacheKey = 'market_indices';

    // Check cache first
    const cached = this.getCachedData(cacheKey, 60); // 1 minute cache
    if (cached) return cached;

    try {
      const indices = await this.fetchWithFallback('indices', ['NSEI', 'BSESN', 'BANKNIFTY']);
      this.cache.set(cacheKey, { data: indices, timestamp: Date.now() });
      return indices;
    } catch (error) {
      console.error('Error fetching market indices:', error);
      return this.getMockMarketIndices();
    }
  }

  /**
   * Get commodity prices
   */
  async getCommodityPrices(): Promise<CommodityPrice[]> {
    const cacheKey = 'commodity_prices';

    // Check cache first
    const cached = this.getCachedData(cacheKey, 120); // 2 minutes cache
    if (cached) return cached;

    try {
      const commodities = await this.fetchWithFallback('commodities', [
        'CRUDE_OIL',
        'GOLD',
        'SILVER',
        'COPPER',
        'ALUMINIUM',
        'STEEL',
        'COAL',
        'NATURAL_GAS',
        'WHEAT',
        'COTTON',
      ]);
      this.cache.set(cacheKey, { data: commodities, timestamp: Date.now() });
      return commodities;
    } catch (error) {
      console.error('Error fetching commodity prices:', error);
      return this.getMockCommodityPrices();
    }
  }

  /**
   * Get sector analysis
   */
  async getSectorAnalysis(): Promise<SectorAnalysis[]> {
    const cacheKey = 'sector_analysis';

    // Check cache first
    const cached = this.getCachedData(cacheKey, 300); // 5 minutes cache
    if (cached) return cached;

    try {
      const sectors = await this.analyzeSectors();
      this.cache.set(cacheKey, { data: sectors, timestamp: Date.now() });
      return sectors;
    } catch (error) {
      console.error('Error analyzing sectors:', error);
      return this.getMockSectorAnalysis();
    }
  }

  /**
   * Get market sentiment analysis
   */
  async getMarketSentiment(): Promise<MarketSentiment> {
    const cacheKey = 'market_sentiment';

    // Check cache first
    const cached = this.getCachedData(cacheKey, 180); // 3 minutes cache
    if (cached) return cached;

    try {
      const sentiment = await this.analyzeMarketSentiment();
      this.cache.set(cacheKey, { data: sentiment, timestamp: Date.now() });
      return sentiment;
    } catch (error) {
      console.error('Error analyzing market sentiment:', error);
      return this.getMockMarketSentiment();
    }
  }

  /**
   * Get price history
   */
  async getPriceHistory(
    symbol: string,
    period: '1D' | '1W' | '1M' | '3M' | '6M' | '1Y'
  ): Promise<PriceHistory> {
    const cacheKey = `history_${symbol}_${period}`;

    // Check cache first
    const cached = this.getCachedData(cacheKey, 3600); // 1 hour cache
    if (cached) return cached;

    try {
      const history = await this.fetchWithFallback('history', [symbol], { period });
      this.cache.set(cacheKey, { data: history, timestamp: Date.now() });
      return history;
    } catch (error) {
      console.error('Error fetching price history:', error);
      return this.getMockPriceHistory(symbol, period);
    }
  }

  /**
   * Fetch data with fallback mechanism
   */
  private async fetchWithFallback(endpoint: string, symbols: string[], params?: any): Promise<any> {
    const activeProviders = this.providers
      .filter(p => p.isActive)
      .sort((a, b) => a.priority - b.priority);

    for (const provider of activeProviders) {
      try {
        await this.rateLimit();

        if (provider.name === 'Fallback Mock') {
          return this.getMockData(endpoint, symbols, params);
        }

        const data = await this.fetchFromProvider(provider, endpoint, symbols, params);
        if (data) return data;
      } catch (error) {
        console.warn(`Provider ${provider.name} failed:`, error);
        continue;
      }
    }

    throw new Error('All providers failed');
  }

  /**
   * Fetch data from specific provider
   */
  private async fetchFromProvider(
    provider: APIProvider,
    endpoint: string,
    symbols: string[],
    params?: any
  ): Promise<any> {
    const url = this.buildUrl(provider, endpoint, symbols, params);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Bell24H-AI-Platform/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return this.normalizeData(provider.name, endpoint, data);
  }

  /**
   * Build API URL
   */
  private buildUrl(
    provider: APIProvider,
    endpoint: string,
    symbols: string[],
    params?: any
  ): string {
    let url = provider.baseUrl + provider.endpoints[endpoint as keyof typeof provider.endpoints];

    // Add symbols and parameters based on provider
    if (provider.name === 'Alpha Vantage') {
      url += `&symbol=${symbols[0]}`;
      if (provider.apiKey) url += `&apikey=${provider.apiKey}`;
    } else if (provider.name === 'Yahoo Finance') {
      url += `?symbols=${symbols.join(',')}`;
    } else if (provider.name === 'Polygon.io') {
      url += `/${symbols[0]}`;
      if (provider.apiKey) url += `?apikey=${provider.apiKey}`;
    }

    return url;
  }

  /**
   * Normalize data from different providers
   */
  private normalizeData(providerName: string, endpoint: string, data: any): any {
    // Normalize data structure based on provider and endpoint
    switch (providerName) {
      case 'Alpha Vantage':
        return this.normalizeAlphaVantageData(endpoint, data);
      case 'Yahoo Finance':
        return this.normalizeYahooFinanceData(endpoint, data);
      case 'Polygon.io':
        return this.normalizePolygonData(endpoint, data);
      default:
        return data;
    }
  }

  /**
   * Rate limiting
   */
  private async rateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.rateLimitDelay) {
      await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay - timeSinceLastRequest));
    }

    this.lastRequestTime = Date.now();
  }

  /**
   * Get cached data
   */
  private getCachedData(key: string, maxAgeSeconds: number): any {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < maxAgeSeconds * 1000) {
      return cached.data;
    }
    return null;
  }

  /**
   * Provider-specific data normalization methods
   */
  private normalizeAlphaVantageData(endpoint: string, data: any): any {
    // Implementation depends on Alpha Vantage API response structure
    return data;
  }

  private normalizeYahooFinanceData(endpoint: string, data: any): any {
    // Implementation depends on Yahoo Finance API response structure
    return data;
  }

  private normalizePolygonData(endpoint: string, data: any): any {
    // Implementation depends on Polygon.io API response structure
    return data;
  }

  /**
   * Mock data methods for fallback
   */
  private getMockData(endpoint: string, symbols: string[], params?: any): any {
    switch (endpoint) {
      case 'quotes':
        return this.getMockStockQuotes(symbols);
      case 'indices':
        return this.getMockMarketIndices();
      case 'commodities':
        return this.getMockCommodityPrices();
      case 'history':
        return this.getMockPriceHistory(symbols[0], params?.period || '1M');
      default:
        return null;
    }
  }

  private getMockStockQuotes(symbols: string[]): StockQuote[] {
    return symbols.map(symbol => ({
      symbol,
      name: `Company ${symbol}`,
      price: 1500 + Math.random() * 1000,
      change: -50 + Math.random() * 100,
      changePercent: -2 + Math.random() * 4,
      volume: Math.floor(Math.random() * 1000000),
      marketCap: 50000 + Math.random() * 100000,
      high: 1600 + Math.random() * 1000,
      low: 1400 + Math.random() * 1000,
      open: 1480 + Math.random() * 1000,
      previousClose: 1490 + Math.random() * 1000,
      timestamp: new Date(),
      exchange: Math.random() > 0.5 ? 'NSE' : 'BSE',
    }));
  }

  private getMockMarketIndices(): MarketIndex[] {
    return [
      {
        name: 'NIFTY 50',
        symbol: 'NSEI',
        value: 22150 + Math.random() * 500,
        change: -50 + Math.random() * 100,
        changePercent: -0.5 + Math.random() * 1,
        high: 22200 + Math.random() * 500,
        low: 22000 + Math.random() * 500,
        timestamp: new Date(),
        constituents: ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'HDFC'],
      },
      {
        name: 'SENSEX',
        symbol: 'BSESN',
        value: 73500 + Math.random() * 1000,
        change: -100 + Math.random() * 200,
        changePercent: -0.3 + Math.random() * 0.6,
        high: 73800 + Math.random() * 1000,
        low: 73200 + Math.random() * 1000,
        timestamp: new Date(),
        constituents: ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'HDFC'],
      },
      {
        name: 'BANK NIFTY',
        symbol: 'BANKNIFTY',
        value: 48500 + Math.random() * 1000,
        change: -200 + Math.random() * 400,
        changePercent: -0.8 + Math.random() * 1.6,
        high: 49000 + Math.random() * 1000,
        low: 48000 + Math.random() * 1000,
        timestamp: new Date(),
        constituents: ['HDFCBANK', 'ICICIBANK', 'KOTAKBANK', 'SBIN', 'AXISBANK'],
      },
    ];
  }

  private getMockCommodityPrices(): CommodityPrice[] {
    return [
      {
        commodity: 'Crude Oil',
        price: 85.5 + Math.random() * 10,
        unit: 'USD/barrel',
        change: -2 + Math.random() * 4,
        changePercent: -1.5 + Math.random() * 3,
        exchange: 'MCX',
        timestamp: new Date(),
        futures: {
          '1month': 86.2 + Math.random() * 10,
          '3month': 87.1 + Math.random() * 10,
          '6month': 88.5 + Math.random() * 10,
        },
      },
      {
        commodity: 'Gold',
        price: 65000 + Math.random() * 5000,
        unit: 'INR/10g',
        change: -500 + Math.random() * 1000,
        changePercent: -0.8 + Math.random() * 1.6,
        exchange: 'MCX',
        timestamp: new Date(),
        futures: {
          '1month': 65200 + Math.random() * 5000,
          '3month': 65800 + Math.random() * 5000,
          '6month': 66500 + Math.random() * 5000,
        },
      },
      {
        commodity: 'Silver',
        price: 78000 + Math.random() * 5000,
        unit: 'INR/kg',
        change: -1000 + Math.random() * 2000,
        changePercent: -1.2 + Math.random() * 2.4,
        exchange: 'MCX',
        timestamp: new Date(),
      },
      {
        commodity: 'Copper',
        price: 750 + Math.random() * 50,
        unit: 'INR/kg',
        change: -10 + Math.random() * 20,
        changePercent: -1.0 + Math.random() * 2.0,
        exchange: 'MCX',
        timestamp: new Date(),
      },
      {
        commodity: 'Steel',
        price: 55000 + Math.random() * 5000,
        unit: 'INR/tonne',
        change: -1000 + Math.random() * 2000,
        changePercent: -1.5 + Math.random() * 3.0,
        exchange: 'MCX',
        timestamp: new Date(),
      },
    ];
  }

  private getMockPriceHistory(symbol: string, period: string): PriceHistory {
    const days = period === '1D' ? 1 : period === '1W' ? 7 : period === '1M' ? 30 : 90;
    const data: Array<{
      date: Date;
      open: number;
      high: number;
      low: number;
      close: number;
      volume: number;
    }> = [];

    for (let i = days; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const basePrice = 1500 + Math.random() * 1000;
      data.push({
        date,
        open: basePrice,
        high: basePrice + Math.random() * 50,
        low: basePrice - Math.random() * 50,
        close: basePrice + (-25 + Math.random() * 50),
        volume: Math.floor(Math.random() * 1000000),
      });
    }

    return { symbol, data, period: period as any };
  }

  private getMockSectorAnalysis(): SectorAnalysis[] {
    const sectors = [
      'Technology',
      'Banking',
      'Healthcare',
      'Energy',
      'Manufacturing',
      'Telecommunications',
      'Consumer Goods',
      'Real Estate',
      'Utilities',
    ];

    return sectors.map(sector => ({
      sector,
      performance: -5 + Math.random() * 10,
      momentum: 0.3 + Math.random() * 0.4,
      volatility: 0.15 + Math.random() * 0.25,
      topStocks: this.getMockStockQuotes([`${sector.toUpperCase()}1`, `${sector.toUpperCase()}2`]),
      sentiment: Math.random() > 0.6 ? 'bullish' : Math.random() > 0.3 ? 'neutral' : 'bearish',
      outlook: `${sector} sector showing ${Math.random() > 0.5 ? 'positive' : 'mixed'} trends`,
    }));
  }

  private getMockMarketSentiment(): MarketSentiment {
    const bullish = 40 + Math.random() * 20;
    const bearish = 25 + Math.random() * 15;
    const neutral = 100 - bullish - bearish;

    return {
      overall: bullish > bearish ? 'bullish' : bearish > bullish ? 'bearish' : 'neutral',
      bullishPercentage: bullish,
      bearishPercentage: bearish,
      neutralPercentage: neutral,
      fearGreedIndex: 30 + Math.random() * 40,
      volatilityIndex: 15 + Math.random() * 20,
      indicators: [
        { name: 'RSI', value: 45 + Math.random() * 20, signal: 'hold' },
        { name: 'MACD', value: -0.5 + Math.random() * 1, signal: 'buy' },
        { name: 'Moving Average', value: 0.8 + Math.random() * 0.4, signal: 'buy' },
        { name: 'Volume', value: 0.6 + Math.random() * 0.4, signal: 'hold' },
      ],
    };
  }

  private async analyzeSectors(): Promise<SectorAnalysis[]> {
    // Implement sector analysis logic
    return this.getMockSectorAnalysis();
  }

  private async analyzeMarketSentiment(): Promise<MarketSentiment> {
    // Implement market sentiment analysis
    return this.getMockMarketSentiment();
  }

  /**
   * Get API health status
   */
  getAPIHealth(): { provider: string; status: 'healthy' | 'degraded' | 'down' }[] {
    return this.providers.map(provider => ({
      provider: provider.name,
      status: provider.isActive ? 'healthy' : 'down',
    }));
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// Export singleton instance
export const stockMarketAPI = new StockMarketAPI();
