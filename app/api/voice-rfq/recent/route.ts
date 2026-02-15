import { NextRequest, NextResponse } from 'next/server';

// Get recent voice-generated RFQs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    // Mock data for recent voice RFQs
    // In a real implementation, this would fetch from database
    const recentRFQs = [
      {
        id: 'voice-rfq-1',
        title: 'Cotton T-shirts for Retail',
        description: 'Voice-generated RFQ: I need 1000 cotton t-shirts for my retail store. Textile and apparel product specifications.',
        category: 'textiles',
        quantity: '1000 units',
        specifications: ['High quality standards required', 'Color specifications', 'Size requirements'],
        timeline: '2 weeks',
        budget: 'Budget to be discussed',
        status: 'active',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        createdVia: 'voice'
      },
      {
        id: 'voice-rfq-2',
        title: 'Steel Pipes - Construction Materials',
        description: 'Voice-generated RFQ: Looking for steel pipes for construction project. Construction materials and building supplies.',
        category: 'construction',
        quantity: '500 meters',
        specifications: ['Grade specifications', 'Size requirements', 'Durability standards'],
        timeline: '1 month',
        budget: '₹2,50,000',
        status: 'quoted',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        createdVia: 'voice'
      },
      {
        id: 'voice-rfq-3',
        title: 'Pharmaceutical Packaging - Chemical Products',
        description: 'Voice-generated RFQ: Need pharmaceutical packaging materials. Chemical and pharmaceutical product needs.',
        category: 'chemicals',
        quantity: '200 boxes',
        specifications: ['Purity levels', 'Safety standards', 'Packaging requirements'],
        timeline: '1 week',
        budget: '₹75,000',
        status: 'completed',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        createdVia: 'voice'
      },
      {
        id: 'voice-rfq-4',
        title: 'CNC Machines - Machinery Equipment',
        description: 'Voice-generated RFQ: Require CNC machines for manufacturing. Machinery and equipment specifications.',
        category: 'machinery',
        quantity: '2 units',
        specifications: ['Technical specifications', 'Performance requirements', 'Maintenance support'],
        timeline: '2 months',
        budget: '₹15,00,000',
        status: 'active',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        createdVia: 'voice'
      },
      {
        id: 'voice-rfq-5',
        title: 'Electronic Components - Electronic Devices',
        description: 'Voice-generated RFQ: Need electronic components for IoT project. Electronic components and technology solutions.',
        category: 'electronics',
        quantity: '500 pieces',
        specifications: ['Technical specifications', 'Compatibility requirements', 'Warranty terms'],
        timeline: '2 weeks',
        budget: '₹1,25,000',
        status: 'quoted',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
        createdVia: 'voice'
      }
    ];

    // Sort by creation date (newest first)
    const sortedRFQs = recentRFQs
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);

    return NextResponse.json({
      success: true,
      rfqs: sortedRFQs,
      total: recentRFQs.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching recent voice RFQs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch recent RFQs' },
      { status: 500 }
    );
  }
}
