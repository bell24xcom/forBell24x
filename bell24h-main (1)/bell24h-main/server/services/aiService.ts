// Simple AI/ML service for recommendations and predictions (stub for future ML expansion)
import { RFQ, Supplier } from '../models/types';

export function recommendSuppliersForRFQ(rfq: RFQ, suppliers: Supplier[]): Supplier[] {
  // Simple rule-based: recommend suppliers matching category and region
  return suppliers.filter(
    s => s.category === rfq.category && s.region === rfq.region
  ).slice(0, 5);
}

export function predictRFQAcceptance(rfq: RFQ): number {
  // Mock: Return a probability based on RFQ value and urgency
  let base = 0.7;
  if (rfq.urgency === 'high') base -= 0.1;
  if (rfq.value > 10000) base += 0.1;
  return Math.max(0.1, Math.min(0.95, base));
}
