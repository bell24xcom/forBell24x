import { Request, Response } from 'express';
import { VoiceRfqService } from '../services/voiceRfqService';
import { StatusCodes } from 'http-status-codes';

export class VoiceRfqController {
    constructor(private voiceRfqService: VoiceRfqService) {}

    async processVoiceRfq(req: Request, res: Response): Promise<void> {
        try {
            const { audioBase64, languagePreference } = req.body;

            if (!audioBase64) {
                res.status(StatusCodes.BAD_REQUEST).json({ message: 'audioBase64 is required' });
                return;
            }

            console.log(`[VoiceRfqController] Processing voice RFQ, language: ${languagePreference}`);

            // Simulate transcription and parsing for now
            const mockTranscription = "I need 100 units of steel pipes, 5 inches in diameter, delivered to Mumbai by next week.";
            const rfqData = await this.voiceRfqService.process(mockTranscription);

            res.status(StatusCodes.OK).json(rfqData);
        } catch (error) {
            console.error('[VoiceRfqController] Error processing voice RFQ:', error);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error processing voice RFQ' });
        }
    }
} 