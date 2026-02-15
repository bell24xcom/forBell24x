import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { authenticateJWT } from '../middleware/auth';
import { rateLimit } from '../middleware/rateLimit';
import { validatePayment } from '../middleware/validation';

const router = Router();
const paymentController = new PaymentController();

// Apply rate limiting to all payment routes
router.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}));

// Apply authentication to all payment routes except webhook
router.use((req, res, next) => {
  if (req.path === '/webhook') {
    next();
  } else {
    authenticateJWT(req, res, next);
  }
});

// Payment intent routes
router.post('/intent', validatePayment, paymentController.createPaymentIntent.bind(paymentController));
router.post('/confirm', validatePayment, paymentController.confirmPayment.bind(paymentController));

// Payment method routes
router.post('/methods', validatePayment, paymentController.addPaymentMethod.bind(paymentController));
router.delete('/methods/:paymentMethodId', paymentController.removePaymentMethod.bind(paymentController));

// Transaction routes
router.get('/transactions/:transactionId', paymentController.getTransaction.bind(paymentController));
router.get('/transactions', paymentController.listTransactions.bind(paymentController));

// Analytics route
router.get('/analytics', paymentController.getPaymentAnalytics.bind(paymentController));

// Webhook route (no authentication required)
router.post('/webhook', paymentController.handleWebhook.bind(paymentController));

export default router; 