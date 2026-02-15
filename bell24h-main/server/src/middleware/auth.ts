import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';
import { UnifiedUser } from '../../../server/types/express';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: UnifiedUser;
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Invalid token format' });
    }

    const decoded = verify(token, JWT_SECRET) as { userId: string; role: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { company: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    if (!user.emailVerified) {
      return res.status(403).json({ error: 'Email not verified' });
    }

    req.user = {
      id: parseInt(user.id),
      email: user.email,
      role: user.role,
      isEmailVerified: user.emailVerified,
      companyId: user.companyId,
      company: user.company,
      ...user
    };

    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    next();
  };
};

export const requireCompany = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { company: true },
    });

    if (!user?.company) {
      return res.status(403).json({ error: 'Company profile required' });
    }

    next();
  } catch (error) {
    logger.error('Company check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const rateLimit = (limit: number, windowMs: number) => {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip;
    const now = Date.now();

    const requestData = requests.get(ip);

    if (requestData) {
      if (now > requestData.resetTime) {
        requests.set(ip, { count: 1, resetTime: now + windowMs });
      } else if (requestData.count >= limit) {
        return res.status(429).json({ error: 'Too many requests' });
      } else {
        requestData.count++;
      }
    } else {
      requests.set(ip, { count: 1, resetTime: now + windowMs });
    }

    next();
  };
};

export const validateRequest = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    next();
  };
}; 