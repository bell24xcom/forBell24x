// Analytics Types
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
  apiResponseTime: number;
  errorRate: number;
  uptime: number;
  throughput: number;
}

export interface AdvancedAnalytics {
  userEngagement: UserEngagement;
  businessMetrics: BusinessMetrics;
  performanceMetrics: PerformanceMetrics;
  timestamp: Date;
}

// Payment Types
export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethodId?: string;
  metadata: any;
}

export interface PaymentMethod {
  id: string;
  userId: string;
  type: string;
  last4?: string;
  brand?: string;
  expMonth?: number;
  expYear?: number;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'SUCCEEDED' | 'FAILED' | 'REFUNDED';
  paymentIntentId: string;
  paymentMethodId: string;
  error?: string;
  refundedAt?: Date;
  refundAmount?: number;
  paymentIntent?: PaymentIntent;
  paymentMethod?: PaymentMethod;
}

export interface PaymentAnalytics {
  totalRevenue: number;
  averageTransactionValue: number;
  successRate: number;
  refundRate: number;
  timestamp: Date;
} 