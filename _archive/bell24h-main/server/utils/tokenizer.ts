/**
 * Simple tokenizer utility for text processing
 * 
 * This utility provides functions for tokenizing text into words, sentences,
 * or subword tokens depending on the needs of the language model.
 */

// Regular expression for basic word tokenization
const WORD_REGEX = /\b\w+\b/g;

// Regular expression for sentence tokenization
const SENTENCE_REGEX = /[^.!?]+[.!?]+/g;

/**
 * Tokenize text into words
 * 
 * @param text - Input text to tokenize
 * @returns Array of word tokens
 */
export function tokenize(text: string): string[] {
  if (!text || typeof text !== 'string') {
    return [];
  }
  
  // Convert to lowercase and extract words
  const words = text.toLowerCase().match(WORD_REGEX) || [];
  return words;
}

/**
 * Tokenize text into sentences
 * 
 * @param text - Input text to tokenize
 * @returns Array of sentence tokens
 */
export function tokenizeSentences(text: string): string[] {
  if (!text || typeof text !== 'string') {
    return [];
  }
  
  // Extract sentences
  const sentences = text.match(SENTENCE_REGEX) || [];
  return sentences.map(s => s.trim());
}

/**
 * Simple implementation of BPE (Byte Pair Encoding) tokenization
 * This is a simplified version for demonstration purposes
 * 
 * @param text - Input text to tokenize
 * @param vocabSize - Size of vocabulary to use
 * @returns Array of subword tokens
 */
export function tokenizeBPE(text: string, vocabSize: number = 1000): string[] {
  if (!text || typeof text !== 'string') {
    return [];
  }
  
  // For simplicity, we'll just use character-level tokenization
  // with some common English subwords
  const commonSubwords = [
    'ing', 'ed', 'er', 'es', 'ion', 'ly', 'ment', 'ness', 'ity', 'al', 
    'the', 'and', 'that', 'have', 'for', 'not', 'with', 'this', 'but', 'from'
  ];
  
  let tokenized = text.toLowerCase();
  
  // Replace common subwords with special tokens
  commonSubwords.forEach((subword, index) => {
    tokenized = tokenized.replace(
      new RegExp(subword, 'g'), 
      `__TOKEN${index}__`
    );
  });
  
  // Split the remaining text into characters
  const chars = tokenized.split('');
  
  // Replace special tokens back with subwords
  const tokens: string[] = [];
  let currentToken = '';
  
  for (const char of chars) {
    if (currentToken.includes('__TOKEN')) {
      if (char === '_' && currentToken.endsWith('__TOKEN')) {
        currentToken += char;
      } else if (char === '_' && currentToken.includes('__TOKEN') && !currentToken.endsWith('_')) {
        const tokenIndex = parseInt(
          currentToken.replace('__TOKEN', '').replace('__', '')
        );
        tokens.push(commonSubwords[tokenIndex]);
        currentToken = char;
      } else {
        currentToken += char;
      }
    } else if (/\s/.test(char)) {
      if (currentToken) {
        tokens.push(currentToken);
        currentToken = '';
      }
    } else {
      currentToken += char;
    }
  }
  
  if (currentToken) {
    tokens.push(currentToken);
  }
  
  return tokens;
}

/**
 * Calculate token statistics for a given text
 * 
 * @param text - Input text
 * @returns Token statistics
 */
export function getTokenStats(text: string): {
  totalTokens: number;
  uniqueTokens: number;
  tokenDensity: number;
  averageTokenLength: number;
} {
  const tokens = tokenize(text);
  const uniqueTokens = new Set(tokens).size;
  
  return {
    totalTokens: tokens.length,
    uniqueTokens,
    tokenDensity: tokens.length > 0 ? uniqueTokens / tokens.length : 0,
    averageTokenLength: tokens.length > 0 
      ? tokens.reduce((sum, token) => sum + token.length, 0) / tokens.length 
      : 0
  };
}

export default {
  tokenize,
  tokenizeSentences,
  tokenizeBPE,
  getTokenStats
};
