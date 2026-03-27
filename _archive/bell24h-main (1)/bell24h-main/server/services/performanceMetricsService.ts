import { v4 as uuidv4 } from 'uuid';

interface PerformanceMetric {
  id: string;
  name: string;
  description: string;
  type: 'rfq' | 'supplier' | 'category' | 'revenue';
  unit: string;
  calculation: string;
  thresholds: {
    warning: number;
    critical: number;
  };
  trending: boolean;
  importance: 'high' | 'medium' | 'low';
}

interface PerformanceMetricsConfig {
  id: string;
  userId: number;
  metrics: PerformanceMetric[];
  thresholds: {
    [key: string]: {
      warning: number;
      critical: number;
    };
  };
  notificationPreferences: {
    email: boolean;
    sms: boolean;
    slack: boolean;
  };
}

interface MetricValue {
  id: string;
  metricId: string;
  value: number;
  timestamp: Date;
  status: 'healthy' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
}

// In-memory storage (would be a database in production)
const metrics: PerformanceMetric[] = [
  {
    id: uuidv4(),
    name: 'RFQ Response Rate',
    description: 'Percentage of RFQs responded to within 24 hours',
    type: 'rfq',
    unit: '%',
    calculation: '(RFQs responded / Total RFQs) * 100',
    thresholds: {
      warning: 80,
      critical: 70
    },
    trending: true,
    importance: 'high'
  },
  {
    id: uuidv4(),
    name: 'Supplier Acceptance Rate',
    description: 'Percentage of RFQs accepted by suppliers',
    type: 'supplier',
    unit: '%',
    calculation: '(RFQs accepted / RFQs received) * 100',
    thresholds: {
      warning: 75,
      critical: 65
    },
    trending: true,
    importance: 'high'
  },
  {
    id: uuidv4(),
    name: 'Quote Accuracy',
    description: 'Percentage of quotes that match final order price',
    type: 'supplier',
    unit: '%',
    calculation: '(Accurate quotes / Total quotes) * 100',
    thresholds: {
      warning: 95,
      critical: 90
    },
    trending: true,
    importance: 'medium'
  },
  {
    id: uuidv4(),
    name: 'Delivery Performance',
    description: 'Percentage of orders delivered on time',
    type: 'supplier',
    unit: '%',
    calculation: '(On-time deliveries / Total deliveries) * 100',
    thresholds: {
      warning: 98,
      critical: 95
    },
    trending: true,
    importance: 'high'
  },
  {
    id: uuidv4(),
    name: 'Category Growth Rate',
    description: 'Monthly growth rate of RFQs per category',
    type: 'category',
    unit: '%',
    calculation: '((Current month RFQs - Previous month RFQs) / Previous month RFQs) * 100',
    thresholds: {
      warning: 5,
      critical: 0
    },
    trending: true,
    importance: 'medium'
  },
  {
    id: uuidv4(),
    name: 'Revenue Growth',
    description: 'Monthly revenue growth rate',
    type: 'revenue',
    unit: '%',
    calculation: '((Current month revenue - Previous month revenue) / Previous month revenue) * 100',
    thresholds: {
      warning: 10,
      critical: 5
    },
    trending: true,
    importance: 'high'
  }
];

const metricValues: MetricValue[] = [];

// Sample data - in production this would come from your database
type MetricSample = {
  value: number;
  timestamp: Date;
};

const sampleData: Record<string, MetricSample[]> = {
  'rfq-response-rate': Array.from({ length: 30 }, (_, i) => ({
    value: 85 + Math.random() * 10,
    timestamp: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000)
  })),
  'supplier-acceptance-rate': Array.from({ length: 30 }, (_, i) => ({
    value: 80 + Math.random() * 10,
    timestamp: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000)
  })),
  'quote-accuracy': Array.from({ length: 30 }, (_, i) => ({
    value: 95 + Math.random() * 5,
    timestamp: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000)
  })),
  'delivery-performance': Array.from({ length: 30 }, (_, i) => ({
    value: 98 + Math.random() * 2,
    timestamp: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000)
  })),
  'category-growth-rate': Array.from({ length: 30 }, (_, i) => ({
    value: 10 + Math.random() * 10,
    timestamp: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000)
  })),
  'revenue-growth': Array.from({ length: 30 }, (_, i) => ({
    value: 15 + Math.random() * 5,
    timestamp: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000)
  }))
};

export const getMetrics = async (): Promise<PerformanceMetric[]> => {
  return metrics;
};

export const getMetricById = async (id: string): Promise<PerformanceMetric | null> => {
  return metrics.find(m => m.id === id) || null;
};

export const getMetricValues = async (metricId: string, period: 'day' | 'week' | 'month'): Promise<MetricValue[]> => {
  const metric = metrics.find(m => m.id === metricId);
  if (!metric) return [];

  const now = new Date();
  const startDate = new Date(now);

  switch (period) {
    case 'day':
      startDate.setDate(startDate.getDate() - 1);
      break;
    case 'week':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(startDate.getMonth() - 1);
      break;
  }

  const values = sampleData[metricId.replace(/-/g, '')];
  return values
    .filter(v => v.timestamp >= startDate)
    .map(v => ({
      id: uuidv4(),
      metricId,
      value: v.value,
      timestamp: v.timestamp,
      status: determineStatus(v.value, metric.thresholds),
      trend: determineTrend(values, v.timestamp)
    }));
};

export const getPerformanceMetricsConfig = async (userId: number): Promise<PerformanceMetricsConfig> => {
  // In production, this would come from the database
  return {
    id: uuidv4(),
    userId,
    metrics,
    thresholds: {
      'rfq-response-rate': { warning: 80, critical: 70 },
      'supplier-acceptance-rate': { warning: 75, critical: 65 },
      'quote-accuracy': { warning: 95, critical: 90 },
      'delivery-performance': { warning: 98, critical: 95 },
      'category-growth-rate': { warning: 5, critical: 0 },
      'revenue-growth': { warning: 10, critical: 5 }
    },
    notificationPreferences: {
      email: true,
      sms: false,
      slack: false
    }
  };
};

export const updatePerformanceMetricsConfig = async (
  userId: number,
  updates: Partial<PerformanceMetricsConfig>
): Promise<PerformanceMetricsConfig> => {
  // In production, this would update the database
  const config = await getPerformanceMetricsConfig(userId);
  return { ...config, ...updates };
};

const determineStatus = (value: number, thresholds: { warning: number; critical: number }): 'healthy' | 'warning' | 'critical' => {
  if (value < thresholds.critical) return 'critical';
  if (value < thresholds.warning) return 'warning';
  return 'healthy';
};

const determineTrend = (values: any[], timestamp: Date): 'up' | 'down' | 'stable' => {
  const current = values.find(v => v.timestamp.getTime() === timestamp.getTime());
  if (!current) return 'stable';

  const previous = values.find(v => v.timestamp < timestamp);
  if (!previous) return 'stable';

  const change = ((current.value - previous.value) / previous.value) * 100;
  if (change > 5) return 'up';
  if (change < -5) return 'down';
  return 'stable';
};
