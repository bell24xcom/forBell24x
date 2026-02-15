import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Import the shared User type
import { User } from '../../shared/schema';

// Re-export types for consistency
export { Request, Response, NextFunction };

// Define authenticated request type
type AuthenticatedRequest = Request & {
  user?: User;
};

export type RequestHandler = (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;

/**
 * Authentication middleware
 * Validates JWT token from cookies or Authorization header
 * Attaches the user to the request object if authenticated
 */
export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    // Get token from cookie or Authorization header
    let token = req.cookies?.authToken;
    
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Verify and decode the token
    const secret = process.env.JWT_SECRET || 'bell24h-secret-key';
    const decoded = jwt.verify(token, secret) as User;
    
    // Attach user to request
    req.user = decoded;
    
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'An error occurred during authentication' });
  }
}

/**
 * Admin role-based access control middleware
 * Only allows access if req.user.role === 'admin'
 */
export function isAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied: Admins only' });
  }
  next();
}

/**
 * Optional authentication middleware
 * If a valid token is provided, attaches the user to the request
 * If no token or invalid token, continues without authentication
 */
export function optionalAuthenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    // Get token from cookie or Authorization header
    let token = req.cookies?.authToken;
    
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    
    if (!token) {
      return next(); // Continue without authentication
    }
    
    // Try to verify and decode the token
    try {
      const secret = process.env.JWT_SECRET || 'bell24h-secret-key';
      const decoded = jwt.verify(token, secret) as User;
      
      // Attach user to request
      req.user = decoded;
    } catch (error) {
      // Token is invalid or expired, but that's fine for optional auth
      // Just continue without setting req.user
    } 
    next();
  } catch (error) {
    // If token is invalid, just continue without authentication
    next();
  }
}
