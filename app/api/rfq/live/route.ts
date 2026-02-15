import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Mock data for live RFQs (replace with actual database queries)
const mockLiveRFQs = [
  {
    id: 'rfq_001',
    title: 'Steel Pipes for Construction Project',
    description: 'Need 1000 units of 6-inch steel pipes for construction project in Mumbai',
    category: 'Steel & Metals',
    budget: 2500000,
    currency: 'INR',
    urgency: 'HIGH',
    status: 'OPEN',
    type: 'text',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    buyer: {
      name: 'ABC Construction Ltd',
      location: 'Mumbai, Maharashtra'
    },
    quotes: 8,
    views: 45
  },
  {
    id: 'rfq_002',
    title: 'Cotton Fabric for Garment Manufacturing',
    description: 'Looking for premium cotton fabric for summer collection',
    category: 'Textiles',
    budget: 500000,
    currency: 'INR',
    urgency: 'MEDIUM',
    status: 'OPEN',
    type: 'video',
    videoUrl: '/videos/rfq-video-1.mp4',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    buyer: {
      name: 'Fashion Forward Pvt Ltd',
      location: 'Delhi, NCR'
    },
    quotes: 12,
    views: 78
  },
  {
    id: 'rfq_003',
    title: 'Electronics Components for Mobile Manufacturing',
    description: 'Need semiconductor chips and display components',
    category: 'Electronics',
    budget: 1500000,
    currency: 'INR',
    urgency: 'URGENT',
    status: 'OPEN',
    type: 'voice',
    audioUrl: '/audio/rfq-voice-1.mp3',
    transcript: 'We need high-quality semiconductor chips for our mobile manufacturing unit...',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    buyer: {
      name: 'TechCorp India',
      location: 'Bangalore, Karnataka'
    },
    quotes: 15,
    views: 92
  },
  {
    id: 'rfq_004',
    title: 'Machinery Parts for Industrial Equipment',
    description: 'Require precision machinery parts for heavy equipment maintenance',
    category: 'Machinery',
    budget: 800000,
    currency: 'INR',
    urgency: 'MEDIUM',
    status: 'OPEN',
    type: 'text',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    buyer: {
      name: 'Industrial Solutions Inc',
      location: 'Pune, Maharashtra'
    },
    quotes: 6,
    views: 34
  },
  {
    id: 'rfq_005',
    title: 'Chemical Raw Materials for Pharmaceutical',
    description: 'Need pharmaceutical-grade chemical raw materials',
    category: 'Chemicals',
    budget: 1200000,
    currency: 'INR',
    urgency: 'HIGH',
    status: 'OPEN',
    type: 'video',
    videoUrl: '/videos/rfq-video-2.mp4',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    buyer: {
      name: 'PharmaCorp Ltd',
      location: 'Hyderabad, Telangana'
    },
    quotes: 9,
    views: 56
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5');
    const type = searchParams.get('type'); // 'all', 'text', 'video', 'voice'

    let filteredRFQs = mockLiveRFQs;

    // Filter by type if specified
    if (type && type !== 'all') {
      filteredRFQs = mockLiveRFQs.filter(rfq => rfq.type === type);
    }

    // Limit results
    const limitedRFQs = filteredRFQs.slice(0, limit);

    // Add real-time updates (simulate live data)
    const liveRFQs = limitedRFQs.map(rfq => ({
      ...rfq,
      timeAgo: getTimeAgo(rfq.createdAt),
      isLive: true,
      lastUpdated: new Date().toISOString()
    }));

    return NextResponse.json({
      success: true,
      data: liveRFQs,
      total: mockLiveRFQs.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching live RFQs:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch live RFQs',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 60) {
    return `${diffInMinutes} minutes ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hours ago`;
  } else {
    return `${diffInDays} days ago`;
  }
}
