/**
 * AI Search Visibility snapshot — manual research (ChatGPT/Gemini SERP-style checks).
 * Update quarterly or after publishing answer-ready content.
 * No paid Ubersuggest API — static cockpit data.
 */

export type AiPlatform = 'chatgpt' | 'gemini' | 'google_search';
export type PromptIntent = 'informational' | 'navigational' | 'commercial' | 'transactional';

export interface AiVisibilityBrand {
  id: string;
  name: string;
  isYou?: boolean;
  isTracked?: boolean;
  avgRank: number | null;
  mentions: number;
  visibilityPct: number;
  shareOfVoicePct: number;
  sentiment: 'positive' | 'neutral' | 'negative' | null;
}

export interface AiVisibilityTopic {
  id: string;
  topic: string;
  brands: { name: string; visibilityPct: number }[];
}

export interface AiVisibilityPrompt {
  id: string;
  prompt: string;
  intent: PromptIntent;
  yourAvgRank: number | null;
  sentiment: 'positive' | 'neutral' | 'negative' | null;
  platforms: AiPlatform[];
}

export const AI_VISIBILITY_META = {
  brand: 'VyaparSethu',
  lastUpdated: '2026-06-22T00:00:00.000Z',
  nextUpdateCycleDays: 30,
  summary:
    "VyaparSethu's brand visibility is critically low at 0.0% with no change over 4 days, while top competitor IndiaMART leads at 33.3%, showing a significant -33.3% gap. With zero AI mentions and no sentiment data, the brand is invisible on OpenAI platforms despite relevant topics like B2B suppliers and blockchain escrow. Develop targeted, answer-ready content addressing key informational prompts to boost AI presence.",
};

export const AI_VISIBILITY_OVERVIEW = {
  brandVisibilityPct: 0,
  shareOfVoicePct: 0,
  sentiment: null as string | null,
  competitorGapPct: -33.3,
  topCompetitor: 'IndiaMART',
  topCompetitorVisibilityPct: 33.3,
  promptsTracked: 9,
  brandsTracked: 21,
  topicsTracked: 5,
};

export const AI_VISIBILITY_BRANDS: AiVisibilityBrand[] = [
  { id: 'indiamart', name: 'IndiaMART', isTracked: true, avgRank: 1.33, mentions: 3, visibilityPct: 33, shareOfVoicePct: 12.5, sentiment: 'positive' },
  { id: 'viatrademart', name: 'ViaTradeMart', avgRank: 2, mentions: 2, visibilityPct: 22, shareOfVoicePct: 8.33, sentiment: 'positive' },
  { id: 'tradeindia', name: 'TradeIndia', isTracked: true, avgRank: 2.5, mentions: 2, visibilityPct: 22, shareOfVoicePct: 8.33, sentiment: 'positive' },
  { id: 'romegamart', name: 'Romegamart', avgRank: 4, mentions: 1, visibilityPct: 11, shareOfVoicePct: 4.17, sentiment: 'positive' },
  { id: 'exportersindia', name: 'ExportersIndia', avgRank: 5, mentions: 1, visibilityPct: 11, shareOfVoicePct: 4.17, sentiment: 'positive' },
  { id: 'justdial', name: 'JustDial', avgRank: 6, mentions: 1, visibilityPct: 11, shareOfVoicePct: 4.17, sentiment: 'positive' },
  { id: 'fieo', name: 'FIEO Member Directory', avgRank: 7, mentions: 1, visibilityPct: 11, shareOfVoicePct: 4.17, sentiment: 'positive' },
  { id: 'udaan', name: 'Udaan', avgRank: 4, mentions: 1, visibilityPct: 11, shareOfVoicePct: 4.17, sentiment: 'positive' },
  { id: 'amazon-biz', name: 'Amazon Business India', avgRank: 5, mentions: 1, visibilityPct: 11, shareOfVoicePct: 4.17, sentiment: 'positive' },
  { id: 'vyaparsethu', name: 'VyaparSethu', isYou: true, isTracked: true, avgRank: null, mentions: 0, visibilityPct: 0, shareOfVoicePct: 0, sentiment: null },
];

export const AI_VISIBILITY_TOPICS: AiVisibilityTopic[] = [
  {
    id: 'verified-suppliers',
    topic: 'how to find verified b2b suppliers in india',
    brands: [
      { name: 'IndiaMART', visibilityPct: 60 },
      { name: 'ViaTradeMart', visibilityPct: 40 },
      { name: 'TradeIndia', visibilityPct: 40 },
      { name: 'Romegamart', visibilityPct: 20 },
      { name: 'ExportersIndia', visibilityPct: 20 },
      { name: 'JustDial', visibilityPct: 20 },
      { name: 'FIEO Member Directory', visibilityPct: 20 },
      { name: 'Udaan', visibilityPct: 20 },
      { name: 'Amazon Business India', visibilityPct: 20 },
      { name: 'Flipkart Wholesale', visibilityPct: 20 },
      { name: 'Global Trade Plaza', visibilityPct: 20 },
    ],
  },
  {
    id: 'regional-languages',
    topic: 'b2b procurement in regional indian languages',
    brands: [
      { name: 'Amazon India', visibilityPct: 100 },
      { name: 'Flipkart', visibilityPct: 100 },
      { name: 'Meesho', visibilityPct: 100 },
      { name: 'Zuvy Store', visibilityPct: 100 },
      { name: 'Sarvam AI', visibilityPct: 100 },
    ],
  },
  {
    id: 'voice-rfq',
    topic: 'posting rfq via voice for small businesses',
    brands: [
      { name: 'Google Assistant', visibilityPct: 100 },
      { name: 'Siri', visibilityPct: 100 },
      { name: 'Windows Dictation', visibilityPct: 100 },
      { name: 'MSMEmart', visibilityPct: 100 },
    ],
  },
  {
    id: 'blockchain-escrow',
    topic: 'blockchain escrow for safe business payments',
    brands: [],
  },
  {
    id: 'msme-procurement',
    topic: 'how msmes can reduce procurement costs',
    brands: [],
  },
];

export const AI_VISIBILITY_PROMPTS: AiVisibilityPrompt[] = [
  { id: 'p1', prompt: 'What are the best platforms to find verified B2B suppliers in India for my business?', intent: 'informational', yourAvgRank: null, sentiment: 'positive', platforms: ['chatgpt', 'gemini'] },
  { id: 'p2', prompt: 'How can I check the credibility and authenticity of a B2B supplier in India before placing a bulk order?', intent: 'informational', yourAvgRank: null, sentiment: 'positive', platforms: ['chatgpt'] },
  { id: 'p3', prompt: 'What documents should I ask a B2B supplier in India to verify their legitimacy?', intent: 'informational', yourAvgRank: null, sentiment: null, platforms: ['chatgpt'] },
  { id: 'p4', prompt: 'How do I compare multiple verified B2B suppliers in India to choose the best one for my procurement needs?', intent: 'commercial', yourAvgRank: null, sentiment: 'neutral', platforms: ['chatgpt'] },
  { id: 'p5', prompt: 'What are the red flags to watch out for when sourcing from B2B suppliers in India?', intent: 'informational', yourAvgRank: null, sentiment: null, platforms: ['chatgpt'] },
  { id: 'p6', prompt: 'Which B2B procurement platforms in India support regional languages like Hindi, Tamil, or Telugu?', intent: 'informational', yourAvgRank: null, sentiment: 'positive', platforms: ['chatgpt', 'gemini'] },
  { id: 'p7', prompt: 'How does blockchain escrow work for securing B2B payments between businesses in India?', intent: 'informational', yourAvgRank: null, sentiment: null, platforms: ['chatgpt'] },
  { id: 'p8', prompt: 'What are the most effective strategies for MSMEs in India to reduce their procurement costs?', intent: 'informational', yourAvgRank: null, sentiment: null, platforms: ['chatgpt'] },
  { id: 'p9', prompt: 'How can small business owners in India post a Request for Quotation using voice commands?', intent: 'transactional', yourAvgRank: null, sentiment: 'neutral', platforms: ['chatgpt', 'gemini'] },
];

export const AI_PROMPT_INTENT_BREAKDOWN = {
  informational: 64,
  navigational: 14,
  commercial: 14,
  transactional: 7,
};

export const AI_CONTENT_ACTIONS = [
  { topic: 'Verified B2B suppliers', page: '/how-verification-works', action: 'Add FAQ schema + llms.txt mention' },
  { topic: 'Voice RFQ', page: '/voice-rfq', action: 'Publish how-to guide linking voice RFQ — target AI prompt #9' },
  { topic: 'Protected payments', page: '/how-payment-works', action: 'Explain escrow/blockchain in plain language for AI citations' },
  { topic: 'B2B portal comparison', page: '/how-it-works', action: 'Comparison table — IndiaMART vs VyaparSethu' },
  { topic: 'Regional languages', page: '/blog', action: 'Hindi/Tamil procurement guides (future)' },
];
