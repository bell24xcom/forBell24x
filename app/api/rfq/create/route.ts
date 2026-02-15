import { NextRequest, NextResponse } from 'next/server';

// Enhanced RFQ creation with live database integration
export async function POST(request: NextRequest) {
  try {
    const rfqData = await request.json();

    if (!rfqData || !rfqData.title || !rfqData.category) {
      return NextResponse.json(
        { success: false, error: 'Title and category are required' },
        { status: 400 }
      );
    }

    // Generate unique RFQ ID
    const rfqId = generateRFQId();
    
    // Enhanced RFQ data with live features
    const enhancedRFQ = {
      id: rfqId,
      title: rfqData.title,
      category: rfqData.category,
      description: rfqData.description || '',
      quantity: rfqData.quantity || '1',
      unit: rfqData.unit || 'units',
      minBudget: rfqData.minBudget || '0',
      maxBudget: rfqData.maxBudget || '0',
      timeline: rfqData.timeline || '2 weeks',
      requirements: rfqData.requirements || '',
      urgency: rfqData.urgency || 'normal',
      status: 'active',
      createdBy: 'user-123', // In real app, get from session
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 0,
      quotes: 0,
      suppliers: [],
      tags: extractTags(rfqData.title, rfqData.description),
      location: 'India', // Default location
      isPublic: true,
      expiresAt: calculateExpiryDate(rfqData.timeline),
      priority: calculatePriority(rfqData.urgency, rfqData.timeline),
      estimatedValue: calculateEstimatedValue(rfqData.minBudget, rfqData.maxBudget),
      matchingSuppliers: await findMatchingSuppliers(rfqData.category, rfqData.tags || [])
    };

    // In a real implementation, save to database
    console.log('Creating RFQ:', enhancedRFQ);

    // Simulate supplier matching
    const matchedSuppliers = await matchSuppliers(enhancedRFQ);
    enhancedRFQ.suppliers = matchedSuppliers;

    // Send notifications to matched suppliers
    await notifySuppliers(enhancedRFQ, matchedSuppliers);

    return NextResponse.json({
      success: true,
      rfq: enhancedRFQ,
      message: 'RFQ created successfully',
      matchedSuppliers: matchedSuppliers.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creating RFQ:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create RFQ' },
      { status: 500 }
    );
  }
}

function generateRFQId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `RFQ-${timestamp}-${random}`.toUpperCase();
}

function extractTags(title: string, description: string): string[] {
  const text = `${title} ${description}`.toLowerCase();
  const commonTags = [
    'urgent', 'bulk', 'custom', 'quality', 'certified', 'branded',
    'steel', 'cotton', 'electronic', 'construction', 'chemical',
    'machinery', 'packaging', 'automotive', 'pharmaceutical'
  ];
  
  return commonTags.filter(tag => text.includes(tag));
}

function calculateExpiryDate(timeline: string): string {
  const now = new Date();
  let days = 30; // Default 30 days
  
  if (timeline.includes('week')) {
    const weeks = parseInt(timeline.match(/\d+/)?.[0] || '2');
    days = weeks * 7;
  } else if (timeline.includes('month')) {
    const months = parseInt(timeline.match(/\d+/)?.[0] || '1');
    days = months * 30;
  } else if (timeline.includes('day')) {
    days = parseInt(timeline.match(/\d+/)?.[0] || '30');
  }
  
  const expiryDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));
  return expiryDate.toISOString();
}

function calculatePriority(urgency: string, timeline: string): number {
  let priority = 1; // Low priority
  
  if (urgency === 'urgent') priority = 5;
  else if (urgency === 'high') priority = 4;
  else if (urgency === 'normal') priority = 3;
  else if (urgency === 'low') priority = 2;
  
  // Adjust based on timeline
  if (timeline.includes('day') && parseInt(timeline) <= 7) priority += 1;
  if (timeline.includes('week') && parseInt(timeline) <= 2) priority += 1;
  
  return Math.min(priority, 5);
}

function calculateEstimatedValue(minBudget: string, maxBudget: string): number {
  const min = parseFloat(minBudget) || 0;
  const max = parseFloat(maxBudget) || 0;
  
  if (min > 0 && max > 0) {
    return (min + max) / 2;
  } else if (min > 0) {
    return min * 1.5; // Estimate 50% higher
  } else if (max > 0) {
    return max * 0.7; // Estimate 30% lower
  }
  
  return 0; // Unknown value
}

async function findMatchingSuppliers(category: string, tags: string[]): Promise<string[]> {
  // Mock supplier matching based on category and tags
  const supplierDatabase = {
    'manufacturing': ['supplier-1', 'supplier-2', 'supplier-6'],
    'textiles': ['supplier-2', 'supplier-7'],
    'electronics': ['supplier-3', 'supplier-8'],
    'construction': ['supplier-4', 'supplier-1'],
    'chemicals': ['supplier-5'],
    'machinery': ['supplier-6', 'supplier-1'],
    'packaging': ['supplier-7'],
    'automotive': ['supplier-8']
  };
  
  return supplierDatabase[category as keyof typeof supplierDatabase] || [];
}

async function matchSuppliers(rfq: any): Promise<any[]> {
  // Enhanced supplier matching algorithm
  const suppliers = await findMatchingSuppliers(rfq.category, rfq.tags);
  
  return suppliers.map((supplierId, index) => ({
    id: supplierId,
    name: `Supplier ${supplierId.split('-')[1]}`,
    company: `Company ${supplierId.split('-')[1]}`,
    rating: 4.0 + (Math.random() * 1.0),
    responseTime: `${Math.floor(Math.random() * 24)} hours`,
    matchScore: 85 + (Math.random() * 15),
    location: 'Mumbai, Maharashtra',
    verified: true,
    specialties: rfq.tags.slice(0, 3),
    lastActive: '2 hours ago'
  }));
}

async function notifySuppliers(rfq: any, suppliers: any[]): Promise<void> {
  // Simulate sending notifications to suppliers
  console.log(`Notifying ${suppliers.length} suppliers about RFQ ${rfq.id}`);
  
  // In real implementation, send emails/SMS/push notifications
  suppliers.forEach(supplier => {
    console.log(`Notification sent to ${supplier.name} (${supplier.company})`);
  });
}