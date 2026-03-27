import { Request, Response, NextFunction } from 'express';
import { logActivity } from '../controllers/communityController';

export const activityLogger = (action: string, description: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Log the activity after the request is complete
    res.on('finish', async () => {
      try {
        // Only log successful requests
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const userId = req.user?.id;
          if (userId) {
            await logActivity(userId, action, description, {
              method: req.method,
              path: req.path,
              statusCode: res.statusCode,
            });
          }
        }
      } catch (error) {
        console.error('Error in activity logger:', error);
      }
    });
    next();
  };
};

export const logActivityMiddleware = (req: Request, action: string, description: string, metadata?: any) => {
  const userId = req.user?.id;
  if (userId) {
    logActivity(userId, action, description, metadata).catch(console.error);
  }
};
