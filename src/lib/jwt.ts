import { sign, verify, JwtPayload } from 'jsonwebtoken';

// In production, JWT_SECRET must be set explicitly — never a hardcoded fallback.
// Mirrors the fail-closed pattern already used in lib/jwt.ts (repo root).
const JWT_SECRET = (() => {
  const s = process.env.JWT_SECRET;
  if (!s) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[JWT] CRITICAL: JWT_SECRET env var is not set. Set it in Vercel → Settings → Environment Variables.');
      return '__MISSING_JWT_SECRET__';
    }
    return 'dev_only_jwt_secret_not_for_production';
  }
  return s;
})();
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

export interface TokenPayload extends JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export const generateTokens = (user: { id: string; email: string; role: string }) => {
  const accessToken = sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });

  const refreshToken = sign({ userId: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });

  return {
    accessToken,
    refreshToken,
    expiresIn: 15 * 60 * 1000, // 15 minutes in milliseconds
  };
};

export const verifyToken = (token: string): TokenPayload => {
  return verify(token, JWT_SECRET) as TokenPayload;
};

export const decodeToken = (token: string): TokenPayload | null => {
  try {
    return verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
};
