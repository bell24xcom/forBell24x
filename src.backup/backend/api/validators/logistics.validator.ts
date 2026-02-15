import Joi from 'joi';

export const createShipmentSchema = Joi.object({
  rfqId: Joi.string().required(),
  carrier: Joi.string().required(),
  service: Joi.string().required(),
  origin: Joi.object({
    address: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    country: Joi.string().required(),
    postalCode: Joi.string().required(),
    contactName: Joi.string().optional(),
    contactPhone: Joi.string().optional(),
    contactEmail: Joi.string().email().optional()
  }).required(),
  destination: Joi.object({
    address: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    country: Joi.string().required(),
    postalCode: Joi.string().required(),
    contactName: Joi.string().optional(),
    contactPhone: Joi.string().optional(),
    contactEmail: Joi.string().email().optional()
  }).required(),
  packages: Joi.array().items(Joi.object({
    weight: Joi.number().positive().required(),
    dimensions: Joi.object({
      length: Joi.number().positive().required(),
      width: Joi.number().positive().required(),
      height: Joi.number().positive().required(),
      unit: Joi.string().valid('cm', 'inch').default('cm')
    }).required(),
    description: Joi.string().max(200).required(),
    value: Joi.number().positive().optional(),
    currency: Joi.string().valid('INR', 'USD', 'EUR', 'GBP').default('INR')
  })).min(1).required(),
  insurance: Joi.object({
    amount: Joi.number().positive().optional(),
    type: Joi.string().valid('basic', 'premium', 'full').default('basic')
  }).optional(),
  specialInstructions: Joi.string().max(500).optional(),
  expectedDelivery: Joi.date().iso().greater('now').optional()
});

export const updateShipmentSchema = Joi.object({
  status: Joi.string().valid('pending', 'in_transit', 'delivered', 'failed', 'returned').optional(),
  trackingNumber: Joi.string().optional(),
  carrier: Joi.string().optional(),
  service: Joi.string().optional(),
  origin: Joi.object({
    address: Joi.string().optional(),
    city: Joi.string().optional(),
    state: Joi.string().optional(),
    country: Joi.string().optional(),
    postalCode: Joi.string().optional(),
    contactName: Joi.string().optional(),
    contactPhone: Joi.string().optional(),
    contactEmail: Joi.string().email().optional()
  }).optional(),
  destination: Joi.object({
    address: Joi.string().optional(),
    city: Joi.string().optional(),
    state: Joi.string().optional(),
    country: Joi.string().optional(),
    postalCode: Joi.string().optional(),
    contactName: Joi.string().optional(),
    contactPhone: Joi.string().optional(),
    contactEmail: Joi.string().email().optional()
  }).optional(),
  specialInstructions: Joi.string().max(500).optional(),
  expectedDelivery: Joi.date().iso().optional()
});

export const trackingQuerySchema = Joi.object({
  trackingNumber: Joi.string().required(),
  carrier: Joi.string().optional(),
  includeHistory: Joi.boolean().default(true),
  includeEstimatedDelivery: Joi.boolean().default(true)
});

export const rateCalculationSchema = Joi.object({
  origin: Joi.object({
    postalCode: Joi.string().required(),
    country: Joi.string().required(),
    city: Joi.string().optional()
  }).required(),
  destination: Joi.object({
    postalCode: Joi.string().required(),
    country: Joi.string().required(),
    city: Joi.string().optional()
  }).required(),
  packages: Joi.array().items(Joi.object({
    weight: Joi.number().positive().required(),
    dimensions: Joi.object({
      length: Joi.number().positive().required(),
      width: Joi.number().positive().required(),
      height: Joi.number().positive().required(),
      unit: Joi.string().valid('cm', 'inch').default('cm')
    }).required(),
    description: Joi.string().max(200).optional()
  })).min(1).required(),
  service: Joi.string().optional(),
  insurance: Joi.object({
    amount: Joi.number().positive().optional(),
    type: Joi.string().valid('basic', 'premium', 'full').default('basic')
  }).optional(),
  deliveryDate: Joi.date().iso().greater('now').optional()
});

export const pickupRequestSchema = Joi.object({
  pickupDate: Joi.date().iso().greater('now').required(),
  pickupTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
  specialInstructions: Joi.string().max(500).optional(),
  contactPerson: Joi.object({
    name: Joi.string().required(),
    phone: Joi.string().required(),
    email: Joi.string().email().optional()
  }).required()
});

export const deliveryConfirmationSchema = Joi.object({
  deliveredAt: Joi.date().iso().required(),
  receivedBy: Joi.string().required(),
  signature: Joi.string().optional(),
  notes: Joi.string().max(500).optional(),
  condition: Joi.string().valid('good', 'damaged', 'partial').default('good'),
  photos: Joi.array().items(Joi.string()).optional()
});

export function validateCreateShipment(req: any, res: any, next: any) {
  const { error } = createShipmentSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: error.details[0].message 
    });
  }
  next();
}

export function validateUpdateShipment(req: any, res: any, next: any) {
  const { error } = updateShipmentSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: error.details[0].message 
    });
  }
  next();
}

export function validateTrackingQuery(req: any, res: any, next: any) {
  const { error } = trackingQuerySchema.validate(req.params);
  if (error) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: error.details[0].message 
    });
  }
  next();
}

export function validateRateCalculation(req: any, res: any, next: any) {
  const { error } = rateCalculationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: error.details[0].message 
    });
  }
  next();
}

export function validatePickupRequest(req: any, res: any, next: any) {
  const { error } = pickupRequestSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: error.details[0].message 
    });
  }
  next();
}

export function validateDeliveryConfirmation(req: any, res: any, next: any) {
  const { error } = deliveryConfirmationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: error.details[0].message 
    });
  }
  next();
} 