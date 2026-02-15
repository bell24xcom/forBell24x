import { NextRequest, NextResponse } from 'next/server';

// Mock data for RFQs
const mockRFQs = [
  {
    id: '1',
    title: 'Steel Pipes for Construction Project',
    description: 'Need 1000 steel pipes for construction project in Mumbai. Grade A quality required.',
    category: 'Steel & Metals',
    budget: 150000.00,
    quantity: 1000,
    timeline: '30 days',
    urgency: 'HIGH',
    status: 'active',
    buyerId: 'buyer_1',
    buyer: {
      id: 'buyer_1',
      name: 'Construction Corp',
      company: 'Mumbai Construction Ltd'
    },
    responses: 5,
    views: 25,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    title: 'Textile Machinery for Garment Factory',
    description: 'Looking for complete textile machinery setup for new garment factory in Delhi.',
    category: 'Machinery',
    budget: 500000.00,
    quantity: 1,
    timeline: '60 days',
    urgency: 'MEDIUM',
    status: 'active',
    buyerId: 'buyer_2',
    buyer: {
      id: 'buyer_2',
      name: 'Fashion Forward',
      company: 'Delhi Garments Pvt Ltd'
    },
    responses: 3,
    views: 18,
    createdAt: '2024-01-16T09:15:00Z',
    updatedAt: '2024-01-16T09:15:00Z'
  },
  {
    id: '3',
    title: 'Electronics Components for IoT Devices',
    description: 'Require various electronics components for IoT device manufacturing.',
    category: 'Electronics',
    budget: 75000.00,
    quantity: 5000,
    timeline: '45 days',
    urgency: 'LOW',
    status: 'pending',
    buyerId: 'buyer_3',
    buyer: {
      id: 'buyer_3',
      name: 'Tech Innovations',
      company: 'Bangalore Tech Solutions'
    },
    responses: 2,
    views: 12,
    createdAt: '2024-01-17T14:20:00Z',
    updatedAt: '2024-01-17T14:20:00Z'
  },
  {
    id: '4',
    title: 'Chemical Products for Manufacturing',
    description: 'Need various chemical products for pharmaceutical manufacturing unit.',
    category: 'Chemicals',
    budget: 200000.00,
    quantity: 100,
    timeline: '20 days',
    urgency: 'URGENT',
    status: 'active',
    buyerId: 'buyer_4',
    buyer: {
      id: 'buyer_4',
      name: 'Pharma Plus',
      company: 'Chennai Pharmaceuticals'
    },
    responses: 8,
    views: 35,
    createdAt: '2024-01-18T11:45:00Z',
    updatedAt: '2024-01-18T11:45:00Z'
  },
  {
    id: '5',
    title: 'Food Packaging Materials',
    description: 'Looking for food-grade packaging materials for food processing unit.',
    category: 'Food & Beverages',
    budget: 50000.00,
    quantity: 2000,
    timeline: '25 days',
    urgency: 'MEDIUM',
    status: 'closed',
    buyerId: 'buyer_5',
    buyer: {
      id: 'buyer_5',
      name: 'Food Processing Co',
      company: 'Hyderabad Food Industries'
    },
    responses: 4,
    views: 20,
    createdAt: '2024-01-19T16:30:00Z',
    updatedAt: '2024-01-19T16:30:00Z'
  },
  {
    id: '6',
    title: 'Automotive Parts for Assembly',
    description: 'Require various automotive parts for vehicle assembly line.',
    category: 'Automotive',
    budget: 300000.00,
    quantity: 500,
    timeline: '40 days',
    urgency: 'HIGH',
    status: 'active',
    buyerId: 'buyer_6',
    buyer: {
      id: 'buyer_6',
      name: 'Auto Manufacturing',
      company: 'Pune Auto Works'
    },
    responses: 6,
    views: 28,
    createdAt: '2024-01-20T08:15:00Z',
    updatedAt: '2024-01-20T08:15:00Z'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const category = searchParams.get('category') || '';
    const urgency = searchParams.get('urgency') || '';

    let filteredRFQs = [...mockRFQs];

    // Apply filters
    if (search) {
      filteredRFQs = filteredRFQs.filter(rfq =>
        rfq.title.toLowerCase().includes(search.toLowerCase()) ||
        rfq.description.toLowerCase().includes(search.toLowerCase()) ||
        rfq.buyer.company.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status && status !== 'all') {
      filteredRFQs = filteredRFQs.filter(rfq => rfq.status === status);
    }

    if (category && category !== 'all') {
      filteredRFQs = filteredRFQs.filter(rfq =>
        rfq.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (urgency && urgency !== 'all') {
      filteredRFQs = filteredRFQs.filter(rfq => rfq.urgency === urgency);
    }

    // Calculate pagination
    const total = filteredRFQs.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const rfqs = filteredRFQs.slice(startIndex, endIndex);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json({
      rfqs,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('RFQs API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, category, budget, quantity, timeline, urgency } = body;

    // Validate required fields
    if (!title || !description || !category || !budget || !quantity || !timeline || !urgency) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    // Create new RFQ
    const newRFQ = {
      id: (mockRFQs.length + 1).toString(),
      title,
      description,
      category,
      budget: parseFloat(budget),
      quantity: parseInt(quantity),
      timeline,
      urgency: urgency.toUpperCase(),
      status: 'active',
      buyerId: 'current_buyer',
      buyer: {
        id: 'current_buyer',
        name: 'Current User',
        company: 'Current Company'
      },
      responses: 0,
      views: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // In a real application, you would save this to a database
    mockRFQs.unshift(newRFQ);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json({
      success: true,
      message: 'RFQ created successfully',
      rfq: newRFQ
    }, { status: 201 });

  } catch (error) {
    console.error('Create RFQ error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
