import { Request, Response, NextFunction } from 'express';

interface SortConfig {
  allowedFields: string[];
  defaultField: string;
  defaultOrder: 'asc' | 'desc';
}

interface SortParams {
  field: string;
  order: 'asc' | 'desc';
}

// Default sort configuration
const defaultConfig: SortConfig = {
  allowedFields: [],
  defaultField: 'createdAt',
  defaultOrder: 'desc',
};

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      sort?: SortParams;
    }
  }
}

// Sort middleware
export const sort = (config: Partial<SortConfig> = {}) => {
  const finalConfig = { ...defaultConfig, ...config };

  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get sort parameters from query
      const sortBy = req.query.sortBy as string || finalConfig.defaultField;
      const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || finalConfig.defaultOrder;

      // Validate field
      if (!finalConfig.allowedFields.includes(sortBy)) {
        return res.status(400).json({
          status: 'error',
          message: `Invalid sort field. Allowed fields: ${finalConfig.allowedFields.join(', ')}`,
        });
      }

      // Validate order
      if (!['asc', 'desc'].includes(sortOrder)) {
        return res.status(400).json({
          status: 'error',
          message: 'Sort order must be either "asc" or "desc"',
        });
      }

      // Add sort parameters to request
      req.sort = {
        field: sortBy,
        order: sortOrder,
      };

      next();
    } catch (error) {
      res.status(400).json({
        status: 'error',
        message: 'Invalid sort parameters',
      });
    }
  };
};

// Sort response
export const sortResponse = (req: Request, res: Response, next: NextFunction) => {
  const originalSend = res.send;

  res.send = function (body: any): Response {
    if (Array.isArray(body) && req.sort) {
      const { field, order } = req.sort;

      const sortedData = [...body].sort((a, b) => {
        const aValue = a[field];
        const bValue = b[field];

        if (aValue === bValue) return 0;
        if (aValue === null) return 1;
        if (bValue === null) return -1;

        const comparison = aValue < bValue ? -1 : 1;
        return order === 'asc' ? comparison : -comparison;
      });

      return originalSend.call(this, sortedData);
    }

    return originalSend.call(this, body);
  };

  next();
};

// Multi-field sort middleware
export const multiSort = (config: Partial<SortConfig> = {}) => {
  const finalConfig = { ...defaultConfig, ...config };

  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const sortFields = (req.query.sort as string || finalConfig.defaultField).split(',');
      const sortOrders = (req.query.order as string || finalConfig.defaultOrder).split(',');

      // Validate number of fields and orders
      if (sortFields.length !== sortOrders.length) {
        return res.status(400).json({
          status: 'error',
          message: 'Number of sort fields must match number of sort orders',
        });
      }

      // Validate fields and orders
      const sortParams = sortFields.map((field, index) => {
        if (!finalConfig.allowedFields.includes(field)) {
          throw new Error(`Invalid sort field: ${field}`);
        }

        const order = sortOrders[index];
        if (!['asc', 'desc'].includes(order)) {
          throw new Error(`Invalid sort order: ${order}`);
        }

        return { field, order: order as 'asc' | 'desc' };
      });

      // Add sort parameters to request
      req.sort = sortParams[0]; // Keep first sort for backward compatibility
      req.multiSort = sortParams;

      next();
    } catch (error) {
      res.status(400).json({
        status: 'error',
        message: error.message,
      });
    }
  };
};

// Multi-field sort response
export const multiSortResponse = (req: Request, res: Response, next: NextFunction) => {
  const originalSend = res.send;

  res.send = function (body: any): Response {
    if (Array.isArray(body) && req.multiSort) {
      const sortedData = [...body].sort((a, b) => {
        for (const { field, order } of req.multiSort) {
          const aValue = a[field];
          const bValue = b[field];

          if (aValue === bValue) continue;
          if (aValue === null) return 1;
          if (bValue === null) return -1;

          const comparison = aValue < bValue ? -1 : 1;
          return order === 'asc' ? comparison : -comparison;
        }
        return 0;
      });

      return originalSend.call(this, sortedData);
    }

    return originalSend.call(this, body);
  };

  next();
}; 