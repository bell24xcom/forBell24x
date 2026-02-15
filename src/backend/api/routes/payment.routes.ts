import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { validateCreatePayment, validatePaymentWebhook } from '../validators/payment.validator';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';

const router = Router();
const controller = new PaymentController();

// Read routes (with auth)
router.get('/', authMiddleware, (req, res) => controller.getAllPayments(req, res));
router.get('/:id', authMiddleware, (req, res) => controller.getPayment(req, res));
router.get('/user/:userId', authMiddleware, (req, res) => controller.getUserPayments(req, res));
router.get('/:id/status', authMiddleware, (req, res) => controller.getPaymentStatus(req, res));
router.get('/:id/transactions', authMiddleware, (req, res) => controller.getPaymentTransactions(req, res));
router.get('/methods/available', authMiddleware, (req, res) => controller.getAvailablePaymentMethods(req, res));
router.get('/analytics/summary', authMiddleware, (req, res) => controller.getPaymentAnalytics(req, res));
router.get('/reports/transaction', authMiddleware, (req, res) => controller.getTransactionReport(req, res));

// Write routes (with auth)
router.post('/', authMiddleware, validateCreatePayment, (req, res) => controller.createPayment(req, res));
router.post('/razorpayx/initiate', authMiddleware, (req, res) => controller.initiateRazorpayXPayment(req, res));
router.post('/razorpayx/verify', authMiddleware, (req, res) => controller.verifyRazorpayXPayment(req, res));
router.post('/:id/capture', authMiddleware, (req, res) => controller.capturePayment(req, res));
router.post('/:id/refund', authMiddleware, (req, res) => controller.refundPayment(req, res));
router.post('/:id/cancel', authMiddleware, (req, res) => controller.cancelPayment(req, res));
router.post('/methods/add', authMiddleware, (req, res) => controller.addPaymentMethod(req, res));

// Webhook routes (no auth required)
router.post('/webhook/razorpayx', validatePaymentWebhook, (req, res) => controller.razorpayXWebhook(req, res));

// Admin routes (with role-based access)
router.delete('/methods/:id', authMiddleware, roleMiddleware, (req, res) => controller.removePaymentMethod(req, res));

export default router; 