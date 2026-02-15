import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class TeamsService {
  private readonly logger = new Logger(TeamsService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  private getWebhookUrl(channel: 'alerts' | 'errors' | 'info'): string {
    const baseUrl = this.configService.get<string>('TEAMS_WEBHOOK_URL');
    if (!baseUrl) {
      throw new Error('Teams webhook URL not configured');
    }
    return `${baseUrl}/${channel}`;
  }

  private createCard(type: 'error' | 'warning' | 'info', title: string, message: string, metadata?: any) {
    const colors = {
      error: '#FF0000', // Red
      warning: '#FFA500', // Orange
      info: '#00FF00', // Green
    };

    return {
      type: 'message',
      attachments: [{
        contentType: 'application/vnd.microsoft.card.adaptive',
        content: {
          type: 'AdaptiveCard',
          version: '1.0',
          body: [
            {
              type: 'TextBlock',
              text: title,
              weight: 'bolder',
              size: 'large',
              color: colors[type],
            },
            {
              type: 'TextBlock',
              text: message,
              wrap: true,
            },
            ...(metadata ? [{
              type: 'FactSet',
              facts: Object.entries(metadata).map(([key, value]) => ({
                title: key,
                value: typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value),
              })),
            }] : []),
            {
              type: 'TextBlock',
              text: `Timestamp: ${new Date().toISOString()}`,
              isSubtle: true,
            },
          ],
        },
      }],
    };
  }

  async sendAlert(
    type: 'error' | 'warning' | 'info',
    title: string,
    message: string,
    metadata?: Record<string, any>,
  ) {
    try {
      const channel = type === 'error' ? 'errors' : type === 'warning' ? 'alerts' : 'info';
      const webhookUrl = this.getWebhookUrl(channel);
      const payload = this.createCard(type, title, message, metadata);

      await firstValueFrom(
        this.httpService.post(webhookUrl, payload, {
          headers: {
            'Content-Type': 'application/json',
          },
        }),
      );

      this.logger.log(`Teams alert sent to ${channel} channel: ${title}`);
    } catch (error) {
      this.logger.error(`Failed to send Teams alert: ${error.message}`, error.stack);
      throw error;
    }
  }

  async sendErrorAlert(error: Error, context?: string) {
    await this.sendAlert(
      'error',
      'System Error',
      error.message,
      {
        context,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      },
    );
  }

  async sendWarningAlert(message: string, metadata?: Record<string, any>) {
    await this.sendAlert('warning', 'System Warning', message, metadata);
  }

  async sendInfoAlert(message: string, metadata?: Record<string, any>) {
    await this.sendAlert('info', 'System Info', message, metadata);
  }
} 