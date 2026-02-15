import { NextRequest, NextResponse } from 'next/server';

// Get list of RFQs with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Mock RFQ data - in real app, fetch from database
    const allRFQs = [
      {
        id: 'RFQ-001',
        title: 'Steel Pipes for Construction Project',
        category: 'manufacturing',
        description: 'High-quality steel pipes for residential construction project',
        quantity: '500',
        unit: 'meters',
        minBudget: '250000',
        maxBudget: '350000',
        timeline: '2 weeks',
        status: 'active',
        urgency: 'normal',
        createdBy: 'user-123',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        views: 45,
        quotes: 8,
        suppliers: 12,
        tags: ['steel', 'construction', 'quality'],
        location: 'Mumbai, Maharashtra',
        priority: 3,
        estimatedValue: 300000
      },
      {
        id: 'RFQ-002',
        title: 'Cotton T-shirts for Retail Store',
        category: 'textiles',
        description: 'Premium quality cotton t-shirts in various sizes and colors',
        quantity: '1000',
        unit: 'pieces',
        minBudget: '50000',
        maxBudget: '75000',
        timeline: '1 week',
        status: 'quoted',
        urgency: 'high',
        createdBy: 'user-456',
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        views: 78,
        quotes: 15,
        suppliers: 8,
        tags: ['cotton', 'textile', 'retail'],
        location: 'Delhi, NCR',
        priority: 4,
        estimatedValue: 62500
      },
      {
        id: 'RFQ-003',
        title: 'Electronic Components for IoT Device',
        category: 'electronics',
        description: 'Sensors, microcontrollers, and connectivity modules for IoT project',
        quantity: '200',
        unit: 'pieces',
        minBudget: '100000',
        maxBudget: '150000',
        timeline: '3 weeks',
        status: 'active',
        urgency: 'normal',
        createdBy: 'user-789',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        views: 32,
        quotes: 5,
        suppliers: 6,
        tags: ['electronic', 'iot', 'sensor'],
        location: 'Bangalore, Karnataka',
        priority: 3,
        estimatedValue: 125000
      },
      {
        id: 'RFQ-004',
        title: 'Pharmaceutical Packaging Materials',
        category: 'chemicals',
        description: 'FDA-approved packaging materials for pharmaceutical products',
        quantity: '500',
        unit: 'boxes',
        minBudget: '75000',
        maxBudget: '100000',
        timeline: '2 weeks',
        status: 'completed',
        urgency: 'urgent',
        createdBy: 'user-321',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        views: 56,
        quotes: 12,
        suppliers: 4,
        tags: ['pharmaceutical', 'packaging', 'fda'],
        location: 'Chennai, Tamil Nadu',
        priority: 5,
        estimatedValue: 87500
      },
      {
        id: 'RFQ-005',
        title: 'CNC Machines for Manufacturing',
        category: 'machinery',
        description: 'High-precision CNC machines for metal fabrication',
        quantity: '2',
        unit: 'units',
        minBudget: '1500000',
        maxBudget: '2000000',
        timeline: '1 month',
        status: 'active',
        urgency: 'normal',
        createdBy: 'user-654',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        views: 89,
        quotes: 6,
        suppliers: 10,
        tags: ['cnc', 'machinery', 'precision'],
        location: 'Pune, Maharashtra',
        priority: 3,
        estimatedValue: 1750000
      }
    ];

    // Apply filters
    let filteredRFQs = allRFQs;

    if (category && category !== 'all') {
      filteredRFQs = filteredRFQs.filter(rfq => rfq.category === category);
    }

    if (status && status !== 'all') {
      filteredRFQs = filteredRFQs.filter(rfq => rfq.status === status);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredRFQs = filteredRFQs.filter(rfq => 
        rfq.title.toLowerCase().includes(searchLower) ||
        rfq.description.toLowerCase().includes(searchLower) ||
        rfq.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Apply sorting
    filteredRFQs.sort((a, b) => {
      let aValue = a[sortBy as keyof typeof a];
      let bValue = b[sortBy as keyof typeof b];

      if (sortBy === 'createdAt') {
        aValue = new Date(aValue as string).getTime();
        bValue = new Date(bValue as string).getTime();
      }

      if (sortOrder === 'desc') {
        return (bValue as number) - (aValue as number);
      } else {
        return (aValue as number) - (bValue as number);
      }
    });

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedRFQs = filteredRFQs.slice(startIndex, endIndex);

    // Calculate pagination info
    const totalPages = Math.ceil(filteredRFQs.length / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      success: true,
      rfqs: paginatedRFQs,
      pagination: {
        page,
        limit,
        total: filteredRFQs.length,
        totalPages,
        hasNextPage,
        hasPrevPage
      },
      filters: {
        category,
        status,
        search,
        sortBy,
        sortOrder
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching RFQs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch RFQs' },
      { status: 500 }
    );
  }
}