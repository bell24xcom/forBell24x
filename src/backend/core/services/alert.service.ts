import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { DiscordService } from './discord.service';
import { TeamsService } from './teams.service';

@Injectable()
export class AlertService {
  private readonly logger = new Logger(AlertService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly discordService: DiscordService,
    private readonly teamsService: TeamsService,
  ) {}

  async sendAlert(
    type: 'error' | 'warning' | 'info',
    title: string,
    message: string,
    metadata?: Record<string, any>,
  ) {
    try {
      // Send to n8n
      const webhookUrl = this.configService.get<string>('N8N_WEBHOOK_URL');
      if (webhookUrl) {
        const payload = {
          type,
          title,
          message,
          metadata,
          timestamp: new Date().toISOString(),
        };

        await firstValueFrom(
          this.httpService.post(webhookUrl, payload, {
            headers: {
              'Content-Type': 'application/json',
            },
          }),
        );
      }

      // Send to Discord
      await this.discordService.sendAlert(type, title, message, metadata);

      // Send to Teams
      await this.teamsService.sendAlert(type, title, message, metadata);

      this.logger.log(`Alert sent: ${title}`);
    } catch (error) {
      this.logger.error(`Failed to send alert: ${error.message}`, error.stack);
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