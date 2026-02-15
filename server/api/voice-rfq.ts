/**
 * Voice RFQ API Endpoint for Bell24H
 * 
 * This API endpoint handles both voice-to-text and text-based RFQ creation
 * with multilingual support using Google Cloud NLP or fallback regex patterns.
 */

import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import perplexityService from '../services/perplexity';
import perplexityApi, { PerplexityModel } from '../services/perplexity-api';
import { getTokenStats } from '../utils/tokenizer';

const router = Router();

// Language detection and NLP helper
interface ExtractedRfqData {
  product?: string;
  quantity?: string;
  deadline?: string;
  specifications?: string[];
  confidence: number;
}

interface PartialRfqData {
  product?: string;
  quantity?: string;
  deadline?: string;
  specifications?: string[];
}

/**
 * Extract product and quantity information from text using
 * Perplexity AI API, Google NLP API, or regex patterns as fallback
 */
async function extractRfqDetails(text: string, language: string): Promise<ExtractedRfqData> {
  // First try Perplexity AI if API key is set
  if (process.env.PERPLEXITY_API_KEY) {
    try {
      console.log(`Using Perplexity AI API for language: ${language}`);
      return await extractWithPerplexityAI(text, language);
    } catch (error) {
      console.error('Perplexity AI API error, falling back to alternatives:', error);
      // Fall through to alternatives on error
    }
  }
  
  // Next try Google NLP if credentials are available
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    // This would use Google's NLP API in a real implementation
    // For now, we'll simulate it with our perplexity service
    console.log(`Using simulated NLP for language: ${language}`);
    return simulateNlpExtraction(text, language);
  } else {
    // Final fallback to regex-based extraction
    console.log(`Using regex extraction for language: ${language}`);
    return extractWithRegex(text, language);
  }
}

/**
 * Simulate NLP extraction using our perplexity service
 * In a real implementation, this would connect to Google's NLP API
 */
async function simulateNlpExtraction(text: string, language: string): Promise<ExtractedRfqData> {
  // Calculate perplexity to gauge text complexity
  const perplexityResult = await perplexityService.calculatePerplexity(text, 'rfq');
  
  // Calculate confidence score based on perplexity
  const confidence = Math.min(0.95, Math.max(0.5, 1 - (perplexityResult.perplexity / 200)));
  
  // Language-specific extraction logic
  let extracted: PartialRfqData;
  switch(language.split('-')[0]) {
    case 'en': // English
      extracted = extractEnglish(text);
      break;
    case 'hi': // Hindi
      extracted = extractHindi(text);
      break;
    case 'fr': // French
      extracted = extractFrench(text);
      break;
    case 'es': // Spanish
      extracted = extractSpanish(text);
      break;
    case 'zh': // Chinese
      extracted = extractChinese(text);
      break;
    default:
      // Default to English for unsupported languages
      extracted = extractEnglish(text);
  }
  
  // Combine extraction results with confidence score
  const result: ExtractedRfqData = {
    ...extracted,
    confidence
  };
  
  return result;
}

/**
 * Extract RFQ details using regex patterns (fallback method)
 */
function extractWithRegex(text: string, language: string): Promise<ExtractedRfqData> {
  // Simple language detection to use the right regex patterns
  const languageCode = language.split('-')[0];
  
  // Use different extraction functions based on language
  let extractedData: PartialRfqData;
  
  switch(languageCode) {
    case 'en': 
      extractedData = extractEnglish(text);
      break;
    case 'hi':
      extractedData = extractHindi(text);
      break;
    case 'fr':
      extractedData = extractFrench(text);
      break;
    case 'es':
      extractedData = extractSpanish(text);
      break;
    case 'zh':
      extractedData = extractChinese(text);
      break;
    default:
      // Default to English patterns for unsupported languages
      extractedData = extractEnglish(text);
  }
  
  // Add confidence score to extracted data
  const result: ExtractedRfqData = {
    ...extractedData,
    confidence: 0.75 // Lower confidence for regex-based extraction
  };
  
  return Promise.resolve(result);
}

/**
 * Extract RFQ details using Perplexity AI API
 */
async function extractWithPerplexityAI(text: string, language: string): Promise<ExtractedRfqData> {
  // Select the appropriate model based on text length and complexity
  const model = text.length > 500 ? PerplexityModel.SONAR_PRO : PerplexityModel.SONAR_MEDIUM;
  
  // Use the Perplexity API to extract RFQ information
  const extractionResult = await perplexityApi.extractRfqInformation(text, model);
  
  // Map the API response to our ExtractedRfqData format
  const result: ExtractedRfqData = {
    product: extractionResult.product,
    quantity: extractionResult.quantity,
    deadline: extractionResult.deadline,
    specifications: extractionResult.specifications || [],
    confidence: extractionResult.confidence / 100 // Convert 0-100 to 0-1 scale
  };
  
  // Also run a text complexity analysis to enhance our confidence calculation
  try {
    const complexityAnalysis = await perplexityApi.analyzeTextComplexity(text, model);
    
    // Adjust confidence based on text complexity (lower for very complex text)
    if (complexityAnalysis.complexity === 'very complex') {
      result.confidence = Math.max(0.5, result.confidence * 0.9);
    }
    
    console.log(`Perplexity AI analysis - Complexity: ${complexityAnalysis.complexity}, Score: ${complexityAnalysis.score}`);
  } catch (error) {
    console.error('Error analyzing text complexity:', error);
    // Continue with extraction result even if complexity analysis fails
  }
  
  return result;
}

// Language-specific extraction functions

function extractEnglish(text: string): PartialRfqData {
  // Extract quantity
  const quantityMatch = text.match(/(\d+)\s*(pcs|pieces|units|kilos|kg|grams|g|items?|laptops?|computers?|monitors?)/i);
  const quantity = quantityMatch ? quantityMatch[1] : undefined;
  
  // Extract product
  const productMatch = text.match(/(?:need|want|looking for|require)(?:\s+\w+){0,3}\s+(?:\d+\s+)?([a-zA-Z\s]+)(?:\.|$)/i);
  let product = productMatch ? productMatch[1].trim() : undefined;
  
  // If product wasn't found with the first pattern, try another
  if (!product) {
    const altProductMatch = text.match(/(\d+)\s+([\w\s]+?)(?:\s+(?:for|by|with|and|or|in|to|from|at|as)\b|$)/i);
    product = altProductMatch ? altProductMatch[2].trim() : undefined;
  }
  
  // Extract deadline if present
  const deadlineMatch = text.match(/by\s+(tomorrow|next week|next month|\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}(?:st|nd|rd|th)?)/i);
  const deadline = deadlineMatch ? deadlineMatch[1] : undefined;
  
  return { product, quantity, deadline };
}

function extractHindi(text: string): PartialRfqData {
  // Extract quantity (Hindi numbers and English numbers)
  const quantityMatch = text.match(/(\d+|एक|दो|तीन|चार|पांच|छह|सात|आठ|नौ|दस)\s*(किलो|किग्रा|ग्राम|नग|पीस)/i);
  
  let quantity;
  if (quantityMatch) {
    // Convert Hindi number words to digits if needed
    const hindiNumbers: Record<string, string> = {
      'एक': '1', 'दो': '2', 'तीन': '3', 'चार': '4', 'पांच': '5',
      'छह': '6', 'सात': '7', 'आठ': '8', 'नौ': '9', 'दस': '10'
    };
    
    quantity = hindiNumbers[quantityMatch[1]] || quantityMatch[1];
  }
  
  // Extract product
  const productMatch = text.match(/(चीनी|लैपटॉप|कंप्यूटर|मॉनिटर|कीबोर्ड|माउस|फोन)/i);
  const product = productMatch ? productMatch[1] : undefined;
  
  return { product, quantity };
}

function extractFrench(text: string): PartialRfqData {
  // Extract quantity
  const quantityMatch = text.match(/(\d+)\s*(pièces|unités|kilos|kg|grammes|g|clavier|claviers)/i);
  const quantity = quantityMatch ? quantityMatch[1] : undefined;
  
  // Extract product
  const productMatch = text.match(/(?:besoin de|veux|recherche|nécessite)(?:\s+\w+){0,3}\s+(?:\d+\s+)?([a-zA-Z\s]+)(?:\.|$)/i);
  const product = productMatch ? productMatch[1].trim() : undefined;
  
  return { product, quantity };
}

function extractSpanish(text: string): PartialRfqData {
  // Extract quantity
  const quantityMatch = text.match(/(\d+)\s*(piezas|unidades|kilos|kg|gramos|g|artículos|monitores)/i);
  const quantity = quantityMatch ? quantityMatch[1] : undefined;
  
  // Extract product
  const productMatch = text.match(/(?:necesito|quiero|busco|requiero)(?:\s+\w+){0,3}\s+(?:\d+\s+)?([a-zA-Z\s]+)(?:\.|$)/i);
  const product = productMatch ? productMatch[1].trim() : undefined;
  
  return { product, quantity };
}

function extractChinese(text: string): PartialRfqData {
  // Extract quantity (Chinese numbers and English numbers)
  const quantityMatch = text.match(/(\d+|一|二|三|四|五|六|七|八|九|十)\s*(个|件|千克|公斤|克)/i);
  
  let quantity;
  if (quantityMatch) {
    // Convert Chinese number words to digits if needed
    const chineseNumbers: Record<string, string> = {
      '一': '1', '二': '2', '三': '3', '四': '4', '五': '5',
      '六': '6', '七': '7', '八': '8', '九': '9', '十': '10'
    };
    
    quantity = chineseNumbers[quantityMatch[1]] || quantityMatch[1];
  }
  
  // Extract product
  const productMatch = text.match(/(鼠标|键盘|显示器|笔记本电脑|电脑)/i);
  const product = productMatch ? productMatch[1] : undefined;
  
  return { product, quantity };
}

/**
 * Create a new RFQ from voice/text input
 * POST /api/voice-rfq
 */
router.post('/', async (req, res) => {
  try {
    const { description, language = 'en-US' } = req.body;
    
    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }
    
    // Extract RFQ details from the text
    const extractedData = await extractRfqDetails(description, language);
    
    // Check if we were able to extract the necessary information
    if (!extractedData.product || !extractedData.quantity) {
      return res.status(422).json({ 
        error: 'Could not extract product and quantity from the description',
        confidence: extractedData.confidence,
        extracted: extractedData
      });
    }
    
    // In a real implementation, we would save this to the database
    // For now, we'll just return the extracted data
    const rfq = {
      id: `RFQ-${Date.now()}`,
      description,
      product: extractedData.product,
      quantity: extractedData.quantity,
      deadline: extractedData.deadline,
      specifications: extractedData.specifications,
      language,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
    
    // Get text statistics for monitoring
    const textStats = getTokenStats(description);
    
    // If we have a Perplexity API key, also analyze text complexity
    if (process.env.PERPLEXITY_API_KEY) {
      try {
        const complexityAnalysis = await perplexityApi.analyzeTextComplexity(description);
        
        // Add complexity data to the response
        return res.status(200).json({
          status: 'created',
          message: 'RFQ created successfully',
          rfq,
          confidence: extractedData.confidence,
          textStats,
          complexityAnalysis
        });
      } catch (error) {
        console.error('Error analyzing text complexity:', error);
        // Continue with regular response if complexity analysis fails
      }
    }
    
    return res.status(200).json({
      status: 'created',
      message: 'RFQ created successfully',
      rfq,
      confidence: extractedData.confidence,
      textStats
    });
  } catch (error) {
    console.error('Error creating voice RFQ:', error);
    return res.status(500).json({ error: 'Failed to process RFQ' });
  }
});

/**
 * Get RFQ details by ID (for authenticated users)
 * GET /api/voice-rfq/:id
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    // In a real implementation, we would fetch this from the database
    // For now, we'll return a mock response
    if (id.startsWith('RFQ-')) {
      return res.status(200).json({
        id,
        description: "Sample RFQ description",
        product: "Sample product",
        quantity: "10",
        status: "pending",
        createdAt: new Date().toISOString()
      });
    } else {
      return res.status(404).json({ error: 'RFQ not found' });
    }
  } catch (error) {
    console.error('Error fetching RFQ:', error);
    return res.status(500).json({ error: 'Failed to fetch RFQ' });
  }
});

export default router;
