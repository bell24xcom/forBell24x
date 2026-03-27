import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { RequestHandler } from 'express-serve-static-core';

/**
 * Middleware to validate request using express-validator
 * @param validations Array of validation chains
 * @returns Middleware function that validates the request and handles errors
 */
export const validateRequest = (validations: ValidationChain[]): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    // Format validation errors
    const formattedErrors = errors.array().map(error => ({
      param: error.param,
      message: error.msg,
      location: error.location,
      value: error.value,
    }));

    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      errors: formattedErrors,
    });
  };
};

/**
 * Middleware to validate request body against a schema
 * @param schema Joi schema to validate against
 * @returns Middleware function that validates the request body
 */
export const validateBody = (schema: any): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (!error) {
      return next();
    }

    const formattedErrors = error.details.map((detail: any) => ({
      message: detail.message,
      path: detail.path,
      type: detail.type,
      context: detail.context,
    }));

    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      errors: formattedErrors,
    });
  };
};

/**
 * Middleware to validate request query parameters against a schema
 * @param schema Joi schema to validate against
 * @returns Middleware function that validates the query parameters
 */
export const validateQuery = (schema: any): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.query, { abortEarly: false });
    
    if (!error) {
      return next();
    }

    const formattedErrors = error.details.map((detail: any) => ({
      message: detail.message,
      path: detail.path,
      type: detail.type,
      context: detail.context,
    }));

    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      errors: formattedErrors,
    });
  };
};

/**
 * Middleware to validate request params against a schema
 * @param schema Joi schema to validate against
 * @returns Middleware function that validates the route parameters
 */
export const validateParams = (schema: any): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.params, { abortEarly: false });
    
    if (!error) {
      return next();
    }

    const formattedErrors = error.details.map((detail: any) => ({
      message: detail.message,
      path: detail.path,
      type: detail.type,
      context: detail.context,
    }));

    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      errors: formattedErrors,
    });
  };
};

export default {
  validateRequest,
  validateBody,
  validateQuery,
  validateParams,
};
