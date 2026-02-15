// nlpService.ts
// Robust NLP analysis for RFQ text using compromise (can be swapped for spaCy API or cloud NLP)
import nlp from 'compromise';

export interface RfqNlpAnalysis {
  entities: string[];
  topics: string[];
  intent: string;
  autoTags: string[];
}

export function analyzeRfqText(text: string): RfqNlpAnalysis {
  const doc = nlp(text);
  // Extract entities (people, organizations, places, products)
  const entities = [
    ...doc.people().out('array'),
    ...doc.organizations().out('array'),
    ...doc.places().out('array'),
    ...doc.nouns().out('array')
  ];
  // Extract topics (nouns, products, categories)
  const topics = doc.topics().out('array');
  // Simple intent detection (RFQ, inquiry, feedback, complaint)
  let intent = 'inquiry';
  if (/buy|purchase|need|require|rfq|quote/i.test(text)) intent = 'rfq';
  else if (/feedback|suggest|improve|like|dislike/i.test(text)) intent = 'feedback';
  else if (/problem|issue|complain|not working|bad/i.test(text)) intent = 'complaint';
  // Auto-tags (keywords, categories)
  const autoTags = [
    ...doc.nouns().out('array'),
    ...doc.adjectives().out('array')
  ];
  return {
    entities: Array.from(new Set(entities)),
    topics: Array.from(new Set(topics)),
    intent,
    autoTags: Array.from(new Set(autoTags))
  };
}
