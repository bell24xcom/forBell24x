/**
 * Bell24h Core API Service
 * Deployed on Oracle Cloud x86 VM (1GB)
 * Handles RFQ, Suppliers, Payments
 */

const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const rateLimit = require('express-rate-limit');

const app = express();
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://neondb_owner:npg_0Duqdxs3RoyA@ep-super-wind-a1c1ni4n-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
    }
  }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Health check
app.get('/', (req, res) => {
  res.json({
    service: 'Bell24h Core API',
    status: 'running',
    version: '1.0.0',
    features: ['RFQ Management', 'Supplier Management', 'Payment Processing']
  });
});

app.get('/health', async (req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    res.json({
      status: 'healthy',
      service: 'core-api',
      database: 'connected',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      service: 'core-api',
      database: 'disconnected',
      error: error.message
    });
  }
});

// RFQ Management
app.get('/api/rfqs', async (req, res) => {
  try {
    const { page = 1, limit = 20, status, category } = req.query;
    const skip = (page - 1) * limit;
    
    const where = {};
    if (status) where.status = status;
    if (category) where.category = category;
    
    const [rfqs, total] = await Promise.all([
      prisma.rfq.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        include: {
          buyer: {
            select: { id: true, name: true, email: true }
          },
          company: {
            select: { id: true, name: true }
          },
          quotes: {
            select: { id: true, price: true, status: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.rfq.count({ where })
    ]);
    
    res.json({
      rfqs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/rfqs', async (req, res) => {
  try {
    const { title, description, category, subcategory, quantity, budget, deadline, buyerId, companyId } = req.body;
    
    const rfq = await prisma.rfq.create({
      data: {
        title,
        description,
        category,
        subcategory,
        quantity: parseInt(quantity),
        budget: budget ? parseFloat(budget) : null,
        deadline: deadline ? new Date(deadline) : null,
        buyerId,
        companyId
      },
      include: {
        buyer: {
          select: { id: true, name: true, email: true }
        }
      }
    });
    
    res.status(201).json(rfq);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/rfqs/:id', async (req, res) => {
  try {
    const rfq = await prisma.rfq.findUnique({
      where: { id: req.params.id },
      include: {
        buyer: {
          select: { id: true, name: true, email: true }
        },
        company: {
          select: { id: true, name: true }
        },
        quotes: {
          include: {
            supplier: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    });
    
    if (!rfq) {
      return res.status(404).json({ error: 'RFQ not found' });
    }
    
    res.json(rfq);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Supplier Management
app.get('/api/suppliers', async (req, res) => {
  try {
    const { page = 1, limit = 20, category, verified } = req.query;
    const skip = (page - 1) * limit;
    
    const where = { role: 'SUPPLIER' };
    if (verified !== undefined) where.isVerified = verified === 'true';
    
    const [suppliers, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        include: {
          profile: true,
          company: {
            select: { id: true, name: true, category: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);
    
    res.json({
      suppliers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/suppliers/:id', async (req, res) => {
  try {
    const supplier = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        profile: true,
        company: {
          include: {
            products: true
          }
        },
        ordersAsSupplier: {
          include: {
            buyer: {
              select: { id: true, name: true }
            }
          }
        }
      }
    });
    
    if (!supplier || supplier.role !== 'SUPPLIER') {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    
    res.json(supplier);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Quote Management
app.post('/api/quotes', async (req, res) => {
  try {
    const { rfqId, supplierId, price, quantity, deliveryTime, validity, specifications, terms, notes } = req.body;
    
    const quote = await prisma.quote.create({
      data: {
        rfqId,
        supplierId,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        deliveryTime,
        validity: validity ? new Date(validity) : null,
        specifications: specifications ? JSON.parse(specifications) : null,
        terms,
        notes
      },
      include: {
        supplier: {
          select: { id: true, name: true, email: true }
        },
        rfq: {
          select: { id: true, title: true, description: true }
        }
      }
    });
    
    res.status(201).json(quote);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/quotes', async (req, res) => {
  try {
    const { rfqId, supplierId, status } = req.query;
    
    const where = {};
    if (rfqId) where.rfqId = rfqId;
    if (supplierId) where.supplierId = supplierId;
    if (status) where.status = status;
    
    const quotes = await prisma.quote.findMany({
      where,
      include: {
        supplier: {
          select: { id: true, name: true, email: true }
        },
        rfq: {
          select: { id: true, title: true, description: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(quotes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Order Management
app.post('/api/orders', async (req, res) => {
  try {
    const { rfqId, quoteId, quantity, price, totalAmount, buyerId, supplierId } = req.body;
    
    const order = await prisma.order.create({
      data: {
        rfqId,
        quoteId,
        quantity: parseInt(quantity),
        price: parseFloat(price),
        totalAmount: parseFloat(totalAmount),
        buyerId,
        supplierId
      },
      include: {
        buyer: {
          select: { id: true, name: true, email: true }
        },
        supplier: {
          select: { id: true, name: true, email: true }
        }
      }
    });
    
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const { buyerId, supplierId, status } = req.query;
    
    const where = {};
    if (buyerId) where.buyerId = buyerId;
    if (supplierId) where.supplierId = supplierId;
    if (status) where.status = status;
    
    const orders = await prisma.order.findMany({
      where,
      include: {
        buyer: {
          select: { id: true, name: true, email: true }
        },
        supplier: {
          select: { id: true, name: true, email: true }
        },
        payments: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Analytics
app.get('/api/analytics/dashboard', async (req, res) => {
  try {
    const [
      totalRFQs,
      totalSuppliers,
      totalOrders,
      totalRevenue,
      recentRFQs,
      topCategories
    ] = await Promise.all([
      prisma.rfq.count(),
      prisma.user.count({ where: { role: 'SUPPLIER' } }),
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: { totalAmount: true }
      }),
      prisma.rfq.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          buyer: { select: { name: true } }
        }
      }),
      prisma.rfq.groupBy({
        by: ['category'],
        _count: { category: true },
        orderBy: { _count: { category: 'desc' } },
        take: 5
      })
    ]);
    
    res.json({
      stats: {
        totalRFQs,
        totalSuppliers,
        totalOrders,
        totalRevenue: totalRevenue._sum.totalAmount || 0
      },
      recentRFQs,
      topCategories
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: error.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

const PORT = process.env.PORT || 8002;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Bell24h Core API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});
