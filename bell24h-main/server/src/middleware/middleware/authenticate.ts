/**
 * Authentication middleware for Bell24H API endpoints
 */
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Import the shared User type and Express types
import { User } from '../../shared/schema';

// Define authenticated request type
type AuthenticatedRequest = Request & {
  user?: User;
};

/**
 * Middleware to authenticate users based on JWT token
 */
export const authenticateUser = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  // Get token from Authorization header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  try {
    // Verify token using JWT
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'bell24h-secret-key'
    ) as Omit<User, 'role'> & { user_type: string };
    
    // Add role based on user_type
    const userWithRole: User = {
      ...decoded,
      role: decoded.user_type === 'admin' ? 'admin' : 'user' as const
    };
    
    // Attach user to request object
    req.user = userWithRole;
    
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Middleware to authorize users based on role
 */
export function authorizeRoles(roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
}
