import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import type { NextRequest } from 'next/server';

export interface JWTPayload {
  userId: string;
  phone: string;
  role: string;
}

export const jwt = {
  sign: (payload: JWTPayload, options?: jwt.SignOptions): string => {
    return jwt.sign(payload, process.env.JWT_SECRET!, options);
  },

  verify: (token: string): JWTPayload => {
    return jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
  },

  decode: (token: string): JWTPayload | null => {
    return jwt.decode(token) as JWTPayload | null;
  },

  async authenticate(request: NextRequest) {
    const authHeader = request.headers.get('Authorization');
    const authToken = request.cookies.get('auth-token')?.value;

    let token = authToken || authHeader?.replace('Bearer ', '');

    if (!token) {
      return null;
    }

    try {
      const payload = jwt.verify(token) as JWTPayload;
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (!user) {
        return null;
      }

      return { userId: user.id, phone: user.phone, role: user.role };
    } catch (error) {
      return null;
    }
  },
};