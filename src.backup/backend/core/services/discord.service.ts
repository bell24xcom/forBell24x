import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class DiscordService {
  private readonly logger = new Logger(DiscordService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  private getWebhookUrl(channel: 'alerts' | 'errors' | 'info'): string {
    const baseUrl = this.configService.get<string>('DISCORD_WEBHOOK_URL');
    if (!baseUrl) {
      throw new Error('Discord webhook URL not configured');
    }
    return `${baseUrl}/${channel}`;
  }

  private createEmbed(type: 'error' | 'warning' | 'info', title: string, message: string, metadata?: any) {
    const colors = {
      error: 0xFF0000, // Red
      warning: 0xFFA500, // Orange
      info: 0x00FF00, // Green
    };

    return {
      embeds: [{
        title,
        description: message,
        color: colors[type],
        fields: metadata ? Object.entries(metadata).map(([key, value]) => ({
          name: key,
          value: typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value),
          inline: true,
        })) : [],
        timestamp: new Date().toISOString(),
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
      const payload = this.createEmbed(type, title, message, metadata);

      await firstValueFrom(
        this.httpService.post(webhookUrl, payload, {
          headers: {
            'Content-Type': 'application/json',
          },
        }),
      );

      this.logger.log(`Discord alert sent to ${channel} channel: ${title}`);
    } catch (error) {
      this.logger.error(`Failed to send Discord alert: ${error.message}`, error.stack);
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