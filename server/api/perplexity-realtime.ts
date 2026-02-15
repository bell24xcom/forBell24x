/**
 * Perplexity Real-Time API
 * 
 * This API provides endpoints for sending real-time notifications
 * about perplexity analysis results.
 */

import express from 'express';
import { randomUUID } from 'crypto';
import perplexityAnalytics from '../services/perplexity-analytics';
import perplexityNotifications from '../services/perplexity-notifications';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Create router
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'bell24h_default_secret';

// Authentication middleware
function authenticate(req: express.Request, res: express.Response, next: express.NextFunction) {
  const token = req.headers.authorization?.split(' ')[1] || req.query.token as string;
  
  if (!token) {
    return res.status(401).json({ error: 'No authentication token provided' });
  }
  
  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    (req as any).user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid authentication token' });
  }
}

/**
 * Send a perplexity update notification
 * 
 * POST /api/perplexity-realtime/notify
 */
router.post('/notify', authenticate, async (req, res) => {
  const { entityType, entityId, analysisType } = req.body;
  
  if (!entityType || !entityId || !analysisType) {
    return res.status(400).json({ 
      error: 'Missing required fields: entityType, entityId, analysisType' 
    });
  }
  
  try {
    // Simulated perplexity profile - in a real implementation, this would
    // retrieve the actual profile from the database or analytics service
    const profile = {
      id: randomUUID(),
      entityType: entityType,
      entityId: entityId,
      timestamp: new Date(),
      perplexityScore: Math.random() * 100 + 20,
      normalizedScore: Math.random() * 0.8 + 0.1,
      complexityCategory: ['low', 'medium', 'high', 'very-high'][Math.floor(Math.random() * 4)],
      tokens: Math.floor(Math.random() * 200 + 50),
      importantTerms: ['quality', 'delivery', 'specifications', 'certification', 'timeline'].slice(0, 3 + Math.floor(Math.random() * 3))
    };
    
    // Send notification via the perplexity notifications service
    await perplexityNotifications.sendPerplexityUpdateNotification(
      entityType,
      entityId,
      profile as any
    );
    
    res.json({
      success: true,
      message: `Notification sent for ${entityType} #${entityId}`,
      profile
    });
  } catch (err) {
    console.error('Error sending perplexity notification:', err);
    res.status(500).json({ 
      error: 'Failed to send perplexity notification',
      details: (err as Error).message
    });
  }
});

/**
 * Send a trend alert notification
 * 
 * POST /api/perplexity-realtime/trend-alert
 */
router.post('/trend-alert', authenticate, async (req, res) => {
  const { entityType, trendDirection, percentageChange, period } = req.body;
  
  if (!entityType || !trendDirection || percentageChange === undefined || !period) {
    return res.status(400).json({ 
      error: 'Missing required fields: entityType, trendDirection, percentageChange, period' 
    });
  }
  
  try {
    // Generate some random significant terms
    const allTerms = [
      'quality', 'delivery', 'specifications', 'certification', 
      'timeline', 'budget', 'compliance', 'materials',
      'warranty', 'support', 'installation', 'maintenance'
    ];
    
    const significantTerms = Array.from(
      { length: 3 + Math.floor(Math.random() * 4) },
      () => allTerms[Math.floor(Math.random() * allTerms.length)]
    );
    
    // Send notification
    await perplexityNotifications.sendTrendAlertNotification(
      entityType,
      trendDirection,
      parseFloat(percentageChange),
      period,
      significantTerms
    );
    
    res.json({
      success: true,
      message: `Trend alert sent for ${entityType}`,
      details: {
        trendDirection,
        percentageChange,
        period,
        significantTerms
      }
    });
  } catch (err) {
    console.error('Error sending trend alert:', err);
    res.status(500).json({ 
      error: 'Failed to send trend alert',
      details: (err as Error).message
    });
  }
});

/**
 * Send a success prediction notification
 * 
 * POST /api/perplexity-realtime/success-prediction
 */
router.post('/success-prediction', authenticate, async (req, res) => {
  const { entityType, entityId } = req.body;
  
  if (!entityType || !entityId) {
    return res.status(400).json({ 
      error: 'Missing required fields: entityType, entityId' 
    });
  }
  
  try {
    // Mock success prediction data
    const prediction = {
      entityId,
      entityType,
      probability: Math.random() * 0.7 + 0.2,
      confidenceScore: Math.random() * 0.4 + 0.5,
      keyFactors: [
        { factor: 'Complexity level', impact: Math.random() },
        { factor: 'Response time', impact: Math.random() },
        { factor: 'Term specificity', impact: Math.random() },
        { factor: 'Industry alignment', impact: Math.random() }
      ],
      recommendedActions: [
        'Simplify technical language',
        'Include more specific details about implementation',
        'Add section on compliance requirements',
        'Emphasize delivery timelines'
      ]
    };
    
    // Send notification
    await perplexityNotifications.sendSuccessPredictionNotification(
      entityType,
      entityId,
      prediction as any
    );
    
    res.json({
      success: true,
      message: `Success prediction sent for ${entityType} #${entityId}`,
      prediction
    });
  } catch (err) {
    console.error('Error sending success prediction:', err);
    res.status(500).json({ 
      error: 'Failed to send success prediction',
      details: (err as Error).message
    });
  }
});

/**
 * Send a text improvement notification
 * 
 * POST /api/perplexity-realtime/text-improvement
 */
router.post('/text-improvement', authenticate, async (req, res) => {
  const { entityType, entityId, text } = req.body;
  
  if (!entityType || !entityId || !text) {
    return res.status(400).json({ 
      error: 'Missing required fields: entityType, entityId, text' 
    });
  }
  
  try {
    // Mock text improvement data
    const originalPerplexity = Math.random() * 100 + 50;
    const improvedPerplexity = originalPerplexity * (Math.random() * 0.4 + 0.5);
    
    const recommendation = {
      originalText: text,
      improvedText: `${text} [with improved clarity and structure]`,
      originalPerplexity,
      improvedPerplexity,
      improvementRationale: 'Simplified technical terminology and improved sentence structure',
      businessImpact: 'Expected to increase response rate by approximately 20%'
    };
    
    // Send notification
    await perplexityNotifications.sendTextImprovementNotification(
      entityType,
      entityId,
      recommendation
    );
    
    res.json({
      success: true,
      message: `Text improvement sent for ${entityType} #${entityId}`,
      recommendation
    });
  } catch (err) {
    console.error('Error sending text improvement:', err);
    res.status(500).json({ 
      error: 'Failed to send text improvement',
      details: (err as Error).message
    });
  }
});

/**
 * Run a complete analysis and send all notification types
 * 
 * POST /api/perplexity-realtime/run-complete-analysis
 */
router.post('/run-complete-analysis', authenticate, async (req, res) => {
  const { entityType, entityId, text } = req.body;
  
  if (!entityType || !entityId || !text) {
    return res.status(400).json({ 
      error: 'Missing required fields: entityType, entityId, text' 
    });
  }
  
  try {
    // Sequential notifications
    const results = {
      notifications: [] as any[]
    };
    
    // 1. Perplexity update
    const profile = {
      id: randomUUID(),
      entityType: entityType,
      entityId: entityId,
      timestamp: new Date(),
      perplexityScore: Math.random() * 100 + 20,
      normalizedScore: Math.random() * 0.8 + 0.1,
      complexityCategory: ['low', 'medium', 'high', 'very-high'][Math.floor(Math.random() * 4)] as any,
      tokens: Math.floor(Math.random() * 200 + 50),
      importantTerms: ['quality', 'delivery', 'specifications', 'certification', 'timeline'].slice(0, 3 + Math.floor(Math.random() * 3))
    };
    
    await perplexityNotifications.sendPerplexityUpdateNotification(
      entityType,
      entityId,
      profile as any
    );
    
    results.notifications.push({
      type: 'perplexity_update',
      data: profile
    });
    
    // 2. Success prediction
    const prediction = {
      entityId,
      entityType,
      probability: Math.random() * 0.7 + 0.2,
      confidenceScore: Math.random() * 0.4 + 0.5,
      keyFactors: [
        { factor: 'Complexity level', impact: Math.random() },
        { factor: 'Response time', impact: Math.random() },
        { factor: 'Term specificity', impact: Math.random() },
      ],
      recommendedActions: [
        'Simplify technical language',
        'Include more specific details about implementation',
      ]
    };
    
    await perplexityNotifications.sendSuccessPredictionNotification(
      entityType,
      entityId,
      prediction as any
    );
    
    results.notifications.push({
      type: 'success_prediction',
      data: prediction
    });
    
    // 3. Text improvement
    const originalPerplexity = Math.random() * 100 + 50;
    const improvedPerplexity = originalPerplexity * (Math.random() * 0.4 + 0.5);
    
    const recommendation = {
      originalText: text,
      improvedText: `${text} [with improved clarity and structure]`,
      originalPerplexity,
      improvedPerplexity,
      improvementRationale: 'Simplified technical terminology and improved sentence structure',
      businessImpact: 'Expected to increase response rate by approximately 20%'
    };
    
    await perplexityNotifications.sendTextImprovementNotification(
      entityType,
      entityId,
      recommendation
    );
    
    results.notifications.push({
      type: 'text_improvement',
      data: recommendation
    });
    
    res.json({
      success: true,
      message: `Complete analysis run for ${entityType} #${entityId}`,
      results
    });
  } catch (err) {
    console.error('Error running complete analysis:', err);
    res.status(500).json({ 
      error: 'Failed to run complete analysis',
      details: (err as Error).message
    });
  }
});

export default router;
