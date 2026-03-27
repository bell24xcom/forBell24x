import { Router } from 'express';
import { isAuthenticated, isAuthorized } from '../middleware/auth';
import { asyncHandler } from '../utils/async-handler';
import { m1exchangeService } from '../services/financial/m1exchange';
import { db } from '../db';
import { milestones, earlyPayments } from '../../src/db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import { createFinancialNotification } from '../../src/websocket/server';
import { getEscrowService } from '../services/escrow';

// Input validation schemas
const earlyPaymentRequestSchema = z.object({
  requestedAmount: z.number().positive('Amount must be positive'),
  remarks: z.string().optional()
});

const updateStatusSchema = z.object({
  status: z.enum(['requested', 'approved', 'processed', 'completed', 'rejected']),
  remarks: z.string().optional()
});

const router = Router();

/**
 * @route GET /api/m1exchange/status
 * @desc Check M1 Exchange service status
 * @access Public
 */
router.get('/status', asyncHandler(async (req, res) => {
  const status = await m1exchangeService.checkServiceStatus();
  res.json({ status });
}));

/**
 * @route POST /api/m1exchange/early-payment/:milestoneId
 * @desc Request early payment for a milestone
 * @access Private (Suppliers only)
 */
router.post('/early-payment/:milestoneId', 
  isAuthenticated, 
  isAuthorized(['supplier']),
  asyncHandler(async (req, res) => {
    const milestoneId = parseInt(req.params.milestoneId);
    const supplierId = req.user.supplierId;
    
    if (!milestoneId || isNaN(milestoneId)) {
      return res.status(400).json({ error: 'Invalid milestone ID' });
    }
    
    // Validate request body
    const validationResult = earlyPaymentRequestSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Invalid request data', 
        details: validationResult.error.errors 
      });
    }
    
    const { requestedAmount, remarks } = validationResult.data;
    
    try {
      // Check milestone eligibility
      const eligibility = await m1exchangeService.checkMilestoneEligibility(milestoneId, supplierId);
      
      if (!eligibility.eligible) {
        return res.status(400).json({ 
          error: 'Milestone not eligible for early payment', 
          details: eligibility.reason 
        });
      }
      
      // Process early payment request
      const earlyPayment = await m1exchangeService.requestEarlyPayment(
        milestoneId, 
        supplierId, 
        requestedAmount, 
        remarks
      );
      
      // Create notification
      await createFinancialNotification(
        'Early Payment Requested', 
        `Early payment of ₹${requestedAmount.toLocaleString()} requested for milestone #${milestoneId}`, 
        {
          userId: req.user.id,
          type: 'early_payment_requested',
          category: 'milestone',
          milestoneId,
          earlyPaymentId: earlyPayment.id,
          amount: requestedAmount,
          severity: 'info'
        }
      );
      
      res.status(201).json(earlyPayment);
    } catch (error) {
      console.error('Error requesting early payment:', error);
      res.status(500).json({ 
        error: 'Failed to process early payment request', 
        message: error.message 
      });
    }
  })
);

/**
 * @route GET /api/m1exchange/transactions/:transactionId
 * @desc Get transaction details by ID
 * @access Private
 */
router.get('/transactions/:transactionId', 
  isAuthenticated,
  asyncHandler(async (req, res) => {
    const transactionId = parseInt(req.params.transactionId);
    
    if (!transactionId || isNaN(transactionId)) {
      return res.status(400).json({ error: 'Invalid transaction ID' });
    }
    
    try {
      const transaction = await m1exchangeService.getTransactionById(transactionId);
      
      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }
      
      // Check if user has permission to view this transaction
      if (req.user.role !== 'admin' && 
          req.user.supplierId !== transaction.supplierId && 
          req.user.buyerId !== transaction.buyerId) {
        return res.status(403).json({ error: 'Not authorized to view this transaction' });
      }
      
      res.json(transaction);
    } catch (error) {
      console.error('Error fetching transaction:', error);
      res.status(500).json({ 
        error: 'Failed to retrieve transaction', 
        message: error.message 
      });
    }
  })
);

/**
 * @route GET /api/m1exchange/transactions/supplier/:supplierId
 * @desc Get all transactions for a supplier
 * @access Private
 */
router.get('/transactions/supplier/:supplierId', 
  isAuthenticated,
  asyncHandler(async (req, res) => {
    const supplierId = parseInt(req.params.supplierId);
    
    if (!supplierId || isNaN(supplierId)) {
      return res.status(400).json({ error: 'Invalid supplier ID' });
    }
    
    // Check authorization
    if (req.user.role !== 'admin' && req.user.supplierId !== supplierId) {
      return res.status(403).json({ error: 'Not authorized to view these transactions' });
    }
    
    try {
      const transactions = await m1exchangeService.getTransactionsBySupplier(supplierId);
      res.json(transactions);
    } catch (error) {
      console.error('Error fetching supplier transactions:', error);
      res.status(500).json({ 
        error: 'Failed to retrieve transactions', 
        message: error.message 
      });
    }
  })
);

/**
 * @route PATCH /api/m1exchange/transactions/:transactionId/status
 * @desc Update transaction status
 * @access Private (Admin or Buyer)
 */
router.patch('/transactions/:transactionId/status', 
  isAuthenticated,
  isAuthorized(['admin', 'buyer']),
  asyncHandler(async (req, res) => {
    const transactionId = parseInt(req.params.transactionId);
    
    if (!transactionId || isNaN(transactionId)) {
      return res.status(400).json({ error: 'Invalid transaction ID' });
    }
    
    // Validate request body
    const validationResult = updateStatusSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Invalid request data', 
        details: validationResult.error.errors 
      });
    }
    
    const { status, remarks } = validationResult.data;
    
    try {
      // Get transaction to check if user has permission
      const transaction = await m1exchangeService.getTransactionById(transactionId);
      
      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }
      
      // For buyers, check if they are associated with this transaction
      if (req.user.role === 'buyer' && req.user.buyerId !== transaction.buyerId) {
        return res.status(403).json({ error: 'Not authorized to update this transaction' });
      }
      
      // Update transaction status
      const updatedTransaction = await m1exchangeService.updateTransactionStatus(
        transactionId, 
        status, 
        remarks
      );
      
      // Create notification for supplier
      await createFinancialNotification(
        `Early Payment ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        `Your early payment request for milestone #${transaction.milestoneId} has been ${status}`,
        {
          userId: transaction.supplierId,
          type: `early_payment_${status}`,
          category: 'milestone',
          milestoneId: transaction.milestoneId,
          earlyPaymentId: transactionId,
          amount: transaction.requestedAmount,
          severity: status === 'approved' || status === 'completed' ? 'success' : 
                   status === 'rejected' ? 'error' : 'info'
        }
      );
      
      res.json(updatedTransaction);
    } catch (error) {
      console.error('Error updating transaction status:', error);
      res.status(500).json({ 
        error: 'Failed to update transaction status', 
        message: error.message 
      });
    }
  })
);

/**
 * @route GET /api/m1exchange/reports/payments
 * @desc Generate payment report
 * @access Private (Admin)
 */
router.get('/reports/payments', 
  isAuthenticated,
  isAuthorized(['admin']),
  asyncHandler(async (req, res) => {
    const { startDate, endDate, status } = req.query;
    
    try {
      const report = await m1exchangeService.generatePaymentReport({
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        status: status as string
      });
      
      res.json(report);
    } catch (error) {
      console.error('Error generating payment report:', error);
      res.status(500).json({ 
        error: 'Failed to generate report', 
        message: error.message 
      });
    }
  })
);

/**
 * @route GET /api/m1exchange/eligible-milestones/:supplierId
 * @desc Get all milestones eligible for early payment for a supplier
 * @access Private (Supplier)
 */
router.get('/eligible-milestones/:supplierId', 
  isAuthenticated,
  asyncHandler(async (req, res) => {
    const supplierId = parseInt(req.params.supplierId);
    
    if (!supplierId || isNaN(supplierId)) {
      return res.status(400).json({ error: 'Invalid supplier ID' });
    }
    
    // Check authorization
    if (req.user.role !== 'admin' && req.user.supplierId !== supplierId) {
      return res.status(403).json({ error: 'Not authorized to view these milestones' });
    }
    
    try {
      const eligibleMilestones = await m1exchangeService.getEligibleMilestones(supplierId);
      res.json(eligibleMilestones);
    } catch (error) {
      console.error('Error fetching eligible milestones:', error);
      res.status(500).json({ 
        error: 'Failed to retrieve eligible milestones', 
        message: error.message 
      });
    }
  })
);

export default router;
