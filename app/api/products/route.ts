import { NextRequest, NextResponse } from 'next/server';

// Mock data for products
const mockProducts = [
  {
    id: '1',
    name: 'Steel Pipes - Grade A',
    description: 'High quality steel pipes for construction and industrial use',
    price: 1500.50,
    category: 'Steel & Metals',
    supplierId: '1',
    supplier: {
      id: '1',
      company: 'ABC Steel Works',
      name: 'John Doe',
      rating: 4.5,
      verified: true
    },
    images: ['/images/steel-pipes-1.jpg', '/images/steel-pipes-2.jpg'],
    specifications: {
      material: 'Steel',
      diameter: '6 inches',
      length: '12 feet',
      grade: 'A',
      thickness: '2mm'
    },
    inStock: true,
    quantity: 100,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    name: 'Cotton Fabric - Premium Quality',
    description: '100% cotton fabric suitable for clothing and home textiles',
    price: 250.75,
    category: 'Textiles',
    supplierId: '2',
    supplier: {
      id: '2',
      company: 'TechText Solutions',
      name: 'Priya Sharma',
      rating: 4.8,
      verified: true
    },
    images: ['/images/cotton-fabric-1.jpg', '/images/cotton-fabric-2.jpg'],
    specifications: {
      material: '100% Cotton',
      width: '60 inches',
      weight: '150 GSM',
      color: 'White',
      finish: 'Mercerized'
    },
    inStock: true,
    quantity: 500,
    createdAt: '2024-01-16T09:15:00Z',
    updatedAt: '2024-01-16T09:15:00Z'
  },
  {
    id: '3',
    name: 'LED Display Panel',
    description: 'High-resolution LED display panel for commercial use',
    price: 25000.00,
    category: 'Electronics',
    supplierId: '3',
    supplier: {
      id: '3',
      company: 'ElectroMax India',
      name: 'Rajesh Kumar',
      rating: 4.3,
      verified: true
    },
    images: ['/images/led-panel-1.jpg', '/images/led-panel-2.jpg'],
    specifications: {
      resolution: '1920x1080',
      size: '55 inches',
      brightness: '5000 nits',
      power: '200W',
      warranty: '3 years'
    },
    inStock: true,
    quantity: 25,
    createdAt: '2024-01-17T14:20:00Z',
    updatedAt: '2024-01-17T14:20:00Z'
  },
  {
    id: '4',
    name: 'Industrial Conveyor Belt',
    description: 'Heavy-duty conveyor belt for industrial applications',
    price: 8500.00,
    category: 'Machinery',
    supplierId: '4',
    supplier: {
      id: '4',
      company: 'Machinery Hub',
      name: 'Amit Patel',
      rating: 4.6,
      verified: true
    },
    images: ['/images/conveyor-belt-1.jpg', '/images/conveyor-belt-2.jpg'],
    specifications: {
      material: 'Rubber',
      width: '24 inches',
      length: '50 feet',
      loadCapacity: '500 kg/m',
      speed: '2 m/s'
    },
    inStock: true,
    quantity: 15,
    createdAt: '2024-01-18T11:45:00Z',
    updatedAt: '2024-01-18T11:45:00Z'
  },
  {
    id: '5',
    name: 'Industrial Solvent',
    description: 'High-purity industrial solvent for cleaning applications',
    price: 450.00,
    category: 'Chemicals',
    supplierId: '5',
    supplier: {
      id: '5',
      company: 'ChemPro Industries',
      name: 'Sneha Reddy',
      rating: 4.4,
      verified: true
    },
    images: ['/images/solvent-1.jpg', '/images/solvent-2.jpg'],
    specifications: {
      type: 'Industrial Solvent',
      purity: '99.9%',
      volume: '5 liters',
      flashPoint: '40°C',
      density: '0.8 g/ml'
    },
    inStock: true,
    quantity: 200,
    createdAt: '2024-01-19T16:30:00Z',
    updatedAt: '2024-01-19T16:30:00Z'
  },
  {
    id: '6',
    name: 'Packaged Food - Ready to Eat',
    description: 'Premium ready-to-eat food products with long shelf life',
    price: 125.00,
    category: 'Food & Beverages',
    supplierId: '6',
    supplier: {
      id: '6',
      company: 'FoodCorp India',
      name: 'Vikram Singh',
      rating: 4.7,
      verified: true
    },
    images: ['/images/packaged-food-1.jpg', '/images/packaged-food-2.jpg'],
    specifications: {
      type: 'Ready to Eat',
      shelfLife: '12 months',
      weight: '200g',
      packaging: 'Vacuum Sealed',
      ingredients: 'Natural'
    },
    inStock: true,
    quantity: 1000,
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
    const minPrice = parseFloat(searchParams.get('minPrice') || '0');
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '0');

    let filteredProducts = [...mockProducts];

    // Apply filters
    if (search) {
      filteredProducts = filteredProducts.filter(product =>
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.description.toLowerCase().includes(search.toLowerCase()) ||
        product.supplier.company.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category && category !== 'all') {
      filteredProducts = filteredProducts.filter(product =>
        product.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (minPrice > 0) {
      filteredProducts = filteredProducts.filter(product => product.price >= minPrice);
    }

    if (maxPrice > 0) {
      filteredProducts = filteredProducts.filter(product => product.price <= maxPrice);
    }

    // Calculate pagination
    const total = filteredProducts.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const products = filteredProducts.slice(startIndex, endIndex);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json({
      products,
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
    console.error('Products API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
