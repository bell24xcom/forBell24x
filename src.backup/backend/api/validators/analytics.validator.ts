import Joi from 'joi';

export const analyticsQuerySchema = Joi.object({
  period: Joi.string().valid('7d', '30d', '90d', '1y', 'custom').default('30d'),
  startDate: Joi.date().iso().when('period', {
    is: 'custom',
    then: Joi.required()
  }),
  endDate: Joi.date().iso().when('period', {
    is: 'custom',
    then: Joi.required()
  }),
  userId: Joi.string().optional(),
  category: Joi.string().optional(),
  status: Joi.string().optional(),
  groupBy: Joi.string().valid('day', 'week', 'month', 'quarter', 'year').default('day'),
  limit: Joi.number().integer().min(1).max(1000).default(100),
  offset: Joi.number().integer().min(0).default(0)
});

export const exportRequestSchema = Joi.object({
  type: Joi.string().valid(
    'rfq_summary',
    'supplier_performance',
    'financial_summary',
    'user_activity',
    'market_trends',
    'risk_assessment',
    'compliance_status',
    'revenue_analysis',
    'cost_analysis',
    'efficiency_metrics'
  ).required(),
  format: Joi.string().valid('csv', 'xlsx', 'pdf', 'json').default('csv'),
  period: Joi.string().valid('7d', '30d', '90d', '1y', 'custom').default('30d'),
  startDate: Joi.date().iso().when('period', {
    is: 'custom',
    then: Joi.required()
  }),
  endDate: Joi.date().iso().when('period', {
    is: 'custom',
    then: Joi.required()
  }),
  filters: Joi.object({
    userId: Joi.string().optional(),
    category: Joi.string().optional(),
    status: Joi.string().optional(),
    supplierId: Joi.string().optional(),
    rfqId: Joi.string().optional(),
    minAmount: Joi.number().optional(),
    maxAmount: Joi.number().optional(),
    location: Joi.string().optional()
  }).optional(),
  includeCharts: Joi.boolean().default(false),
  includeRawData: Joi.boolean().default(true)
});

export const reportScheduleSchema = Joi.object({
  name: Joi.string().max(100).required(),
  type: Joi.string().valid(
    'rfq_summary',
    'supplier_performance',
    'financial_summary',
    'user_activity',
    'market_trends',
    'risk_assessment',
    'compliance_status',
    'revenue_analysis',
    'cost_analysis',
    'efficiency_metrics'
  ).required(),
  frequency: Joi.string().valid('daily', 'weekly', 'monthly', 'quarterly').required(),
  schedule: Joi.object({
    dayOfWeek: Joi.number().min(0).max(6).when('frequency', {
      is: 'weekly',
      then: Joi.required()
    }),
    dayOfMonth: Joi.number().min(1).max(31).when('frequency', {
      is: 'monthly',
      then: Joi.required()
    }),
    month: Joi.number().min(1).max(12).when('frequency', {
      is: 'quarterly',
      then: Joi.required()
    }),
    time: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).default('09:00')
  }).required(),
  recipients: Joi.array().items(Joi.string().email()).min(1).required(),
  format: Joi.string().valid('csv', 'xlsx', 'pdf').default('pdf'),
  filters: Joi.object().optional(),
  isActive: Joi.boolean().default(true)
});

export const alertConfigSchema = Joi.object({
  name: Joi.string().max(100).required(),
  type: Joi.string().valid(
    'rfq_created',
    'payment_received',
    'escrow_released',
    'risk_threshold',
    'performance_decline',
    'compliance_issue',
    'system_error'
  ).required(),
  conditions: Joi.object({
    metric: Joi.string().required(),
    operator: Joi.string().valid('gt', 'gte', 'lt', 'lte', 'eq', 'neq').required(),
    value: Joi.alternatives().try(Joi.number(), Joi.string(), Joi.boolean()).required(),
    timeWindow: Joi.string().valid('1h', '6h', '24h', '7d', '30d').optional()
  }).required(),
  actions: Joi.array().items(Joi.object({
    type: Joi.string().valid('email', 'sms', 'push', 'webhook').required(),
    config: Joi.object({
      recipients: Joi.array().items(Joi.string().email()).when('type', {
        is: 'email',
        then: Joi.required()
      }),
      phoneNumbers: Joi.array().items(Joi.string()).when('type', {
        is: 'sms',
        then: Joi.required()
      }),
      webhookUrl: Joi.string().uri().when('type', {
        is: 'webhook',
        then: Joi.required()
      }),
      message: Joi.string().max(500).optional()
    }).required()
  })).min(1).required(),
  isActive: Joi.boolean().default(true),
  cooldown: Joi.number().integer().min(300).max(86400).default(3600) // 1 hour default
});

export function validateAnalyticsQuery(req: any, res: any, next: any) {
  const { error } = analyticsQuerySchema.validate(req.query);
  if (error) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: error.details[0].message 
    });
  }
  next();
}

export function validateExportRequest(req: any, res: any, next: any) {
  const { error } = exportRequestSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: error.details[0].message 
    });
  }
  next();
}

export function validateReportSchedule(req: any, res: any, next: any) {
  const { error } = reportScheduleSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: error.details[0].message 
    });
  }
  next();
}

export function validateAlertConfig(req: any, res: any, next: any) {
  const { error } = alertConfigSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: error.details[0].message 
    });
  }
  next();
} 