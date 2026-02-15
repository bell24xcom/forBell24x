import { Router } from 'express';
import { EscrowController } from '../controllers/escrow.controller';
import { validateCreateEscrow, validateReleaseEscrow, validateRefundEscrow } from '../validators/escrow.validator';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';

const router = Router();
const controller = new EscrowController();

// Read routes (with auth)
router.get('/', authMiddleware, (req, res) => controller.getAllEscrows(req, res));
router.get('/:id', authMiddleware, (req, res) => controller.getEscrow(req, res));
router.get('/rfq/:rfqId', authMiddleware, (req, res) => controller.getEscrowByRFQ(req, res));
router.get('/user/:userId', authMiddleware, (req, res) => controller.getUserEscrows(req, res));
router.get('/:id/status', authMiddleware, (req, res) => controller.getEscrowStatus(req, res));
router.get('/:id/transactions', authMiddleware, (req, res) => controller.getEscrowTransactions(req, res));
router.get('/:id/razorpayx-details', authMiddleware, (req, res) => controller.getRazorpayXDetails(req, res));
router.get('/analytics/summary', authMiddleware, (req, res) => controller.getEscrowAnalytics(req, res));

// Write routes (with auth)
router.post('/', authMiddleware, validateCreateEscrow, (req, res) => controller.createEscrow(req, res));
router.post('/:id/release', authMiddleware, validateReleaseEscrow, (req, res) => controller.releaseEscrow(req, res));
router.post('/:id/refund', authMiddleware, validateRefundEscrow, (req, res) => controller.refundEscrow(req, res));
router.post('/:id/dispute', authMiddleware, (req, res) => controller.disputeEscrow(req, res));
router.post('/:id/extend', authMiddleware, (req, res) => controller.extendEscrow(req, res));
router.post('/:id/cancel', authMiddleware, (req, res) => controller.cancelEscrow(req, res));
router.post('/:id/sync-razorpayx', authMiddleware, (req, res) => controller.syncRazorpayX(req, res));

// Admin routes (with role-based access)
router.post('/:id/resolve-dispute', authMiddleware, roleMiddleware, (req, res) => controller.resolveDispute(req, res));

export default router; 