import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { RateLimiter } from 'limiter';

@Injectable()
export class SlackService {
  private readonly logger = new Logger(SlackService.name);
  private readonly rateLimiter: RateLimiter;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    // Allow 20 messages per minute
    this.rateLimiter = new RateLimiter({
      tokensPerInterval: 20,
      interval: 'minute',
    });
  }

  private getWebhookUrl(channel: 'alerts' | 'errors' | 'info'): string {
    const baseUrl = this.configService.get<string>('SLACK_WEBHOOK_URL');
    if (!baseUrl) {
      throw new Error('Slack webhook URL not configured');
    }
    return `${baseUrl}/${channel}`;
  }

  private createMessage(type: 'error' | 'warning' | 'info', title: string, message: string, metadata?: any) {
    const colors = {
      error: '#FF0000', // Red
      warning: '#FFA500', // Orange
      info: '#00FF00', // Green
    };

    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: title,
          emoji: true,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: message,
        },
      },
    ];

    if (metadata) {
      blocks.push({
        type: 'section',
        fields: Object.entries(metadata).map(([key, value]) => ({
          type: 'mrkdwn',
          text: `*${key}*:\n${typeof value === 'object' ? JSON.stringify(value, null, 2) : value}`,
        })),
      });
    }

    blocks.push({
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `*Type:* ${type.toUpperCase()} | *Time:* ${new Date().toISOString()}`,
        },
      ],
    });

    return {
      blocks,
      attachments: [
        {
          color: colors[type],
          blocks,
        },
      ],
    };
  }

  private async waitForRateLimit(): Promise<void> {
    const hasToken = await this.rateLimiter.tryRemoveTokens(1);
    if (!hasToken) {
      this.logger.warn('Rate limit reached, waiting for next available token...');
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return this.waitForRateLimit();
    }
  }

  async sendAlert(
    type: 'error' | 'warning' | 'info',
    title: string,
    message: string,
    metadata?: Record<string, any>,
  ) {
    try {
      await this.waitForRateLimit();

      const channel = type === 'error' ? 'errors' : type === 'warning' ? 'alerts' : 'info';
      const webhookUrl = this.getWebhookUrl(channel);
      const payload = this.createMessage(type, title, message, metadata);

      await firstValueFrom(
        this.httpService.post(webhookUrl, payload, {
          headers: {
            'Content-Type': 'application/json',
          },
        }),
      );

      this.logger.log(`Slack alert sent to ${channel} channel: ${title}`);
    } catch (error) {
      this.logger.error(`Failed to send Slack alert: ${error.message}`, error.stack);
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