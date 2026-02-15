import { PrismaClient } from '@prisma/client';
import { prisma } from '../utils/prisma';
import { authenticator } from 'otplib';
import { logger } from '../utils/logger';
import { emailService } from './emailService';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';
import { generateSecureRandom } from '../utils/crypto';

export class MFAService {
  private readonly BACKUP_CODES_COUNT = 10;
  private readonly BACKUP_CODE_LENGTH = 8;

  constructor(private readonly prisma: PrismaClient) {}

  async setupMFA(userId: string): Promise<{
    secret: string;
    qrCode: string;
    backupCodes: string[];
  }> {
    try {
      // Generate a new secret
      const secret = authenticator.generateSecret();
      
      // Generate recovery codes
      const recoveryCodes = await this.generateRecoveryCodes();
      
      // Store the secret and recovery codes
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          mfaSecret: secret,
          mfaRecoveryCodes: recoveryCodes,
          mfaEnabled: false // Will be enabled after verification
        }
      });

      // Generate QR code URL
      const otpauth = authenticator.keyuri(
        userId,
        'Bell24H.com',
        secret
      );

      return {
        secret,
        qrCode: otpauth,
        backupCodes: recoveryCodes
      };
    } catch (error) {
      logger.error('MFA setup failed:', error);
      throw new Error('Failed to setup MFA');
    }
  }

  async verifyMFASetup(userId: string, code: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { mfaSecret: true }
      });

      if (!user?.mfaSecret) {
        throw new Error('MFA not setup');
      }

      const isValid = authenticator.verify({
        token: code,
        secret: user.mfaSecret
      });

      if (!isValid) {
        throw new Error('Invalid verification code');
      }

      // Enable MFA
      await this.prisma.user.update({
        where: { id: userId },
        data: { mfaEnabled: true }
      });

      return {
        enabled: true,
        message: 'MFA enabled successfully'
      };
    } catch (error) {
      logger.error('MFA verification failed:', error);
      throw error;
    }
  }

  async disableMFA(userId: string): Promise<boolean> {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          mfaEnabled: false,
          mfaSecret: null,
          mfaRecoveryCodes: []
        }
      });

      // Send confirmation email
      await emailService.sendMFADisabledEmail(userId);

      return true;
    } catch (error) {
      logger.error('MFA disable failed:', error);
      throw new Error('Failed to disable MFA');
    }
  }

  async generateRecoveryCodes(): Promise<string[]> {
    try {
      const codes = [];
      for (let i = 0; i < 8; i++) {
        const code = await generateSecureRandom(10);
        codes.push(code);
      }
      return codes;
    } catch (error) {
      logger.error('Recovery codes generation failed:', error);
      throw new Error('Failed to generate recovery codes');
    }
  }

  async verifyCode(userId: string, code: string): Promise<boolean> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { mfaSecret: true, mfaRecoveryCodes: true }
      });

      if (!user?.mfaSecret) {
        return false;
      }

      // Check if it's a recovery code
      if (user.mfaRecoveryCodes.includes(code)) {
        // Remove used recovery code
        await this.prisma.user.update({
          where: { id: userId },
          data: {
            mfaRecoveryCodes: user.mfaRecoveryCodes.filter(c => c !== code)
          }
        });
        return true;
      }

      // Verify TOTP code
      return authenticator.verify({
        token: code,
        secret: user.mfaSecret
      });
    } catch (error) {
      logger.error('MFA code verification failed:', error);
      return false;
    }
  }
}

export const mfaService = new MFAService(prisma); 