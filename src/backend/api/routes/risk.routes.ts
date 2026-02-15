import { Router } from 'express';
import { RiskController } from '../controllers/risk.controller';
import { validateRiskAssessment, validateRiskMitigation } from '../validators/risk.validator';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';

const router = Router();
const controller = new RiskController();

// Read routes (with auth)
router.get('/dashboard', authMiddleware, (req, res) => controller.getRiskDashboard(req, res));
router.get('/assessments', authMiddleware, (req, res) => controller.getAllAssessments(req, res));
router.get('/assessments/:id', authMiddleware, (req, res) => controller.getAssessment(req, res));
router.get('/supplier/:supplierId/assessment', authMiddleware, (req, res) => controller.getSupplierRiskAssessment(req, res));
router.get('/financial/analysis', authMiddleware, (req, res) => controller.getFinancialRiskAnalysis(req, res));
router.get('/operational/analysis', authMiddleware, (req, res) => controller.getOperationalRiskAnalysis(req, res));
router.get('/compliance/analysis', authMiddleware, (req, res) => controller.getComplianceRiskAnalysis(req, res));
router.get('/market/analysis', authMiddleware, (req, res) => controller.getMarketRiskAnalysis(req, res));
router.get('/mitigation/:id', authMiddleware, (req, res) => controller.getMitigationPlan(req, res));
router.get('/alerts', authMiddleware, (req, res) => controller.getRiskAlerts(req, res));
router.get('/scenarios', authMiddleware, (req, res) => controller.getRiskScenarios(req, res));
router.get('/metrics/trends', authMiddleware, (req, res) => controller.getRiskMetricsTrends(req, res));
router.get('/reports/summary', authMiddleware, (req, res) => controller.getRiskSummaryReport(req, res));
router.get('/reports/detailed', authMiddleware, (req, res) => controller.getDetailedRiskReport(req, res));
router.get('/explainability/:assessmentId', authMiddleware, (req, res) => controller.getRiskExplainability(req, res));

// Write routes (with auth)
router.post('/assessments', authMiddleware, validateRiskAssessment, (req, res) => controller.createAssessment(req, res));
router.put('/assessments/:id', authMiddleware, validateRiskAssessment, (req, res) => controller.updateAssessment(req, res));
router.post('/supplier/:supplierId/assess', authMiddleware, (req, res) => controller.assessSupplierRisk(req, res));
router.post('/mitigation', authMiddleware, validateRiskMitigation, (req, res) => controller.createMitigationPlan(req, res));
router.put('/mitigation/:id', authMiddleware, validateRiskMitigation, (req, res) => controller.updateMitigationPlan(req, res));
router.post('/mitigation/:id/execute', authMiddleware, (req, res) => controller.executeMitigationPlan(req, res));
router.post('/scenarios/simulate', authMiddleware, (req, res) => controller.simulateRiskScenario(req, res));

// Admin routes (with role-based access)
router.post('/alerts/configure', authMiddleware, roleMiddleware, (req, res) => controller.configureRiskAlerts(req, res));
router.post('/monitoring/start', authMiddleware, roleMiddleware, (req, res) => controller.startRiskMonitoring(req, res));
router.post('/monitoring/stop', authMiddleware, roleMiddleware, (req, res) => controller.stopRiskMonitoring(req, res));

export default router; 