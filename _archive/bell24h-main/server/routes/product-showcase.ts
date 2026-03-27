import express from 'express';
import { body, param, query } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Import controllers from their implementation file
import {
  createProductShowcase,
  getProductShowcase,
  updateProductShowcase,
  deleteProductShowcase,
  listProductShowcases,
  getProductShowcaseAnalytics
} from '../controllers/productShowcaseController';

// Create a new product showcase
router.post(
  '/',
  authenticate,
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('productId').isUUID().withMessage('Valid product ID is required'),
    body('description').optional(),
    body('videoUrl').isURL().withMessage('Valid video URL is required'),
    body('thumbnailUrl').isURL().withMessage('Valid thumbnail URL is required'),
  ],
  validateRequest,
  createProductShowcase
);

// Get a product showcase by ID
router.get(
  '/:id',
  authenticate,
  [
    param('id').isUUID().withMessage('Invalid showcase ID'),
  ],
  validateRequest,
  getProductShowcase
);

// Update a product showcase
router.patch(
  '/:id',
  authenticate,
  [
    param('id').isUUID().withMessage('Invalid showcase ID'),
    body('title').optional(),
    body('description').optional(),
    body('videoUrl').optional().isURL().withMessage('Valid video URL is required'),
    body('thumbnailUrl').optional().isURL().withMessage('Valid thumbnail URL is required'),
  ],
  validateRequest,
  updateProductShowcase
);

// Delete a product showcase
router.delete(
  '/:id',
  authenticate,
  [
    param('id').isUUID().withMessage('Invalid showcase ID'),
  ],
  validateRequest,
  deleteProductShowcase
);

// List product showcases with filtering
router.get(
  '/',
  authenticate,
  [
    query('productId').optional().isUUID().withMessage('Invalid product ID'),
    query('companyId').optional().isUUID().withMessage('Invalid company ID'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  ],
  validateRequest,
  listProductShowcases
);

// Get analytics for a product showcase
router.get(
  '/:id/analytics',
  authenticate,
  [
    param('id').isUUID().withMessage('Invalid showcase ID'),
  ],
  validateRequest,
  getProductShowcaseAnalytics
);

export default router;
