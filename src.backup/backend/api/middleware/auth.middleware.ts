import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthService } from '../../core/auth/auth.service';

const authService = new AuthService();

export interface AuthenticatedRequest extends Request {
  user?: any;
  token?: string;
}

export async function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Bearer token is required'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!token) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Token is required'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    
    if (!decoded) {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Token verification failed'
      });
    }

    // Get user from database
    const user = await authService.getUserById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        error: 'User not found',
        message: 'User associated with token not found'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        error: 'Account inactive',
        message: 'User account is deactivated'
      });
    }

    // Attach user to request
    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Token is invalid or expired'
      });
    }

    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        error: 'Token expired',
        message: 'Token has expired'
      });
    }

    console.error('Auth middleware error:', error);
    return res.status(500).json({
      error: 'Authentication error',
      message: 'Internal server error during authentication'
    });
  }
}

export async function roleMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'User not authenticated'
      });
    }

    const requiredRoles = ['admin', 'manager'];
    const userRole = req.user.role;

    if (!requiredRoles.includes(userRole)) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Insufficient permissions for this operation'
      });
    }

    next();
  } catch (error) {
    console.error('Role middleware error:', error);
    return res.status(500).json({
      error: 'Authorization error',
      message: 'Internal server error during authorization'
    });
  }
}

export async function optionalAuthMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Continue without authentication
      return next();
    }

    const token = authHeader.substring(7);
    
    if (!token) {
      return next();
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    
    if (decoded) {
      const user = await authService.getUserById(decoded.userId);
      if (user && user.isActive) {
        req.user = user;
        req.token = token;
      }
    }

    next();
  } catch (error) {
    // Continue without authentication on error
    next();
  }
} 