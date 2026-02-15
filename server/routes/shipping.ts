import express from 'express';
import { createShipment, trackShipment } from '../services/shipping';

const router = express.Router();

// POST /api/shipping/create
router.post('/create', async (req, res) => {
  try {
    const result = await createShipment(req.body);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: 'Shipment creation failed', details: error.message });
  }
});

// GET /api/shipping/track
router.get('/track', async (req, res) => {
  try {
    const { provider, trackingNumber } = req.query;
    if (!provider || !trackingNumber) throw new Error('Missing provider or tracking number');
    const result = await trackShipment(provider as string, trackingNumber as string);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: 'Shipment tracking failed', details: error.message });
  }
});

export default router;
