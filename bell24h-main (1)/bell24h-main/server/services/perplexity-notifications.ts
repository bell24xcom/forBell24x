/**
 * Perplexity Notifications Service
 * 
 * This service handles broadcasting perplexity analysis results through
 * the WebSocket and SSE notification systems.
 */

import { SSEApi } from '../../src/websocket/sse';
import { randomUUID } from 'crypto';
import perplexityAnalytics from './perplexity-analytics';
import type { 
  PerplexityProfile, 
  SuccessPrediction, 
  PerplexityRecommendation,
  CustomerPerplexityProfile
} from './perplexity-analytics';

// WebSocket client for broadcasting
// In a production environment, you would use an internal WebSocket client
// For now, we'll use SSEApi for both SSE and WebSocket notifications

/**
 * Notification types for perplexity analysis
 */
export type PerplexityNotificationType = 
  'perplexity_update' | 
  'trend_alert' | 
  'success_prediction' | 
  'text_improvement' | 
  'customer_insight';

/**
 * Base interface for perplexity notifications
 */
export interface PerplexityNotification {
  id: string;
  type: PerplexityNotificationType;
  title: string;
  message: string;
  timestamp: string;
  data: any;
  entityType: 'rfq' | 'bid' | 'product' | 'conversation';
  entityId?: string;
  importance: 'low' | 'medium' | 'high';
}

/**
 * Create a base notification object
 */
function createBaseNotification(
  type: PerplexityNotificationType,
  title: string,
  message: string,
  data: any,
  entityType: 'rfq' | 'bid' | 'product' | 'conversation',
  entityId?: string,
  importance: 'low' | 'medium' | 'high' = 'medium'
): PerplexityNotification {
  return {
    id: randomUUID(),
    type,
    title,
    message,
    timestamp: new Date().toISOString(),
    data,
    entityType,
    entityId,
    importance
  };
}

/**
 * Send a notification about new perplexity analysis
 */
async function sendPerplexityUpdateNotification(
  entityType: 'rfq' | 'bid' | 'product' | 'conversation',
  entityId: string,
  profile: PerplexityProfile
): Promise<void> {
  const notification = createBaseNotification(
    'perplexity_update',
    'New Perplexity Analysis Available',
    `New analysis available for ${entityType} #${entityId}`,
    {
      entityType,
      entityId,
      perplexityScore: profile.perplexityScore,
      normalizedScore: profile.normalizedScore,
      complexityCategory: profile.complexityCategory,
      importantTerms: profile.importantTerms.slice(0, 3),
      summary: true
    },
    entityType,
    entityId,
    profile.complexityCategory === 'high' || profile.complexityCategory === 'very-high' ? 'high' : 'medium'
  );

  // Broadcast via SSE
  SSEApi.broadcastEvent(notification, 'notification');

  console.log(`Perplexity update notification sent for ${entityType} #${entityId}`);
}

/**
 * Send a notification about a significant trend
 */
async function sendTrendAlertNotification(
  entityType: 'rfq' | 'bid' | 'product',
  trendDirection: 'increasing' | 'decreasing' | 'stable',
  percentageChange: number,
  period: string,
  significantTerms: string[]
): Promise<void> {
  // Only send alerts for significant changes
  if (Math.abs(percentageChange) < 10) return;

  const importance = Math.abs(percentageChange) > 25 ? 'high' : 'medium';
  
  let title = 'Perplexity Trend Alert';
  let message = `${Math.abs(percentageChange).toFixed(1)}% ${trendDirection} trend in ${entityType} complexity for ${period}`;

  const notification = createBaseNotification(
    'trend_alert',
    title,
    message,
    {
      entityType,
      trendDirection,
      percentageChange,
      period,
      significantTerms: significantTerms.slice(0, 5)
    },
    entityType,
    undefined,
    importance
  );

  // Broadcast via SSE
  SSEApi.broadcastEvent(notification, 'notification');

  console.log(`Trend alert notification sent: ${message}`);
}

/**
 * Send a notification about a success prediction
 */
async function sendSuccessPredictionNotification(
  entityType: 'rfq' | 'bid' | 'product',
  entityId: string,
  prediction: SuccessPrediction
): Promise<void> {
  const importance = prediction.probability > 0.7 ? 'high' : prediction.probability > 0.4 ? 'medium' : 'low';
  
  const title = 'Success Prediction Analysis';
  const message = `${Math.round(prediction.probability * 100)}% success probability for ${entityType} #${entityId}`;

  const notification = createBaseNotification(
    'success_prediction',
    title,
    message,
    {
      entityType,
      entityId,
      probability: prediction.probability,
      confidenceScore: prediction.confidenceScore,
      keyFactors: prediction.keyFactors.slice(0, 3),
      recommendedActions: prediction.recommendedActions.slice(0, 2)
    },
    entityType,
    entityId,
    importance
  );

  // Broadcast via SSE
  SSEApi.broadcastEvent(notification, 'notification');

  console.log(`Success prediction notification sent for ${entityType} #${entityId}`);
}

/**
 * Send a notification about text improvement suggestions
 */
async function sendTextImprovementNotification(
  entityType: 'rfq' | 'bid' | 'product',
  entityId: string,
  recommendation: PerplexityRecommendation
): Promise<void> {
  // Calculate improvement percentage
  const improvementPercentage = ((recommendation.originalPerplexity - recommendation.improvedPerplexity) / recommendation.originalPerplexity) * 100;
  const importance = improvementPercentage > 20 ? 'high' : improvementPercentage > 10 ? 'medium' : 'low';
  
  const title = 'Text Improvement Available';
  const message = `${Math.abs(improvementPercentage).toFixed(1)}% text clarity improvement available for ${entityType} #${entityId}`;

  const notification = createBaseNotification(
    'text_improvement',
    title,
    message,
    {
      entityType,
      entityId,
      originalPerplexity: recommendation.originalPerplexity,
      improvedPerplexity: recommendation.improvedPerplexity,
      improvementRationale: recommendation.improvementRationale,
      businessImpact: recommendation.businessImpact
    },
    entityType,
    entityId,
    importance
  );

  // Broadcast via SSE
  SSEApi.broadcastEvent(notification, 'notification');

  console.log(`Text improvement notification sent for ${entityType} #${entityId}`);
}

/**
 * Send a notification about customer perplexity profile insights
 */
async function sendCustomerInsightNotification(
  customerId: string,
  profile: CustomerPerplexityProfile
): Promise<void> {
  const title = 'Customer Communication Insight';
  const message = `Communication profile updated for customer #${customerId}`;

  const notification = createBaseNotification(
    'customer_insight',
    title,
    message,
    {
      customerId,
      preferredComplexity: profile.preferredComplexity,
      communicationPreferences: profile.communicationPreferences,
      industrySpecificTerms: profile.industrySpecificTerms.slice(0, 5),
      responseRate: profile.responseRate,
      engagementScore: profile.engagementScore
    },
    'conversation',
    customerId,
    'medium'
  );

  // Broadcast via SSE
  SSEApi.broadcastEvent(notification, 'notification');

  console.log(`Customer insight notification sent for customer #${customerId}`);
}

export default {
  sendPerplexityUpdateNotification,
  sendTrendAlertNotification,
  sendSuccessPredictionNotification,
  sendTextImprovementNotification,
  sendCustomerInsightNotification
};
