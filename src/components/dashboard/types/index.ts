export interface UserEngagement {
  sessionDuration: number;
  pageViews: number;
  bounceRate: number;
  conversionRate: number;
}

export interface BusinessMetrics {
  rfqCompletionRate: number;
  supplierResponseTime: number;
  averageOrderValue: number;
  customerLifetimeValue: number;
}

export interface PerformanceMetrics {
  responseTime: number;
  errorRate: number;
  uptime: number;
  throughput: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
}

export interface ExportFormat {
  type: 'json' | 'csv' | 'pdf';
  label: string;
} 