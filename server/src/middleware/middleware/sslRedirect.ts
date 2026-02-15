import { Request, Response, NextFunction } from 'express';

export function sslRedirect(req: Request, res: Response, next: NextFunction) {
  if (req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect('https://' + req.headers.host + req.url);
  }
  next();
}
