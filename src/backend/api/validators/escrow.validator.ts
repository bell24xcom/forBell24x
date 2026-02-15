import Joi from 'joi';

export const createEscrowSchema = Joi.object({
  rfqId: Joi.string().required(),
  buyerId: Joi.string().required(),
  supplierId: Joi.string().required(),
  amount: Joi.number().positive().required(),
  currency: Joi.string().valid('INR', 'USD', 'EUR', 'GBP').default('INR'),
  terms: Joi.string().max(1000).required(),
  deadline: Joi.date().iso().greater('now').required(),
  description: Joi.string().max(500).optional(),
  metadata: Joi.object().optional()
});

export const releaseEscrowSchema = Joi.object({
  reason: Joi.string().max(500).required(),
  evidence: Joi.array().items(Joi.string()).optional(),
  amount: Joi.number().positive().optional(),
  description: Joi.string().max(500).optional()
});

export const refundEscrowSchema = Joi.object({
  reason: Joi.string().max(500).required(),
  evidence: Joi.array().items(Joi.string()).optional(),
  amount: Joi.number().positive().optional(),
  description: Joi.string().max(500).optional()
});

export const disputeEscrowSchema = Joi.object({
  reason: Joi.string().max(500).required(),
  description: Joi.string().max(2000).required(),
  evidence: Joi.array().items(Joi.string()).min(1).required(),
  requestedAction: Joi.string().valid('refund', 'partial_refund', 'release', 'mediation').required(),
  amount: Joi.number().positive().optional()
});

export const extendEscrowSchema = Joi.object({
  newDeadline: Joi.date().iso().greater('now').required(),
  reason: Joi.string().max(500).required(),
  additionalTerms: Joi.string().max(1000).optional()
});

export const cancelEscrowSchema = Joi.object({
  reason: Joi.string().max(500).required(),
  evidence: Joi.array().items(Joi.string()).optional(),
  refundAmount: Joi.number().positive().optional()
});

export function validateCreateEscrow(req: any, res: any, next: any) {
  const { error } = createEscrowSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: error.details[0].message 
    });
  }
  next();
}

export function validateReleaseEscrow(req: any, res: any, next: any) {
  const { error } = releaseEscrowSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: error.details[0].message 
    });
  }
  next();
}

export function validateRefundEscrow(req: any, res: any, next: any) {
  const { error } = refundEscrowSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: error.details[0].message 
    });
  }
  next();
}

export function validateDisputeEscrow(req: any, res: any, next: any) {
  const { error } = disputeEscrowSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: error.details[0].message 
    });
  }
  next();
}

export function validateExtendEscrow(req: any, res: any, next: any) {
  const { error } = extendEscrowSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: error.details[0].message 
    });
  }
  next();
}

export function validateCancelEscrow(req: any, res: any, next: any) {
  const { error } = cancelEscrowSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: error.details[0].message 
    });
  }
  next();
} 