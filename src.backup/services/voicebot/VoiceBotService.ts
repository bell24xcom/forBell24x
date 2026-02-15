import { OpenAI } from 'openai';
import { redisService } from '../cache/RedisService';
import { logger } from '../../utils/logger';
import { SpeechRecognizer } from './SpeechRecognizer';
import { SpeechSynthesizer } from './SpeechSynthesizer';
import { CallRouter } from './CallRouter';
import { VoiceCommandHandler } from './VoiceCommandHandler';

interface VoiceBotConfig {
  openaiApiKey: string;
  model: string;
  language: string;
  voiceId: string;
}

interface CallSession {
  id: string;
  userId: string;
  startTime: Date;
  status: 'active' | 'completed' | 'transferred';
  transcript: string[];
}

export class VoiceBotService {
  private openai: OpenAI;
  private config: VoiceBotConfig;
  private speechRecognizer: SpeechRecognizer;
  private speechSynthesizer: SpeechSynthesizer;
  private callRouter: CallRouter;
  private voiceCommandHandler: VoiceCommandHandler;

  constructor(config: VoiceBotConfig) {
    this.config = config;
    this.openai = new OpenAI({ apiKey: config.openaiApiKey });
    this.speechRecognizer = new SpeechRecognizer(this.openai, config);
    this.speechSynthesizer = new SpeechSynthesizer(this.openai, config);
    this.callRouter = new CallRouter();
    this.voiceCommandHandler = new VoiceCommandHandler();
  }

  async handleIncomingCall(callId: string, phoneNumber: string): Promise<void> {
    try {
      // Create call session
      const session: CallSession = {
        id: callId,
        userId: phoneNumber,
        startTime: new Date(),
        status: 'active',
        transcript: []
      };

      // Store session
      await redisService.set(`call:${callId}`, session);

      // Play greeting
      await this.playGreeting(callId);

      // Start call handling
      await this.handleCall(session);

      logger.info('VoiceBot incoming call handled successfully', { callId, phoneNumber });
    } catch (error) {
      logger.error('Error handling VoiceBot incoming call', { error, callId, phoneNumber });
      throw error;
    }
  }

  private async playGreeting(callId: string): Promise<void> {
    try {
      const greeting = await this.speechSynthesizer.synthesize(
        'Welcome to Bell24H. How can I help you today?',
        this.config.voiceId
      );
      await this.callRouter.playAudio(callId, greeting);
    } catch (error) {
      logger.error('Error playing VoiceBot greeting', { error, callId });
      throw error;
    }
  }

  private async handleCall(session: CallSession): Promise<void> {
    try {
      while (session.status === 'active') {
        // Listen for user input
        const audio = await this.callRouter.recordAudio(session.id);
        
        // Convert speech to text
        const text = await this.speechRecognizer.recognize(audio);
        session.transcript.push(text);

        // Process voice command
        const command = await this.voiceCommandHandler.processCommand(text);
        
        if (command.type === 'transfer') {
          // Transfer call to human agent
          await this.transferCall(session, command.agentId);
          break;
        } else if (command.type === 'response') {
          // Generate and play response
          const response = await this.generateResponse(text);
          const audioResponse = await this.speechSynthesizer.synthesize(
            response,
            this.config.voiceId
          );
          await this.callRouter.playAudio(session.id, audioResponse);
        }

        // Update session
        await redisService.set(`call:${session.id}`, session);
      }
    } catch (error) {
      logger.error('Error in VoiceBot call handling', { error, callId: session.id });
      throw error;
    }
  }

  private async generateResponse(text: string): Promise<string> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: this.config.model,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful customer service assistant. Provide clear and concise responses.'
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.7,
        max_tokens: 150
      });

      return completion.choices[0].message.content || 'I apologize, but I could not process your request.';
    } catch (error) {
      logger.error('Error generating VoiceBot response', { error });
      throw error;
    }
  }

  private async transferCall(session: CallSession, agentId: string): Promise<void> {
    try {
      // Update session status
      session.status = 'transferred';
      await redisService.set(`call:${session.id}`, session);

      // Transfer call to agent
      await this.callRouter.transferCall(session.id, agentId);

      logger.info('VoiceBot call transferred successfully', { callId: session.id, agentId });
    } catch (error) {
      logger.error('Error transferring VoiceBot call', { error, callId: session.id, agentId });
      throw error;
    }
  }

  async endCall(callId: string): Promise<void> {
    try {
      // Get session
      const session = await redisService.get<CallSession>(`call:${callId}`);
      if (!session) {
        throw new Error('Call session not found');
      }

      // Update session status
      session.status = 'completed';
      await redisService.set(`call:${callId}`, session);

      // End call
      await this.callRouter.endCall(callId);

      logger.info('VoiceBot call ended successfully', { callId });
    } catch (error) {
      logger.error('Error ending VoiceBot call', { error, callId });
      throw error;
    }
  }

  async getCallTranscript(callId: string): Promise<string[]> {
    try {
      const session = await redisService.get<CallSession>(`call:${callId}`);
      if (!session) {
        throw new Error('Call session not found');
      }

      return session.transcript;
    } catch (error) {
      logger.error('Error retrieving VoiceBot call transcript', { error, callId });
      throw error;
    }
  }

  async updateVoiceSettings(voiceId: string): Promise<void> {
    try {
      this.config.voiceId = voiceId;
      logger.info('VoiceBot voice settings updated successfully', { voiceId });
    } catch (error) {
      logger.error('Error updating VoiceBot voice settings', { error, voiceId });
      throw error;
    }
  }

  async addVoiceCommand(pattern: string, action: string): Promise<void> {
    try {
      await this.voiceCommandHandler.addCommand(pattern, action);
      logger.info('VoiceBot command added successfully', { pattern, action });
    } catch (error) {
      logger.error('Error adding VoiceBot command', { error, pattern, action });
      throw error;
    }
  }
}

export const voiceBotService = new VoiceBotService({
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  model: 'gpt-4',
  language: 'en-US',
  voiceId: 'en-US-Neural2-F'
}); 