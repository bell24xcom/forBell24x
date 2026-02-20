import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

    const where: any = {};

    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }

    if (category && category !== 'all') {
      where.category = category;
    }

    const [rfqs, totalCount] = await Promise.all([
      prisma.rFQ.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
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
              timeline: true,
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
      prisma.rFQ.count({ where })
    ]);

    return NextResponse.json({
      rfqs,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching RFQs:', error);
    return NextResponse.json({
      rfqs: [],
      pagination: { page: 1, limit: 20, total: 0, pages: 0 },
      error: 'Failed to fetch RFQs'
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const rfq = await prisma.rFQ.create({
      data: {
        title: body.title,
        description: body.description,
        category: body.category || '',
        quantity: body.quantity || '1',
        unit: body.unit || 'units',
        minBudget: body.minBudget ? parseFloat(body.minBudget) : null,
        maxBudget: body.maxBudget ? parseFloat(body.maxBudget) : null,
        timeline: body.timeline || body.deadline || '7 days',
        urgency: body.urgency || 'NORMAL',
        status: 'ACTIVE',
        location: body.location,
        createdBy: body.buyerId || body.userId,
      },
      include: {
        user: {
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
    console.error('Error creating RFQ:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create RFQ'
    }, { status: 500 });
  }
}
