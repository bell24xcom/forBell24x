import { Router } from 'express';
import { body, param } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';
import { authenticateJWT } from '../middleware/auth';
import * as paymentController from '../controllers/paymentController';

const router = Router();

// Webhook endpoints (no authentication required)
router.post(
  '/webhook/:provider',
  body().isObject().withMessage('Request body must be a JSON object'),
  paymentController.verifyPaymentWebhook
);

// Payment verification endpoints (protected)
router.get(
  '/verify/:paymentId',
  authenticateJWT,
  [
    param('paymentId')
      .isString()
      .withMessage('Payment ID must be a string')
      .notEmpty()
      .withMessage('Payment ID is required'),
  ],
  validateRequest,
  paymentController.verifyPayment
);

// Get payment details (protected)
router.get(
  '/:paymentId',
  authenticateJWT,
  [
    param('paymentId')
      .isString()
      .withMessage('Payment ID must be a string')
      .notEmpty()
      .withMessage('Payment ID is required'),
  ],
  validateRequest,
  paymentController.getPaymentDetails
);

// Create a new payment (protected)
router.post(
  '/create',
  authenticateJWT,
  [
    body('orderId').isString().notEmpty().withMessage('Order ID is required'),
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('currency').optional().isString().isLength({ min: 3, max: 3 }),
    body('provider')
      .isIn(['stripe', 'paypal', 'razorpay'])
      .withMessage('Invalid payment provider'),
    body('metadata').optional().isObject(),
  ],
  validateRequest,
  paymentController.createPayment
);

// Process payment (protected)
router.post(
  '/process',
  authenticateJWT,
  [
    body('paymentId').isString().notEmpty().withMessage('Payment ID is required'),
    body('paymentMethod').isObject().withMessage('Payment method details are required'),
    body('billingDetails').optional().isObject(),
  ],
  validateRequest,
  paymentController.processPayment
);

// Refund a payment (protected)
router.post(
  '/refund/:paymentId',
  authenticateJWT,
  [
    param('paymentId').isString().notEmpty().withMessage('Payment ID is required'),
    body('amount').optional().isNumeric(),
    body('reason').optional().isString(),
  ],
  validateRequest,
  paymentController.refundPayment
);

// List payments (protected, with pagination)
router.get(
  '/',
  authenticateJWT,
  [
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be a positive number'),
    query('status').optional().isString(),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
  ],
  validateRequest,
  paymentController.listPayments
);

export default router;
