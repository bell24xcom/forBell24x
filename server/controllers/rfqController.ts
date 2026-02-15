import { Request, Response, NextFunction } from 'express';
import { RFQ, RFQCreateInput, RFQUpdateInput } from '../models/RFQModel';
import { sendEmail } from '../services/emailService';
import { PrismaClient } from '@prisma/client';

// Default Prisma client for production use
const defaultPrisma = new PrismaClient();

// Type for the Prisma client with only the methods we use
type PrismaClientLike = {
  rFQ: {
    findMany: (args: any) => Promise<any[]>;
    findUnique: (args: any) => Promise<any>;
    create: (args: any) => Promise<any>;
    update: (args: any) => Promise<any>;
    count: (args: any) => Promise<number>;
  };
  $disconnect: () => Promise<void>;
};

// Advanced Filtering Endpoint
export const getFilteredRFQs = async (req: Request, res: Response) => {
  try {
    const {
      status,
      creationDateStart,
      creationDateEnd,
      submissionDateStart,
      submissionDateEnd,
      clientName,
      productCategory,
      priceMin,
      priceMax,
      assignedUser,
      supplierRiskScoreMin,
      supplierRiskScoreMax,
      location
    } = req.query;

    // Build Prisma where clause dynamically
    const where: any = {};

    if (status) where.status = { in: Array.isArray(status) ? status : [status] };
    if (creationDateStart || creationDateEnd) {
      where.createdAt = {};
      if (creationDateStart) where.createdAt.gte = new Date(creationDateStart as string);
      if (creationDateEnd) where.createdAt.lte = new Date(creationDateEnd as string);
    }
    if (submissionDateStart || submissionDateEnd) {
      where.submissionDate = {};
      if (submissionDateStart) where.submissionDate.gte = new Date(submissionDateStart as string);
      if (submissionDateEnd) where.submissionDate.lte = new Date(submissionDateEnd as string);
    }
    if (clientName) where.buyerName = { contains: clientName as string, mode: 'insensitive' };
    if (productCategory) where.productCategory = { contains: productCategory as string, mode: 'insensitive' };
    if (priceMin || priceMax) {
      where.price = {};
      if (priceMin) where.price.gte = Number(priceMin);
      if (priceMax) where.price.lte = Number(priceMax);
    }
    if (assignedUser) where.assignedUser = assignedUser;
    if (supplierRiskScoreMin || supplierRiskScoreMax) {
      where.supplierRiskScore = {};
      if (supplierRiskScoreMin) where.supplierRiskScore.gte = Number(supplierRiskScoreMin);
      if (supplierRiskScoreMax) where.supplierRiskScore.lte = Number(supplierRiskScoreMax);
    }
    if (location) where.location = { contains: location as string, mode: 'insensitive' };

    // Pagination support
    const page = Number(req.query.page) || 1;
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      RFQ.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      RFQ.count({ where })
    ]);

    return res.status(200).json({
      success: true,
      data: items,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
        limit,
      },
    });
  } catch (error) {
    console.error('Error fetching filtered RFQs:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const createRFQ = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const rfqData: RFQCreateInput = {
      ...req.body,
      buyerId: userId,
      status: 'submitted',
    };

    const newRFQ = await RFQ.create(rfqData);
    
    // Notify supplier about new RFQ
    await notifySupplierAboutNewRFQ(newRFQ);

    res.status(201).json({
      success: true,
      data: newRFQ,
      message: 'RFQ submitted successfully',
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create RFQ';
    res.status(500).json({ 
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
    });
  }
};

export const getRFQ = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const rfq = await RFQ.findById(id);
    
    if (!rfq) {
      return res.status(404).json({ error: 'RFQ not found' });
    }

    // Authorization check
    if (rfq.buyerId !== userId && rfq.supplierId !== userId) {
      return res.status(403).json({ error: 'Not authorized to view this RFQ' });
    }

    res.json({
      success: true,
      data: rfq,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch RFQ';
    res.status(500).json({ 
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
    });
  }
};

export const updateRFQ = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const updateData: RFQUpdateInput = req.body;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const rfq = await RFQ.findById(id);
    
    if (!rfq) {
      return res.status(404).json({ error: 'RFQ not found' });
    }

    // Authorization check
    if (rfq.buyerId !== userId && rfq.supplierId !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this RFQ' });
    }

    const updatedRFQ = await RFQ.update(id, updateData);
    
    // Notify relevant parties about the update
    if (updateData.status === 'quoted' && updatedRFQ.buyerId) {
      await notifyBuyerAboutQuote(updatedRFQ);
    }

    res.json({
      success: true,
      data: updatedRFQ,
      message: 'RFQ updated successfully',
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update RFQ';
    res.status(500).json({ 
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
    });
  }
};

export const listBuyerRFQs = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { status, page = 1, limit = 10 } = req.query;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const result = await RFQ.listByBuyer(userId, {
      status: status as string,
      page: Number(page),
      limit: Math.min(Number(limit), 50),
    });

    res.json({
      success: true,
      data: result.items,
      pagination: result.pagination,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch RFQs';
    res.status(500).json({ 
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
    });
  }
};

export const listSupplierRFQs = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { status, page = 1, limit = 10 } = req.query;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // In a real app, verify the user is a supplier
    const result = await RFQ.listBySupplier(userId, {
      status: status as string,
      page: Number(page),
      limit: Math.min(Number(limit), 50),
    });

    res.json({
      success: true,
      data: result.items,
      pagination: result.pagination,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch RFQs';
    res.status(500).json({ 
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
    });
  }
};

// Helper functions for notifications
async function notifySupplierAboutNewRFQ(rfq: any) {
  try {
    // In a real app, fetch supplier details and send email
    await sendEmail({
      to: 'supplier@example.com', // Replace with actual supplier email
      subject: 'New RFQ Received',
      template: 'rfq-notification',
      data: {
        rfqId: rfq.id,
        productName: rfq.productName,
        quantity: rfq.quantity,
        buyerName: rfq.buyerName,
        companyName: rfq.buyerCompany,
        viewUrl: `${process.env.FRONTEND_URL}/supplier/rfqs/${rfq.id}`,
      },
    });
  } catch (error) {
    console.error('Failed to send RFQ notification to supplier:', error);
  }
}

async function notifyBuyerAboutQuote(rfq: any) {
  try {
    // In a real app, fetch buyer details and send email
    await sendEmail({
      to: 'buyer@example.com', // Replace with actual buyer email
      subject: 'Quote Received for Your RFQ',
      template: 'quote-notification',
      data: {
        rfqId: rfq.id,
        productName: rfq.productName,
        quotedPrice: rfq.quotedPrice,
        quotedCurrency: rfq.quotedCurrency,
        supplierName: rfq.supplier?.name || 'Supplier',
        viewUrl: `${process.env.FRONTEND_URL}/buyer/rfqs/${rfq.id}`,
      },
    });
  } catch (error) {
    console.error('Failed to send quote notification to buyer:', error);
  }
}
