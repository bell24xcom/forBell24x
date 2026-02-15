import { Router } from 'express';
import { WalletController } from '../controllers/wallet.controller';
import { validateCreateWallet, validateDeposit, validateWithdraw, validateTransfer } from '../validators/wallet.validator';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';

const router = Router();
const controller = new WalletController();

// Read routes (with auth)
router.get('/', authMiddleware, (req, res) => controller.getAllWallets(req, res));
router.get('/:id', authMiddleware, (req, res) => controller.getWallet(req, res));
router.get('/user/:userId', authMiddleware, (req, res) => controller.getUserWallet(req, res));
router.get('/:id/balance', authMiddleware, (req, res) => controller.getBalance(req, res));
router.get('/:id/transactions', authMiddleware, (req, res) => controller.getTransactions(req, res));
router.get('/:id/statement', authMiddleware, (req, res) => controller.getStatement(req, res));
router.get('/:id/razorpayx-account', authMiddleware, (req, res) => controller.getRazorpayXAccount(req, res));

// Write routes (with auth)
router.post('/', authMiddleware, roleMiddleware, validateCreateWallet, (req, res) => controller.createWallet(req, res));
router.post('/:id/deposit', authMiddleware, validateDeposit, (req, res) => controller.deposit(req, res));
router.post('/:id/withdraw', authMiddleware, validateWithdraw, (req, res) => controller.withdraw(req, res));
router.post('/:id/transfer', authMiddleware, validateTransfer, (req, res) => controller.transfer(req, res));
router.post('/:id/sync-razorpayx', authMiddleware, (req, res) => controller.syncRazorpayX(req, res));

// Admin routes (with role-based access)
router.post('/:id/freeze', authMiddleware, roleMiddleware, (req, res) => controller.freezeWallet(req, res));
router.post('/:id/unfreeze', authMiddleware, roleMiddleware, (req, res) => controller.unfreezeWallet(req, res));

export default router; 