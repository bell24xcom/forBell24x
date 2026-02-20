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
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const [rfqs, totalCount] = await Promise.all([
      prisma.rFQ.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          },
          quotes: {
            select: {
              id: true,
              price: true,
              status: true,
              supplier: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          },
          _count: {
            select: { quotes: true }
          }
        }
      }),
      prisma.rFQ.count({ where })
    ]);

    const stats = await Promise.all([
      prisma.rFQ.count({ where: { status: 'ACTIVE' } }),
      prisma.rFQ.count({ where: { status: 'COMPLETED' } }),
      prisma.rFQ.count({ where: { status: 'CANCELLED' } }),
      prisma.rFQ.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      })
    ]);

    return NextResponse.json({
      rfqs,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      },
      stats: {
        totalRfqs: totalCount,
        activeRfqs: stats[0],
        completedRfqs: stats[1],
        cancelledRfqs: stats[2],
        newRfqsThisWeek: stats[3]
      }
    });

  } catch (error) {
    console.error('Error fetching RFQs:', error);
    return NextResponse.json({
      error: 'Failed to fetch RFQs'
    }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { rfqId, updates } = await req.json();

    if (!rfqId) {
      return NextResponse.json({
        error: 'RFQ ID is required'
      }, { status: 400 });
    }

    const updatedRfq = await prisma.rFQ.update({
      where: { id: rfqId },
      data: updates,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: { quotes: true }
        }
      }
    });

    return NextResponse.json({
      rfq: updatedRfq,
      message: 'RFQ updated successfully'
    });

  } catch (error) {
    console.error('Error updating RFQ:', error);
    return NextResponse.json({
      error: 'Failed to update RFQ'
    }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rfqId = searchParams.get('rfqId');

    if (!rfqId) {
      return NextResponse.json({
        error: 'RFQ ID is required'
      }, { status: 400 });
    }

    const updatedRfq = await prisma.rFQ.update({
      where: { id: rfqId },
      data: { status: 'CANCELLED' },
      select: {
        id: true,
        title: true,
        status: true
      }
    });

    return NextResponse.json({
      rfq: updatedRfq,
      message: 'RFQ cancelled successfully'
    });

  } catch (error) {
    console.error('Error cancelling RFQ:', error);
    return NextResponse.json({
      error: 'Failed to cancel RFQ'
    }, { status: 500 });
  }
}
