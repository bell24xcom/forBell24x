import { NextRequest } from 'next/server';
import { verifyToken, TokenPayload } from './jwt';

export interface AuthenticatedUser {
  id: string;
  role: string;
  email?: string;
}

/**
 * Extracts and verifies the user from the request.
 * Checks for 'auth-token' cookie first, then Authorization header.
 */
export function getAuthenticatedUser(req: NextRequest): AuthenticatedUser | null {
  try {
    // 1. Check Cookie
    let token = req.cookies.get('auth-token')?.value;

    // 2. Check Authorization Header if no cookie
    if (!token) {
      const authHeader = req.headers.get('Authorization');
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) return null;

    // 3. Verify JWT
    const decoded = verifyToken(token) as TokenPayload;
    
    if (!decoded || !decoded.userId) return null;

    return {
      id: decoded.userId,
      role: decoded.role,
      email: decoded.email
    };
  } catch (error) {
    console.error('Authentication Error:', error);
    return null;
  }
}

/**
 * Checks if the user has the required role.
 */
export function hasRole(user: AuthenticatedUser | null, role: string | string[]): boolean {
  if (!user) return false;
  
  const requiredRoles = Array.isArray(role) ? role : [role];
  return requiredRoles.includes(user.role);
}
