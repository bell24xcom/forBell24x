// MSG91 SMS Service Integration using Shared API
// Uses your existing shared MSG91 API

interface MSG91Config {
  apiUrl: string;
  apiKey: string;
  templateId: string;
  senderId: string;
}

interface SendOTPResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

class MSG91Service {
  private config: MSG91Config;

  constructor() {
    this.config = {
      apiUrl: process.env.MSG91_API_URL || 'https://your-shared-api.com/api/msg91',
      apiKey: process.env.MSG91_API_KEY || '',
      templateId: process.env.MSG91_TEMPLATE_ID || 'your_template_id',
      senderId: process.env.MSG91_SENDER_ID || 'BELL24'
    };
  }

  async sendOTP(mobile: string, otp: string): Promise<SendOTPResponse> {
    try {
      // Validate configuration
      if (!this.config.apiUrl) {
        throw new Error('MSG91_API_URL is not configured');
      }

      if (!this.config.apiKey) {
        throw new Error('MSG91_API_KEY is not configured');
      }

      // Format mobile number (ensure it starts with +91)
      const formattedMobile = mobile.startsWith('+91') ? mobile : `+91${mobile}`;

      // Call your shared MSG91 API
      const response = await fetch(`${this.config.apiUrl}/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'X-API-Key': this.config.apiKey
        },
        body: JSON.stringify({
          mobile: formattedMobile,
          otp: otp,
          template_id: this.config.templateId,
          sender_id: this.config.senderId,
          expiry: 300 // 5 minutes
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return {
          success: true,
          messageId: data.messageId || data.request_id
        };
      } else {
        return {
          success: false,
          error: data.message || data.error || 'Failed to send OTP'
        };
      }

    } catch (error) {
      console.error('MSG91 Send OTP Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send OTP'
      };
    }
  }

  async verifyOTP(mobile: string, otp: string): Promise<{ success: boolean; error?: string }> {
    try {
      const formattedMobile = mobile.startsWith('+91') ? mobile : `+91${mobile}`;

      const response = await fetch(`${this.config.apiUrl}/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'X-API-Key': this.config.apiKey
        },
        body: JSON.stringify({
          mobile: formattedMobile,
          otp: otp
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return { success: true };
      } else {
        return {
          success: false,
          error: data.message || data.error || 'Invalid OTP'
        };
      }

    } catch (error) {
      console.error('MSG91 Verify OTP Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'OTP verification failed'
      };
    }
  }

  // Fallback method for development/testing
  async sendOTPDev(mobile: string, otp: string): Promise<SendOTPResponse> {
    console.log(`📱 [DEV MODE] OTP for ${mobile}: ${otp}`);
    console.log(`📱 [DEV MODE] SMS would be sent via shared MSG91 API to +91${mobile}`);
    
    return {
      success: true,
      messageId: `dev_${Date.now()}`
    };
  }
}

export const msg91Service = new MSG91Service();

// Environment variables needed for your shared API:
// MSG91_API_URL=https://your-shared-api.com/api/msg91
// MSG91_API_KEY=your_api_key_here
// MSG91_TEMPLATE_ID=your_template_id_here  
// MSG91_SENDER_ID=BELL24