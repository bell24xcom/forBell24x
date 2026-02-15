import { Request, Response } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { isAdmin } from '../../middleware/auth.js';
import { prisma } from '../../db/client.js';

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Apply authentication and admin authorization
    await authenticate(req, res, () => {});
    isAdmin(req, res, () => {});

    const {
      page = '1',
      pageSize = '10',
      search = '',
      status = 'all',
      category = 'all',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page as string);
    const pageSizeNum = parseInt(pageSize as string);
    const skip = (pageNum - 1) * pageSizeNum;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { buyer: { name: { contains: search as string, mode: 'insensitive' } } },
        { buyer: { email: { contains: search as string, mode: 'insensitive' } } }
      ];
    }

    if (status !== 'all') {
      where.status = status;
    }

    if (category !== 'all') {
      where.category = category;
    }

    // Build order by clause
    const orderBy: any = {};
    orderBy[sortBy as string] = sortOrder;

    // Fetch RFQs with pagination
    const [rfqs, total] = await Promise.all([
      prisma.rFQ.findMany({
        where,
        include: {
          buyer: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          bids: {
            select: {
              id: true
            }
          },
          _count: {
            select: {
              bids: true
            }
          }
        },
        orderBy,
        skip,
        take: pageSizeNum
      }),
      prisma.rFQ.count({ where })
    ]);

    // Transform the data to match the expected format
    const transformedRFQs = rfqs.map(rfq => ({
      id: rfq.id,
      title: rfq.title,
      description: rfq.description,
      category: rfq.category,
      budget: rfq.budget || 0,
      deadline: rfq.deadline?.toISOString() || '',
      status: rfq.status,
      buyer: rfq.buyer,
      createdAt: rfq.createdAt.toISOString(),
      updatedAt: rfq.updatedAt.toISOString(),
      supplierCount: rfq._count.bids,
      bidCount: rfq._count.bids,
      isUrgent: rfq.isUrgent || false,
      isFeatured: rfq.isFeatured || false,
      tags: rfq.tags || []
    }));

    res.status(200).json({
      rfqs: transformedRFQs,
      pagination: {
        page: pageNum,
        pageSize: pageSizeNum,
        total,
        totalPages: Math.ceil(total / pageSizeNum)
      }
    });
  } catch (error) {
    console.error('Error fetching RFQs:', error);
    res.status(500).json({ 
      error: 'Failed to fetch RFQs',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 