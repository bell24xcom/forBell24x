/**
 * Admin authentication helper for Bell24h.
 * Each /api/admin/* route imports requireAdmin() to enforce ADMIN role.
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractToken, TokenPayload } from '@/lib/jwt';

export interface AdminPayload extends TokenPayload {
  role: 'ADMIN';
}

/**
 * Verifies that the request carries a valid JWT with role=ADMIN.
 * Returns the decoded payload or throws a NextResponse (which the caller returns).
 */
export function requireAdmin(request: NextRequest): AdminPayload | NextResponse {
  // Accept admin-token (dedicated admin session) OR auth-token (main app session with ADMIN role)
  const token = extractToken(
    request.headers.get('authorization'),
    request.cookies.get('admin-token')?.value ?? request.cookies.get('auth-token')?.value
  );

  if (!token) {
    return NextResponse.json(
      { success: false, message: 'Admin authentication required' },
      { status: 401 }
    );
  }

  let payload: TokenPayload;
  try {
    payload = verifyToken(token);
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
