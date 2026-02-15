import { Router } from 'express';
import { SupplierController } from '../controllers/supplier.controller';
import { validateCreateSupplier, validateUpdateSupplier, validateSupplierSearch } from '../validators/supplier.validator';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';

const router = Router();
const controller = new SupplierController();

// Public routes (with auth)
router.get('/', authMiddleware, (req, res) => controller.getAllSuppliers(req, res));
router.get('/:id', authMiddleware, (req, res) => controller.getSupplier(req, res));
router.get('/:id/qualification', authMiddleware, (req, res) => controller.getSupplierQualification(req, res));
router.get('/:id/performance', authMiddleware, (req, res) => controller.getSupplierPerformance(req, res));
router.get('/:id/compliance', authMiddleware, (req, res) => controller.getSupplierCompliance(req, res));
router.get('/:id/risk-assessment', authMiddleware, (req, res) => controller.getRiskAssessment(req, res));

// Protected routes (with role-based access)
router.post('/', authMiddleware, roleMiddleware, validateCreateSupplier, (req, res) => controller.createSupplier(req, res));
router.put('/:id', authMiddleware, roleMiddleware, validateUpdateSupplier, (req, res) => controller.updateSupplier(req, res));
router.delete('/:id', authMiddleware, roleMiddleware, (req, res) => controller.deleteSupplier(req, res));
router.post('/:id/qualify', authMiddleware, roleMiddleware, (req, res) => controller.qualifySupplier(req, res));

// Search route
router.post('/search', authMiddleware, validateSupplierSearch, (req, res) => controller.searchSuppliers(req, res));

export default router; 