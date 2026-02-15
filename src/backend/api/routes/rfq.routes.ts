import { Router } from 'express';
import { RFQController } from '../controllers/rfq.controller';
import { validateCreateRFQ } from '../validators/rfq.validator';

const router = Router();
const controller = new RFQController();

router.get('/:id', async (req, res) => {
  try {
    const result = await controller.getRFQ(req, res);
    res.json(result);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const result = await controller.listRFQs(req, res);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/', validateCreateRFQ, async (req, res) => {
  try {
    const result = await controller.createRFQ(req, res);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const result = await controller.updateRFQ(req, res);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await controller.deleteRFQ(req, res);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/:id/match', async (req, res) => {
  try {
    const result = await controller.matchSuppliers(req, res);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/:id/proposal', async (req, res) => {
  try {
    const result = await controller.submitProposal(req, res);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/:id/evaluate', async (req, res) => {
  try {
    const result = await controller.evaluateProposals(req, res);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/voice', async (req, res) => {
  try {
    const result = await controller.voiceRFQ(req, res);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router; 