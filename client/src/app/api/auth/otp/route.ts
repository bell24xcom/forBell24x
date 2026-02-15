import { NextRequest, NextResponse } from 'next/server';
import { OTPService } from '@/lib/otp-service';
import { JWTService } from '@/lib/jwt-service';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, otp, action } = await request.json();
    
    if (action === 'send') {
      const result = await OTPService.sendOTP(phoneNumber);
      return NextResponse.json(result);
    }
    
    if (action === 'verify') {
      const result = await OTPService.verifyOTP(phoneNumber, otp);
      
      if (result.success) {
        // Generate JWT token after successful OTP verification
        const token = JWTService.generateToken({ 
          phoneNumber, 
          verified: true,
          timestamp: Date.now()
        });
        
        return NextResponse.json({
          success: true,
          message: 'OTP verified successfully',
          token
        });
      }
      
      return NextResponse.json(result);
    }
    
    return NextResponse.json({ success: false, message: 'Invalid action' });
  } catch (error) {
    console.error('OTP API error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}