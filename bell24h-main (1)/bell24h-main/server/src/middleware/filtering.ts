import { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger';

// Filter configuration
interface FilterConfig {
  allowedFields: string[];
  operators: string[];
  maxFilters: number;
}

interface Filter {
  field: string;
  operator: string;
  value: any;
}

// Default filter configuration
const defaultConfig: FilterConfig = {
  allowedFields: [],
  operators: ['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'in', 'nin', 'like', 'ilike'],
  maxFilters: 5,
};

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      filters?: Filter[];
    }
  }
}

// Filter middleware
export const filter = (config: Partial<FilterConfig> = {}) => {
  const finalConfig = { ...defaultConfig, ...config };

  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters: Filter[] = [];

      // Parse filter parameters from query
      Object.entries(req.query).forEach(([key, value]) => {
        if (key.startsWith('filter[') && key.endsWith(']')) {
          const field = key.slice(7, -1);
          const [operator, fieldName] = field.split('.');

          // Validate field
          if (!finalConfig.allowedFields.includes(fieldName)) {
            throw new Error(`Invalid filter field: ${fieldName}`);
          }

          // Validate operator
          if (!finalConfig.operators.includes(operator)) {
            throw new Error(`Invalid filter operator: ${operator}`);
          }

          // Parse value based on operator
          let parsedValue = value;
          if (operator === 'in' || operator === 'nin') {
            parsedValue = (value as string).split(',');
          }

          filters.push({
            field: fieldName,
            operator,
            value: parsedValue,
          });
        }
      });

      // Check maximum filters
      if (filters.length > finalConfig.maxFilters) {
        throw new Error(`Maximum ${finalConfig.maxFilters} filters allowed`);
      }

      // Add filters to request
      req.filters = filters;

      next();
    } catch (error) {
      res.status(400).json({
        status: 'error',
        message: error.message,
      });
    }
  };
};

// Filter response
export const filterResponse = (req: Request, res: Response, next: NextFunction) => {
  const originalSend = res.send;

  res.send = function (body: any): Response {
    if (Array.isArray(body) && req.filters) {
      const filteredData = body.filter(item => {
        return req.filters.every(filter => {
          const { field, operator, value } = filter;
          const itemValue = item[field];

          switch (operator) {
            case 'eq':
              return itemValue === value;
            case 'ne':
              return itemValue !== value;
            case 'gt':
              return itemValue > value;
            case 'gte':
              return itemValue >= value;
            case 'lt':
              return itemValue < value;
            case 'lte':
              return itemValue <= value;
            case 'in':
              return value.includes(itemValue);
            case 'nin':
              return !value.includes(itemValue);
            case 'like':
              return String(itemValue).toLowerCase().includes(String(value).toLowerCase());
            case 'ilike':
              return String(itemValue).toLowerCase().includes(String(value).toLowerCase());
            default:
              return true;
          }
        });
      });

      return originalSend.call(this, filteredData);
    }

    return originalSend.call(this, body);
  };

  next();
};

// Search middleware
export const search = (fields: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = req.query.q as string;

      if (!query) {
        next();
        return;
      }

      if (query.length < 2) {
        throw new Error('Search query must be at least 2 characters long');
      }

      // Add search parameters to request
      req.search = {
        query: query.toLowerCase(),
        fields,
      };

      next();
    } catch (error) {
      res.status(400).json({
        status: 'error',
        message: error.message,
      });
    }
  };
};

// Search response
export const searchResponse = (req: Request, res: Response, next: NextFunction) => {
  const originalSend = res.send;

  res.send = function (body: any): Response {
    if (Array.isArray(body) && req.search) {
      const { query, fields } = req.search;

      const searchResults = body.filter(item => {
        return fields.some(field => {
          const value = item[field];
          if (!value) return false;

          return String(value).toLowerCase().includes(query);
        });
      });

      return originalSend.call(this, searchResults);
    }

    return originalSend.call(this, body);
  };

  next();
}; 