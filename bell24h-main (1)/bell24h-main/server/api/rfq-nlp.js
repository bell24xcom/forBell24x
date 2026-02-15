import express from 'express';

const router = express.Router();

// Mock NLP processing for RFQs
// In a real implementation, this would use actual NLP libraries or services

/**
 * Extract keywords from text
 * @param {string} text - The text to analyze
 * @returns {Array} Array of keywords
 */
const extractKeywords = (text) => {
  // Simple keyword extraction (in a real app, use proper NLP)
  const words = text.toLowerCase().split(/\W+/).filter(word => word.length > 3);
  const wordCount = {};
  
  words.forEach(word => {
    if (!wordCount[word]) {
      wordCount[word] = 0;
    }
    wordCount[word]++;
  });
  
  // Return top keywords
  return Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(entry => entry[0]);
};

/**
 * Categorize RFQ text
 * @param {string} text - The text to analyze
 * @returns {Object} Categories with confidence scores
 */
const categorizeRfq = (text) => {
  const text_lower = text.toLowerCase();
  
  // Simple category matching (in a real app, use ML models)
  const categories = {
    'Electronics': text_lower.includes('electronic') || text_lower.includes('circuit') || text_lower.includes('device') ? 0.8 : 0.1,
    'Industrial': text_lower.includes('industrial') || text_lower.includes('manufacturing') || text_lower.includes('machine') ? 0.85 : 0.15,
    'Software': text_lower.includes('software') || text_lower.includes('program') || text_lower.includes('application') ? 0.9 : 0.05,
    'Services': text_lower.includes('service') || text_lower.includes('consulting') || text_lower.includes('support') ? 0.75 : 0.2,
    'Materials': text_lower.includes('material') || text_lower.includes('raw') || text_lower.includes('supply') ? 0.7 : 0.25
  };
  
  return categories;
};

/**
 * Analyze RFQ for completeness and quality
 * @param {Object} rfq - The RFQ object to analyze
 * @returns {Object} Analysis results
 */
const analyzeRfqQuality = (rfq) => {
  const checks = {
    hasTitle: !!rfq.title,
    hasDescription: !!rfq.description && rfq.description.length > 50,
    hasBudget: !!rfq.budget && rfq.budget > 0,
    hasDeadline: !!rfq.deadline,
    hasDetailedRequirements: rfq.description && rfq.description.length > 200
  };
  
  const score = Object.values(checks).filter(Boolean).length / Object.values(checks).length;
  
  return {
    checks,
    score: score * 100,
    suggestions: getSuggestions(checks)
  };
};

/**
 * Get suggestions based on quality checks
 * @param {Object} checks - The quality checks results
 * @returns {Array} Suggestions for improvement
 */
const getSuggestions = (checks) => {
  const suggestions = [];
  
  if (!checks.hasTitle) {
    suggestions.push('Add a clear and descriptive title');
  }
  
  if (!checks.hasDescription) {
    suggestions.push('Provide a more detailed description');
  }
  
  if (!checks.hasBudget) {
    suggestions.push('Specify your budget range');
  }
  
  if (!checks.hasDeadline) {
    suggestions.push('Set a deadline for supplier responses');
  }
  
  if (!checks.hasDetailedRequirements) {
    suggestions.push('Add more detailed requirements to get better responses');
  }
  
  return suggestions;
};

// API Endpoints

// Analyze RFQ text
router.post('/analyze', (req, res) => {
  const { text } = req.body;
  
  if (!text) {
    return res.status(400).json({ message: 'Text is required' });
  }
  
  const keywords = extractKeywords(text);
  const categories = categorizeRfq(text);
  
  res.json({
    keywords,
    categories,
    wordCount: text.split(/\s+/).length,
    sentiment: 'neutral' // Placeholder for sentiment analysis
  });
});

// Check RFQ quality
router.post('/quality-check', (req, res) => {
  const rfq = req.body;
  
  if (!rfq) {
    return res.status(400).json({ message: 'RFQ data is required' });
  }
  
  const analysis = analyzeRfqQuality(rfq);
  
  res.json(analysis);
});

// Generate RFQ summary
router.post('/summarize', (req, res) => {
  const { rfq } = req.body;
  
  if (!rfq) {
    return res.status(400).json({ message: 'RFQ data is required' });
  }
  
  // Simple summary generation (in a real app, use NLP)
  const summary = `${rfq.title}. Budget: ${rfq.budget}. Deadline: ${rfq.deadline}.`;
  
  res.json({ summary });
});

export default router;
