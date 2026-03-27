/**
 * Financial Services API Controller
 * 
 * Handles API endpoints for Bell24H financial services including KredX and M1 Exchange
 * 
 * @module server/controllers/financial
 */

import express from 'express';
import { z } from 'zod';
import { isAuthenticated, isAuthorized } from '../middleware/auth.js';
import kredxService from '../services/financial/kredx.js';
import m1ExchangeService from '../services/financial/m1exchange.js';

const router = express.Router();

// Validation schemas
const invoiceSubmissionSchema = z.object({
  buyerId: z.number(),
  amount: z.number().positive(),
  dueDate: z.string().transform(val => new Date(val)),
  issueDate: z.string().transform(val => new Date(val)),
  invoiceNumber: z.string(),
  description: z.string(),
  attachmentUrl: z.string().optional()
});

const invoiceFinanceSchema = z.object({
  invoiceId: z.string()
});

const invoicePaymentSchema = z.object({
  invoiceId: z.string(),
  amount: z.number().positive()
});

const milestoneEligibilitySchema = z.object({
  milestoneId: z.string()
});

const earlyPaymentRequestSchema = z.object({
  milestoneId: z.string(),
  requestedAmount: z.number().positive(),
  reason: z.string().optional()
});

// Error handler middleware
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * @route GET /api/financial/health
 * @desc Health check for financial services
 * @access Public
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Financial services are operational',
    timestamp: new Date().toISOString(),
    services: ['KredX', 'M1Exchange']
  });
});

/**
 * @route POST /api/financial/kredx/evaluate-invoice
 * @desc Evaluate invoice for financing options
 * @access Private (supplier)
 */
router.post('/kredx/evaluate-invoice', 
  isAuthenticated, 
  isAuthorized(['supplier']),
  asyncHandler(async (req, res) => {
    const supplierId = req.user.id;
    const validatedData = invoiceSubmissionSchema.parse(req.body);
    
    // Add supplierId to the invoice data
    const invoiceData = {
      ...validatedData,
      supplierId
    };
    
    const financingOptions = await kredxService.evaluateInvoice(invoiceData);
    res.status(200).json(financingOptions);
  })
);

/**
 * @route POST /api/financial/kredx/finance-invoice
 * @desc Submit invoice for financing
 * @access Private (supplier)
 */
router.post('/kredx/finance-invoice', 
  isAuthenticated, 
  isAuthorized(['supplier']),
  asyncHandler(async (req, res) => {
    const supplierId = req.user.id;
    const { invoiceId } = invoiceFinanceSchema.parse(req.body);
    
    const result = await kredxService.financeInvoice(invoiceId, supplierId);
    res.status(200).json(result);
  })
);

/**
 * @route POST /api/financial/kredx/track-payment
 * @desc Track buyer payment for a financed invoice
 * @access Private (buyer)
 */
router.post('/kredx/track-payment', 
  isAuthenticated, 
  isAuthorized(['buyer']),
  asyncHandler(async (req, res) => {
    const buyerId = req.user.id;
    const { invoiceId, amount } = invoicePaymentSchema.parse(req.body);
    
    const result = await kredxService.trackInvoicePayment(invoiceId, buyerId, amount);
    res.status(200).json(result);
  })
);

/**
 * @route GET /api/financial/kredx/history
 * @desc Get supplier's financing history
 * @access Private (supplier)
 */
router.get('/kredx/history', 
  isAuthenticated, 
  isAuthorized(['supplier']),
  asyncHandler(async (req, res) => {
    const supplierId = req.user.id;
    const history = await kredxService.getFinancingHistory(supplierId);
    res.status(200).json(history);
  })
);

/**
 * @route POST /api/financial/m1/check-eligibility
 * @desc Check milestone eligibility for early payment
 * @access Private (supplier)
 */
router.post('/m1/check-eligibility', 
  isAuthenticated, 
  isAuthorized(['supplier']),
  asyncHandler(async (req, res) => {
    const supplierId = req.user.id;
    const { milestoneId } = milestoneEligibilitySchema.parse(req.body);
    
    const eligibility = await m1ExchangeService.checkMilestoneEligibility(milestoneId, supplierId);
    res.status(200).json(eligibility);
  })
);

/**
 * @route POST /api/financial/m1/request-payment
 * @desc Request early payment for eligible milestone
 * @access Private (supplier)
 */
router.post('/m1/request-payment', 
  isAuthenticated, 
  isAuthorized(['supplier']),
  asyncHandler(async (req, res) => {
    const supplierId = req.user.id;
    const requestData = earlyPaymentRequestSchema.parse(req.body);
    
    const result = await m1ExchangeService.processEarlyPayment({
      ...requestData,
      supplierId
    });
    
    res.status(200).json(result);
  })
);

/**
 * @route GET /api/financial/m1/history
 * @desc Get supplier's early payment history
 * @access Private (supplier)
 */
router.get('/m1/history', 
  isAuthenticated, 
  isAuthorized(['supplier']),
  asyncHandler(async (req, res) => {
    const supplierId = req.user.id;
    const history = await m1ExchangeService.getPaymentHistory(supplierId);
    res.status(200).json(history);
  })
);

/**
 * @route GET /api/financial/m1/savings
 * @desc Calculate supplier's savings from using M1 Exchange
 * @access Private (supplier)
 */
router.get('/m1/savings', 
  isAuthenticated, 
  isAuthorized(['supplier']),
  asyncHandler(async (req, res) => {
    const supplierId = req.user.id;
    const savings = await m1ExchangeService.calculateSupplierSavings(supplierId);
    res.status(200).json(savings);
  })
);

/**
 * @route GET /api/financial/compare
 * @desc Compare available financial services
 * @access Private
 */
router.get('/compare', 
  isAuthenticated,
  asyncHandler(async (req, res) => {
    // Provide comparison details between KredX and M1 Exchange
    res.status(200).json({
      kredx: {
        name: 'KredX',
        description: 'Invoice discounting and financing service',
        bestFor: 'Suppliers with large numbers of outstanding invoices',
        feeStructure: '0.5-2% based on buyer\'s credit rating and invoice terms',
        advantages: [
          'Convert unpaid invoices into immediate cash',
          'Early payment discounts for buyers',
          'Supply chain financing options',
          'Automated invoice processing',
          'Credit risk assessment'
        ]
      },
      m1Exchange: {
        name: 'M1 Exchange',
        description: 'Early milestone payment service',
        bestFor: 'Project-based work with defined milestones',
        feeStructure: '1-2% of milestone amount',
        advantages: [
          'Milestone-based early payments',
          'Flexible payment options',
          'Escrow integration',
          'Transparent transaction history',
          'Payment reports'
        ]
      },
      recommendations: {
        useKredxWhen: [
          'You have multiple outstanding invoices',
          'You need significant working capital',
          'Your payment terms are 45+ days',
          'You prefer a structured financing approach',
          'You want to offer early payment incentives to buyers'
        ],
        useM1When: [
          'You work on milestone-based projects',
          'You need immediate payment after completing deliverables',
          'Your payment is already in escrow',
          'You prefer simplicity and direct integration',
          'You want to maintain full visibility in your Bell24H wallet'
        ]
      }
    });
  })
);

export default router;
