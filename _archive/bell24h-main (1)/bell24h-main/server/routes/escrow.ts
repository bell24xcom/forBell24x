import express, { Request, Response } from 'express';
import { escrowService } from '../services/escrowService.new';
import { walletService } from '../services/walletService';
import { PaymentGateway } from '@prisma/client';

const router = express.Router();

// POST /api/escrow/hold (previously /create)
router.post('/hold', async (req: Request, res: Response) => {
  const {
    walletId,
    amount,
    orderType,
    currency,
    gateway,
    buyerId,
    sellerId,
    sellerWalletId, // New optional parameter
    orderId,
    metadata,
    releaseDate,
    sendNotifications
  } = req.body;

  if (!walletId || !amount || !currency || !gateway || !buyerId || !sellerId) {
    return res.status(400).json({ error: 'Missing required fields for escrow hold check/creation.' });
  }

  try {
    const ruleCheckResult = await escrowService.checkEscrowRules({
      walletId,
      amount,
      orderType
    });

    if (ruleCheckResult.isEscrowRequired) {
      const escrowHold = await escrowService.createEscrowHold({
        walletId,
        amount,
        currency,
        gateway: gateway as PaymentGateway,
        buyerId,
        sellerId,
        sellerWalletId, // Pass the sellerWalletId to the service
        orderId,
        metadata,
        releaseDate,
        sendNotifications
      });
      return res.status(201).json({ message: 'Escrow hold created successfully due to rule: ' + ruleCheckResult.reason, escrowHold });
    } else {
      return res.status(200).json({ message: 'Escrow not required for this transaction.', details: ruleCheckResult });
    }
  } catch (error: any) {
    console.error('Escrow hold error:', error);
    res.status(500).json({ error: 'Escrow hold operation failed', details: error.message });
  }
});

// POST /api/escrow/release
router.post('/release', async (req: Request, res: Response) => {
  const { escrowHoldId, metadata, sendNotifications } = req.body;
  if (!escrowHoldId) {
    return res.status(400).json({ error: 'Missing escrowHoldId for release.' });
  }
  try {
    const result = await escrowService.releaseEscrow({ 
        escrowHoldId, 
        metadata, 
        sendNotifications 
    });
    res.json(result);
  } catch (error: any) {
    console.error('Escrow release error:', error);
    res.status(500).json({ error: 'Escrow release failed', details: error.message });
  }
});

// POST /api/escrow/refund
router.post('/refund', async (req: Request, res: Response) => {
  const { escrowHoldId, reason, metadata, sendNotifications } = req.body;
  if (!escrowHoldId) {
    return res.status(400).json({ error: 'Missing escrowHoldId for refund.' });
  }
  try {
    const result = await escrowService.refundEscrow({ 
        escrowHoldId, 
        reason, 
        metadata, 
        sendNotifications 
    });
    res.json(result);
  } catch (error: any) {
    console.error('Escrow refund error:', error);
    res.status(500).json({ error: 'Escrow refund failed', details: error.message });
  }
});

// POST /api/escrow/toggle
router.post('/toggle', async (req: Request, res: Response) => {
  const { walletId, isEscrowEnabled } = req.body;

  if (!walletId || typeof isEscrowEnabled !== 'boolean') {
    return res.status(400).json({ error: 'Missing walletId or isEscrowEnabled flag (must be boolean).' });
  }

  try {
    const updatedWallet = await walletService.toggleEscrow(walletId, isEscrowEnabled);
    res.json({ message: `Escrow status for wallet ${walletId} set to ${isEscrowEnabled}.`, wallet: updatedWallet });
  } catch (error: any) {
    console.error('Escrow toggle error:', error);
    res.status(500).json({ error: 'Failed to toggle escrow status', details: error.message });
  }
});

export default router;
