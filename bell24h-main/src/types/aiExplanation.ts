export type DecisionType =
  | 'supplier_recommendation'
  | 'price_optimization'
  | 'rfq_matching'
  | 'risk_assessment'
  | 'quality_prediction';
export type ImpactType = 'positive' | 'negative' | 'neutral';
export type ConfidenceLevel = 'low' | 'medium' | 'high' | 'very_high';

export interface FeatureValue {
  name: string;
  value: string | number | boolean;
  unit?: string;
  description?: string;
  category?: string;
}

export interface Decision {
  id: string;
  type: DecisionType;
  value: string | number | boolean;
  confidence: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface FeatureImportance {
  feature: string;
  importance: number;
  impact: ImpactType;
  description: string;
  evidence?: string[];
  category?: string;
}

export interface AlternativeDecision {
  id: string;
  value: string | number | boolean;
  confidence: number;
  reasoning: string;
  tradeoffs: string[];
}

export interface ExplanationDetail {
  factor: string;
  impact: ImpactType;
  weight: number;
  description: string;
  evidence: string[];
  category?: string;
  confidence?: number;
}

export interface AIExplanation {
  id: string;
  decisionType: DecisionType;
  timestamp: Date;
  inputFeatures: FeatureValue[];
  outputDecision: Decision;
  explanation: ExplanationDetail[];
  confidence: number;
  featureImportance: FeatureImportance[];
  alternativeOptions?: AlternativeDecision[];
  metadata?: {
    modelVersion: string;
    processingTime: number;
    requestId: string;
    userId?: string;
  };
}

export interface AIExplanationConfig {
  maxExplanations: number;
  cacheTimeout: number;
  retryAttempts: number;
  accessibilityMode: boolean;
  enableRealTime: boolean;
  maxFeatureImportance: number;
}

export interface ExplanationRequest {
  decisionType: DecisionType;
  inputData: Record<string, any>;
  userId?: string;
  sessionId?: string;
  includeAlternatives?: boolean;
  detailLevel?: 'basic' | 'detailed' | 'comprehensive';
}

export interface ExplanationResponse {
  success: boolean;
  explanation?: AIExplanation;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    processingTime: number;
    cacheHit: boolean;
    modelVersion: string;
  };
}

export interface ExplanationFilter {
  decisionType?: DecisionType[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  confidenceMin?: number;
  userId?: string;
  searchTerm?: string;
}

export interface ExplanationHistory {
  explanations: AIExplanation[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface RealTimeExplanationUpdate {
  type: 'new_explanation' | 'update' | 'delete';
  explanation: AIExplanation;
  timestamp: Date;
}
