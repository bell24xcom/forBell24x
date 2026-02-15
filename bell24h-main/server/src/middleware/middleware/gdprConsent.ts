import { Request, Response, NextFunction } from 'express';

export function gdprConsent(req: Request, res: Response, next: NextFunction) {
  // Simulate GDPR consent check (extend for real logic)
  if (req.cookies && req.cookies.gdpr_accepted) {
    return next();
  }
  res.status(403).json({ error: 'GDPR consent required' });
}
