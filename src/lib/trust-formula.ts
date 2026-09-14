/**
 * Trade Confidence Score™ — documented formula (no schema changes).
 * Computed daily via batchRecomputeTrustScores in trust-batch.ts.
 */

export const TRUST_SCORE_FORMULA = {
  name: 'Trade Confidence Score™',
  scale: '0–100',
  schedule: 'Daily batch at 2 AM IST via /api/cron/trust-scores (chained from /api/cron/daily)',
  storageField: 'User.trustScore',
  components: [
    { weight: 30, label: 'Payment History', detail: '% of supplier transactions with status COMPLETED' },
    { weight: 20, label: 'On-time Delivery', detail: '% of deals COMPLETED or ACTIVE' },
    { weight: 15, label: 'Response Speed', detail: 'Avg hours from RFQ to quote (faster = higher)' },
    { weight: 15, label: 'Repeat Orders', detail: '% of buyers with more than one deal' },
    { weight: 10, label: 'Dispute Rate', detail: 'Inverse of low ratings (rating < 3)' },
    { weight: 10, label: 'Verification Strength', detail: 'Claimed +30, Verified +30, GST +20, Udyam +20' },
  ],
  floors: [
    'Claimed suppliers: minimum score 30 after batch',
    'Batch never lowers below current stored score (event bumps are authoritative)',
  ],
  expression:
    'trustScore = 0.30×payment + 0.20×delivery + 0.15×response + 0.15×repeat + 0.10×dispute + 0.10×verification',
} as const;

export type TrustFormulaDoc = typeof TRUST_SCORE_FORMULA;
