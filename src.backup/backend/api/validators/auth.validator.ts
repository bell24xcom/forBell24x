import Joi from 'joi';

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  rememberMe: Joi.boolean().default(false),
  twoFactorCode: Joi.string().length(6).optional()
});

export const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/).required()
    .messages({
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    }),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required()
    .messages({
      'any.only': 'Passwords must match'
    }),
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).optional(),
  company: Joi.string().max(100).optional(),
  role: Joi.string().valid('buyer', 'supplier', 'admin').default('buyer'),
  acceptTerms: Joi.boolean().valid(true).required()
    .messages({
      'any.only': 'You must accept the terms and conditions'
    })
});

export const passwordResetSchema = Joi.object({
  token: Joi.string().required(),
  newPassword: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/).required()
    .messages({
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    }),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
    .messages({
      'any.only': 'Passwords must match'
    })
});

export const profileUpdateSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).optional(),
  lastName: Joi.string().min(2).max(50).optional(),
  phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).optional(),
  company: Joi.string().max(100).optional(),
  avatar: Joi.string().uri().optional(),
  preferences: Joi.object({
    language: Joi.string().valid('en', 'hi', 'es', 'fr').default('en'),
    timezone: Joi.string().default('Asia/Kolkata'),
    notifications: Joi.object({
      email: Joi.boolean().default(true),
      push: Joi.boolean().default(true),
      sms: Joi.boolean().default(false)
    }).default()
  }).optional()
});

export function validateLogin(req: any, res: any, next: any) {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: error.details[0].message 
    });
  }
  next();
}

export function validateRegister(req: any, res: any, next: any) {
  const { error } = registerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: error.details[0].message 
    });
  }
  next();
}

export function validatePasswordReset(req: any, res: any, next: any) {
  const { error } = passwordResetSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: error.details[0].message 
    });
  }
  next();
}

export function validateProfileUpdate(req: any, res: any, next: any) {
  const { error } = profileUpdateSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: error.details[0].message 
    });
  }
  next();
} 