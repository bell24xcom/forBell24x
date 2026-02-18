/**
 * JWT Token Management for Bell24h.com
 * Centralized token generation, verification, and decoding.
 */
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'bell24h_jwt_secret_change_in_production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'bell24h_refresh_secret_change_in_production';

export interface TokenPayload {
  userId: string;
  phone: string;
  role: string;
  type?: 'access' | 'refresh';
}

export interface TokenResult {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
}

/**
 * Generate access + refresh token pair
 */
export function generateTokens(payload: Omit<TokenPayload, 'type'>): TokenResult {
  const accessToken = jwt.sign(
    { ...payload, type: 'access' },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  const refreshToken = jwt.sign(
    { ...payload, type: 'refresh' },
    JWT_REFRESH_SECRET,
    { expiresIn: '30d' }
  );

  return {
    accessToken,
    refreshToken,
    expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
  };
}

/**
 * Generate a single access token (for backward compatibility)
 */
export function generateToken(payload: Omit<TokenPayload, 'type'>, expiresIn = '7d'): string {
  return jwt.sign({ ...payload, type: 'access' }, JWT_SECRET, { expiresIn });
}

/**
 * Verify and decode an access token
 */
export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

/**
 * Verify and decode a refresh token
 */
export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
}

/**
 * Decode without verification (for debugging — never use for auth decisions)
 */
export function decodeToken(token: string): TokenPayload | null {
  try {
    return jwt.decode(token) as TokenPayload;
  } catch {
    return null;
  }
}

/**
 * Extract token from Authorization header or cookie
 */
export function extractToken(authHeader?: string | null, cookieToken?: string | null): string | null {
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  return cookieToken || null;
}
