import jwt from 'jsonwebtoken';
import type { JwtPayload } from 'jsonwebtoken';
const { sign, verify } = jwt;

// H6-16A: true fail-closed. No hardcoded secret is ever substituted — if
// JWT_SECRET is missing or empty, signing/verification throws instead of
// proceeding with a guessable default. Resolved lazily per call (not at
// module load) so importing this module doesn't crash routes that never
// actually sign/verify a token.
export class MissingJwtSecretError extends Error {
  constructor() {
    super('JWT_SECRET is not configured — refusing to sign or verify JWTs');
    this.name = 'MissingJwtSecretError';
  }
}

function requireSecret(): string {
  const s = process.env.JWT_SECRET;
  if (!s) {
    console.error('[JWT] CRITICAL: JWT_SECRET env var is not set. Set it in Vercel → Settings → Environment Variables.');
    throw new MissingJwtSecretError();
  }
  return s;
}
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

export interface TokenPayload extends JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export const generateTokens = (user: { id: string; email: string; role: string }) => {
  const secret = requireSecret();
  const accessToken = sign({ userId: user.id, email: user.email, role: user.role }, secret, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });

  const refreshToken = sign({ userId: user.id, email: user.email }, secret, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });

  return {
    accessToken,
    refreshToken,
    expiresIn: 15 * 60 * 1000, // 15 minutes in milliseconds
  };
};

export const verifyToken = (token: string): TokenPayload => {
  return verify(token, requireSecret()) as TokenPayload;
};

export const decodeToken = (token: string): TokenPayload | null => {
  try {
    return verify(token, requireSecret()) as TokenPayload;
  } catch (error) {
    return null;
  }
};
