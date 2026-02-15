import { Request, Response } from 'express';
import { recommendSuppliersForRFQ, predictRFQAcceptance } from '../services/aiService';
import suppliers from '../data/suppliers';

export const getRFQRecommendations = (req: Request, res: Response) => {
  const rfq = req.body;
  const recommended = recommendSuppliersForRFQ(rfq, suppliers);
  res.json({ recommended });
};

export const getRFQAcceptancePrediction = (req: Request, res: Response) => {
  const rfq = req.body;
  const probability = predictRFQAcceptance(rfq);
  res.json({ probability });
};
