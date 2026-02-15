import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { validateAnalyticsQuery, validateExportRequest } from '../validators/analytics.validator';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';

const router = Router();
const controller = new AnalyticsController();

// Read routes (with auth)
router.get('/dashboard', authMiddleware, validateAnalyticsQuery, (req, res) => controller.getDashboardData(req, res));
router.get('/rfq/summary', authMiddleware, validateAnalyticsQuery, (req, res) => controller.getRFQSummary(req, res));
router.get('/supplier/performance', authMiddleware, validateAnalyticsQuery, (req, res) => controller.getSupplierPerformance(req, res));
router.get('/financial/summary', authMiddleware, validateAnalyticsQuery, (req, res) => controller.getFinancialSummary(req, res));
router.get('/user/activity', authMiddleware, validateAnalyticsQuery, (req, res) => controller.getUserActivity(req, res));
router.get('/market/trends', authMiddleware, validateAnalyticsQuery, (req, res) => controller.getMarketTrends(req, res));
router.get('/risk/assessment', authMiddleware, validateAnalyticsQuery, (req, res) => controller.getRiskAssessment(req, res));
router.get('/compliance/status', authMiddleware, validateAnalyticsQuery, (req, res) => controller.getComplianceStatus(req, res));
router.get('/revenue/analysis', authMiddleware, validateAnalyticsQuery, (req, res) => controller.getRevenueAnalysis(req, res));
router.get('/cost/analysis', authMiddleware, validateAnalyticsQuery, (req, res) => controller.getCostAnalysis(req, res));
router.get('/efficiency/metrics', authMiddleware, validateAnalyticsQuery, (req, res) => controller.getEfficiencyMetrics(req, res));
router.get('/predictions/forecast', authMiddleware, validateAnalyticsQuery, (req, res) => controller.getPredictions(req, res));
router.get('/export/:id/status', authMiddleware, (req, res) => controller.getExportStatus(req, res));
router.get('/export/:id/download', authMiddleware, (req, res) => controller.downloadExport(req, res));
router.get('/reports/custom', authMiddleware, (req, res) => controller.getCustomReports(req, res));
router.get('/alerts/active', authMiddleware, (req, res) => controller.getActiveAlerts(req, res));
router.get('/kpi/dashboard', authMiddleware, validateAnalyticsQuery, (req, res) => controller.getKPIDashboard(req, res));
router.get('/comparison/period', authMiddleware, (req, res) => controller.getPeriodComparison(req, res));

// Write routes (with role-based access)
router.post('/export', authMiddleware, roleMiddleware, validateExportRequest, (req, res) => controller.exportData(req, res));
router.post('/reports/schedule', authMiddleware, roleMiddleware, (req, res) => controller.scheduleReport(req, res));
router.post('/alerts/configure', authMiddleware, roleMiddleware, (req, res) => controller.configureAlerts(req, res));

export default router; 