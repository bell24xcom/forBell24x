import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

/**
 * Middleware for validating request body against a Zod schema
 * @param schema Zod schema to validate against
 * @param source Where to find the data to validate (default: 'body')
 */
export function validateRequest(schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get the data from the specified source
      const data = req[source];
      
      // Validate the data against the schema
      const result = schema.safeParse(data);
      
      if (!result.success) {
        // Format validation errors
        const formattedErrors = result.error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        }));
        
        return res.status(400).json({
          error: 'Validation error',
          details: formattedErrors
        });
      }
      
      // Replace the request data with the validated data (includes defaults, etc.)
      req[source] = result.data;
      
      next();
    } catch (error) {
      console.error('Validation error:', error);
      res.status(500).json({ error: 'An error occurred during validation' });
    }
  };
}
