import { Router } from 'express';
import { LogisticsController } from '../controllers/logistics.controller';
import { validateCreateShipment, validateUpdateShipment, validateTrackingQuery } from '../validators/logistics.validator';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';

const router = Router();
const controller = new LogisticsController();

// Read routes (with auth)
router.get('/shipments', authMiddleware, (req, res) => controller.getAllShipments(req, res));
router.get('/shipments/:id', authMiddleware, (req, res) => controller.getShipment(req, res));
router.get('/shipments/:id/tracking', authMiddleware, (req, res) => controller.getShipmentTracking(req, res));
router.get('/tracking/:trackingNumber', authMiddleware, validateTrackingQuery, (req, res) => controller.trackByNumber(req, res));
router.get('/carriers', authMiddleware, (req, res) => controller.getCarriers(req, res));
router.get('/carriers/:id/services', authMiddleware, (req, res) => controller.getCarrierServices(req, res));
router.get('/shipments/:id/label/download', authMiddleware, (req, res) => controller.downloadLabel(req, res));
router.get('/warehouses', authMiddleware, (req, res) => controller.getWarehouses(req, res));
router.get('/warehouses/:id/inventory', authMiddleware, (req, res) => controller.getWarehouseInventory(req, res));
router.get('/routes/optimize', authMiddleware, (req, res) => controller.optimizeRoutes(req, res));
router.get('/analytics/shipping', authMiddleware, (req, res) => controller.getShippingAnalytics(req, res));
router.get('/reports/delivery', authMiddleware, (req, res) => controller.getDeliveryReport(req, res));
router.get('/zones/shipping', authMiddleware, (req, res) => controller.getShippingZones(req, res));
router.get('/zones/:zoneId/rates', authMiddleware, (req, res) => controller.getZoneRates(req, res));

// Write routes (with auth)
router.post('/shipments', authMiddleware, validateCreateShipment, (req, res) => controller.createShipment(req, res));
router.put('/shipments/:id', authMiddleware, validateUpdateShipment, (req, res) => controller.updateShipment(req, res));
router.post('/shipments/:id/track', authMiddleware, (req, res) => controller.updateTracking(req, res));
router.post('/rates/calculate', authMiddleware, (req, res) => controller.calculateRates(req, res));
router.post('/shipments/:id/label', authMiddleware, (req, res) => controller.generateLabel(req, res));
router.post('/shipments/:id/pickup', authMiddleware, (req, res) => controller.schedulePickup(req, res));
router.post('/shipments/:id/delivery', authMiddleware, (req, res) => controller.confirmDelivery(req, res));
router.post('/warehouses/:id/inventory/update', authMiddleware, (req, res) => controller.updateInventory(req, res));

// Webhook routes (no auth required)
router.post('/webhooks/carrier', (req, res) => controller.handleCarrierWebhook(req, res));

export default router; 