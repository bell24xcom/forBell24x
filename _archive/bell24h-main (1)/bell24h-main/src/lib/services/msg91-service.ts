// MSG91 OTP Service Integration
// This service handles OTP sending and verification using MSG91 API

const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY || 'YOUR_MSG91_AUTH_KEY';
const MSG91_SENDER_ID = process.env.MSG91_SENDER_ID || 'BELL24H';
const MSG91_ROUTE = process.env.MSG91_ROUTE || '4'; // 4 = Transactional
const MSG91_OTP_LENGTH = 6;
const MSG91_OTP_EXPIRY = 5; // minutes

interface SendOTPResponse {
  success: boolean;
  message: string;
  requestId?: string;
  error?: string;
}

interface VerifyOTPResponse {
  success: boolean;
  message: string;
  verified: boolean;
  error?: string;
}

export class MSG91Service {
  private authKey: string;
  private senderId: string;
  private route: string;

  constructor() {
    this.authKey = MSG91_AUTH_KEY;
    this.senderId = MSG91_SENDER_ID;
    this.route = MSG91_ROUTE;
  }

  /**
   * Send OTP to mobile number using MSG91
   */
  async sendOTP(mobileNumber: string): Promise<SendOTPResponse> {
    try {
      // Validate mobile number (Indian format)
      if (!this.isValidIndianMobile(mobileNumber)) {
        return {
          success: false,
          message: 'Invalid mobile number format',
          error: 'Mobile number must be 10 digits',
        };
      }

      // Format mobile number (remove +91 if present)
      const formattedNumber = mobileNumber.replace(/^\+91/, '').trim();

      // MSG91 OTP Send API endpoint
      const url = 'https://control.msg91.com/api/v5/otp';
      const payload = {
        template_id: process.env.MSG91_TEMPLATE_ID, // Your MSG91 template ID
        mobile: `91${formattedNumber}`, // Country code + number
        authkey: this.authKey,
        otp_length: MSG91_OTP_LENGTH,
        otp_expiry: MSG91_OTP_EXPIRY,
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'authkey': this.authKey,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.type === 'success') {
        return {
          success: true,
          message: 'OTP sent successfully',
          requestId: data.request_id,
        };
      } else {
        return {
          success: false,
          message: 'Failed to send OTP',
          error: data.message || 'Unknown error',
        };
      }
    } catch (error) {
      console.error('MSG91 Send OTP Error:', error);
      return {
        success: false,
        message: 'Error sending OTP',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Verify OTP using MSG91
   */
  async verifyOTP(mobileNumber: string, otp: string): Promise<VerifyOTPResponse> {
    try {
      // Validate inputs
      if (!this.isValidIndianMobile(mobileNumber)) {
        return {
          success: false,
          message: 'Invalid mobile number format',
          verified: false,
          error: 'Mobile number must be 10 digits',
        };
      }

      if (!otp || otp.length !== MSG91_OTP_LENGTH) {
        return {
          success: false,
          message: 'Invalid OTP format',
          verified: false,
          error: `OTP must be ${MSG91_OTP_LENGTH} digits`,
        };
      }

      // Format mobile number
      const formattedNumber = mobileNumber.replace(/^\+91/, '').trim();

      // MSG91 OTP Verify API endpoint
      const url = `https://control.msg91.com/api/v5/otp/verify?otp=${otp}&mobile=91${formattedNumber}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'authkey': this.authKey,
        },
      });

      const data = await response.json();

      if (response.ok && data.type === 'success') {
        return {
          success: true,
          message: 'OTP verified successfully',
          verified: true,
        };
      } else {
        return {
          success: false,
          message: 'Invalid OTP',
          verified: false,
          error: data.message || 'OTP verification failed',
        };
      }
    } catch (error) {
      console.error('MSG91 Verify OTP Error:', error);
      return {
        success: false,
        message: 'Error verifying OTP',
        verified: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Resend OTP
   */
  async resendOTP(mobileNumber: string): Promise<SendOTPResponse> {
    try {
      const formattedNumber = mobileNumber.replace(/^\+91/, '').trim();
      const url = 'https://control.msg91.com/api/v5/otp/retry';
      const payload = {
        mobile: `91${formattedNumber}`,
        authkey: this.authKey,
        retrytype: 'text', // or 'voice' for voice OTP
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'authkey': this.authKey,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.type === 'success') {
        return {
          success: true,
          message: 'OTP resent successfully',
        };
      } else {
        return {
          success: false,
          message: 'Failed to resend OTP',
          error: data.message || 'Unknown error',
        };
      }
    } catch (error) {
      console.error('MSG91 Resend OTP Error:', error);
      return {
        success: false,
        message: 'Error resending OTP',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Validate Indian mobile number format
   */
  private isValidIndianMobile(mobile: string): boolean {
    const cleanNumber = mobile.replace(/^\+91/, '').trim();
    const mobileRegex = /^[6-9]\d{9}$/;
    return mobileRegex.test(cleanNumber);
  }
}

// Singleton instance
export const msg91Service = new MSG91Service();

// Helper functions for easy import
export const sendOTP = (mobile: string) => msg91Service.sendOTP(mobile);
export const verifyOTP = (mobile: string, otp: string) => msg91Service.verifyOTP(mobile, otp);
export const resendOTP = (mobile: string) => msg91Service.resendOTP(mobile);

