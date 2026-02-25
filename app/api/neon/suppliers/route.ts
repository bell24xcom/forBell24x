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

    const suppliersWithData = suppliers.map(supplier => ({
      ...supplier,
      verified: supplier.isVerified,
      category: supplier.category || category || 'Uncategorized',
      rfqCount: supplier._count.rfqs,
      leadCount: supplier._count.leads
    }));

    const response = {
      suppliers: suppliersWithData,
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

    return NextResponse.json({
      success: false,
      error: 'Failed to fetch suppliers',
      message: 'Database error occurred. Please try again.',
      suppliers: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        pages: 0
      }
    }, { status: 500 });
  }
}
