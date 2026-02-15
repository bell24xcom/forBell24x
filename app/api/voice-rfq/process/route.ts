import { NextRequest, NextResponse } from 'next/server';

// AI-powered voice processing for RFQ generation
export async function POST(request: NextRequest) {
  try {
    const { voiceText } = await request.json();

    if (!voiceText || voiceText.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Voice text is required' },
        { status: 400 }
      );
    }

    // AI processing to extract RFQ details from voice text
    const processedRFQ = await processVoiceToRFQ(voiceText);

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

async function processVoiceToRFQ(voiceText: string) {
  // AI-powered extraction of RFQ details
  const text = voiceText.toLowerCase();
  
  // Extract category
  const category = extractCategory(text);
  
  // Extract quantity
  const quantity = extractQuantity(text);
  
  // Extract timeline
  const timeline = extractTimeline(text);
  
  // Extract budget
  const budget = extractBudget(text);
  
  // Generate title
  const title = generateTitle(text, category);
  
  // Generate description
  const description = generateDescription(text, category);
  
  // Extract specifications
  const specifications = extractSpecifications(text, category);
  
  // Generate unique ID
  const id = generateId();

  return {
    id,
    title,
    description,
    category,
    quantity,
    specifications,
    timeline,
    budget,
    status: 'draft' as const,
    createdAt: new Date().toISOString(),
    createdVia: 'voice' as const
  };
}

function extractCategory(text: string): string {
  const categoryKeywords = {
    'manufacturing': ['steel', 'metal', 'machinery', 'equipment', 'industrial', 'manufacturing'],
    'textiles': ['cotton', 'fabric', 'textile', 'clothing', 'garment', 'apparel', 't-shirt', 'shirt'],
    'electronics': ['electronic', 'circuit', 'led', 'sensor', 'component', 'device', 'technology'],
    'construction': ['construction', 'building', 'cement', 'brick', 'tile', 'infrastructure'],
    'chemicals': ['chemical', 'pharmaceutical', 'medicine', 'drug', 'compound', 'solvent'],
    'machinery': ['machine', 'cnc', 'automation', 'tool', 'equipment', 'spare part'],
    'packaging': ['packaging', 'box', 'label', 'container', 'wrapper', 'corrugated'],
    'automotive': ['automotive', 'car', 'vehicle', 'engine', 'brake', 'auto part']
  };

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return category;
    }
  }

  return 'general';
}

function extractQuantity(text: string): string {
  const quantityRegex = /(\d+)\s*(?:pieces?|units?|kg|tons?|meters?|feet?|boxes?|packages?)/gi;
  const match = text.match(quantityRegex);
  
  if (match) {
    return match[0];
  }

  // Look for numbers
  const numberRegex = /\d+/g;
  const numbers = text.match(numberRegex);
  
  if (numbers && numbers.length > 0) {
    return `${numbers[0]} units`;
  }

  return 'Quantity not specified';
}

function extractTimeline(text: string): string {
  const timelineKeywords = {
    'urgent': ['urgent', 'asap', 'immediately', 'today', 'tomorrow'],
    '1 week': ['week', '7 days', 'one week'],
    '2 weeks': ['2 weeks', 'two weeks', 'fortnight'],
    '1 month': ['month', '30 days', 'one month'],
    '2 months': ['2 months', 'two months', '60 days']
  };

  for (const [timeline, keywords] of Object.entries(timelineKeywords)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return timeline;
    }
  }

  return '2 weeks';
}

function extractBudget(text: string): string {
  const budgetRegex = /(?:budget|price|cost|₹|rs\.?)\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:lakh|cr|k|thousand|million)?/gi;
  const match = text.match(budgetRegex);
  
  if (match) {
    return `₹${match[0].replace(/[^\d]/g, '')}`;
  }

  return 'Budget to be discussed';
}

function generateTitle(text: string, category: string): string {
  const categoryTitles = {
    'manufacturing': 'Industrial Equipment & Machinery',
    'textiles': 'Textile & Apparel Products',
    'electronics': 'Electronic Components & Devices',
    'construction': 'Construction Materials & Supplies',
    'chemicals': 'Chemical & Pharmaceutical Products',
    'machinery': 'Machinery & Equipment',
    'packaging': 'Packaging Materials & Solutions',
    'automotive': 'Automotive Parts & Components',
    'general': 'General Products & Services'
  };

  const baseTitle = categoryTitles[category as keyof typeof categoryTitles] || 'General Products';
  
  // Extract key product from text
  const productKeywords = text.split(' ').filter(word => 
    word.length > 3 && 
    !['need', 'want', 'require', 'looking', 'for', 'the', 'and', 'or', 'but'].includes(word)
  );

  if (productKeywords.length > 0) {
    return `${productKeywords[0].charAt(0).toUpperCase() + productKeywords[0].slice(1)} - ${baseTitle}`;
  }

  return baseTitle;
}

function generateDescription(text: string, category: string): string {
  const categoryDescriptions = {
    'manufacturing': 'Industrial equipment and machinery requirements',
    'textiles': 'Textile and apparel product specifications',
    'electronics': 'Electronic components and technology solutions',
    'construction': 'Construction materials and building supplies',
    'chemicals': 'Chemical and pharmaceutical product needs',
    'machinery': 'Machinery and equipment specifications',
    'packaging': 'Packaging materials and solutions',
    'automotive': 'Automotive parts and components',
    'general': 'General product and service requirements'
  };

  const baseDescription = categoryDescriptions[category as keyof typeof categoryDescriptions] || 'General requirements';
  
  return `Voice-generated RFQ: ${text}. ${baseDescription}.`;
}

function extractSpecifications(text: string, category: string): string[] {
  const specifications: string[] = [];
  
  // Extract common specifications
  if (text.includes('quality')) {
    specifications.push('High quality standards required');
  }
  
  if (text.includes('certified') || text.includes('certification')) {
    specifications.push('Certified products only');
  }
  
  if (text.includes('branded') || text.includes('brand')) {
    specifications.push('Branded products preferred');
  }
  
  if (text.includes('custom') || text.includes('customized')) {
    specifications.push('Custom specifications required');
  }
  
  if (text.includes('bulk') || text.includes('wholesale')) {
    specifications.push('Bulk quantity pricing required');
  }
  
  // Category-specific specifications
  const categorySpecs = {
    'textiles': ['Color specifications', 'Size requirements', 'Fabric type'],
    'electronics': ['Technical specifications', 'Compatibility requirements', 'Warranty terms'],
    'construction': ['Grade specifications', 'Size requirements', 'Durability standards'],
    'chemicals': ['Purity levels', 'Safety standards', 'Packaging requirements'],
    'machinery': ['Technical specifications', 'Performance requirements', 'Maintenance support']
  };

  const categorySpecificSpecs = categorySpecs[category as keyof typeof categorySpecs] || [];
  specifications.push(...categorySpecificSpecs.slice(0, 2));

  return specifications.length > 0 ? specifications : ['Standard specifications'];
}

function generateId(): string {
  return `voice-rfq-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
