import axios from 'axios';

const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY;
const MSG91_SENDER_ID = process.env.MSG91_SENDER_ID;
const MSG91_TEMPLATE_ID = process.env.MSG91_TEMPLATE_ID;

export class OTPService {
  static async sendOTP(phoneNumber: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axios.post('https://api.msg91.com/api/v5/otp', {
        authkey: MSG91_AUTH_KEY,
        mobile: phoneNumber,
        sender: MSG91_SENDER_ID,
        template_id: MSG91_TEMPLATE_ID
      });
      
      if (response.data.type === 'success') {
        return { success: true, message: 'OTP sent successfully' };
      } else {
        return { success: false, message: 'Failed to send OTP' };
      }
    } catch (error) {
      console.error('OTP send error:', error);
      return { success: false, message: 'Error sending OTP' };
    }
  }
  
  static async verifyOTP(phoneNumber: string, otp: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axios.post('https://api.msg91.com/api/v5/otp/verify', {
        authkey: MSG91_AUTH_KEY,
        mobile: phoneNumber,
        otp: otp
      });
      
      if (response.data.type === 'success') {
        return { success: true, message: 'OTP verified successfully' };
      } else {
        return { success: false, message: 'Invalid OTP' };
      }
    } catch (error) {
      console.error('OTP verify error:', error);
      return { success: false, message: 'Error verifying OTP' };
    }
  }
}