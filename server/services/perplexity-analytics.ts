/**
 * Advanced Perplexity Analytics Service for Bell24H
 * 
 * This service extends the basic perplexity calculation with advanced
 * business analytics capabilities including temporal analysis, competitive
 * intelligence, market segmentation, and more.
 */

import * as math from 'mathjs';
import perplexityService from './perplexity';
import aiExplainer from './ai-explainer';
import db from '../db/client';
import { sql } from 'drizzle-orm';

// Types for perplexity analytics
export type PerplexityProfile = {
  id: string;
  entityType: 'rfq' | 'bid' | 'product' | 'conversation';
  entityId: string;
  timestamp: Date;
  perplexityScore: number;
  normalizedScore: number;
  complexityCategory: 'low' | 'medium' | 'high' | 'very-high';
  tokens: number;
  languageCode?: string;
  importantTerms: string[];
  industryContext?: string;
};

export type TemporalTrend = {
  period: string;
  averagePerplexity: number;
  trendDirection: 'increasing' | 'decreasing' | 'stable';
  percentageChange: number;
  significantTerms: string[];
};

export type CompetitiveInsight = {
  term: string;
  frequency: number;
  uniqueness: number; // How unique this term is to this entity vs others
  emergingScore: number; // How rapidly this term is growing in usage
  businessValue: number; // Estimated business value of this term
};

export type MarketSegment = {
  id: string;
  name: string;
  size: number;
  averagePerplexity: number;
  averageDealSize?: number;
  keyTerms: string[];
  growthRate?: number;
};

export type SuccessPrediction = {
  entityId: string;
  entityType: 'rfq' | 'bid' | 'product';
  probability: number;
  confidenceScore: number;
  keyFactors: Array<{factor: string, impact: number}>;
  recommendedActions: string[];
};

export type PerplexityRecommendation = {
  originalText: string;
  improvedText: string;
  originalPerplexity: number;
  improvedPerplexity: number;
  improvementRationale: string;
  businessImpact: string;
};

export type CustomerPerplexityProfile = {
  customerId: string;
  preferredComplexity: 'low' | 'medium' | 'high' | 'very-high';
  industrySpecificTerms: string[];
  responseRate: number;
  engagementScore: number;
  communicationPreferences: {
    detailLevel: 'minimal' | 'moderate' | 'detailed';
    formalityLevel: 'casual' | 'neutral' | 'formal';
    technicalLevel: 'basic' | 'moderate' | 'advanced';
  };
};

/**
 * Store a perplexity profile for historical analysis
 */
export const storePerplexityProfile = async (profile: Omit<PerplexityProfile, 'id'>): Promise<string> => {
  // For now, we'll simulate storing this data
  // In a real implementation, this would insert into a database table
  console.log('Storing perplexity profile for analysis:', profile);
  
  // In a production environment, this would be:
  // const result = await db.insert(perplexityProfiles).values(profile).returning({ id: perplexityProfiles.id });
  // return result[0].id;
  
  return `profile-${Date.now()}`;
};

/**
 * Analyze perplexity trends over time for a specific entity type
 */
export const analyzeTemporalTrends = async (
  entityType: 'rfq' | 'bid' | 'product', 
  timeframe: 'week' | 'month' | 'quarter' | 'year',
  segmentBy?: 'customer' | 'category' | 'region'
): Promise<TemporalTrend[]> => {
  // In a real implementation, this would query the database for historical perplexity data
  // For demo purposes, we'll return simulated trends
  
  const trends: TemporalTrend[] = [];
  
  // Simulate 5 periods of data
  const periods = timeframe === 'week' ? 
    ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'] :
    timeframe === 'month' ?
    ['Jan', 'Feb', 'Mar', 'Apr', 'May'] :
    timeframe === 'quarter' ?
    ['Q1', 'Q2', 'Q3', 'Q4', 'Q1 2025'] :
    ['2021', '2022', '2023', '2024', '2025'];
  
  // Generate simulated trend data
  let basePerplexity = 50 + Math.random() * 30;
  
  for (let i = 0; i < periods.length; i++) {
    // Add some random fluctuation to create a trend
    const change = (Math.random() - 0.3) * 10;
    basePerplexity += change;
    
    // Ensure perplexity stays within reasonable bounds
    basePerplexity = Math.max(10, Math.min(200, basePerplexity));
    
    // Generate trend direction and percentage
    const trendDirection = change > 2 ? 'increasing' : change < -2 ? 'decreasing' : 'stable';
    const percentageChange = change / (basePerplexity - change) * 100;
    
    // Simulate significant terms
    const significantTerms = [
      'quality', 'delivery', 'price', 'specification', 'material',
      'component', 'manufacturing', 'sample', 'prototype', 'quotation'
    ].sort(() => Math.random() - 0.5).slice(0, 3 + Math.floor(Math.random() * 3));
    
    trends.push({
      period: periods[i],
      averagePerplexity: basePerplexity,
      trendDirection,
      percentageChange,
      significantTerms
    });
  }
  
  return trends;
};

/**
 * Analyze competitive intelligence based on perplexity profiles
 */
export const analyzeCompetitiveIntelligence = async (
  entityId: string,
  entityType: 'rfq' | 'bid' | 'product',
  competitorIds?: string[]
): Promise<CompetitiveInsight[]> => {
  // In a real implementation, this would compare perplexity profiles between entities
  // For demo purposes, we'll return simulated insights
  
  const insights: CompetitiveInsight[] = [];
  
  // Simulate competitive insights for common business terms
  const businessTerms = [
    'competitive pricing', 'fast delivery', 'quality assurance', 'bulk discount',
    'technical specifications', 'material composition', 'sustainable manufacturing',
    'customization options', 'warranty period', 'certification standards'
  ];
  
  // Generate simulated insights
  for (const term of businessTerms) {
    insights.push({
      term,
      frequency: Math.random(),
      uniqueness: Math.random(),
      emergingScore: Math.random(),
      businessValue: Math.random()
    });
  }
  
  // Sort by business value (highest first)
  insights.sort((a, b) => b.businessValue - a.businessValue);
  
  return insights.slice(0, 5); // Return top 5 insights
};

/**
 * Identify market segments based on perplexity patterns
 */
export const identifyMarketSegments = async (
  entityType: 'rfq' | 'bid' | 'product',
  segmentationCriteria: 'language_complexity' | 'terminology' | 'industry',
  minSegmentSize: number = 5
): Promise<MarketSegment[]> => {
  // In a real implementation, this would use clustering algorithms on perplexity profiles
  // For demo purposes, we'll return simulated segments
  
  // Simulate different segment types based on criteria
  const segments: MarketSegment[] = [];
  
  if (segmentationCriteria === 'language_complexity') {
    segments.push(
      {
        id: 'segment-1',
        name: 'Technical Specialists',
        size: 35,
        averagePerplexity: 180,
        keyTerms: ['technical specification', 'engineering requirements', 'precision manufacturing'],
        growthRate: 0.15,
        averageDealSize: 75000
      },
      {
        id: 'segment-2',
        name: 'Business Managers',
        size: 55,
        averagePerplexity: 90,
        keyTerms: ['cost efficiency', 'delivery timeline', 'payment terms'],
        growthRate: 0.08,
        averageDealSize: 45000
      },
      {
        id: 'segment-3',
        name: 'Retail Buyers',
        size: 110,
        averagePerplexity: 40,
        keyTerms: ['product selection', 'wholesale pricing', 'shipping options'],
        growthRate: 0.22,
        averageDealSize: 15000
      }
    );
  } else if (segmentationCriteria === 'terminology') {
    segments.push(
      {
        id: 'segment-1',
        name: 'Quality-Focused',
        size: 65,
        averagePerplexity: 120,
        keyTerms: ['premium quality', 'durability testing', 'quality assurance'],
        growthRate: 0.12,
        averageDealSize: 62000
      },
      {
        id: 'segment-2',
        name: 'Price-Sensitive',
        size: 95,
        averagePerplexity: 70,
        keyTerms: ['competitive pricing', 'cost reduction', 'bulk discounts'],
        growthRate: 0.06,
        averageDealSize: 28000
      },
      {
        id: 'segment-3',
        name: 'Innovation-Seeking',
        size: 40,
        averagePerplexity: 150,
        keyTerms: ['cutting-edge', 'prototype development', 'custom solutions'],
        growthRate: 0.18,
        averageDealSize: 83000
      }
    );
  } else {
    segments.push(
      {
        id: 'segment-1',
        name: 'Manufacturing',
        size: 78,
        averagePerplexity: 110,
        keyTerms: ['production capacity', 'material specifications', 'assembly process'],
        growthRate: 0.09,
        averageDealSize: 52000
      },
      {
        id: 'segment-2',
        name: 'Electronics',
        size: 45,
        averagePerplexity: 160,
        keyTerms: ['circuit design', 'voltage requirements', 'component integration'],
        growthRate: 0.17,
        averageDealSize: 68000
      },
      {
        id: 'segment-3',
        name: 'Construction',
        size: 52,
        averagePerplexity: 95,
        keyTerms: ['building materials', 'structural integrity', 'safety standards'],
        growthRate: 0.11,
        averageDealSize: 47000
      },
      {
        id: 'segment-4',
        name: 'Consumer Goods',
        size: 87,
        averagePerplexity: 60,
        keyTerms: ['packaging design', 'shelf-life', 'consumer appeal'],
        growthRate: 0.14,
        averageDealSize: 34000
      }
    );
  }
  
  return segments;
};

/**
 * Predict success probability based on perplexity profile
 */
export const predictSuccessProbability = async (
  text: string,
  entityType: 'rfq' | 'bid' | 'product',
  modelType: 'rfq_classification' | 'bid_pricing' | 'product_categorization'
): Promise<SuccessPrediction> => {
  // Calculate perplexity for the input
  const perplexityResult = await perplexityService.calculatePerplexity(text, 
    entityType === 'rfq' ? 'rfq' : 
    entityType === 'product' ? 'product' : 'default'
  );
  
  // In a real implementation, this would use ML models trained on historical data
  // For demo purposes, we'll return simulated predictions
  
  // Get SHAP explanation to identify key factors
  const shapExplanation = await aiExplainer.explainWithSHAP(text, modelType);
  
  // Extract top features from SHAP explanation
  const keyFactors = shapExplanation.features
    .sort((a: any, b: any) => Math.abs(b.importance) - Math.abs(a.importance))
    .slice(0, 3)
    .map((f: any) => ({
      factor: f.name,
      impact: f.importance
    }));
  
  // Calculate simulated probability based on perplexity and complexity
  let baseProbability = 0.5;
  
  // Adjust based on perplexity - medium complexity tends to be optimal
  if (perplexityResult.complexityCategory === 'medium') {
    baseProbability += 0.2;
  } else if (perplexityResult.complexityCategory === 'very-high') {
    baseProbability -= 0.15;
  }
  
  // Adjust based on token count - too short or too long can be problematic
  if (perplexityResult.tokens < 10) {
    baseProbability -= 0.1;
  } else if (perplexityResult.tokens > 30 && perplexityResult.tokens < 200) {
    baseProbability += 0.1;
  }
  
  // Ensure probability is between 0 and 1
  baseProbability = Math.max(0.1, Math.min(0.9, baseProbability));
  
  // Generate recommended actions based on entity type
  const recommendedActions: string[] = [];
  
  if (entityType === 'rfq') {
    recommendedActions.push(
      "Include more specific product requirements",
      "Add expected delivery timeframe",
      "Specify target price range"
    );
  } else if (entityType === 'bid') {
    recommendedActions.push(
      "Break down pricing into component costs",
      "Highlight quality differentiators",
      "Add volume discount options"
    );
  } else {
    recommendedActions.push(
      "Include more technical specifications",
      "Add comparison with competing products",
      "Highlight unique selling points"
    );
  }
  
  return {
    entityId: `${entityType}-${Date.now()}`,
    entityType,
    probability: baseProbability,
    confidenceScore: 0.75, // Simulated confidence in prediction
    keyFactors,
    recommendedActions
  };
};

/**
 * Generate improved text recommendations based on perplexity analysis
 */
export const generateTextImprovements = async (
  text: string,
  targetAudience: 'technical' | 'business' | 'general',
  entityType: 'rfq' | 'bid' | 'product',
  modelType: 'rfq_classification' | 'bid_pricing' | 'product_categorization'
): Promise<PerplexityRecommendation> => {
  // Calculate perplexity for the original text
  const originalPerplexityResult = await perplexityService.calculatePerplexity(text, 
    entityType === 'rfq' ? 'rfq' : 
    entityType === 'product' ? 'product' : 'default'
  );
  
  // In a real implementation, this would use advanced NLP to improve the text
  // For demo purposes, we'll return a simplified improvement
  
  // Get data quality assessment to identify issues
  const shapExplanation = await aiExplainer.explainWithSHAP(text, modelType);
  const limeExplanation = await aiExplainer.explainWithLIME(text, modelType);
  
  // Analyze the text for common issues based on entity type
  let improvedText = text;
  let improvementRationale = "";
  let businessImpact = "";
  
  // Check for entity-specific improvements
  if (entityType === 'rfq') {
    if (!text.match(/\b\d+\s*(units|pieces|kg|tons|pounds|items|pcs)\b/i)) {
      improvedText += " We require 500 units.";
      improvementRationale += "Added quantity specification. ";
      businessImpact += "Clearer quantity requirements lead to more accurate quotes. ";
    }
    
    if (!text.match(/\b(delivery|deadline|by|within|asap|urgently)\b/i)) {
      improvedText += " Delivery is needed within 30 days.";
      improvementRationale += "Added delivery timeframe. ";
      businessImpact += "Clear deadlines improve supplier planning. ";
    }
  } else if (entityType === 'bid') {
    if (!text.match(/\b(breakdown|itemized|detailed pricing)\b/i)) {
      improvedText += " This price includes a detailed breakdown: materials ($2,500), labor ($1,500), and shipping ($500).";
      improvementRationale += "Added price breakdown. ";
      businessImpact += "Transparent pricing builds trust and justifies value. ";
    }
  } else if (entityType === 'product') {
    if (!text.match(/\b(made of|material|composition|contains)\b/i)) {
      improvedText += " The product is made of high-grade stainless steel with reinforced polymer components.";
      improvementRationale += "Added material specification. ";
      businessImpact += "Material details help qualify the product for specific applications. ";
    }
  }
  
  // Adjust language complexity based on target audience
  let targetPerplexity = originalPerplexityResult.perplexity;
  
  if (targetAudience === 'technical' && originalPerplexityResult.complexityCategory !== 'high') {
    improvedText = improvedText.replace(/good/g, 'optimal')
                             .replace(/fast/g, 'high-velocity')
                             .replace(/strong/g, 'high-tensile strength');
    targetPerplexity = Math.min(200, targetPerplexity * 1.5);
    improvementRationale += "Enhanced technical terminology for expert audience. ";
    businessImpact += "Technical language builds credibility with specialists. ";
  } else if (targetAudience === 'general' && originalPerplexityResult.complexityCategory !== 'low') {
    improvedText = improvedText.replace(/utilize/g, 'use')
                             .replace(/implement/g, 'set up')
                             .replace(/procure/g, 'get');
    targetPerplexity = Math.max(20, targetPerplexity * 0.7);
    improvementRationale += "Simplified language for general audience. ";
    businessImpact += "Clearer language improves understanding and response rates. ";
  }
  
  return {
    originalText: text,
    improvedText,
    originalPerplexity: originalPerplexityResult.perplexity,
    improvedPerplexity: targetPerplexity,
    improvementRationale,
    businessImpact
  };
};

/**
 * Generate or update a customer's perplexity profile
 */
export const updateCustomerPerplexityProfile = async (
  customerId: string,
  recentTexts: string[]
): Promise<CustomerPerplexityProfile> => {
  // In a real implementation, this would analyze historical communications
  // For demo purposes, we'll return a simulated profile
  
  // Calculate average perplexity across recent texts
  const perplexityResults = await Promise.all(
    recentTexts.map(text => perplexityService.calculatePerplexity(text))
  );
  
  // Calculate the average perplexity
  const averagePerplexity = perplexityResults.reduce(
    (sum, result) => sum + result.perplexity, 0
  ) / perplexityResults.length;
  
  // Determine preferred complexity based on average perplexity
  let preferredComplexity: 'low' | 'medium' | 'high' | 'very-high' = 'medium';
  if (averagePerplexity < 20) {
    preferredComplexity = 'low';
  } else if (averagePerplexity < 80) {
    preferredComplexity = 'medium';
  } else if (averagePerplexity < 150) {
    preferredComplexity = 'high';
  } else {
    preferredComplexity = 'very-high';
  }
  
  // Simulate other profile attributes
  return {
    customerId,
    preferredComplexity,
    industrySpecificTerms: [
      'quality assurance', 
      'delivery timeline',
      'technical specifications'
    ],
    responseRate: 0.75,
    engagementScore: 0.82,
    communicationPreferences: {
      detailLevel: preferredComplexity === 'low' ? 'minimal' : 
                  preferredComplexity === 'medium' ? 'moderate' : 'detailed',
      formalityLevel: Math.random() > 0.5 ? 'formal' : 'neutral',
      technicalLevel: preferredComplexity === 'high' || 
                     preferredComplexity === 'very-high' ? 'advanced' : 'moderate'
    }
  };
};

/**
 * Handle multilingual perplexity analysis
 */
export const analyzeMultilingualPerplexity = async (
  text: string,
  languageCode: string,
  entityType: 'rfq' | 'bid' | 'product'
): Promise<{
  perplexity: number,
  normalizedScore: number,
  detectedLanguage: string,
  translationConfidence: number,
  keyTerms: { term: string, confidence: number }[]
}> => {
  // In a real implementation, this would detect language and calculate
  // language-specific perplexity
  // For demo purposes, we'll return simulated results
  
  // Use base perplexity calculation but adjust for language
  const baseResult = await perplexityService.calculatePerplexity(text);
  
  // Apply language-specific adjustment factors (simulated)
  const languageAdjustments: Record<string, number> = {
    'en': 1.0,    // English (baseline)
    'es': 1.2,    // Spanish
    'fr': 1.15,   // French
    'de': 1.3,    // German
    'zh': 1.5,    // Chinese
    'ja': 1.45,   // Japanese
    'ko': 1.4,    // Korean
    'pt': 1.18,   // Portuguese
    'it': 1.1,    // Italian
    'ru': 1.35    // Russian
  };
  
  // Apply adjustment factor (default to 1.2 if language not in the list)
  const adjustmentFactor = languageAdjustments[languageCode] || 1.2;
  const adjustedPerplexity = baseResult.perplexity * adjustmentFactor;
  
  // Simulate key terms extraction for the language
  const keyTerms = [
    {term: 'quality', confidence: 0.92},
    {term: 'delivery', confidence: 0.87},
    {term: 'price', confidence: 0.95},
    {term: 'specification', confidence: 0.83},
    {term: 'material', confidence: 0.79}
  ];
  
  return {
    perplexity: adjustedPerplexity,
    normalizedScore: baseResult.normalizedPerplexity,
    detectedLanguage: languageCode, // In a real impl, this would be detected
    translationConfidence: 0.85,
    keyTerms
  };
};

export default {
  storePerplexityProfile,
  analyzeTemporalTrends,
  analyzeCompetitiveIntelligence,
  identifyMarketSegments,
  predictSuccessProbability,
  generateTextImprovements,
  updateCustomerPerplexityProfile,
  analyzeMultilingualPerplexity
};
