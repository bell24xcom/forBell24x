import { NextRequest, NextResponse } from 'next/server';

// Enhanced categories data with live statistics
const categories = [
  {
    id: 'manufacturing',
    name: 'Manufacturing',
    description: 'Industrial equipment, machinery, and manufacturing solutions',
    supplierCount: 1250,
    productCount: 15420,
    icon: '🏭',
    color: 'bg-blue-100',
    growthRate: 12.5,
    avgResponseTime: '2.3 hours',
    topProducts: ['Steel Pipes', 'CNC Machines', 'Industrial Valves']
  },
  {
    id: 'textiles',
    name: 'Textiles',
    description: 'Fabric, clothing, and textile products from verified suppliers',
    supplierCount: 890,
    productCount: 12300,
    icon: '👕',
    color: 'bg-green-100',
    growthRate: 8.7,
    avgResponseTime: '1.8 hours',
    topProducts: ['Cotton Fabric', 'Silk Material', 'Synthetic Textiles']
  },
  {
    id: 'electronics',
    name: 'Electronics',
    description: 'Electronic components, devices, and technology solutions',
    supplierCount: 650,
    productCount: 8900,
    icon: '📱',
    color: 'bg-purple-100',
    growthRate: 15.2,
    avgResponseTime: '1.5 hours',
    topProducts: ['Circuit Boards', 'LED Lights', 'Electronic Components']
  },
  {
    id: 'construction',
    name: 'Construction',
    description: 'Building materials, construction supplies, and infrastructure',
    supplierCount: 1100,
    productCount: 18750,
    icon: '🏗️',
    color: 'bg-orange-100',
    growthRate: 9.3,
    avgResponseTime: '2.1 hours',
    topProducts: ['Cement', 'Steel Bars', 'Bricks']
  },
  {
    id: 'chemicals',
    name: 'Chemicals',
    description: 'Chemical raw materials, compounds, and industrial chemicals',
    supplierCount: 420,
    productCount: 5600,
    icon: '🧪',
    color: 'bg-red-100',
    growthRate: 6.8,
    avgResponseTime: '3.2 hours',
    topProducts: ['Industrial Chemicals', 'Solvents', 'Raw Materials']
  },
  {
    id: 'machinery',
    name: 'Machinery',
    description: 'Heavy machinery, equipment, and industrial tools',
    supplierCount: 780,
    productCount: 11200,
    icon: '⚙️',
    color: 'bg-gray-100',
    growthRate: 11.4,
    avgResponseTime: '2.8 hours',
    topProducts: ['CNC Machines', 'Industrial Equipment', 'Spare Parts']
  },
  {
    id: 'packaging',
    name: 'Packaging',
    description: 'Packaging materials, solutions, and logistics supplies',
    supplierCount: 340,
    productCount: 4200,
    icon: '📦',
    color: 'bg-yellow-100',
    growthRate: 7.9,
    avgResponseTime: '1.2 hours',
    topProducts: ['Cardboard Boxes', 'Plastic Packaging', 'Labels']
  },
  {
    id: 'automotive',
    name: 'Automotive',
    description: 'Auto parts, automotive supplies, and vehicle components',
    supplierCount: 560,
    productCount: 7800,
    icon: '🚗',
    color: 'bg-indigo-100',
    growthRate: 13.1,
    avgResponseTime: '2.0 hours',
    topProducts: ['Engine Parts', 'Brake Components', 'Electrical Parts']
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    const sortBy = searchParams.get('sortBy') || 'supplierCount';
    
    let filteredCategories = [...categories];
    
    // Sort categories
    if (sortBy === 'supplierCount') {
      filteredCategories.sort((a, b) => b.supplierCount - a.supplierCount);
    } else if (sortBy === 'growthRate') {
      filteredCategories.sort((a, b) => b.growthRate - a.growthRate);
    } else if (sortBy === 'responseTime') {
      filteredCategories.sort((a, b) => parseFloat(a.avgResponseTime) - parseFloat(b.avgResponseTime));
    }
    
    // Apply limit
    if (limit) {
      filteredCategories = filteredCategories.slice(0, parseInt(limit));
    }
    
    return NextResponse.json({
      success: true,
      categories: filteredCategories,
      total: categories.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
