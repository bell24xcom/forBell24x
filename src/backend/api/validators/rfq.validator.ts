import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

export const createRFQSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  requirements: Joi.array().items(Joi.string()).required(),
  category: Joi.string().required(),
  budget: Joi.number().optional(),
  priority: Joi.string().optional(),
  deadline: Joi.date().optional(),
  metadata: Joi.object().optional(),
});

export function validateCreateRFQ(req: Request, res: Response, next: NextFunction) {
  const { error } = createRFQSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  next();
} 