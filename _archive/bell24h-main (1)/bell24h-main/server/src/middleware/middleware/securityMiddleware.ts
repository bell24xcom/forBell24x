import { Request, Response, NextFunction } from 'express';
import { mfaService } from '../services/mfaService';
import { deviceManagementService } from '../services/deviceManagementService';
import { transactionSecurityService } from '../services/transactionSecurityService';
import { logger } from '../utils/logger';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const securityMiddleware = {
  /**
   * Middleware to verify device and enforce MFA
   */
  async verifyDeviceAndMFA(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const deviceInfo = {
        userAgent: req.headers['user-agent'] as string,
        ipAddress: req.ip,
        deviceId: req.headers['x-device-id'] as string
      };

      // Check if device is registered
      const device = await deviceManagementService.getDevices(req.user.id)
        .then(devices => devices.find(d => d.id === deviceInfo.deviceId));

      if (!device) {
        // Register new device
        const { deviceId, verificationToken } = await deviceManagementService.registerDevice(
          req.user.id,
          deviceInfo
        );

        return res.status(403).json({
          error: 'Device verification required',
          deviceId,
          verificationToken
        });
      }

      // Check if device is verified
      if (!device.isVerified) {
        return res.status(403).json({
          error: 'Device not verified',
          deviceId: device.id
        });
      }

      // Check if MFA is required
      const mfaSetup = await mfaService.getMFASetup(req.user.id);
      if (mfaSetup?.isEnabled) {
        const mfaToken = req.headers['x-mfa-token'] as string;
        if (!mfaToken) {
          return res.status(403).json({
            error: 'MFA token required'
          });
        }

        const isValid = await mfaService.verifyMFAToken(req.user.id, mfaToken);
        if (!isValid) {
          return res.status(403).json({
            error: 'Invalid MFA token'
          });
        }
      }

      // Update device activity
      await deviceManagementService.updateDeviceActivity(device.id);

      next();
    } catch (error) {
      logger.error('Security middleware error:', error);
      res.status(500).json({ error: 'Security check failed' });
    }
  },

  /**
   * Middleware to validate transactions
   */
  async validateTransaction(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      // Only apply to transaction-related routes
      if (!req.path.includes('/api/transactions')) {
        return next();
      }

      const transaction = {
        userId: req.user.id,
        amount: req.body.amount,
        type: req.body.type,
        currency: req.body.currency,
        metadata: {
          ...req.body.metadata,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
          deviceId: req.headers['x-device-id']
        }
      };

      const validation = await transactionSecurityService.validateTransaction(transaction);
      if (!validation.isValid) {
        logger.warn('Transaction validation failed', {
          userId: req.user.id,
          reason: validation.reason,
          riskScore: validation.riskScore
        });

        return res.status(403).json({
          error: 'Transaction validation failed',
          reason: validation.reason,
          riskScore: validation.riskScore
        });
      }

      // Add validation result to request for later use
      req.transactionValidation = validation;

      next();
    } catch (error) {
      logger.error('Transaction validation error:', error);
      res.status(500).json({ error: 'Transaction validation failed' });
    }
  },

  /**
   * Middleware to check device risk
   */
  async checkDeviceRisk(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const deviceInfo = {
        userAgent: req.headers['user-agent'] as string,
        ipAddress: req.ip,
        deviceId: req.headers['x-device-id'] as string
      };

      const riskAssessment = await deviceManagementService.checkDeviceRisk(deviceInfo);
      if (riskAssessment.riskScore > 0.7) {
        logger.warn('High risk device detected', {
          userId: req.user.id,
          riskScore: riskAssessment.riskScore,
          riskFactors: riskAssessment.riskFactors
        });

        return res.status(403).json({
          error: 'High risk device detected',
          riskFactors: riskAssessment.riskFactors
        });
      }

      next();
    } catch (error) {
      logger.error('Device risk check error:', error);
      res.status(500).json({ error: 'Device risk check failed' });
    }
  }
}; 