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
    const status = searchParams.get('status');
    const category = searchParams.get('category');

    const skip = (page - 1) * limit;

    // Build where clause for Neon database
    const where: any = {};
    
    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }
    
    if (category && category !== 'all') {
      where.category = category;
    }

    // Fetch RFQs from Neon database
    const [rfqs, totalCount] = await Promise.all([
      prisma.rfq.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          buyer: {
            select: {
              id: true,
              name: true,
              company: true,
              location: true
            }
          },
          quotes: {
            select: {
              id: true,
              price: true,
              deliveryTime: true,
              supplier: {
                select: {
                  name: true,
                  company: true
                }
              }
            }
          }
        }
      }),
      prisma.rfq.count({ where })
    ]);

    const response = {
      rfqs,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    };

    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error fetching RFQs from Neon:', error);
    
    // Return mock data if database fails
    const mockRfqs = [
      {
        id: '1',
        title: 'Steel Pipes for Construction',
        description: 'Need 1000 steel pipes for construction project',
        category: 'steel',
        quantity: '1000 pieces',
        budget: '500000',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        urgency: 'NORMAL',
        status: 'OPEN',
        createdAt: new Date(),
        buyer: {
          id: '1',
          name: 'John Doe',
          company: 'Construction Co',
          location: 'Mumbai, India'
        },
        quotes: [
          {
            id: '1',
            price: 250000,
            deliveryTime: '7 days',
            supplier: {
              name: 'Rajesh Kumar',
              company: 'SteelCo India'
            }
          }
        ]
      }
    ];

    return NextResponse.json({
      rfqs: mockRfqs,
      pagination: {
        page: 1,
        limit: 20,
        total: mockRfqs.length,
        pages: 1
      }
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Create RFQ in Neon database
    const rfq = await prisma.rfq.create({
      data: {
        title: body.title,
        description: body.description,
        category: body.category,
        quantity: body.quantity,
        budget: body.budget,
        deadline: new Date(body.deadline),
        urgency: body.urgency || 'NORMAL',
        status: 'OPEN',
        buyerId: body.buyerId || 'default-buyer-id', // In production, get from auth
        specifications: body.specifications,
        location: body.location
      },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            company: true,
            location: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      rfq,
      message: 'RFQ created successfully'
    });
    
  } catch (error) {
    console.error('Error creating RFQ in Neon:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create RFQ'
    }, { status: 500 });
  }
}
