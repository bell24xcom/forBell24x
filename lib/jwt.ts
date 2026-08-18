/**
 * JWT Token Management for Bell24h.com
 * Centralized token generation, verification, and decoding.
 */
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import type { NextRequest } from 'next/server';

/**
 * H6-16A: true fail-closed secret resolution. No hardcoded secret is ever
 * substituted, in any environment. If JWT_SECRET/JWT_REFRESH_SECRET is
 * missing, empty, or still the placeholder value, signing and verification
 * throw MissingJwtSecretError instead of proceeding. We deliberately do NOT
 * throw at module load time (an unconditional throw here would crash the
 * module for every route that imports it, including ones that don't need a
 * token on every request) — instead each sign/verify call resolves the
 * secret lazily via requireSecret(), so the throw happens exactly at the
 * point an operation actually needs it. Existing callers already wrap
 * verifyToken()/generateTokens() in try/catch (jwt.verify() has always been
 * able to throw, for expired/invalid tokens) and already translate any
 * thrown error into their normal 401/error response — see authenticate()
 * below and lib/admin-auth.ts for the pattern this relies on.
 */
export class MissingJwtSecretError extends Error {
  constructor(varName: string) {
    super(`${varName} is not configured — refusing to sign or verify JWTs`);
    this.name = 'MissingJwtSecretError';
  }
}

function requireSecret(varName: 'JWT_SECRET' | 'JWT_REFRESH_SECRET'): string {
  const s = process.env[varName];
  const placeholder =
    varName === 'JWT_SECRET' ? 'bell24h_jwt_secret_change_in_production' : 'bell24h_refresh_secret_change_in_production';
  if (!s || s === placeholder) {
    console.error(`[JWT] CRITICAL: ${varName} env var is not set (or is a known placeholder). Set it in Vercel → Settings → Environment Variables.`);
    throw new MissingJwtSecretError(varName);
  }
  return s;
}

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
    requireSecret('JWT_SECRET'),
    { expiresIn: '7d' }
  );

  const refreshToken = jwt.sign(
    { ...payload, type: 'refresh' },
    requireSecret('JWT_REFRESH_SECRET'),
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
  return jwt.sign({ ...payload, type: 'access' }, requireSecret('JWT_SECRET'), { expiresIn });
}

/**
 * Verify and decode an access token
 */
export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, requireSecret('JWT_SECRET')) as TokenPayload;
}

/**
 * Verify and decode a refresh token
 */
export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, requireSecret('JWT_REFRESH_SECRET')) as TokenPayload;
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

/**
 * Authenticate a request by extracting + verifying token and looking up the user.
 * Returns { userId, phone, role } or null if unauthenticated.
 */
export async function authenticate(request: NextRequest): Promise<{ userId: string; phone: string | null; role: string } | null> {
  const authHeader = request.headers.get('Authorization');
  const authCookie = request.cookies.get('auth-token')?.value;
  const token = extractToken(authHeader, authCookie);

  if (!token) {
    console.error('[AUTH] No auth-token cookie and no Bearer header');
    return null;
  }

  try {
    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
      console.error('[AUTH] JWT valid but user not found in DB:', payload.userId);
      return null;
    }
    return { userId: user.id, phone: user.phone, role: user.role };
  } catch (err: any) {
    console.error('[AUTH] JWT verify failed:', err?.message || err);
    return null;
  }
}
