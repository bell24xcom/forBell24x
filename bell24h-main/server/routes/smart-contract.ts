import express from 'express';
import { interactWithContract, verifyOnChain } from '../services/smart-contract';

const router = express.Router();

// POST /api/smart-contract/interact
router.post('/interact', async (req, res) => {
  try {
    const { contractAddress, abi, method, args, privateKey, providerUrl } = req.body;
    const result = await interactWithContract(contractAddress, abi, method, args, privateKey, providerUrl);
    res.json({ result });
  } catch (error: any) {
    res.status(500).json({ error: 'Smart contract interaction failed', details: error.message });
  }
});

// POST /api/smart-contract/verify
router.post('/verify', async (req, res) => {
  try {
    const { contractAddress, abi, method, args, providerUrl } = req.body;
    const result = await verifyOnChain(contractAddress, abi, method, args, providerUrl);
    res.json({ result });
  } catch (error: any) {
    res.status(500).json({ error: 'On-chain verification failed', details: error.message });
  }
});

export default router;
