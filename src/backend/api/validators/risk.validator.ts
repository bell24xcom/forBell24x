import Joi from 'joi';

export const riskAssessmentSchema = Joi.object({
  entityId: Joi.string().required(),
  entityType: Joi.string().valid('supplier', 'buyer', 'transaction', 'project').required(),
  riskFactors: Joi.object({
    financial: Joi.number().min(0).max(1).required(),
    operational: Joi.number().min(0).max(1).required(),
    compliance: Joi.number().min(0).max(1).required(),
    market: Joi.number().min(0).max(1).required(),
    reputation: Joi.number().min(0).max(1).optional(),
    technical: Joi.number().min(0).max(1).optional()
  }).required(),
  overallRisk: Joi.number().min(0).max(1).required(),
  riskLevel: Joi.string().valid('low', 'medium', 'high', 'critical').required(),
  recommendations: Joi.array().items(Joi.string().max(200)).min(1).required(),
  assessmentDate: Joi.date().iso().default(() => new Date().toISOString()),
  assessorId: Joi.string().required(),
  notes: Joi.string().max(1000).optional(),
  metadata: Joi.object().optional()
});

export const riskMitigationSchema = Joi.object({
  assessmentId: Joi.string().required(),
  actions: Joi.array().items(Joi.object({
    action: Joi.string().max(200).required(),
    description: Joi.string().max(500).optional(),
    priority: Joi.string().valid('low', 'medium', 'high', 'critical').required(),
    deadline: Joi.date().iso().greater('now').required(),
    assignedTo: Joi.string().optional(),
    status: Joi.string().valid('pending', 'in_progress', 'completed', 'cancelled').default('pending'),
    cost: Joi.number().positive().optional(),
    currency: Joi.string().valid('INR', 'USD', 'EUR', 'GBP').default('INR')
  })).min(1).required(),
  expectedOutcome: Joi.string().max(500).required(),
  targetRiskLevel: Joi.string().valid('low', 'medium', 'high', 'critical').required(),
  budget: Joi.number().positive().optional(),
  currency: Joi.string().valid('INR', 'USD', 'EUR', 'GBP').default('INR'),
  timeline: Joi.object({
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().greater(Joi.ref('startDate')).required()
  }).required()
});

export const riskScenarioSchema = Joi.object({
  name: Joi.string().max(100).required(),
  description: Joi.string().max(500).required(),
  scenarioType: Joi.string().valid('financial', 'operational', 'market', 'compliance', 'reputation').required(),
  probability: Joi.number().min(0).max(1).required(),
  impact: Joi.number().min(0).max(1).required(),
  timeframe: Joi.string().valid('immediate', 'short_term', 'medium_term', 'long_term').required(),
  triggers: Joi.array().items(Joi.string().max(200)).min(1).required(),
  affectedEntities: Joi.array().items(Joi.string()).min(1).required(),
  mitigationStrategies: Joi.array().items(Joi.string().max(300)).optional(),
  estimatedLoss: Joi.object({
    amount: Joi.number().positive().required(),
    currency: Joi.string().valid('INR', 'USD', 'EUR', 'GBP').default('INR'),
    type: Joi.string().valid('direct', 'indirect', 'opportunity').required()
  }).optional()
});

export const riskMonitoringConfigSchema = Joi.object({
  entityId: Joi.string().required(),
  entityType: Joi.string().valid('supplier', 'buyer', 'transaction', 'project').required(),
  metrics: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    type: Joi.string().valid('financial', 'operational', 'compliance', 'market').required(),
    threshold: Joi.number().required(),
    operator: Joi.string().valid('gt', 'gte', 'lt', 'lte', 'eq', 'neq').required(),
    frequency: Joi.string().valid('realtime', 'hourly', 'daily', 'weekly', 'monthly').required(),
    alertLevel: Joi.string().valid('info', 'warning', 'critical').required()
  })).min(1).required(),
  alerts: Joi.object({
    email: Joi.array().items(Joi.string().email()).optional(),
    sms: Joi.array().items(Joi.string()).optional(),
    webhook: Joi.string().uri().optional(),
    slack: Joi.string().optional()
  }).optional(),
  isActive: Joi.boolean().default(true)
});

export const supplierRiskAssessmentSchema = Joi.object({
  supplierId: Joi.string().required(),
  assessmentType: Joi.string().valid('initial', 'periodic', 'incident_based').required(),
  financialData: Joi.object({
    annualRevenue: Joi.number().positive().optional(),
    profitMargin: Joi.number().min(-1).max(1).optional(),
    debtRatio: Joi.number().min(0).max(1).optional(),
    cashFlow: Joi.number().optional(),
    creditRating: Joi.string().optional()
  }).optional(),
  operationalData: Joi.object({
    deliveryPerformance: Joi.number().min(0).max(1).optional(),
    qualityScore: Joi.number().min(0).max(1).optional(),
    responseTime: Joi.number().positive().optional(),
    capacityUtilization: Joi.number().min(0).max(1).optional()
  }).optional(),
  complianceData: Joi.object({
    certifications: Joi.array().items(Joi.string()).optional(),
    auditResults: Joi.array().items(Joi.object({
      type: Joi.string().required(),
      date: Joi.date().iso().required(),
      result: Joi.string().valid('pass', 'fail', 'conditional').required(),
      score: Joi.number().min(0).max(100).optional()
    })).optional(),
    violations: Joi.array().items(Joi.object({
      type: Joi.string().required(),
      date: Joi.date().iso().required(),
      severity: Joi.string().valid('low', 'medium', 'high', 'critical').required(),
      resolved: Joi.boolean().default(false)
    })).optional()
  }).optional(),
  marketData: Joi.object({
    marketPosition: Joi.string().valid('leader', 'challenger', 'follower', 'niche').optional(),
    marketShare: Joi.number().min(0).max(1).optional(),
    competitiveAdvantage: Joi.array().items(Joi.string()).optional(),
    industryTrends: Joi.array().items(Joi.string()).optional()
  }).optional()
});

export function validateRiskAssessment(req: any, res: any, next: any) {
  const { error } = riskAssessmentSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: error.details[0].message 
    });
  }
  next();
}

export function validateRiskMitigation(req: any, res: any, next: any) {
  const { error } = riskMitigationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: error.details[0].message 
    });
  }
  next();
}

export function validateRiskScenario(req: any, res: any, next: any) {
  const { error } = riskScenarioSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: error.details[0].message 
    });
  }
  next();
}

export function validateRiskMonitoringConfig(req: any, res: any, next: any) {
  const { error } = riskMonitoringConfigSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: error.details[0].message 
    });
  }
  next();
}

export function validateSupplierRiskAssessment(req: any, res: any, next: any) {
  const { error } = supplierRiskAssessmentSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: error.details[0].message 
    });
  }
  next();
} 