import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status') || 'ACTIVE';
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = parseInt(searchParams.get('skip') || '0');

    const where: any = { status };
    if (category) {
      where.category = category;
    }

    const [rfqs, total] = await Promise.all([
      prisma.rFQ.findMany({
        where,
        take: limit,
        skip: skip,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              name: true,
              company: true,
            }
          },
          _count: {
            select: { quotes: true }
          }
        }
      }),
      prisma.rFQ.count({ where })
    ]);

    return NextResponse.json({ 
      success: true, 
      rfqs, 
      pagination: { total, limit, skip } 
    });
  } catch (error) {
    console.error('RFQ List Error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
