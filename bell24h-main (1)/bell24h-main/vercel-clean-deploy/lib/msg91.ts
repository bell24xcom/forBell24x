// lib/msg91.ts - MSG91 SMS API Integration
import { NextResponse } from 'next/server';

interface MSG91Config {
  authKey: string;
  senderId: string;
  templateId?: string;
}

interface SendOTPParams {
  phone: string;
  otp: string;
  templateId?: string;
}

class MSG91Service {
  private config: MSG91Config;

  constructor() {
    this.config = {
      authKey: process.env.MSG91_AUTH_KEY || '',
      senderId: process.env.MSG91_SENDER_ID || 'BELL24H',
      templateId: process.env.MSG91_TEMPLATE_ID || 'default'
    };
  }

  async sendOTP({ phone, otp, templateId }: SendOTPParams): Promise<{ success: boolean; message: string; error?: string }> {
    try {
      // Validate configuration
      if (!this.config.authKey) {
        return {
          success: false,
          message: 'MSG91 not configured',
          error: 'MSG91_AUTH_KEY not found in environment variables'
        };
      }

      // Clean phone number (remove + and ensure it starts with country code)
      const cleanPhone = phone.replace(/\D/g, '');
      const formattedPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;

      // MSG91 API endpoint
      const url = 'https://api.msg91.com/api/v5/otp';
      
      const payload = {
        template_id: templateId || this.config.templateId,
        mobile: formattedPhone,
        otp: otp,
        authkey: this.config.authKey
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'authkey': this.config.authKey
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok && data.type === 'success') {
        return {
          success: true,
          message: 'OTP sent successfully'
        };
      } else {
        return {
          success: false,
          message: 'Failed to send OTP',
          error: data.message || 'Unknown error'
        };
      }

    } catch (error) {
      console.error('MSG91 Error:', error);
      return {
        success: false,
        message: 'Failed to send OTP',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async sendSMS({ phone, message }: { phone: string; message: string }): Promise<{ success: boolean; message: string; error?: string }> {
    try {
      if (!this.config.authKey) {
        return {
          success: false,
          message: 'MSG91 not configured',
          error: 'MSG91_AUTH_KEY not found in environment variables'
        };
      }

      const cleanPhone = phone.replace(/\D/g, '');
      const formattedPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;

      const url = 'https://api.msg91.com/api/sendhttp.php';
      const params = new URLSearchParams({
        authkey: this.config.authKey,
        mobiles: formattedPhone,
        message: message,
        sender: this.config.senderId,
        route: '4'
      });

      const response = await fetch(`${url}?${params}`);
      const data = await response.text();

      if (data.includes('SMS sent successfully')) {
        return {
          success: true,
          message: 'SMS sent successfully'
        };
      } else {
        return {
          success: false,
          message: 'Failed to send SMS',
          error: data
        };
      }

    } catch (error) {
      console.error('MSG91 SMS Error:', error);
      return {
        success: false,
        message: 'Failed to send SMS',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Health check for MSG91 service
  async healthCheck(): Promise<{ status: string; message: string }> {
    try {
      if (!this.config.authKey) {
        return {
          status: 'error',
          message: 'MSG91 not configured - AUTH_KEY missing'
        };
      }

      // Test with a dummy request
      const testResponse = await this.sendOTP({
        phone: '9999999999',
        otp: '123456'
      });

      if (testResponse.success) {
        return {
          status: 'healthy',
          message: 'MSG91 service is operational'
        };
      } else {
        return {
          status: 'warning',
          message: `MSG91 service issue: ${testResponse.error}`
        };
      }

    } catch (error) {
      return {
        status: 'error',
        message: `MSG91 service error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}

// Export singleton instance
export const msg91Service = new MSG91Service();

// Export types
export type { SendOTPParams, MSG91Config };
