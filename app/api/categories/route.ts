import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const categories = [
      {
        id: 'textiles-garments',
        name: 'Textiles & Garments',
        description: 'Find suppliers for textiles, clothing, and fashion accessories',
        supplierCount: 1247,
        productCount: 8934,
        icon: '👕',
        color: 'bg-pink-100'
      },
      {
        id: 'pharmaceuticals',
        name: 'Pharmaceuticals',
        description: 'Connect with pharmaceutical manufacturers and suppliers',
        supplierCount: 892,
        productCount: 4567,
        icon: '💊',
        color: 'bg-blue-100'
      },
      {
        id: 'agricultural-products',
        name: 'Agricultural Products',
        description: 'Source agricultural products and farming equipment',
        supplierCount: 2156,
        productCount: 12345,
        icon: '🌾',
        color: 'bg-green-100'
      },
      {
        id: 'automotive-parts',
        name: 'Automotive Parts',
        description: 'Find automotive components and spare parts',
        supplierCount: 1567,
        productCount: 7890,
        icon: '🚗',
        color: 'bg-gray-100'
      },
      {
        id: 'it-services',
        name: 'IT Services',
        description: 'Connect with IT service providers and software companies',
        supplierCount: 2341,
        productCount: 5678,
        icon: '💻',
        color: 'bg-indigo-100'
      },
      {
        id: 'gems-jewelry',
        name: 'Gems & Jewelry',
        description: 'Source precious stones, jewelry, and accessories',
        supplierCount: 678,
        productCount: 3456,
        icon: '💎',
        color: 'bg-yellow-100'
      },
      {
        id: 'handicrafts',
        name: 'Handicrafts',
        description: 'Find traditional and modern handicraft suppliers',
        supplierCount: 1234,
        productCount: 6789,
        icon: '🎨',
        color: 'bg-purple-100'
      },
      {
        id: 'machinery-equipment',
        name: 'Machinery & Equipment',
        description: 'Source industrial machinery and equipment',
        supplierCount: 987,
        productCount: 4567,
        icon: '⚙️',
        color: 'bg-red-100'
      },
      {
        id: 'chemicals',
        name: 'Chemicals',
        description: 'Find chemical suppliers and manufacturers',
        supplierCount: 756,
        productCount: 2345,
        icon: '🧪',
        color: 'bg-orange-100'
      },
      {
        id: 'food-processing',
        name: 'Food Processing',
        description: 'Connect with food processing and packaging suppliers',
        supplierCount: 1456,
        productCount: 5678,
        icon: '🍎',
        color: 'bg-emerald-100'
      },
      {
        id: 'electronics',
        name: 'Electronics',
        description: 'Source electronic components and devices',
        supplierCount: 1876,
        productCount: 7890,
        icon: '📱',
        color: 'bg-cyan-100'
      },
      {
        id: 'construction',
        name: 'Construction Materials',
        description: 'Find construction materials and building supplies',
        supplierCount: 2134,
        productCount: 8901,
        icon: '🏗️',
        color: 'bg-stone-100'
      },
      {
        id: 'packaging',
        name: 'Packaging',
        description: 'Source packaging materials and solutions',
        supplierCount: 987,
        productCount: 3456,
        icon: '📦',
        color: 'bg-amber-100'
      },
      {
        id: 'logistics',
        name: 'Logistics & Transportation',
        description: 'Connect with logistics and transportation services',
        supplierCount: 1234,
        productCount: 2345,
        icon: '🚚',
        color: 'bg-teal-100'
      }
    ];

    return NextResponse.json({ categories });
    
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch categories' 
    }, { status: 500 });
  }
}
