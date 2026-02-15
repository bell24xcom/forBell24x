import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { RateLimiter } from 'limiter';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly rateLimiter: RateLimiter;
  private readonly transporter: nodemailer.Transporter;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    // Allow 10 emails per minute
    this.rateLimiter = new RateLimiter({
      tokensPerInterval: 10,
      interval: 'minute',
    });

    // Initialize email transporter
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      secure: this.configService.get<boolean>('SMTP_SECURE'),
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  private async waitForRateLimit(): Promise<void> {
    const hasToken = await this.rateLimiter.tryRemoveTokens(1);
    if (!hasToken) {
      this.logger.warn('Rate limit reached, waiting for next available token...');
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return this.waitForRateLimit();
    }
  }

  private createEmailContent(type: 'error' | 'warning' | 'info', title: string, message: string, metadata?: any) {
    const colors = {
      error: '#FF0000', // Red
      warning: '#FFA500', // Orange
      info: '#00FF00', // Green
    };

    const metadataHtml = metadata
      ? Object.entries(metadata)
          .map(([key, value]) => `<tr><td><strong>${key}:</strong></td><td>${value}</td></tr>`)
          .join('')
      : '';

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: ${colors[type]}; padding: 10px; color: white;">
          <h2 style="margin: 0;">${title}</h2>
        </div>
        <div style="padding: 20px; background-color: #f9f9f9;">
          <p>${message}</p>
          ${metadataHtml ? `<table style="width: 100%; border-collapse: collapse;">${metadataHtml}</table>` : ''}
          <p style="color: #666; font-size: 12px;">
            Sent at: ${new Date().toISOString()}
          </p>
        </div>
      </div>
    `;
  }

  async sendAlert(
    type: 'error' | 'warning' | 'info',
    title: string,
    message: string,
    metadata?: Record<string, any>,
    recipients?: string[],
  ) {
    try {
      await this.waitForRateLimit();

      const to = recipients || this.configService.get<string>('ALERT_EMAIL_RECIPIENTS')?.split(',') || [];
      if (!to.length) {
        throw new Error('No email recipients configured');
      }

      const mailOptions = {
        from: this.configService.get<string>('SMTP_FROM'),
        to,
        subject: `[${type.toUpperCase()}] ${title}`,
        html: this.createEmailContent(type, title, message, metadata),
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email alert sent to ${to.join(', ')}: ${title}`);
    } catch (error) {
      this.logger.error(`Failed to send email alert: ${error.message}`, error.stack);
      throw error;
    }
  }

  async sendErrorAlert(error: Error, context?: string, recipients?: string[]) {
    await this.sendAlert(
      'error',
      'System Error',
      error.message,
      {
        context,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      },
      recipients,
    );
  }

  async sendWarningAlert(message: string, metadata?: Record<string, any>, recipients?: string[]) {
    await this.sendAlert('warning', 'System Warning', message, metadata, recipients);
  }

  async sendInfoAlert(message: string, metadata?: Record<string, any>, recipients?: string[]) {
    await this.sendAlert('info', 'System Info', message, metadata, recipients);
  }
} 