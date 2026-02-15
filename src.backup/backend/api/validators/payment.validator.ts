import Joi from 'joi';

export const createPaymentSchema = Joi.object({
  amount: Joi.number().positive().required(),
  currency: Joi.string().valid('INR', 'USD', 'EUR', 'GBP').default('INR'),
  method: Joi.string().valid('razorpayx', 'bank_transfer', 'upi', 'card').required(),
  description: Joi.string().max(500).required(),
  metadata: Joi.object().optional(),
  callbackUrl: Joi.string().uri().optional(),
  returnUrl: Joi.string().uri().optional()
});

export const paymentWebhookSchema = Joi.object({
  event: Joi.string().required(),
  payload: Joi.object({
    payment: Joi.object({
      id: Joi.string().required(),
      amount: Joi.number().required(),
      currency: Joi.string().required(),
      status: Joi.string().required(),
      method: Joi.string().required(),
      description: Joi.string().optional(),
      email: Joi.string().email().optional(),
      contact: Joi.string().optional(),
      notes: Joi.object().optional(),
      created_at: Joi.number().required()
    }).required(),
    entity: Joi.string().valid('payment').required()
  }).required()
});

export const razorpayXPaymentSchema = Joi.object({
  amount: Joi.number().positive().required(),
  currency: Joi.string().valid('INR', 'USD', 'EUR', 'GBP').default('INR'),
  description: Joi.string().max(500).required(),
  callbackUrl: Joi.string().uri().required(),
  returnUrl: Joi.string().uri().optional(),
  notes: Joi.object().optional(),
  prefill: Joi.object({
    name: Joi.string().optional(),
    email: Joi.string().email().optional(),
    contact: Joi.string().optional()
  }).optional()
});

export const paymentVerificationSchema = Joi.object({
  paymentId: Joi.string().required(),
  signature: Joi.string().required(),
  orderId: Joi.string().optional()
});

export const capturePaymentSchema = Joi.object({
  amount: Joi.number().positive().required(),
  currency: Joi.string().valid('INR', 'USD', 'EUR', 'GBP').optional(),
  receipt: Joi.string().optional(),
  notes: Joi.object().optional()
});

export const refundPaymentSchema = Joi.object({
  amount: Joi.number().positive().required(),
  speed: Joi.string().valid('normal', 'optimum').default('normal'),
  notes: Joi.object().optional(),
  receipt: Joi.string().optional()
});

export const addPaymentMethodSchema = Joi.object({
  type: Joi.string().valid('bank_account', 'card', 'upi').required(),
  details: Joi.object({
    // Bank account details
    accountNumber: Joi.string().when('type', {
      is: 'bank_account',
      then: Joi.required()
    }),
    ifscCode: Joi.string().when('type', {
      is: 'bank_account',
      then: Joi.required()
    }),
    accountHolderName: Joi.string().when('type', {
      is: 'bank_account',
      then: Joi.required()
    }),
    // Card details
    cardNumber: Joi.string().when('type', {
      is: 'card',
      then: Joi.required()
    }),
    expiryMonth: Joi.string().when('type', {
      is: 'card',
      then: Joi.required()
    }),
    expiryYear: Joi.string().when('type', {
      is: 'card',
      then: Joi.required()
    }),
    cvv: Joi.string().when('type', {
      is: 'card',
      then: Joi.required()
    }),
    // UPI details
    upiId: Joi.string().when('type', {
      is: 'upi',
      then: Joi.required()
    })
  }).required()
});

export function validateCreatePayment(req: any, res: any, next: any) {
  const { error } = createPaymentSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: error.details[0].message 
    });
  }
  next();
}

export function validatePaymentWebhook(req: any, res: any, next: any) {
  const { error } = paymentWebhookSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: error.details[0].message 
    });
  }
  next();
}

export function validateRazorpayXPayment(req: any, res: any, next: any) {
  const { error } = razorpayXPaymentSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: error.details[0].message 
    });
  }
  next();
}

export function validatePaymentVerification(req: any, res: any, next: any) {
  const { error } = paymentVerificationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: error.details[0].message 
    });
  }
  next();
}

export function validateCapturePayment(req: any, res: any, next: any) {
  const { error } = capturePaymentSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: error.details[0].message 
    });
  }
  next();
}

export function validateRefundPayment(req: any, res: any, next: any) {
  const { error } = refundPaymentSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: error.details[0].message 
    });
  }
  next();
}

export function validateAddPaymentMethod(req: any, res: any, next: any) {
  const { error } = addPaymentMethodSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: error.details[0].message 
    });
  }
  next();
} 