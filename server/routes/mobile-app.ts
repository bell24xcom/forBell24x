import express from 'express';
import { sendPushNotification, storeOfflineData } from '../services/mobile-app';

const router = express.Router();

// POST /api/mobile/push
router.post('/push', async (req, res) => {
  try {
    const result = await sendPushNotification(req.body);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: 'Push notification failed', details: error.message });
  }
});

// POST /api/mobile/offline
router.post('/offline', async (req, res) => {
  try {
    const result = await storeOfflineData(req.body);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: 'Offline storage failed', details: error.message });
  }
});

export default router;
