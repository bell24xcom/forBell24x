import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

interface ValidationSuccess<T> {
  success: true;
  data: T;
}

interface ValidationError {
  success: false;
  errors: Record<string, string>;
}

type ValidationResult<T> = ValidationSuccess<T> | ValidationError;

/**
 * Validate the request body against a Zod schema
 *
 * @param req Next.js API request
 * @param res Next.js API response
 * @param schema Zod schema to validate against
 * @returns Validation result containing either the validated data or validation errors
 */
export async function validateRequest<T>(
  req: NextApiRequest,
  res: NextApiResponse,
  schema: z.ZodType<T>
): Promise<ValidationResult<T>> {
  try {
    // Parse the request body with the schema
    const validData = schema.parse(req.body);
    return {
      success: true,
      data: validData,
    };
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};

      // Format the errors into a more user-friendly structure
      error.errors.forEach(err => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });

      return {
        success: false,
        errors,
      };
    }

    // Handle other errors
    console.error('Unexpected validation error:', error);
    return {
      success: false,
      errors: {
        _error: 'An unexpected error occurred during validation',
      },
    };
  }
}
