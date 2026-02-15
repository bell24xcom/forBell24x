import { Router } from 'express';
import { deviceManagementService } from '../services/deviceManagementService';
import { mfaService } from '../services/mfaService';
import { securityMiddleware } from '../middleware/securityMiddleware';
import { logger } from '../utils/logger';

const router = Router();

// Device Management Routes
router.get('/devices', securityMiddleware.verifyDeviceAndMFA, async (req, res) => {
  try {
    const devices = await deviceManagementService.getUserDevices(req.user.id);
    res.json({ devices });
  } catch (error) {
    logger.error('Failed to fetch devices:', error);
    res.status(500).json({ error: 'Failed to fetch devices' });
  }
});

router.delete('/devices/:deviceId', securityMiddleware.verifyDeviceAndMFA, async (req, res) => {
  try {
    await deviceManagementService.removeDevice(req.user.id, req.params.deviceId);
    res.json({ message: 'Device removed successfully' });
  } catch (error) {
    logger.error('Failed to remove device:', error);
    res.status(500).json({ error: 'Failed to remove device' });
  }
});

// MFA Routes
router.post('/mfa/setup', securityMiddleware.verifyDeviceAndMFA, async (req, res) => {
  try {
    const setupData = await mfaService.setupMFA(req.user.id);
    res.json(setupData);
  } catch (error) {
    logger.error('Failed to setup MFA:', error);
    res.status(500).json({ error: 'Failed to setup MFA' });
  }
});

router.post('/mfa/verify', securityMiddleware.verifyDeviceAndMFA, async (req, res) => {
  try {
    const { code } = req.body;
    const result = await mfaService.verifyMFASetup(req.user.id, code);
    res.json(result);
  } catch (error) {
    logger.error('Failed to verify MFA:', error);
    res.status(400).json({ error: 'Invalid verification code' });
  }
});

router.post('/mfa/disable', securityMiddleware.verifyDeviceAndMFA, async (req, res) => {
  try {
    await mfaService.disableMFA(req.user.id);
    res.json({ message: 'MFA disabled successfully' });
  } catch (error) {
    logger.error('Failed to disable MFA:', error);
    res.status(500).json({ error: 'Failed to disable MFA' });
  }
});

router.post('/mfa/recovery-codes', securityMiddleware.verifyDeviceAndMFA, async (req, res) => {
  try {
    const recoveryCodes = await mfaService.generateRecoveryCodes(req.user.id);
    res.json({ recoveryCodes });
  } catch (error) {
    logger.error('Failed to generate recovery codes:', error);
    res.status(500).json({ error: 'Failed to generate recovery codes' });
  }
});

export default router; 