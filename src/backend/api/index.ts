import { Router } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';

// Import all route modules
import rfqRoutes from './routes/rfq.routes';
import supplierRoutes from './routes/supplier.routes';
import walletRoutes from './routes/wallet.routes';
import escrowRoutes from './routes/escrow.routes';
import paymentRoutes from './routes/payment.routes';
import analyticsRoutes from './routes/analytics.routes';
import logisticsRoutes from './routes/logistics.routes';
import riskRoutes from './routes/risk.routes';
import videoRoutes from './routes/video.routes';
import authRoutes from './routes/auth.routes';

// Import middleware
import { errorHandler } from './middleware/error.middleware';
import { requestLogger } from './middleware/logger.middleware';
import { validateApiKey } from './middleware/api-key.middleware';

const router = Router();

// Security middleware
router.use(helmet());
router.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
router.use(limiter);

// Compression
router.use(compression());

// Request logging
router.use(requestLogger);

// API key validation for external requests
router.use(validateApiKey);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API documentation endpoint
router.get('/docs', (req, res) => {
  res.json({
    message: 'Bell24H Enterprise API Documentation',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      rfq: '/api/rfq',
      supplier: '/api/supplier',
      wallet: '/api/wallet',
      escrow: '/api/escrow',
      payment: '/api/payment',
      analytics: '/api/analytics',
      logistics: '/api/logistics',
      risk: '/api/risk',
      video: '/api/video'
    },
    documentation: '/api/docs/swagger'
  });
});

// Register all API routes
router.use('/auth', authRoutes);
router.use('/rfq', rfqRoutes);
router.use('/supplier', supplierRoutes);
router.use('/wallet', walletRoutes);
router.use('/escrow', escrowRoutes);
router.use('/payment', paymentRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/logistics', logisticsRoutes);
router.use('/risk', riskRoutes);
router.use('/video', videoRoutes);

// 404 handler for undefined routes
router.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Global error handler
router.use(errorHandler);

export default router; 