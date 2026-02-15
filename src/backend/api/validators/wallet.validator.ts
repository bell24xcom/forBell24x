import Joi from 'joi';

export const createWalletSchema = Joi.object({
  userId: Joi.string().required(),
  currency: Joi.string().valid('INR', 'USD', 'EUR', 'GBP').default('INR'),
  type: Joi.string().valid('personal', 'business', 'escrow').default('personal'),
  description: Joi.string().max(500).optional(),
  metadata: Joi.object().optional()
});

export const depositSchema = Joi.object({
  amount: Joi.number().positive().required(),
  currency: Joi.string().valid('INR', 'USD', 'EUR', 'GBP').default('INR'),
  method: Joi.string().valid('bank_transfer', 'upi', 'card', 'razorpayx').required(),
  reference: Joi.string().optional(),
  description: Joi.string().max(500).optional(),
  metadata: Joi.object().optional()
});

export const withdrawSchema = Joi.object({
  amount: Joi.number().positive().required(),
  currency: Joi.string().valid('INR', 'USD', 'EUR', 'GBP').default('INR'),
  method: Joi.string().valid('bank_transfer', 'upi', 'razorpayx').required(),
  accountDetails: Joi.object({
    accountNumber: Joi.string().when('method', {
      is: 'bank_transfer',
      then: Joi.required()
    }),
    ifscCode: Joi.string().when('method', {
      is: 'bank_transfer',
      then: Joi.required()
    }),
    upiId: Joi.string().when('method', {
      is: 'upi',
      then: Joi.required()
    })
  }).required(),
  reference: Joi.string().optional(),
  description: Joi.string().max(500).optional()
});

export const transferSchema = Joi.object({
  toWalletId: Joi.string().required(),
  amount: Joi.number().positive().required(),
  currency: Joi.string().valid('INR', 'USD', 'EUR', 'GBP').default('INR'),
  description: Joi.string().max(500).optional(),
  metadata: Joi.object().optional()
});

export function validateCreateWallet(req: any, res: any, next: any) {
  const { error } = createWalletSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: error.details[0].message 
    });
  }
  next();
}

export function validateDeposit(req: any, res: any, next: any) {
  const { error } = depositSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: error.details[0].message 
    });
  }
  next();
}

export function validateWithdraw(req: any, res: any, next: any) {
  const { error } = withdrawSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: error.details[0].message 
    });
  }
  next();
}

export function validateTransfer(req: any, res: any, next: any) {
  const { error } = transferSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: error.details[0].message 
    });
  }
  next();
} 