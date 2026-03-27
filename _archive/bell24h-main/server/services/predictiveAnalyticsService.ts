import { v4 as uuidv4 } from 'uuid';
import { getMetricValues } from './performanceMetricsService.js';
import { getDashboardMetrics } from './dashboardService.js';
import { format } from 'date-fns';
import { storage } from '../storage.js';

interface PredictionModel {
  id: string;
  name: string;
  description: string;
  type: 'linear-regression' | 'time-series' | 'mlp' | 'xgboost';
  parameters: Record<string, any>;
  metrics: string[];
  accuracy: number;
  lastTrained: Date;
  status: 'active' | 'inactive' | 'training';
  error?: string;
}

interface Prediction {
  id: string;
  modelId: string;
  timestamp: Date;
  values: Record<string, number>;
  confidence: number;
  anomalies: {
    metric: string;
    value: number;
    confidence: number;
  }[];
}

interface TrendAnalysis {
  id: string;
  metric: string;
  period: 'day' | 'week' | 'month';
  trend: 'up' | 'down' | 'stable';
  magnitude: number;
  confidence: number;
  factors: {
    factor: string;
    impact: number;
    confidence: number;
  }[];
}

// In-memory storage (would be a database in production)
const predictionModels: PredictionModel[] = [];
const predictions: Prediction[] = [];
const trendAnalyses: TrendAnalysis[] = [];

// Model types with their implementations
const modelTypes = {
  'linear-regression': {
    train: async (data: any[]) => {
      // Simple linear regression implementation
      const x = data.map(d => d.timestamp.getTime());
      const y = data.map(d => d.value);
      
      const n = x.length;
      const sumX = x.reduce((a, b) => a + b, 0);
      const sumY = y.reduce((a, b) => a + b, 0);
      const sumXY = x.reduce((a, b, i) => a + b * y[i], 0);
      const sumX2 = x.reduce((a, b) => a + b * b, 0);
      
      const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;
      
      return { slope, intercept };
    },
    predict: (model: any, timestamp: Date) => {
      return model.slope * timestamp.getTime() + model.intercept;
    }
  },
  'time-series': {
    train: async (data: any[]) => {
      // Simple moving average implementation
      const windowSize = 7;
      const averages = [];
      
      for (let i = windowSize; i < data.length; i++) {
        const window = data.slice(i - windowSize, i);
        const average = window.reduce((a, b) => a + b.value, 0) / windowSize;
        averages.push({
          timestamp: data[i].timestamp,
          value: average
        });
      }
      
      return averages;
    },
    predict: (model: any, timestamp: Date) => {
      const lastValue = model[model.length - 1].value;
      return lastValue;
    }
  }
} as const;

export const createPredictionModel = async (modelData: Omit<PredictionModel, 'id' | 'lastTrained' | 'status'>): Promise<PredictionModel> => {
  const newModel: PredictionModel = {
    id: uuidv4(),
    ...modelData,
    lastTrained: new Date(0),
    status: 'inactive'
  };

  predictionModels.push(newModel);
  return newModel;
};

export const trainPredictionModel = async (modelId: string): Promise<PredictionModel> => {
  const model = predictionModels.find(m => m.id === modelId);
  if (!model) throw new Error('Model not found');

  try {
    model.status = 'training';
    
    // Get historical data for training
    const metricsData = await Promise.all(
      model.metrics.map(metric => getMetricValues(metric, 'month'))
    );

    // Train the model
    const modelType = modelTypes[model.type];
    const trainedModel = await modelType.train(metricsData);
    
    // Calculate accuracy
    const predictions = metricsData.map(data => 
      modelType.predict(trainedModel, data.timestamp)
    );
    
    const errors = predictions.map((p, i) => 
      Math.abs(p - metricsData[i].value)
    );
    
    const mse = errors.reduce((a, b) => a + b * b, 0) / errors.length;
    const rmse = Math.sqrt(mse);
    
    model.accuracy = 1 - rmse;
    model.lastTrained = new Date();
    model.status = 'active';
    
    return model;
  } catch (error) {
    model.status = 'inactive';
    model.error = error instanceof Error ? error.message : 'Training failed';
    throw error;
  }
};

export const generatePrediction = async (modelId: string, timestamp: Date): Promise<Prediction> => {
  const model = predictionModels.find(m => m.id === modelId);
  if (!model || model.status !== 'active') {
    throw new Error('Model not trained or inactive');
  }

  const modelType = modelTypes[model.type];
  const metricsData = await Promise.all(
    model.metrics.map(metric => getMetricValues(metric, 'day'))
  );

  const predictions = model.metrics.map(metric => ({
    metric,
    value: modelType.predict(metricsData.find(d => d.metric === metric)!, timestamp)
  }));

  const prediction: Prediction = {
    id: uuidv4(),
    modelId,
    timestamp,
    values: predictions.reduce((acc, p) => ({ ...acc, [p.metric]: p.value }), {}),
    confidence: model.accuracy,
    anomalies: []
  };

  predictions.push(prediction);
  return prediction;
};

export const analyzeTrends = async (metric: string, period: 'day' | 'week' | 'month'): Promise<TrendAnalysis> => {
  const data = await getMetricValues(metric, period);
  
  // Calculate trend direction and magnitude
  const first = data[0].value;
  const last = data[data.length - 1].value;
  const change = last - first;
  const magnitude = Math.abs(change / first) * 100;
  
  const trend = change > 0 ? 'up' : change < 0 ? 'down' : 'stable';
  
  // Calculate factors (using simple correlation analysis)
  const dashboardMetrics = await getDashboardMetrics();
  const factors = Object.entries(dashboardMetrics)
    .map(([factor, value]) => ({
      factor,
      impact: (value - first) / first,
      confidence: Math.random() * 0.3 + 0.7 // Random confidence for demo
    }))
    .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
    .slice(0, 3);

  const analysis: TrendAnalysis = {
    id: uuidv4(),
    metric,
    period,
    trend,
    magnitude,
    confidence: Math.random() * 0.2 + 0.8, // Random confidence for demo
    factors
  };

  trendAnalyses.push(analysis);
  return analysis;
};

export const getPredictionModels = async (): Promise<PredictionModel[]> => {
  const models = await storage.getPredictionModels();
  return models;
};

export const getModelPredictions = async (modelId: string): Promise<Prediction[]> => {
  const predictions = await storage.getPredictions();
  return predictions.filter(p => p.modelId === modelId);
};

export const getTrendAnalyses = async (): Promise<TrendAnalysis[]> => {
  const analyses = await storage.getTrends();
  return analyses;
};
