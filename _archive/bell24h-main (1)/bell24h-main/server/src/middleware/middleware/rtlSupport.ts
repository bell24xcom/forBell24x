import { Request, Response, NextFunction } from 'express';

const rtlLanguages = ['ar', 'he', 'fa', 'ur'];

export function rtlSupport(req: Request, res: Response, next: NextFunction) {
  const lang = req.headers['accept-language']?.split(',')[0]?.slice(0, 2);
  if (lang && rtlLanguages.includes(lang)) {
    res.locals.rtl = true;
  } else {
    res.locals.rtl = false;
  }
  next();
}
