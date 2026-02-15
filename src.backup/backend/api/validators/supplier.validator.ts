import Joi from 'joi';

export const createSupplierSchema = Joi.object({
  name: Joi.string().required().min(2).max(100),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).optional(),
  address: Joi.object({
    street: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    country: Joi.string().required(),
    postalCode: Joi.string().required()
  }).required(),
  businessType: Joi.string().valid('manufacturer', 'distributor', 'wholesaler', 'retailer', 'service').required(),
  categories: Joi.array().items(Joi.string()).min(1).required(),
  certifications: Joi.array().items(Joi.string()).optional(),
  taxId: Joi.string().optional(),
  website: Joi.string().uri().optional(),
  description: Joi.string().max(1000).optional(),
  contactPerson: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).optional(),
    position: Joi.string().optional()
  }).required()
});

export const updateSupplierSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).optional(),
  address: Joi.object({
    street: Joi.string().optional(),
    city: Joi.string().optional(),
    state: Joi.string().optional(),
    country: Joi.string().optional(),
    postalCode: Joi.string().optional()
  }).optional(),
  businessType: Joi.string().valid('manufacturer', 'distributor', 'wholesaler', 'retailer', 'service').optional(),
  categories: Joi.array().items(Joi.string()).min(1).optional(),
  certifications: Joi.array().items(Joi.string()).optional(),
  taxId: Joi.string().optional(),
  website: Joi.string().uri().optional(),
  description: Joi.string().max(1000).optional(),
  contactPerson: Joi.object({
    name: Joi.string().optional(),
    email: Joi.string().email().optional(),
    phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).optional(),
    position: Joi.string().optional()
  }).optional()
});

export const supplierSearchSchema = Joi.object({
  query: Joi.string().min(2).optional(),
  category: Joi.string().optional(),
  businessType: Joi.string().valid('manufacturer', 'distributor', 'wholesaler', 'retailer', 'service').optional(),
  location: Joi.string().optional(),
  certification: Joi.string().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sortBy: Joi.string().valid('name', 'rating', 'createdAt', 'updatedAt').default('name'),
  sortOrder: Joi.string().valid('asc', 'desc').default('asc')
});

export function validateCreateSupplier(req: any, res: any, next: any) {
  const { error } = createSupplierSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: error.details[0].message 
    });
  }
  next();
}

export function validateUpdateSupplier(req: any, res: any, next: any) {
  const { error } = updateSupplierSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: error.details[0].message 
    });
  }
  next();
}

export function validateSupplierSearch(req: any, res: any, next: any) {
  const { error } = supplierSearchSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: error.details[0].message 
    });
  }
  next();
} 