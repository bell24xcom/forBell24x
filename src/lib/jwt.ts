import { sign, verify, JwtPayload } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
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
