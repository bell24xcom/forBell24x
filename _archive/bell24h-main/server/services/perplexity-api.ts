/**
 * Perplexity AI API Service
 * 
 * This service provides a simple interface to communicate with the Perplexity AI API,
 * allowing Bell24H to leverage advanced language models for RFQ analysis and text processing.
 */

import axios from 'axios';
import { config } from 'dotenv';

// Load environment variables
config();

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

// Models available in Perplexity AI
export enum PerplexityModel {
  SONAR_SMALL = 'sonar-small',
  SONAR_MEDIUM = 'sonar-medium', 
  SONAR_LARGE = 'sonar-large',
  SONAR_PRO = 'sonar-pro',
  MIXTRAL = 'mixtral-8x7b-instruct',
  CLAUDE_3_OPUS = 'claude-3-opus',
  CLAUDE_3_SONNET = 'claude-3-sonnet',
  CLAUDE_3_HAIKU = 'claude-3-haiku',
  LLAMA_3 = 'llama-3-70b-instruct',
}

// Message type for API requests
export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Response type from Perplexity API
export interface PerplexityResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: Message;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Send a request to Perplexity AI API
 * 
 * @param messages Array of messages to send to the API
 * @param model Perplexity model to use
 * @returns Response from Perplexity API
 */
export async function queryPerplexity(
  messages: Message[],
  model: PerplexityModel = PerplexityModel.SONAR_MEDIUM
): Promise<PerplexityResponse> {
  if (!PERPLEXITY_API_KEY) {
    throw new Error('PERPLEXITY_API_KEY environment variable is not set');
  }

  try {
    const response = await axios.post(
      PERPLEXITY_API_URL,
      {
        model,
        messages
      },
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${PERPLEXITY_API_KEY}`
        }
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.error('Perplexity API Error:', error.response.data);
      throw new Error(`Perplexity API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    }
    throw error;
  }
}

/**
 * Analyze text complexity using Perplexity AI
 * 
 * @param text Text to analyze
 * @param model Perplexity model to use
 * @returns Analysis results with perplexity metrics
 */
export async function analyzeTextComplexity(
  text: string,
  model: PerplexityModel = PerplexityModel.SONAR_MEDIUM
): Promise<{
  complexity: 'simple' | 'moderate' | 'complex' | 'very complex';
  score: number;
  explanation: string;
}> {
  const messages: Message[] = [
    {
      role: 'system',
      content: `Analyze the following text and determine its linguistic complexity. 
      Provide a complexity score from 0-100 (where 0 is extremely simple and 100 is extremely complex).
      Categorize it as: 'simple', 'moderate', 'complex', or 'very complex'.
      Give a brief 1-sentence explanation for your rating.
      Format your response as valid JSON with properties: complexity, score, and explanation.`
    },
    {
      role: 'user',
      content: text
    }
  ];

  const response = await queryPerplexity(messages, model);
  const content = response.choices[0]?.message.content;

  try {
    // Parse the JSON response
    const parsedResult = JSON.parse(content);
    return {
      complexity: parsedResult.complexity,
      score: parsedResult.score,
      explanation: parsedResult.explanation
    };
  } catch (error) {
    console.error('Error parsing Perplexity API response:', error);
    throw new Error('Failed to parse complexity analysis response');
  }
}

/**
 * Extract key information from RFQ text using Perplexity AI
 * 
 * @param rfqText RFQ text to analyze
 * @param model Perplexity model to use
 * @returns Extracted information from the RFQ
 */
export async function extractRfqInformation(
  rfqText: string,
  model: PerplexityModel = PerplexityModel.SONAR_MEDIUM
): Promise<{
  product?: string;
  quantity?: string;
  budget?: string;
  deadline?: string;
  specifications?: string[];
  confidence: number;
}> {
  const messages: Message[] = [
    {
      role: 'system',
      content: `Extract key information from the following RFQ (Request for Quote) text.
      Identify the product, quantity, budget, deadline, and any specifications.
      Provide a confidence score from 0-100 for your extraction.
      Format your response as valid JSON with properties: product, quantity, budget, deadline, specifications (array), and confidence.
      If any field is not found, omit it from the JSON.`
    },
    {
      role: 'user',
      content: rfqText
    }
  ];

  const response = await queryPerplexity(messages, model);
  const content = response.choices[0]?.message.content;

  try {
    // Parse the JSON response
    const parsedResult = JSON.parse(content);
    return {
      product: parsedResult.product,
      quantity: parsedResult.quantity,
      budget: parsedResult.budget,
      deadline: parsedResult.deadline,
      specifications: parsedResult.specifications,
      confidence: parsedResult.confidence
    };
  } catch (error) {
    console.error('Error parsing Perplexity API RFQ extraction response:', error);
    throw new Error('Failed to parse RFQ extraction response');
  }
}

export default {
  queryPerplexity,
  analyzeTextComplexity,
  extractRfqInformation,
  PerplexityModel
};
