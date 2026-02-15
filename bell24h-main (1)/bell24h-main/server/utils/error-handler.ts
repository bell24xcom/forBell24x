/**
 * Bell24H Error Handling Utilities
 * 
 * This module provides consistent error handling patterns
 * for the Bell24H application, ensuring proper TypeScript
 * compatibility and standardized error responses.
 */

import { Response } from 'express';
import { AppError } from '../types/express';

/**
 * Format an error for API responses
 */
export function formatError(error: unknown): { message: string; details?: any } {
  if (error instanceof Error) {
    return {
      message: error.message,
      details: (error as AppError).code ? { code: (error as AppError).code } : undefined
    };
  } else if (typeof error === 'string') {
    return { message: error };
  } else {
    return { message: 'An unknown error occurred', details: error };
  }
}

/**
 * Handle API errors with consistent response format
 */
export function handleApiError(res: Response, error: unknown, statusCode = 500): Response {
  console.error('API Error:', error);
  const formattedError = formatError(error);
  
  return res.status(statusCode).json({
    success: false,
    error: formattedError.message,
    details: formattedError.details
  });
}

/**
 * Create a standardized API error
 */
export function createApiError(message: string, code?: string, status = 400): AppError {
  const error = new Error(message) as AppError;
  error.code = code;
  error.status = status;
  return error;
}

/**
 * Async handler to catch errors in Express route handlers
 */
export function asyncHandler(fn: Function) {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      next(error);
    });
  };
}

export default {
  formatError,
  handleApiError,
  createApiError,
  asyncHandler
};
