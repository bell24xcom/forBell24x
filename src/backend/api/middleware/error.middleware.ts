import { Request, Response, NextFunction } from 'express';

export interface ApiError extends Error {
  statusCode?: number;
  isOperational?: boolean;
  code?: string;
}

export class AppError extends Error implements ApiError {
  public statusCode: number;
  public isOperational: boolean;
  public code?: string;

  constructor(message: string, statusCode: number = 500, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;

    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorHandler(
  error: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  let { statusCode = 500, message, code } = error;

  // Log error for debugging
  console.error('API Error:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Handle specific error types
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    code = 'VALIDATION_ERROR';
  }

  if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
    code = 'INVALID_ID';
  }

  if (error.name === 'MongoError' && (error as any).code === 11000) {
    statusCode = 409;
    message = 'Duplicate field value';
    code = 'DUPLICATE_ERROR';
  }

  if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    code = 'INVALID_TOKEN';
  }

  if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    code = 'TOKEN_EXPIRED';
  }

  // Handle Prisma errors
  if (error.name === 'PrismaClientKnownRequestError') {
    const prismaError = error as any;
    
    switch (prismaError.code) {
      case 'P2002':
        statusCode = 409;
        message = 'Unique constraint violation';
        code = 'UNIQUE_CONSTRAINT_VIOLATION';
        break;
      case 'P2025':
        statusCode = 404;
        message = 'Record not found';
        code = 'RECORD_NOT_FOUND';
        break;
      case 'P2003':
        statusCode = 400;
        message = 'Foreign key constraint violation';
        code = 'FOREIGN_KEY_VIOLATION';
        break;
      default:
        statusCode = 400;
        message = 'Database operation failed';
        code = 'DATABASE_ERROR';
    }
  }

  // Handle Prisma validation errors
  if (error.name === 'PrismaClientValidationError') {
    statusCode = 400;
    message = 'Invalid data provided';
    code = 'VALIDATION_ERROR';
  }

  // Production error response (hide stack trace)
  if (process.env.NODE_ENV === 'production') {
    return res.status(statusCode).json({
      error: {
        message: message || 'Internal server error',
        code: code || 'INTERNAL_ERROR',
        statusCode
      },
      timestamp: new Date().toISOString(),
      path: req.url
    });
  }

  // Development error response (include stack trace)
  return res.status(statusCode).json({
    error: {
      message: message || 'Internal server error',
      code: code || 'INTERNAL_ERROR',
      statusCode,
      stack: error.stack
    },
    timestamp: new Date().toISOString(),
    path: req.url,
    method: req.method
  });
}

export function notFoundHandler(req: Request, res: Response, next: NextFunction) {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404, 'ROUTE_NOT_FOUND');
  next(error);
}

export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
} 