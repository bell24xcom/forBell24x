import { Request, Response } from 'express';
import { authenticator } from 'otplib';
import * as QRCode from 'qrcode';

export const generateMfaSecret = async (req: Request, res: Response) => {
  const secret = authenticator.generateSecret();
  
  try {
    const otpauthUrl = authenticator.keyuri(req.user.email, 'Bell24H', secret);
    const qrCode = await QRCode.toDataURL(otpauthUrl);
    
    res.status(200).json({ secret, qrCode });
  } catch (error) {
    console.error('Failed to generate QR code', error);
    res.status(500).json({ message: 'Failed to generate MFA setup' });
  }
};

export const verifyMfaToken = async (req: Request, res: Response) => {
  const { token, secret } = req.body;
  
  const isValid = authenticator.check(token, secret);
  
  if (isValid) {
    // Save secret to user in database
    res.status(200).json({ message: 'MFA setup successful' });
  } else {
    res.status(400).json({ message: 'Invalid token' });
  }
};
