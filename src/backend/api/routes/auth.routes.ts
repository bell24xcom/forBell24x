import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateLogin, validateRegister, validatePasswordReset, validateProfileUpdate } from '../validators/auth.validator';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';

const router = Router();
const controller = new AuthController();

// Public routes (no auth required)
router.post('/login', validateLogin, (req, res) => controller.login(req, res));
router.post('/register', validateRegister, (req, res) => controller.register(req, res));
router.post('/refresh', (req, res) => controller.refreshToken(req, res));
router.post('/password/reset', (req, res) => controller.requestPasswordReset(req, res));
router.post('/password/reset/confirm', validatePasswordReset, (req, res) => controller.confirmPasswordReset(req, res));
router.get('/verify/email/:token', (req, res) => controller.verifyEmail(req, res));
router.post('/2fa/verify', (req, res) => controller.verify2FA(req, res));
router.get('/sso/providers', (req, res) => controller.getSSOProviders(req, res));
router.get('/sso/:provider/initiate', (req, res) => controller.initiateSSO(req, res));
router.get('/sso/:provider/callback', (req, res) => controller.handleSSOCallback(req, res));

// Protected routes (with auth)
router.post('/logout', authMiddleware, (req, res) => controller.logout(req, res));
router.post('/password/change', authMiddleware, (req, res) => controller.changePassword(req, res));
router.get('/profile', authMiddleware, (req, res) => controller.getProfile(req, res));
router.put('/profile', authMiddleware, validateProfileUpdate, (req, res) => controller.updateProfile(req, res));
router.post('/verify/email/resend', authMiddleware, (req, res) => controller.resendEmailVerification(req, res));
router.post('/2fa/enable', authMiddleware, (req, res) => controller.enable2FA(req, res));
router.post('/2fa/disable', authMiddleware, (req, res) => controller.disable2FA(req, res));
router.get('/sessions', authMiddleware, (req, res) => controller.getUserSessions(req, res));
router.post('/sessions/:sessionId/revoke', authMiddleware, (req, res) => controller.revokeSession(req, res));
router.post('/sessions/revoke-all', authMiddleware, (req, res) => controller.revokeAllSessions(req, res));
router.get('/permissions', authMiddleware, (req, res) => controller.getUserPermissions(req, res));
router.get('/roles', authMiddleware, (req, res) => controller.getUserRoles(req, res));
router.post('/impersonate/stop', authMiddleware, (req, res) => controller.stopImpersonation(req, res));
router.get('/security/status', authMiddleware, (req, res) => controller.getSecurityStatus(req, res));

// Admin routes (with role-based access)
router.post('/impersonate/:userId', authMiddleware, roleMiddleware, (req, res) => controller.impersonateUser(req, res));
router.get('/audit/logs', authMiddleware, roleMiddleware, (req, res) => controller.getAuditLogs(req, res));
router.post('/security/lock-account', authMiddleware, roleMiddleware, (req, res) => controller.lockAccount(req, res));
router.post('/security/unlock-account', authMiddleware, roleMiddleware, (req, res) => controller.unlockAccount(req, res));

export default router; 