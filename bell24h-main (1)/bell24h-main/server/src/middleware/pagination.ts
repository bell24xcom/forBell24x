import { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger';

// Pagination configuration
interface PaginationConfig {
  defaultLimit: number;
  maxLimit: number;
  defaultPage: number;
}

interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

// Default pagination configuration
const defaultConfig: PaginationConfig = {
  defaultLimit: 10,
  maxLimit: 100,
  defaultPage: 1,
};

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      pagination?: {
        page: number;
        limit: number;
        skip: number;
      };
    }
  }
}

// Pagination middleware
export const paginate = (config: Partial<PaginationConfig> = {}) => {
  const finalConfig = { ...defaultConfig, ...config };

  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get pagination parameters from query
      const page = parseInt(req.query.page as string) || finalConfig.defaultPage;
      const limit = parseInt(req.query.limit as string) || finalConfig.defaultLimit;

      // Validate parameters
      if (page < 1) {
        return res.status(400).json({
          status: 'error',
          message: 'Page number must be greater than 0',
        });
      }

      if (limit < 1 || limit > finalConfig.maxLimit) {
        return res.status(400).json({
          status: 'error',
          message: `Limit must be between 1 and ${finalConfig.maxLimit}`,
        });
      }

      // Calculate skip value
      const skip = (page - 1) * limit;

      // Add pagination parameters to request
      req.pagination = {
        page,
        limit,
        skip,
      };

      next();
    } catch (error) {
      logger.error('Pagination error:', error);
      res.status(400).json({
        status: 'error',
        message: 'Invalid pagination parameters',
      });
    }
  };
};

// Paginate response
export const paginateResponse = (req: Request, res: Response, next: NextFunction) => {
  const originalSend = res.send;

  res.send = function (body: any): Response {
    if (Array.isArray(body) && req.pagination) {
      const { page, limit } = req.pagination;
      const total = body.length;
      const totalPages = Math.ceil(total / limit);
      const hasNext = page < totalPages;
      const hasPrev = page > 1;

      return originalSend.call(this, {
        data: body,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext,
          hasPrev,
        },
      });
    }

    return originalSend.call(this, body);
  };

  next();
};

// Cursor-based pagination
export const cursorPaginate = (config: Partial<PaginationConfig> = {}) => {
  const finalConfig = { ...defaultConfig, ...config };

  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const cursor = req.query.cursor as string;
      const limit = parseInt(req.query.limit as string) || finalConfig.defaultLimit;

      if (limit < 1 || limit > finalConfig.maxLimit) {
        return res.status(400).json({
          status: 'error',
          message: `Limit must be between 1 and ${finalConfig.maxLimit}`,
        });
      }

      req.pagination = {
        page: 1,
        limit,
        skip: 0,
        cursor,
      };

      next();
    } catch (error) {
      logger.error('Cursor pagination error:', error);
      res.status(400).json({
        status: 'error',
        message: 'Invalid cursor pagination parameters',
      });
    }
  };
};

// Cursor-based pagination response
export const cursorPaginateResponse = (req: Request, res: Response, next: NextFunction) => {
  const originalSend = res.send;

  res.send = function (body: any): Response {
    if (Array.isArray(body) && req.pagination) {
      const { limit, cursor } = req.pagination;
      const hasMore = body.length > limit;
      const nextCursor = hasMore ? body[limit - 1].id : null;

      return originalSend.call(this, {
        data: body.slice(0, limit),
        pagination: {
          cursor: nextCursor,
          hasMore,
        },
      });
    }

    return originalSend.call(this, body);
  };

  next();
};

// Offset-based pagination
export const offsetPaginate = (config: Partial<PaginationConfig> = {}) => {
  const finalConfig = { ...defaultConfig, ...config };

  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const offset = parseInt(req.query.offset as string) || 0;
      const limit = parseInt(req.query.limit as string) || finalConfig.defaultLimit;

      if (offset < 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Offset must be greater than or equal to 0',
        });
      }

      if (limit < 1 || limit > finalConfig.maxLimit) {
        return res.status(400).json({
          status: 'error',
          message: `Limit must be between 1 and ${finalConfig.maxLimit}`,
        });
      }

      req.pagination = {
        page: Math.floor(offset / limit) + 1,
        limit,
        skip: offset,
      };

      next();
    } catch (error) {
      logger.error('Offset pagination error:', error);
      res.status(400).json({
        status: 'error',
        message: 'Invalid offset pagination parameters',
      });
    }
  };
};

// Offset-based pagination response
export const offsetPaginateResponse = (req: Request, res: Response, next: NextFunction) => {
  const originalSend = res.send;

  res.send = function (body: any): Response {
    if (Array.isArray(body) && req.pagination) {
      const { limit, skip } = req.pagination;
      const total = body.length;
      const hasMore = total > skip + limit;

      return originalSend.call(this, {
        data: body.slice(skip, skip + limit),
        pagination: {
          offset: skip,
          limit,
          total,
          hasMore,
        },
      });
    }

    return originalSend.call(this, body);
  };

  next();
}; 