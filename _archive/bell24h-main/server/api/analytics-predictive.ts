import express from 'express';
import { cacheMiddleware } from '../middleware/redisCache.js';
import { db } from '../db.js';
import { rfqs, bids, productShowcases } from '../../shared/schema.js';
import { sql } from 'drizzle-orm';

const router = express.Router();

// Predictive trends for logistics (shipping delays, volume, etc.)
router.get('/predictive-trends', cacheMiddleware('predictive-trends', 600), async (req, res) => {
  try {
    // Example: Predict shipping delays based on historical RFQ/bid data
    const delays = await db.select({
      avgDelay: sql<number>`AVG(EXTRACT(EPOCH FROM (delivered_at - shipped_at))/3600)`
    }).from(rfqs).where(sql`delivered_at IS NOT NULL AND shipped_at IS NOT NULL`);

    // Example: Predict volume trends (last 30 days)
    const volumes = await db.select({
      day: sql<string>`DATE_TRUNC('day', created_at)`,
      count: sql<number>`COUNT(*)`
    }).from(rfqs).where(sql`created_at > NOW() - INTERVAL '30 days'`).groupBy(sql`DATE_TRUNC('day', created_at)`);

    res.json({
      avgDelayHours: delays[0]?.avgDelay || 0,
      volumeTrends: volumes
    });
  } catch (error) {
    console.error('Predictive trends error:', error);
    res.status(500).json({ error: 'Failed to compute predictive trends' });
  }
});

// Anomaly detection for shipping delays
router.get('/anomaly-detection', cacheMiddleware('anomaly-detection', 600), async (req, res) => {
  try {
    // Example: Find RFQs with unusually high shipping delays (outliers)
    const anomalies = await db.select({
      id: rfqs.id,
      shipped_at: rfqs.shipped_at,
      delivered_at: rfqs.delivered_at,
      delayHours: sql<number>`EXTRACT(EPOCH FROM (delivered_at - shipped_at))/3600`
    }).from(rfqs).where(sql`delivered_at IS NOT NULL AND shipped_at IS NOT NULL AND (EXTRACT(EPOCH FROM (delivered_at - shipped_at))/3600) > 72`);

    res.json({ anomalies });
  } catch (error) {
    console.error('Anomaly detection error:', error);
    res.status(500).json({ error: 'Failed to detect anomalies' });
  }
});

export default router;
