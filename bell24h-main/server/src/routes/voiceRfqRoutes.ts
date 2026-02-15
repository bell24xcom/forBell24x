import { Router } from 'express';
import { VoiceRfqController } from '../controllers/voiceRfqController';
import { VoiceRfqService } from '../services/voiceRfqService';

const router = Router();
const voiceRfqService = new VoiceRfqService();
const voiceRfqController = new VoiceRfqController(voiceRfqService);

router.post('/rfq/voice', (req, res) => voiceRfqController.processVoiceRfq(req, res));

export default router; 