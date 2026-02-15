import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { MonitoringService } from './monitoring.service';

export type EventType = 
  | 'rfq.created'
  | 'rfq.updated'
  | 'rfq.completed'
  | 'escrow.created'
  | 'escrow.released'
  | 'user.registered'
  | 'user.updated'
  | 'transaction.created'
  | 'transaction.completed';

export interface EventData {
  [key: string]: any;
}

@Injectable()
export class EventService {
  private readonly logger = new Logger(EventService.name);
  private readonly webhookUrl: string;
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000; // 1 second

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly monitoringService: MonitoringService,
  ) {
    this.webhookUrl = this.configService.get<string>('N8N_WEBHOOK_URL');
    if (!this.webhookUrl) {
      this.logger.warn('N8N_WEBHOOK_URL is not configured');
    }
  }

  async sendEvent(event: EventType, data: EventData): Promise<void> {
    if (!this.webhookUrl) {
      this.logger.error('Cannot send event: N8N_WEBHOOK_URL is not configured');
      await this.monitoringService.logEvent(event, data, 'error', 'Webhook URL not configured');
      return;
    }

    try {
      await firstValueFrom(
        this.httpService.post(
          this.webhookUrl,
          {
            event,
            data,
            timestamp: new Date().toISOString(),
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'X-Event-Source': 'bell24h-backend',
            },
          },
        ).pipe(
          retry({
            count: this.maxRetries,
            delay: this.retryDelay,
          }),
          catchError((error) => {
            this.logger.error(
              `Failed to send event ${event} after ${this.maxRetries} retries`,
              error.stack,
            );
            throw error;
          }),
        ),
      );

      this.logger.log(`Successfully sent event: ${event}`);
      await this.monitoringService.logEvent(event, data, 'success');
    } catch (error) {
      this.logger.error(
        `Error sending event ${event}: ${error.message}`,
        error.stack,
      );
      await this.monitoringService.logEvent(event, data, 'error', error.message);
      throw error;
    }
  }

  // Convenience methods for common events
  async sendRFQCreated(rfqId: string, data: EventData): Promise<void> {
    await this.sendEvent('rfq.created', { rfqId, ...data });
  }

  async sendRFQUpdated(rfqId: string, data: EventData): Promise<void> {
    await this.sendEvent('rfq.updated', { rfqId, ...data });
  }

  async sendRFQCompleted(rfqId: string, data: EventData): Promise<void> {
    await this.sendEvent('rfq.completed', { rfqId, ...data });
  }

  async sendEscrowCreated(escrowId: string, data: EventData): Promise<void> {
    await this.sendEvent('escrow.created', { escrowId, ...data });
  }

  async sendEscrowReleased(escrowId: string, data: EventData): Promise<void> {
    await this.sendEvent('escrow.released', { escrowId, ...data });
  }

  async sendUserRegistered(userId: string, data: EventData): Promise<void> {
    await this.sendEvent('user.registered', { userId, ...data });
  }

  async sendUserUpdated(userId: string, data: EventData): Promise<void> {
    await this.sendEvent('user.updated', { userId, ...data });
  }

  async sendTransactionCreated(transactionId: string, data: EventData): Promise<void> {
    await this.sendEvent('transaction.created', { transactionId, ...data });
  }

  async sendTransactionCompleted(transactionId: string, data: EventData): Promise<void> {
    await this.sendEvent('transaction.completed', { transactionId, ...data });
  }
} 