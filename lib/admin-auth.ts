/**
 * Admin authentication helper for Bell24h.
 * Each /api/admin/* route imports requireAdmin() to enforce ADMIN role.
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractToken, TokenPayload } from '@/lib/jwt';

export interface AdminPayload extends TokenPayload {
  role: 'ADMIN';
}

const STATIC_ADMIN_PAYLOAD: AdminPayload = {
  userId: 'system',
  phone:  '',
  role:   'ADMIN',
};

/**
 * Verifies the request carries a valid JWT with role=ADMIN,
 * OR a static bearer token matching ADMIN_TOKEN / EXPORT_API_KEY.
 * The static path allows M2M calls (e.g. bell24h-v2 pushing leads) without a JWT.
 */
export function requireAdmin(request: NextRequest): AdminPayload | NextResponse {
  const incomingToken =
    request.headers.get('authorization')?.replace('Bearer ', '') ||
    request.headers.get('x-admin-token') ||
    null;

  // Static token fast-path for M2M / API key auth
  const adminToken = process.env.ADMIN_TOKEN;
  const exportKey  = process.env.EXPORT_API_KEY;
  if (
    incomingToken &&
    ((adminToken && incomingToken === adminToken) ||
     (exportKey  && incomingToken === exportKey))
  ) {
    return STATIC_ADMIN_PAYLOAD;
  }

  // JWT path for human admin sessions (browser / Vercel dashboard)
  const jwtToken = extractToken(
    request.headers.get('authorization'),
    request.cookies.get('admin-token')?.value ?? request.cookies.get('auth-token')?.value
  );

  if (!jwtToken) {
    return NextResponse.json(
      { success: false, message: 'Admin authentication required' },
      { status: 401 }
    );
  }

  let payload: TokenPayload;
  try {
    payload = verifyToken(jwtToken);
  } catch {
    return NextResponse.json(
      { success: false, message: 'Invalid or expired admin session' },
      { status: 401 }
    );
  }

  if (payload.role !== 'ADMIN') {
    return NextResponse.json(
      { success: false, message: 'Access denied: Admin role required' },
      { status: 403 }
    );
  }

  return payload as AdminPayload;
}

/** Type guard — use after requireAdmin() */
export function isErrorResponse(v: AdminPayload | NextResponse): v is NextResponse {
  return v instanceof NextResponse;
}
