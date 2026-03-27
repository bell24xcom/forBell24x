import { Router } from 'express';
import { storage } from '../storage';

const router = Router();

// Prometheus metrics endpoint
router.get('/metrics', async (req, res) => {
  try {
    // Example metrics (replace with real queries as needed)
    const rfqCount = await storage.countRFQs?.() || 0;
    const bidCount = await storage.countBids?.() || 0;
    const escrowTotal = await storage.sumEscrowAmount?.() || 0;
    const adRevenue = await storage.sumAdRevenue?.() || 0;
    const invoiceDiscounting = await storage.sumInvoiceDiscounting?.() || 0;

    let metrics = '';
    metrics += `rfq_volume_total ${rfqCount}\n`;
    metrics += `transaction_fees_total ${bidCount * 200}\n`;
    metrics += `escrow_amount_total ${escrowTotal}\n`;
    metrics += `ad_revenue_total ${adRevenue}\n`;
    metrics += `invoice_discounting_total ${invoiceDiscounting}\n`;

    res.set('Content-Type', 'text/plain');
    res.send(metrics);
  } catch (e) {
    res.status(500).send('# Error generating metrics');
  }
});

export default router;
