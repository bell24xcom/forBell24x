import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { logger } from '../lib/logger';

// Validation error handler
const handleValidationError = (error: Joi.ValidationError, res: Response) => {
  const errors = error.details.map(detail => ({
    field: detail.path.join('.'),
    message: detail.message,
  }));

  logger.warn('Validation error:', { errors });

  return res.status(400).json({
    status: 'error',
    message: 'Validation failed',
    errors,
  });
};

// Generic validation middleware
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return handleValidationError(error, res);
    }

    next();
  };
};

// Query validation middleware
export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return handleValidationError(error, res);
    }

    next();
  };
};

// Params validation middleware
export const validateParams = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return handleValidationError(error, res);
    }

    next();
  };
};

// File validation middleware
export const validateFile = (options: {
  fieldName: string;
  maxSize?: number;
  mimeTypes?: string[];
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const file = req.file || req.files?.[options.fieldName];

    if (!file) {
      return res.status(400).json({
        status: 'error',
        message: `File field "${options.fieldName}" is required`,
      });
    }

    if (options.maxSize && file.size > options.maxSize) {
      return res.status(400).json({
        status: 'error',
        message: `File size must be less than ${options.maxSize} bytes`,
      });
    }

    if (options.mimeTypes && !options.mimeTypes.includes(file.mimetype)) {
      return res.status(400).json({
        status: 'error',
        message: `File type must be one of: ${options.mimeTypes.join(', ')}`,
      });
    }

    next();
  };
};

// Custom validation middleware
export const customValidate = (validator: (req: Request) => Promise<void>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await validator(req);
      next();
    } catch (error) {
      res.status(400).json({
        status: 'error',
        message: error.message,
      });
    }
  };
};

// Predefined validation schemas
export const schemas = {
  user: {
    create: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(8).required(),
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      role: Joi.string().valid('user', 'admin').default('user'),
    }),

    update: Joi.object({
      email: Joi.string().email(),
      firstName: Joi.string(),
      lastName: Joi.string(),
      role: Joi.string().valid('user', 'admin'),
    }),
  },

  company: {
    create: Joi.object({
      name: Joi.string().required(),
      type: Joi.string().valid('buyer', 'seller').required(),
      industry: Joi.string().required(),
      size: Joi.string().valid('small', 'medium', 'large').required(),
      website: Joi.string().uri(),
      description: Joi.string(),
    }),

    update: Joi.object({
      name: Joi.string(),
      type: Joi.string().valid('buyer', 'seller'),
      industry: Joi.string(),
      size: Joi.string().valid('small', 'medium', 'large'),
      website: Joi.string().uri(),
      description: Joi.string(),
    }),
  },

  rfq: {
    create: Joi.object({
      title: Joi.string().required(),
      description: Joi.string().required(),
      category: Joi.string().required(),
      quantity: Joi.number().integer().min(1).required(),
      unit: Joi.string().required(),
      budget: Joi.number().min(0),
      deadline: Joi.date().min('now').required(),
      attachments: Joi.array().items(Joi.string()),
    }),

    update: Joi.object({
      title: Joi.string(),
      description: Joi.string(),
      category: Joi.string(),
      quantity: Joi.number().integer().min(1),
      unit: Joi.string(),
      budget: Joi.number().min(0),
      deadline: Joi.date().min('now'),
      attachments: Joi.array().items(Joi.string()),
    }),
  },

  quote: {
    create: Joi.object({
      rfqId: Joi.string().required(),
      price: Joi.number().min(0).required(),
      currency: Joi.string().required(),
      deliveryTime: Joi.number().integer().min(1).required(),
      validity: Joi.number().integer().min(1).required(),
      description: Joi.string().required(),
      attachments: Joi.array().items(Joi.string()),
    }),

    update: Joi.object({
      price: Joi.number().min(0),
      currency: Joi.string(),
      deliveryTime: Joi.number().integer().min(1),
      validity: Joi.number().integer().min(1),
      description: Joi.string(),
      attachments: Joi.array().items(Joi.string()),
    }),
  },

  review: Joi.object({
    rating: Joi.number().min(1).max(5).required(),
    comment: Joi.string().required(),
    type: Joi.string().valid('SUPPLIER', 'BUYER').required(),
    targetId: Joi.string().required(),
  }),

  message: Joi.object({
    recipientId: Joi.string().required(),
    content: Joi.string().required(),
    attachments: Joi.array().items(Joi.string()),
  }),

  notification: Joi.object({
    type: Joi.string().required(),
    title: Joi.string().required(),
    message: Joi.string().required(),
    data: Joi.object(),
  }),

  file: Joi.object({
    fieldname: Joi.string().required(),
    originalname: Joi.string().required(),
    encoding: Joi.string().required(),
    mimetype: Joi.string().required(),
    size: Joi.number().required(),
    destination: Joi.string().required(),
    filename: Joi.string().required(),
    path: Joi.string().required(),
  }),
};
