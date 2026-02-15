export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

// Define proper interface for stock data
interface StockData {
  prices: number[];
  timestamps: string[];
  volume: number[];
  currentPrice: number;
  change24h: number;
  changePercent24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  technical?: {
    rsi: number | null;
    macd: any;
    sma20: number | null;
    sma50: number | null;
    ema12: number | null;
    ema26: number | null;
    bollingerBands: any;
    volumeAnalysis: any;
  };
  sentiment?: {
    overall: string;
    confidence: number;
    factors: string[];
  };
}

export async function GET(request: Request) {
  try {
    // Get URL parameters for filtering
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol') || 'NSEI'; // Default to Nifty 50
    const timeframe = searchParams.get('timeframe') || '1D'; // 1D, 1W, 1M, etc.
    const includeTechnical = searchParams.get('technical') === 'true';

    // Mock stock data - in production, integrate with actual APIs
    const stockData: StockData = generateMockStockData(symbol, timeframe);

    // Add technical indicators if requested
    if (includeTechnical) {
      stockData.technical = {
        rsi: calculateRSI(stockData.prices),
        macd: calculateMACD(stockData.prices),
        sma20: calculateSMA(stockData.prices, 20),
        sma50: calculateSMA(stockData.prices, 50),
        ema12: calculateEMA(stockData.prices, 12),
        ema26: calculateEMA(stockData.prices, 26),
        bollingerBands: calculateBollingerBands(stockData.prices),
        volumeAnalysis: analyzeVolume(stockData.volume)
      };
    }

    // Add market sentiment analysis
    stockData.sentiment = {
      overall: 'positive',
      confidence: 0.75,
      factors: [
        'Positive news coverage',
        'Strong institutional buying',
        'Above key moving averages',
        'Bullish technical indicators'
      ]
    };

    // NOTE: riskMetrics removed - not defined in StockData interface

    return NextResponse.json({
      success: true,
      data: {
        symbol,
        timeframe,
        ...stockData,
        metadata: {
          lastUpdated: new Date().toISOString(),
          dataPoints: stockData.prices.length,
          source: 'mock_data' // Change to actual data source
        }
      }
    });

  } catch (error) {
    console.error('Stock data analytics error:', error);
    return NextResponse.json({
      error: 'Failed to fetch stock data analytics',
      success: false
    }, { status: 500 });
  }
}

function generateMockStockData(symbol: string, timeframe: string): StockData {
  let dataPoints = 100; // Default for 1D
  let intervalMs = 60000; // 1 minute for intraday

  // Adjust data points based on timeframe
  switch (timeframe) {
    case '1D':
      dataPoints = 390; // 6.5 hours * 60 minutes
      intervalMs = 60000;
      break;
    case '1W':
      dataPoints = 120; // 5 days * 24 data points
      intervalMs = 3600000; // 1 hour
      break;
    case '1M':
      dataPoints = 30; // 30 days
      intervalMs = 86400000; // 1 day
      break;
    case '3M':
      dataPoints = 90; // 90 days
      intervalMs = 86400000;
      break;
  }

  const prices: number[] = [];
  const timestamps: string[] = [];
  const volume: number[] = [];

  let basePrice = 20000; // Reference price for NIFTY
  const currentTime = Date.now();

  for (let i = dataPoints; i >= 0; i--) {
    // Generate realistic price movement
    const randomChange = (Math.random() - 0.5) * 100; // Random price change
    const trendComponent = Math.sin(i / 10) * 20; // Add some trend
    basePrice += randomChange + trendComponent;

    // Keep price realistic (between 15000-25000 for NIFTY)
    basePrice = Math.max(15000, Math.min(25000, basePrice));

    prices.push(Number(basePrice.toFixed(2)));
    timestamps.push(new Date(currentTime - (i * intervalMs)).toISOString());

    // Generate volume data
    const baseVolume = 150000000; // Base volume for NIFTY
    const volumeNoise = (Math.random() - 0.5) * 50000000;
    volume.push(Math.max(10000000, baseVolume + volumeNoise));
  }

  return {
    prices,
    timestamps,
    volume,
    currentPrice: prices[prices.length - 1],
    change24h: prices[prices.length - 1] - prices[0],
    changePercent24h: ((prices[prices.length - 1] - prices[0]) / prices[0]) * 100,
    high24h: Math.max(...prices),
    low24h: Math.min(...prices),
    volume24h: volume.reduce((a, b) => a + b, 0)
  };
}

function calculateRSI(prices: number[], period: number = 14): number {
  if (prices.length < period + 1) return 50; // Neutral RSI

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const change = prices[prices.length - i] - prices[prices.length - i - 1];
    if (change > 0) {
      gains += change;
    } else {
      losses += Math.abs(change);
    }
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;

  if (avgLoss === 0) return 100; // Max bullish
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

function calculateMACD(prices: number[]): { macd: number; signal: number; histogram: number } {
  if (prices.length < 26) return { macd: 0, signal: 0, histogram: 0 };

  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  const macd = ema12 - ema26;

  // Simple signal calculation (would normally use EMA of MACD)
  const signal = macd * 0.8; // Simplified
  const histogram = macd - signal;

  return { macd, signal, histogram };
}

function calculateSMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1];

  const slice = prices.slice(-period);
  return slice.reduce((sum, price) => sum + price, 0) / period;
}

function calculateEMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1];

  const multiplier = 2 / (period + 1);
  let ema = prices.slice(0, period).reduce((sum, price) => sum + price, 0) / period;

  for (let i = period; i < prices.length; i++) {
    ema = (prices[i] - ema) * multiplier + ema;
  }

  return ema;
}

function calculateBollingerBands(prices: number[], period: number = 20, stdDev: number = 2) {
  if (prices.length < period) return { upper: 0, middle: 0, lower: 0 };

  const sma = calculateSMA(prices, period);

  const variance = prices.slice(-period).reduce((sum, price) => {
    return sum + Math.pow(price - sma, 2);
  }, 0) / period;

  const stdDeviation = Math.sqrt(variance);

  return {
    upper: sma + (stdDeviation * stdDev),
    middle: sma,
    lower: sma - (stdDeviation * stdDev)
  };
}

function analyzeVolume(volume: number[]) {
  if (volume.length < 10) return { trend: 'insufficient_data', average: 0 };

  const recent = volume.slice(-10);
  const older = volume.slice(-20, -10);

  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const olderAvg = older.length > 0 ? older.reduce((a, b) => a + b, 0) / older.length : recentAvg;

  const changePercent = ((recentAvg - olderAvg) / olderAvg) * 100;

  return {
    trend: changePercent > 10 ? 'increasing' : changePercent < -10 ? 'decreasing' : 'stable',
    average: Math.round(recentAvg),
    current: volume[volume.length - 1],
    changePercent: Number(changePercent.toFixed(2))
  };
}

function calculateVolatility(prices: number[]): number {
  if (prices.length < 2) return 0;

  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
  }

  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;

  return Math.sqrt(variance * 252) * 100; // Annualized volatility
}

function calculateBeta(prices: number[]): number {
  // Simplified beta calculation - in real scenario, compare against market index
  const volatility = calculateVolatility(prices);
  return volatility / 20; // Simplified relationship
}

function calculateSharpeRatio(prices: number[]): number {
  if (prices.length < 2) return 0;

  const volatility = calculateVolatility(prices) / 100; // Convert to decimal
  if (volatility === 0) return 0;

  // Simplified - assuming risk-free rate of 4%
  const riskFreeRate = 0.04;
  const returns = prices[prices.length - 1] / prices[0] - 1;
  const excessReturn = returns - riskFreeRate;

  return excessReturn / volatility;
}

function calculateMaxDrawdown(prices: number[]): number {
  if (prices.length < 2) return 0;

  let maxDrawdown = 0;
  let peak = prices[0];

  for (let i = 1; i < prices.length; i++) {
    if (prices[i] > peak) {
      peak = prices[i];
    }

    const drawdown = (peak - prices[i]) / peak;
    maxDrawdown = Math.max(maxDrawdown, drawdown);
  }

  return maxDrawdown * 100; // Convert to percentage
}
