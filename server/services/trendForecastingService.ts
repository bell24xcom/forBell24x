import { format } from 'date-fns';
import { linearRegression, linearRegressionLine } from 'simple-statistics';
import { v4 as uuidv4 } from 'uuid';

interface ForecastData {
  id: string;
  type: 'rfq' | 'revenue' | 'supplierPerformance' | 'categoryTrend';
  period: 'daily' | 'weekly' | 'monthly';
  startDate: Date;
  endDate: Date;
  historicalData: {
    date: string;
    value: number;
  }[];
  forecast: {
    date: string;
    predictedValue: number;
    confidence: number;
  }[];
  metrics: {
    rSquared: number;
    meanAbsoluteError: number;
    meanSquaredError: number;
  };
}

interface ForecastRequest {
  type: 'rfq' | 'revenue' | 'supplierPerformance' | 'categoryTrend';
  period: 'daily' | 'weekly' | 'monthly';
  startDate: string;
  endDate: string;
  historicalData: {
    date: string;
    value: number;
  }[];
  forecastPeriods: number;
}

// In-memory storage for forecasts (would be a database in production)
const forecasts: ForecastData[] = [];

const calculateMetrics = (actual: number[], predicted: number[]): {
  rSquared: number;
  meanAbsoluteError: number;
  meanSquaredError: number;
} => {
  const n = actual.length;
  const mean = actual.reduce((sum, val) => sum + val, 0) / n;
  
  const ssTotal = actual.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0);
  const ssResidual = actual.reduce((sum, val, i) => sum + Math.pow(val - predicted[i], 2), 0);
  
  const rSquared = 1 - (ssResidual / ssTotal);
  const meanAbsoluteError = actual.reduce((sum, val, i) => sum + Math.abs(val - predicted[i]), 0) / n;
  const meanSquaredError = actual.reduce((sum, val, i) => sum + Math.pow(val - predicted[i], 2), 0) / n;
  
  return {
    rSquared,
    meanAbsoluteError,
    meanSquaredError
  };
};

const forecastTrend = (data: number[], periods: number): number[] => {
  const x = Array.from({ length: data.length }, (_, i) => i);
  const regression = linearRegression(x, data);
  const line = linearRegressionLine(regression);
  
  const forecast = Array.from({ length: periods }, (_, i) => line(data.length + i));
  return forecast;
};

export const createForecast = async (request: ForecastRequest): Promise<ForecastData> => {
  try {
    // Parse dates
    const startDate = new Date(request.startDate);
    const endDate = new Date(request.endDate);
    
    // Validate data
    if (request.historicalData.length < 3) {
      throw new Error('Not enough historical data for forecasting');
    }

    // Extract values for analysis
    const values = request.historicalData.map(d => d.value);
    
    // Calculate forecast
    const forecastValues = forecastTrend(values, request.forecastPeriods);
    
    // Calculate metrics
    const metrics = calculateMetrics(values, forecastValues.slice(0, values.length));
    
    // Generate forecast data points
    const forecastData = Array.from({ length: request.forecastPeriods }, (_, i) => {
      const date = new Date(endDate);
      switch (request.period) {
        case 'daily':
          date.setDate(date.getDate() + i + 1);
          break;
        case 'weekly':
          date.setDate(date.getDate() + (i + 1) * 7);
          break;
        case 'monthly':
          date.setMonth(date.getMonth() + i + 1);
          break;
      }
      return {
        date: format(date, 'yyyy-MM-dd'),
        predictedValue: forecastValues[i],
        confidence: metrics.rSquared
      };
    });

    // Create forecast record
    const forecast: ForecastData = {
      id: uuidv4(),
      type: request.type,
      period: request.period,
      startDate,
      endDate,
      historicalData: request.historicalData,
      forecast: forecastData,
      metrics
    };

    forecasts.push(forecast);
    return forecast;
  } catch (error) {
    console.error('Error creating forecast:', error);
    throw error;
  }
};

export const getForecasts = async (userId: number): Promise<ForecastData[]> => {
  // In production, filter by userId
  return forecasts;
};

export const getForecastById = async (id: string): Promise<ForecastData | null> => {
  return forecasts.find(f => f.id === id) || null;
};

export const deleteForecast = async (id: string): Promise<boolean> => {
  const index = forecasts.findIndex(f => f.id === id);
  if (index === -1) return false;
  forecasts.splice(index, 1);
  return true;
};

export const updateForecast = async (id: string, updates: Partial<ForecastData>): Promise<ForecastData | null> => {
  const index = forecasts.findIndex(f => f.id === id);
  if (index === -1) return null;

  const forecast = { ...forecasts[index], ...updates };
  forecasts[index] = forecast;
  return forecast;
};

// Predefined forecast types
export const forecastTypes = {
  'rfq': {
    title: 'RFQ Volume Forecast',
    description: 'Predicts future RFQ volumes based on historical data',
    metrics: ['totalRfqs', 'activeRfqs', 'completedRfqs']
  },
  'revenue': {
    title: 'Revenue Forecast',
    description: 'Predicts future revenue trends based on historical data',
    metrics: ['monthlyRevenue', 'yearlyRevenue']
  },
  'supplierPerformance': {
    title: 'Supplier Performance Forecast',
    description: 'Predicts future supplier performance metrics',
    metrics: ['responseRate', 'acceptanceRate', 'deliveryPerformance']
  },
  'categoryTrend': {
    title: 'Category Trend Forecast',
    description: 'Predicts future trends for specific categories',
    metrics: ['rfqCount', 'quoteTime', 'deliveryTime']
  }
} as const;

export type ForecastType = keyof typeof forecastTypes;

// Forecast periods
export const forecastPeriods = {
  daily: {
    title: 'Daily',
    description: 'Daily forecast for the next 30 days',
    maxPeriods: 30
  },
  weekly: {
    title: 'Weekly',
    description: 'Weekly forecast for the next 12 weeks',
    maxPeriods: 12
  },
  monthly: {
    title: 'Monthly',
    description: 'Monthly forecast for the next 6 months',
    maxPeriods: 6
  }
} as const;

export type ForecastPeriod = keyof typeof forecastPeriods;
