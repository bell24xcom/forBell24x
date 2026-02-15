import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const validatePayment = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const { amount, currency, paymentMethodId } = req.body;

    // Validate amount
    if (amount && (typeof amount !== 'number' || amount <= 0)) {
      res.status(400).json({ error: 'Invalid amount' });
      return;
    }

    // Validate currency
    if (currency && !['usd', 'eur', 'gbp'].includes(currency.toLowerCase())) {
      res.status(400).json({ error: 'Invalid currency' });
      return;
    }

    // Validate payment method ID
    if (paymentMethodId && typeof paymentMethodId !== 'string') {
      res.status(400).json({ error: 'Invalid payment method ID' });
      return;
    }

    next();
  } catch (error) {
    logger.error('Error validating payment:', error);
    res.status(500).json({ error: 'Payment validation failed' });
  }
}; 