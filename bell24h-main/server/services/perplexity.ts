/**
 * Perplexity calculation service for Bell24H AI models
 * 
 * This service provides utilities to calculate perplexity scores for text inputs,
 * which helps in evaluating language model performance and detecting model drift.
 */

import * as math from 'mathjs';
import { tokenize } from '../utils/tokenizer';

// Cache for model probabilities to improve performance
const probabilityCache = new Map<string, number>();

/**
 * Calculate perplexity score for a given text input
 * Perplexity = 2^(-1/N * sum(log2(P(w_i|w_1, ..., w_{i-1}))))
 * 
 * @param text - The input text to calculate perplexity for
 * @param modelName - The language model to use (default: 'default')
 * @returns Perplexity score and additional metrics
 */
export const calculatePerplexity = async (
  text: string,
  modelName: 'default' | 'rfq' | 'product' = 'default'
): Promise<{ 
  perplexity: number,
  normalizedPerplexity: number,
  tokens: number,
  complexityCategory: 'low' | 'medium' | 'high' | 'very-high'
}> => {
  // Tokenize the input text
  const tokens = tokenize(text);
  const numTokens = tokens.length;
  
  if (numTokens === 0) {
    return {
      perplexity: 0,
      normalizedPerplexity: 0,
      tokens: 0,
      complexityCategory: 'low'
    };
  }
  
  // Calculate token probabilities based on the selected model
  const logProbabilities: number[] = [];
  
  for (let i = 0; i < tokens.length; i++) {
    const context = i > 0 ? tokens.slice(0, i).join(' ') : '';
    const token = tokens[i];
    const cacheKey = `${modelName}:${context}:${token}`;
    
    let logProb: number;
    
    if (probabilityCache.has(cacheKey)) {
      logProb = probabilityCache.get(cacheKey)!;
    } else {
      // In a real implementation, we would call the language model API here
      // For this example, we'll use a simplified probability calculation
      logProb = calculateSimulatedLogProbability(token, context, modelName);
      probabilityCache.set(cacheKey, logProb);
    }
    
    logProbabilities.push(logProb);
  }
  
  // Calculate perplexity
  const sumLogProb = logProbabilities.reduce((sum, logProb) => sum + logProb, 0);
  const avgLogProb = sumLogProb / numTokens;
  const perplexity = Math.pow(2, -avgLogProb);
  
  // Normalize the perplexity score to a 0-100 scale
  // Lower perplexity is better, so we invert the scale
  const maxPerplexity = 1000; // Maximum expected perplexity
  const normalizedPerplexity = Math.max(0, Math.min(100, 100 * (1 - perplexity / maxPerplexity)));
  
  // Categorize the complexity based on perplexity
  let complexityCategory: 'low' | 'medium' | 'high' | 'very-high';
  if (perplexity < 10) {
    complexityCategory = 'low';
  } else if (perplexity < 50) {
    complexityCategory = 'medium';
  } else if (perplexity < 200) {
    complexityCategory = 'high';
  } else {
    complexityCategory = 'very-high';
  }
  
  return {
    perplexity,
    normalizedPerplexity,
    tokens: numTokens,
    complexityCategory
  };
};

/**
 * Calculate perplexity for a batch of text inputs
 * 
 * @param texts - Array of text inputs
 * @param modelName - The language model to use
 * @returns Array of perplexity results
 */
export const calculateBatchPerplexity = async (
  texts: string[],
  modelName: 'default' | 'rfq' | 'product' = 'default'
): Promise<Array<{
  perplexity: number,
  normalizedPerplexity: number,
  tokens: number,
  complexityCategory: 'low' | 'medium' | 'high' | 'very-high'
}>> => {
  const results = await Promise.all(
    texts.map(text => calculatePerplexity(text, modelName))
  );
  
  return results;
};

/**
 * Calculate simulated log probability for a token given context
 * This is a simplified implementation for demonstration
 * 
 * @param token - The current token
 * @param context - Previous tokens (context)
 * @param modelName - The model to use for probability calculation
 * @returns Log probability (base 2)
 */
function calculateSimulatedLogProbability(
  token: string,
  context: string,
  modelName: 'default' | 'rfq' | 'product'
): number {
  // Common words should have higher probability
  const commonWords = new Set([
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'I',
    'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at'
  ]);
  
  // Domain-specific words for different models
  const domainWords: Record<string, string[]> = {
    'default': ['price', 'cost', 'quality', 'product', 'service'],
    'rfq': ['request', 'quote', 'quantity', 'supplier', 'deadline', 'specification'],
    'product': ['showcase', 'feature', 'dimension', 'material', 'design', 'color']
  };
  
  // Base probability based on token length and commonality
  let logProb = -Math.log2(token.length + 1);
  
  // Adjust probability based on word commonality
  if (commonWords.has(token.toLowerCase())) {
    logProb += 2; // Higher probability for common words
  }
  
  // Adjust probability based on domain-specific words
  if (domainWords[modelName].includes(token.toLowerCase())) {
    logProb += 1; // Higher probability for domain-specific words
  }
  
  // Context-based adjustment (simplified)
  if (context && context.length > 0) {
    const contextTokens = context.split(' ');
    const lastContextToken = contextTokens[contextTokens.length - 1].toLowerCase();
    
    // Word pairs that commonly appear together
    const commonPairs: Record<string, string[]> = {
      'request': ['for', 'quote'],
      'product': ['showcase', 'description', 'quality'],
      'price': ['quote', 'range', 'list'],
      'please': ['provide', 'send', 'quote']
    };
    
    if (commonPairs[lastContextToken]?.includes(token.toLowerCase())) {
      logProb += 1.5; // Higher probability for common word pairs
    }
  }
  
  return logProb;
}

/**
 * Get interpretation of perplexity score
 * 
 * @param perplexity - The calculated perplexity score
 * @returns Human-readable interpretation
 */
export const interpretPerplexity = (perplexity: number): string => {
  if (perplexity < 10) {
    return 'Very predictable text, likely simple or repetitive content';
  } else if (perplexity < 50) {
    return 'Moderately predictable text, typical for standard business communication';
  } else if (perplexity < 200) {
    return 'Complex text with domain-specific terminology or unusual phrasing';
  } else {
    return 'Highly complex or potentially erroneous text that may need review';
  }
};

export default {
  calculatePerplexity,
  calculateBatchPerplexity,
  interpretPerplexity
};
