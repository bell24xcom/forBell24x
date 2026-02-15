import express from 'express';
import { body, param, query } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';
import { authenticate } from '../middleware/auth';
import {
  createRFQ,
  getRFQ,
  updateRFQ,
  listBuyerRFQs,
  listSupplierRFQs,
  getFilteredRFQs,
} from '../controllers/rfqController';

const router = express.Router();

// Create a new RFQ (Buyer)
router.post(
  '/',
  authenticate,
  [
    body('productId').notEmpty().withMessage('Product ID is required'),
    body('productName').notEmpty().withMessage('Product name is required'),
    body('quantity').isNumeric().withMessage('Quantity must be a number'),
    body('buyerName').notEmpty().withMessage('Your name is required'),
    body('buyerEmail').isEmail().withMessage('Valid email is required'),
    body('buyerCompany').notEmpty().withMessage('Company name is required'),
  ],
  validateRequest,
  createRFQ
);

// Get RFQ details
router.get(
  '/:id',
  authenticate,
  [
    param('id').isUUID().withMessage('Invalid RFQ ID'),
  ],
  validateRequest,
  getRFQ
);

// Update RFQ (Buyer or Supplier)
router.patch(
  '/:id',
  authenticate,
  [
    param('id').isUUID().withMessage('Invalid RFQ ID'),
    body('status')
      .optional()
      .isIn(['draft', 'submitted', 'quoted', 'expired', 'cancelled'])
      .withMessage('Invalid status'),
    body('quotedPrice')
      .optional()
      .isNumeric()
      .withMessage('Quoted price must be a number'),
    body('quotedCurrency')
      .optional()
      .isString()
      .isLength({ min: 3, max: 3 })
      .withMessage('Currency code must be 3 characters'),
  ],
  validateRequest,
  updateRFQ
);

// List buyer's RFQs
router.get(
  '/buyer/list',
  authenticate,
  [
    query('status')
      .optional()
      .isIn(['draft', 'submitted', 'quoted', 'expired', 'cancelled'])
      .withMessage('Invalid status'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('Limit must be between 1 and 50'),
  ],
  validateRequest,
  listBuyerRFQs
);

// List supplier's RFQs
router.get(
  '/supplier/list',
  authenticate,
  [
    query('status')
      .optional()
      .isIn(['submitted', 'quoted', 'expired', 'cancelled'])
      .withMessage('Invalid status'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('Limit must be between 1 and 50'),
  ],
  validateRequest,
  listSupplierRFQs
);

// Advanced Filtering Endpoint
router.get(
  '/filter',
  authenticate,
  [
    query('status').optional().isString(),
    query('creationDateStart').optional().isISO8601(),
    query('creationDateEnd').optional().isISO8601(),
    query('submissionDateStart').optional().isISO8601(),
    query('submissionDateEnd').optional().isISO8601(),
    query('clientName').optional().isString(),
    query('productCategory').optional().isString(),
    query('priceMin').optional().isNumeric(),
    query('priceMax').optional().isNumeric(),
    query('assignedUser').optional().isString(),
    query('supplierRiskScoreMin').optional().isNumeric(),
    query('supplierRiskScoreMax').optional().isNumeric(),
    query('location').optional().isString(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  validateRequest,
  getFilteredRFQs
);

export default router;
