import { Router } from 'express';
import { body, query } from 'express-validator';
import { walletController } from '../controllers/walletController';
import { validateRequest } from '../middleware/validateRequest';
import { authenticate } from '../middleware/auth';

const router = Router();

// Apply authentication middleware to all wallet routes
router.use(authenticate);

// Get wallet details
router.get('/', walletController.getWallet);

// Deposit money into wallet
router.post(
  '/deposit',
  [
    body('amount').isFloat({ min: 1 }).withMessage('Amount must be at least 1'),
    body('paymentMethodId').notEmpty().withMessage('Payment method is required')
  ],
  validateRequest,
  walletController.deposit
);

// Withdraw money from wallet
router.post(
  '/withdraw',
  [
    body('amount').isFloat({ min: 1 }).withMessage('Amount must be at least 1'),
    body('bankAccountId').notEmpty().withMessage('Bank account is required')
  ],
  validateRequest,
  walletController.withdraw
);

// Get transaction history
router.get(
  '/transactions',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt()
  ],
  validateRequest,
  walletController.getTransactions
);

// Webhook for Stripe events (no auth required)
router.post(
  '/webhook',
  // Raw body is needed for webhook verification
  (req: any, res: any, next: any) => {
    req.rawBody = req.body;
    next();
  },
  walletController.handleWebhook
);

export default router;
