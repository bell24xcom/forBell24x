import { NextRequest, NextResponse } from 'next/server';
import { aiClient } from '@/lib/ai-client';

// Real AI-powered voice RFQ processing via NVIDIA DeepSeek V3.2
export async function POST(request: NextRequest) {
  try {
    const { voiceText } = await request.json();

    if (!voiceText || voiceText.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Voice text is required' },
        { status: 400 }
      );
    }

    // Try NVIDIA DeepSeek AI first, fall back to keyword extraction
    let processedRFQ;
    try {
      processedRFQ = await processVoiceWithNvidiaAI(voiceText);
    } catch (aiError) {
      console.warn('NVIDIA AI unavailable, using keyword extraction fallback:', aiError);
      processedRFQ = processVoiceWithKeywords(voiceText);
    }

    return NextResponse.json({
      success: true,
      rfq: processedRFQ,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error processing voice RFQ:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process voice input' },
      { status: 500 }
    );
  }
}

// NVIDIA DeepSeek V3.2 - real AI extraction
async function processVoiceWithNvidiaAI(voiceText: string) {
  const client = aiClient.getClient('text'); // DeepSeek V3.2

  if (!client) throw new Error('NVIDIA AI client not available');

  const systemPrompt = `You are an expert B2B procurement assistant for Bell24h.com, an Indian B2B marketplace.
Extract a structured RFQ from the user's voice input. Always respond with valid JSON only, no other text.

Return this exact JSON structure:
{
  "title": "product/service name (concise, 5-10 words)",
  "description": "detailed description of what is needed",
  "category": "one of: Agriculture, Apparel & Fashion, Automobile, Chemical, Electronics & Electrical, Food Products & Beverage, Industrial Machinery, Packaging & Paper, Real Estate & Construction, Textiles, Tools & Equipment, Health & Beauty, Logistics, Other",
  "quantity": "e.g. 500 pieces, 10 tons, 1000 units",
  "unit": "pieces/kg/tons/meters/liters/boxes",
  "budget": "e.g. ₹50,000 or 'Not specified'",
  "timeline": "e.g. 2 weeks, 1 month, urgent",
  "specifications": ["spec1", "spec2", "spec3"],
  "location": "delivery city/state or 'Not specified'",
  "urgency": "low/medium/high"
}`;

  const response = await (client as any).chat.completions.create({
    model: 'deepseek-ai/deepseek-v3-0324',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Extract RFQ from this voice input: "${voiceText}"` }
    ],
    temperature: 0.3,
    max_tokens: 800,
  });

  const content = response.choices[0]?.message?.content || '';

  // Parse JSON from response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON in AI response');

  const extracted = JSON.parse(jsonMatch[0]);

  return {
    id: `voice-rfq-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: extracted.title || 'Voice RFQ',
    description: extracted.description || voiceText,
    category: extracted.category || 'Other',
    quantity: extracted.quantity || 'Not specified',
    unit: extracted.unit || 'units',
    budget: extracted.budget || 'To be discussed',
    timeline: extracted.timeline || '2 weeks',
    specifications: extracted.specifications || [],
    location: extracted.location || 'Not specified',
    urgency: extracted.urgency || 'medium',
    status: 'draft' as const,
    createdAt: new Date().toISOString(),
    createdVia: 'voice' as const,
    aiPowered: true,
    aiModel: 'NVIDIA DeepSeek V3.2'
  };
}

// Keyword-based fallback (no AI dependency)
function processVoiceWithKeywords(voiceText: string) {
  const text = voiceText.toLowerCase();

  const categoryKeywords: Record<string, string[]> = {
    'Industrial Machinery': ['steel', 'metal', 'machinery', 'equipment', 'industrial', 'manufacturing', 'cnc', 'machine'],
    'Textiles': ['cotton', 'fabric', 'textile', 'clothing', 'garment', 'apparel', 't-shirt', 'shirt', 'yarn'],
    'Electronics & Electrical': ['electronic', 'circuit', 'led', 'sensor', 'component', 'device', 'technology', 'electrical', 'wire'],
    'Real Estate & Construction': ['construction', 'building', 'cement', 'brick', 'tile', 'infrastructure', 'sand', 'concrete'],
    'Chemical': ['chemical', 'pharmaceutical', 'medicine', 'drug', 'compound', 'solvent', 'acid', 'polymer'],
    'Packaging & Paper': ['packaging', 'box', 'label', 'container', 'wrapper', 'corrugated', 'carton', 'paper'],
    'Automobile': ['automotive', 'car', 'vehicle', 'engine', 'brake', 'auto part', 'tyre'],
    'Agriculture': ['seeds', 'fertilizer', 'pesticide', 'crop', 'agri', 'farm', 'grain'],
    'Food Products & Beverage': ['food', 'beverage', 'snack', 'spice', 'grain', 'rice', 'wheat', 'sugar'],
  };

  let category = 'Other';
  for (const [cat, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(kw => text.includes(kw))) { category = cat; break; }
  }

  const quantityMatch = text.match(/(\d+)\s*(?:pieces?|units?|kg|tons?|meters?|feet?|boxes?|packages?|liters?)/i);
  const budgetMatch = text.match(/(?:budget|price|cost|₹|rs\.?)\s*(\d+(?:,\d+)*)/i);
  const timelineMap: Record<string, string[]> = {
    'urgent': ['urgent', 'asap', 'immediately', 'today'],
    '1 week': ['week', '7 days'],
    '1 month': ['month', '30 days'],
  };

  let timeline = '2 weeks';
  for (const [t, kws] of Object.entries(timelineMap)) {
    if (kws.some(kw => text.includes(kw))) { timeline = t; break; }
  }

  const words = voiceText.split(' ').filter(w => w.length > 4 &&
    !['need', 'want', 'require', 'looking', 'please', 'provide'].includes(w.toLowerCase()));

  return {
    id: `voice-rfq-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: words.slice(0, 5).join(' ') || 'Voice RFQ',
    description: `Voice RFQ: ${voiceText}`,
    category,
    quantity: quantityMatch ? quantityMatch[0] : 'Not specified',
    unit: 'units',
    budget: budgetMatch ? `₹${budgetMatch[1]}` : 'To be discussed',
    timeline,
    specifications: [],
    location: 'Not specified',
    urgency: timeline === 'urgent' ? 'high' : 'medium',
    status: 'draft' as const,
    createdAt: new Date().toISOString(),
    createdVia: 'voice' as const,
    aiPowered: false,
    aiModel: 'keyword-fallback'
  };
}
