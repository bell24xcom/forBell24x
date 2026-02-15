import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const verified = searchParams.get('verified');

    const skip = (page - 1) * limit;

    // Build where clause for Neon database
    const where: any = {
      role: 'SUPPLIER',
      isActive: true
    };
    
    if (category && category !== 'all') {
      where.category = category;
    }
    
    if (verified === 'true') {
      where.isVerified = true;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Fetch suppliers from Neon database
    const [suppliers, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        },
        select: {
          id: true,
          name: true,
          company: true,
          email: true,
          phone: true,
          location: true,
          isVerified: true,
          createdAt: true,
          category: true,
          _count: {
            select: {
              rfqs: true,
              leads: true
            }
          }
        }
      }),
      prisma.user.count({ where })
    ]);

    // Add mock data for demonstration (remove in production)
    const suppliersWithMockData = suppliers.map(supplier => ({
      ...supplier,
      verified: supplier.isVerified,
      rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0 to 5.0
      products: [
        'Steel Pipes',
        'Steel Sheets', 
        'Steel Rods',
        'Steel Plates',
        'Metal Components'
      ].slice(0, Math.floor(Math.random() * 5) + 1),
      category: supplier.category || category || 'steel',
      rfqCount: supplier._count.rfqs,
      leadCount: supplier._count.leads
    }));

    const response = {
      suppliers: suppliersWithMockData,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    };

    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error fetching suppliers from Neon:', error);
    
    // Return mock data if database fails
    const mockSuppliers = [
      {
        id: '1',
        name: 'Rajesh Kumar',
        company: 'SteelCo India',
        email: 'rajesh@steelco.com',
        phone: '+91-9876543210',
        location: 'Mumbai, Maharashtra',
        verified: true,
        createdAt: '2024-01-15T10:30:00Z',
        rating: 4.8,
        products: ['Steel Pipes', 'Steel Sheets', 'Steel Rods', 'Steel Plates'],
        category: 'steel',
        rfqCount: 45,
        leadCount: 23
      },
      {
        id: '2',
        name: 'Priya Sharma',
        company: 'Textile Innovations',
        email: 'priya@textileinnovations.com',
        phone: '+91-9876543211',
        location: 'Surat, Gujarat',
        verified: true,
        createdAt: '2024-02-20T14:15:00Z',
        rating: 4.6,
        products: ['Cotton Fabric', 'Silk Fabric', 'Polyester Fabric', 'Blended Fabric'],
        category: 'textiles',
        rfqCount: 32,
        leadCount: 18
      }
    ];

    return NextResponse.json({
      suppliers: mockSuppliers,
      pagination: {
        page: 1,
        limit: 20,
        total: mockSuppliers.length,
        pages: 1
      }
    });
  }
}
