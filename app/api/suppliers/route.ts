import { NextRequest, NextResponse } from 'next/server';

// Mock data for suppliers
const mockSuppliers = [
  {
    id: '1',
    company: 'ABC Steel Works',
    name: 'John Doe',
    email: 'john@abcsteel.com',
    phone: '+91-9876543210',
    location: 'Mumbai, Maharashtra',
    category: 'Steel & Metals',
    verified: true,
    rating: 4.5,
    description: 'Leading steel manufacturer with 20+ years experience',
    gstNumber: '27ABCDE1234F1Z5',
    website: 'https://abcsteel.com',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    company: 'TechText Solutions',
    name: 'Priya Sharma',
    email: 'priya@techtext.com',
    phone: '+91-9876543211',
    location: 'Delhi, NCR',
    category: 'Textiles',
    verified: true,
    rating: 4.8,
    description: 'Premium textile manufacturer and exporter',
    gstNumber: '07FGHIJ5678K9L2',
    website: 'https://techtext.com',
    createdAt: '2024-01-16T09:15:00Z',
    updatedAt: '2024-01-16T09:15:00Z'
  },
  {
    id: '3',
    company: 'ElectroMax India',
    name: 'Rajesh Kumar',
    email: 'rajesh@electromax.com',
    phone: '+91-9876543212',
    location: 'Bangalore, Karnataka',
    category: 'Electronics',
    verified: true,
    rating: 4.3,
    description: 'Electronic components and devices manufacturer',
    gstNumber: '29MNOPQ9012R3S4',
    website: 'https://electromax.com',
    createdAt: '2024-01-17T14:20:00Z',
    updatedAt: '2024-01-17T14:20:00Z'
  },
  {
    id: '4',
    company: 'Machinery Hub',
    name: 'Amit Patel',
    email: 'amit@machineryhub.com',
    phone: '+91-9876543213',
    location: 'Pune, Maharashtra',
    category: 'Machinery',
    verified: true,
    rating: 4.6,
    description: 'Industrial machinery and equipment supplier',
    gstNumber: '27TUVWX3456Y7Z8',
    website: 'https://machineryhub.com',
    createdAt: '2024-01-18T11:45:00Z',
    updatedAt: '2024-01-18T11:45:00Z'
  },
  {
    id: '5',
    company: 'ChemPro Industries',
    name: 'Sneha Reddy',
    email: 'sneha@chempro.com',
    phone: '+91-9876543214',
    location: 'Chennai, Tamil Nadu',
    category: 'Chemicals',
    verified: true,
    rating: 4.4,
    description: 'Chemical products and solutions provider',
    gstNumber: '33ABCDE7890F1G2',
    website: 'https://chempro.com',
    createdAt: '2024-01-19T16:30:00Z',
    updatedAt: '2024-01-19T16:30:00Z'
  },
  {
    id: '6',
    company: 'FoodCorp India',
    name: 'Vikram Singh',
    email: 'vikram@foodcorp.com',
    phone: '+91-9876543215',
    location: 'Hyderabad, Telangana',
    category: 'Food & Beverages',
    verified: true,
    rating: 4.7,
    description: 'Premium food products and packaging solutions',
    gstNumber: '36HIJKLM1234N5O6',
    website: 'https://foodcorp.com',
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
    const category = searchParams.get('category') || '';
    const location = searchParams.get('location') || '';
    const verified = searchParams.get('verified');

    let filteredSuppliers = [...mockSuppliers];

    // Apply filters
    if (search) {
      filteredSuppliers = filteredSuppliers.filter(supplier =>
        supplier.company.toLowerCase().includes(search.toLowerCase()) ||
        supplier.name.toLowerCase().includes(search.toLowerCase()) ||
        supplier.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category && category !== 'all') {
      filteredSuppliers = filteredSuppliers.filter(supplier =>
        supplier.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (location) {
      filteredSuppliers = filteredSuppliers.filter(supplier =>
        supplier.location.toLowerCase().includes(location.toLowerCase())
      );
    }

    if (verified === 'true') {
      filteredSuppliers = filteredSuppliers.filter(supplier => supplier.verified);
    }

    // Calculate pagination
    const total = filteredSuppliers.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const suppliers = filteredSuppliers.slice(startIndex, endIndex);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json({
      suppliers,
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
    console.error('Suppliers API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}