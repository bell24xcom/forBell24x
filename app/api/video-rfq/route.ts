import { NextRequest, NextResponse } from 'next/server';
import { aiClient } from '@/lib/ai-client';

// Helper function to extract numeric budget from string
function extractBudgetNumber(budgetStr: string): number {
  if (!budgetStr || budgetStr === 'To be discussed' || budgetStr === 'Not specified') {
    return 0;
  }
  const numMatch = budgetStr.match(/[\d,]+/);
  if (numMatch) {
    return parseInt(numMatch[0].replace(/,/g, ''));
  }
  return 0;
}

// Real AI-powered video RFQ processing via NVIDIA MiniMax M2.1
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const videoFile = formData.get('video') as File | null;
    const additionalContext = formData.get('context') as string || '';

    if (!videoFile) {
      return NextResponse.json(
        { success: false, error: 'Video file is required' },
        { status: 400 }
      );
    }

    // Convert video file to buffer
    const videoBytes = await videoFile.arrayBuffer();
    const videoBuffer = Buffer.from(videoBytes);

    // Try NVIDIA MiniMax AI first, fall back to basic analysis
    let processedRFQ;
    try {
      processedRFQ = await processVideoWithNvidiaAI(videoBuffer, videoFile.type, additionalContext);
    } catch (aiError) {
      console.warn('NVIDIA AI unavailable, using basic analysis fallback:', aiError);
      processedRFQ = processVideoWithBasicAnalysis(videoFile.name, additionalContext);
    }

    return NextResponse.json({
      success: true,
      transcription: processedRFQ.description,
      extractedInfo: {
        title: processedRFQ.title,
        description: processedRFQ.description,
        category: processedRFQ.category,
        subcategory: processedRFQ.category,
        quantity: parseInt(processedRFQ.quantity) || 0,
        unit: processedRFQ.unit,
        budget: extractBudgetNumber(processedRFQ.budget),
        currency: 'INR',
        location: processedRFQ.location,
        deliveryDeadline: processedRFQ.timeline,
        priority: processedRFQ.urgency,
        specifications: processedRFQ.specifications,
        requirements: processedRFQ.visualFeatures || [],
        aiPowered: processedRFQ.aiPowered,
        aiModel: processedRFQ.aiModel
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error processing video RFQ:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process video input' },
      { status: 500 }
    );
  }
}

// NVIDIA MiniMax M2.1 - real video AI analysis
async function processVideoWithNvidiaAI(videoBuffer: Buffer, mimeType: string, context: string) {
  const client = aiClient.getClient('video'); // MiniMax M2.1

  if (!client) throw new Error('NVIDIA video client not available');

  const base64Video = videoBuffer.toString('base64');

  const systemPrompt = `You are an expert B2B procurement analyst for Bell24h.com, an Indian B2B marketplace.
Analyze the industrial/commercial product video and extract a structured RFQ. Always respond with valid JSON only.

Return this exact JSON structure:
{
  "title": "product/service name from video (concise, 5-10 words)",
  "description": "detailed description of product shown in video",
  "category": "one of: Agriculture, Apparel & Fashion, Automobile, Chemical, Electronics & Electrical, Food Products & Beverage, Industrial Machinery, Packaging & Paper, Real Estate & Construction, Textiles, Tools & Equipment, Health & Beauty, Logistics, Other",
  "quantity": "estimated quantity if visible (e.g. 100 pieces, 10 tons) or 'To be discussed'",
  "unit": "pieces/kg/tons/meters/liters/boxes",
  "budget": "estimated budget range or 'To be discussed'",
  "timeline": "estimated delivery timeline (e.g. 2 weeks, 1 month, urgent)",
  "specifications": ["visible spec1", "visible spec2", "visible spec3"],
  "visualFeatures": ["feature1 from video", "feature2 from video"],
  "location": "if mentioned in video, else 'Not specified'",
  "urgency": "low/medium/high"
}`;

  const userPrompt = context
    ? `Analyze this product video and extract RFQ details. Additional context: ${context}`
    : 'Analyze this product video and extract RFQ details for the B2B marketplace.';

  const response = await (client as any).chat.completions.create({
    model: 'minimaxai/minimax-m2.1',
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: [
          {
            type: 'video',
            source: {
              type: 'base64',
              media_type: mimeType || 'video/mp4',
              data: base64Video
            }
          },
          {
            type: 'text',
            text: userPrompt
          }
        ]
      }
    ],
    temperature: 0.4,
    max_tokens: 1200,
  });

  const content = response.choices[0]?.message?.content || '';

  // Parse JSON from response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON in AI response');

  const extracted = JSON.parse(jsonMatch[0]);

  return {
    id: `video-rfq-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: extracted.title || 'Video RFQ',
    description: extracted.description || 'Product shown in uploaded video',
    category: extracted.category || 'Other',
    quantity: extracted.quantity || 'To be discussed',
    unit: extracted.unit || 'units',
    budget: extracted.budget || 'To be discussed',
    timeline: extracted.timeline || '2 weeks',
    specifications: extracted.specifications || [],
    visualFeatures: extracted.visualFeatures || [],
    location: extracted.location || 'Not specified',
    urgency: extracted.urgency || 'medium',
    status: 'draft' as const,
    createdAt: new Date().toISOString(),
    createdVia: 'video' as const,
    aiPowered: true,
    aiModel: 'NVIDIA MiniMax M2.1'
  };
}

// Basic analysis fallback (no AI dependency)
function processVideoWithBasicAnalysis(filename: string, context: string) {
  const contextLower = context.toLowerCase();

  const categoryKeywords: Record<string, string[]> = {
    'Industrial Machinery': ['machine', 'machinery', 'equipment', 'industrial', 'manufacturing', 'cnc', 'lathe'],
    'Textiles': ['cotton', 'fabric', 'textile', 'clothing', 'garment', 'apparel', 'yarn'],
    'Electronics & Electrical': ['electronic', 'circuit', 'led', 'sensor', 'component', 'device', 'electrical'],
    'Real Estate & Construction': ['construction', 'building', 'cement', 'brick', 'tile', 'infrastructure'],
    'Chemical': ['chemical', 'pharmaceutical', 'medicine', 'compound', 'solvent'],
    'Packaging & Paper': ['packaging', 'box', 'label', 'container', 'wrapper', 'corrugated'],
    'Automobile': ['automotive', 'car', 'vehicle', 'engine', 'brake', 'auto'],
    'Agriculture': ['seeds', 'fertilizer', 'pesticide', 'crop', 'agri', 'farm'],
    'Food Products & Beverage': ['food', 'beverage', 'snack', 'spice', 'grain'],
  };

  let category = 'Other';
  for (const [cat, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(kw => contextLower.includes(kw) || filename.toLowerCase().includes(kw))) {
      category = cat;
      break;
    }
  }

  const title = context
    ? context.split(' ').slice(0, 6).join(' ')
    : filename.replace(/\.(mp4|mov|avi|webm)$/i, '');

  return {
    id: `video-rfq-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: title || 'Video RFQ',
    description: `Product shown in video: ${filename}${context ? `. Context: ${context}` : ''}`,
    category,
    quantity: 'To be discussed',
    unit: 'units',
    budget: 'To be discussed',
    timeline: '2 weeks',
    specifications: ['Details extracted from video'],
    visualFeatures: ['Upload successful - awaiting AI analysis'],
    location: 'Not specified',
    urgency: 'medium',
    status: 'draft' as const,
    createdAt: new Date().toISOString(),
    createdVia: 'video' as const,
    aiPowered: false,
    aiModel: 'basic-fallback'
  };
}
