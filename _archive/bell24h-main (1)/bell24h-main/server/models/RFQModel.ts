import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface RFQCreateInput {
  productId: string;
  productName: string;
  quantity: number;
  unit?: string;
  specifications?: Record<string, any>;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  buyerCompany: string;
  status?: 'draft' | 'submitted' | 'quoted' | 'expired' | 'cancelled';
  expiryDate?: Date;
  notes?: string;
  attachments?: string[];
}

export interface RFQUpdateInput {
  status?: 'draft' | 'submitted' | 'quoted' | 'expired' | 'cancelled';
  notes?: string;
  expiryDate?: Date;
  quotedPrice?: number;
  quotedCurrency?: string;
  quotedBySupplierId?: string;
  quotedAt?: Date;
}

export const RFQ = {
  async create(data: RFQCreateInput) {
    return prisma.rFQ.create({
      data: {
        ...data,
        status: data.status || 'draft',
        expiryDate: data.expiryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days
      },
    });
  },

  async findById(id: string) {
    return prisma.rFQ.findUnique({
      where: { id },
      include: {
        product: true,
        buyer: true,
        supplier: true,
        quotes: true,
      },
    });
  },

  async update(id: string, data: RFQUpdateInput) {
    return prisma.rFQ.update({
      where: { id },
      data: {
        ...data,
        ...(data.status === 'quoted' && { quotedAt: new Date() }),
      },
    });
  },

  async listByBuyer(buyerId: string, { status, page = 1, limit = 10 }: { status?: string; page?: number; limit?: number }) {
    const skip = (page - 1) * limit;
    const where = { buyerId, ...(status && { status }) };
    
    const [items, total] = await Promise.all([
      prisma.rFQ.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: { select: { name: true, images: true } },
          _count: { select: { quotes: true } },
        },
      }),
      prisma.rFQ.count({ where }),
    ]);

    return {
      items,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
        limit,
      },
    };
  },

  async listBySupplier(supplierId: string, { status, page = 1, limit = 10 }: { status?: string; page?: number; limit?: number }) {
    const skip = (page - 1) * limit;
    const where = { supplierId, ...(status && { status }) };
    
    const [items, total] = await Promise.all([
      prisma.rFQ.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: { select: { name: true, images: true } },
          buyer: { select: { name: true, companyName: true } },
          _count: { select: { quotes: true } },
        },
      }),
      prisma.rFQ.count({ where }),
    ]);

    return {
      items,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
        limit,
      },
    };
  },
};
