import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';
import { verifyPaymentWebhook, verifyPayment, getPaymentDetails } from '../controllers/paymentController';
import { authenticate as verifyAuth } from '../middleware/auth';
import rateLimit from 'express-rate-limit';
import { Payment } from '../models/PaymentModel';
import {
  createPaymentIntentHandler,
  createSetupIntentHandler,
  getPaymentMethodsHandler,
  attachPaymentMethodHandler,
  detachPaymentMethodHandler,
  createSubscriptionHandler,
  cancelSubscriptionHandler,
  createCheckoutSessionHandler,
  handleWebhookHandler,
} from '../controllers/paymentsController';

const router = Router();

// Rate limiting configuration
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many payment requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for webhooks
    return req.path.includes('/webhook/');
  },
});

// Apply rate limiter to all payment routes
router.use(paymentLimiter);

// Webhook endpoints (no auth required)
router.post(
  '/webhook/stripe',
  // Raw body is needed for webhook verification
  (req, res, next) => {
    req.rawBody = req.body;
    next();
  },
  handleWebhookHandler
);

// Legacy webhook endpoint (deprecated)
router.post(
  '/webhook/:provider',
  // Raw body is needed for webhook verification
  (req, res, next) => {
    req.rawBody = req.body;
    next();
  },
  verifyPaymentWebhook
);

// Payment verification endpoints (protected)
router.post(
  '/verify',
  verifyAuth,
  [
    body('paymentId').isString().notEmpty().withMessage('Payment ID is required'),
    body('provider').isString().isIn(['stripe', 'paypal', 'razorpay']).withMessage('Invalid payment provider'),
  ],
  validateRequest,
  verifyPayment
);

// Get payment details (protected)
router.get(
  '/:paymentId',
  verifyAuth,
  [
    param('paymentId')
      .isString()
      .notEmpty()
      .withMessage('Payment ID is required')
      .isLength({ min: 5, max: 100 })
      .withMessage('Payment ID must be between 5 and 100 characters'),
  ],
  validateRequest,
  getPaymentDetails
);

// Payment Intents
router.post(
  '/create-payment-intent',
  verifyAuth,
  [
    body('amount').isInt({ min: 50 }).withMessage('Amount must be at least 50 cents'),
    body('currency').optional().isString().isIn(['usd', 'eur', 'gbp', 'cad', 'aud', 'jpy']),
    body('customerId').optional().isString(),
    body('paymentMethodId').optional().isString(),
    body('metadata').optional().isObject(),
  ],
  validateRequest,
  createPaymentIntentHandler
);

// Setup Intents
router.post(
  '/create-setup-intent',
  verifyAuth,
  createSetupIntentHandler
);

// Payment Methods
router.get(
  '/payment-methods',
  verifyAuth,
  getPaymentMethodsHandler
);

router.post(
  '/payment-methods/attach',
  verifyAuth,
  [
    body('paymentMethodId').isString().notEmpty(),
  ],
  validateRequest,
  attachPaymentMethodHandler
);

router.delete(
  '/payment-methods/:paymentMethodId',
  verifyAuth,
  [
    param('paymentMethodId').isString().notEmpty(),
  ],
  validateRequest,
  detachPaymentMethodHandler
);

// Subscriptions
router.post(
  '/subscriptions',
  verifyAuth,
  [
    body('priceId').isString().notEmpty(),
    body('paymentMethodId').optional().isString(),
    body('trialPeriodDays').optional().isInt({ min: 0 }),
  ],
  validateRequest,
  createSubscriptionHandler
);

router.delete(
  '/subscriptions/:subscriptionId',
  verifyAuth,
  [
    param('subscriptionId').isString().notEmpty(),
    body('cancelAtPeriodEnd').optional().isBoolean(),
  ],
  validateRequest,
  cancelSubscriptionHandler
);

// Checkout Sessions
router.post(
  '/create-checkout-session',
  verifyAuth,
  [
    body('priceId').isString().notEmpty(),
    body('successUrl').isString().notEmpty(),
    body('cancelUrl').isString().notEmpty(),
    body('mode').optional().isIn(['payment', 'setup', 'subscription']),
    body('allowPromotionCodes').optional().isBoolean(),
  ],
  validateRequest,
  createCheckoutSessionHandler
);

// Get payment history for a user (protected)
router.get(
  '/user/history',
  verifyAuth,
  [
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('offset').optional().isInt({ min: 0 }).toInt(),
  ],
  validateRequest,
  async (req, res, next) => {
    try {
      const { limit = 10, offset = 0 } = req.query;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const payments = await Payment.getPaymentHistory(userId, {
        limit: Number(limit),
        offset: Number(offset),
      });

      res.json(payments);
    } catch (error) {
      next(error);
    }
  }
);

// Handle 404 for undefined payment routes
router.use((req, res) => {
  res.status(404).json({ error: 'Payment route not found' });
});

// Error handling middleware
router.use((err: any, req: any, res: any, next: any) => {
  console.error('Payment route error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

export { router as paymentRoutes };
