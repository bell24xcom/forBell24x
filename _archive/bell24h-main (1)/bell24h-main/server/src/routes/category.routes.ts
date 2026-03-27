import { Router } from 'express';
import {
  getCategoryTree,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/category.controller.js';
import { protect } from '../auth.js';
import { checkAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// Public route to get the category tree (e.g., for homepage display)
router.get('/', getCategoryTree);

// Admin routes - protected and for admins only
router.get('/all', protect, checkAdmin, getAllCategories);
router.post('/', protect, checkAdmin, createCategory);
router.put('/:id', protect, checkAdmin, updateCategory);
router.delete('/:id', protect, checkAdmin, deleteCategory);

export default router; 