import { securityConfig, securityUtils } from '../../config/security';
import { logger } from '../../utils/logger';
import { Redis } from 'ioredis';
import { createClient } from 'redis';

export class SecurityService {
  private static instance: SecurityService;
  private redis: Redis;
  private auditLogEnabled: boolean;

  private constructor() {
    this.redis = createClient({
      host: securityConfig.redis.host,
      port: securityConfig.redis.port,
      password: securityConfig.redis.password
    });
    this.auditLogEnabled = securityConfig.auditLog.enabled;
  }

  public static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  // API Key Management
  public async generateApiKey(userId: string): Promise<string> {
    const apiKey = securityUtils.generateApiKey();
    await this.redis.set(`api_key:${apiKey}`, userId, 'EX', 30 * 24 * 60 * 60); // 30 days
    return apiKey;
  }

  public async validateApiKey(apiKey: string): Promise<boolean> {
    const userId = await this.redis.get(`api_key:${apiKey}`);
    return !!userId;
  }

  public async revokeApiKey(apiKey: string): Promise<void> {
    await this.redis.del(`api_key:${apiKey}`);
  }

  // Rate Limiting
  public async checkRateLimit(ip: string, endpoint: string): Promise<boolean> {
    const key = `rate_limit:${ip}:${endpoint}`;
    const current = await this.redis.incr(key);
    
    if (current === 1) {
      await this.redis.expire(key, securityConfig.rateLimit.windowMs / 1000);
    }

    return current <= securityConfig.rateLimit.max;
  }

  // Session Management
  public async createSession(userId: string): Promise<string> {
    const sessionId = securityUtils.generateApiKey();
    await this.redis.set(
      `session:${sessionId}`,
      userId,
      'EX',
      securityConfig.session.cookie.maxAge / 1000
    );
    return sessionId;
  }

  public async validateSession(sessionId: string): Promise<boolean> {
    const userId = await this.redis.get(`session:${sessionId}`);
    return !!userId;
  }

  public async destroySession(sessionId: string): Promise<void> {
    await this.redis.del(`session:${sessionId}`);
  }

  // Password Management
  public async hashPassword(password: string): Promise<string> {
    return securityUtils.hashPassword(password);
  }

  public async verifyPassword(password: string, hash: string): Promise<boolean> {
    return securityUtils.verifyPassword(password, hash);
  }

  public validatePasswordPolicy(password: string): boolean {
    return securityUtils.validatePassword(password);
  }

  // JWT Management
  public generateToken(payload: any): string {
    return securityUtils.generateToken(payload);
  }

  public verifyToken(token: string): any {
    return securityUtils.verifyToken(token);
  }

  // CSRF Protection
  public generateCsrfToken(): string {
    return securityUtils.generateCsrfToken();
  }

  public verifyCsrfToken(token: string, storedToken: string): boolean {
    return securityUtils.verifyCsrfToken(token, storedToken);
  }

  // Input Sanitization
  public sanitizeInput(input: string): string {
    return securityUtils.sanitizeInput(input);
  }

  // Audit Logging
  public async logAuditEvent(event: {
    action: string;
    userId: string;
    ip: string;
    details: any;
  }): Promise<void> {
    if (!this.auditLogEnabled) return;

    const logEntry = {
      timestamp: new Date().toISOString(),
      ...event
    };

    logger.info('Audit Log', logEntry);
    await this.redis.lpush('audit_log', JSON.stringify(logEntry));
  }

  // Security Headers
  public getSecurityHeaders(): Record<string, string> {
    return securityConfig.headers;
  }

  // File Upload Security
  public validateFileUpload(file: {
    size: number;
    mimetype: string;
  }): boolean {
    if (file.size > securityConfig.fileUpload.maxSize) {
      return false;
    }

    if (!securityConfig.fileUpload.allowedTypes.includes(file.mimetype)) {
      return false;
    }

    return true;
  }

  // IP Blocking
  public async blockIP(ip: string, reason: string): Promise<void> {
    await this.redis.set(`blocked_ip:${ip}`, reason, 'EX', 24 * 60 * 60); // 24 hours
  }

  public async isIPBlocked(ip: string): Promise<boolean> {
    return !!(await this.redis.get(`blocked_ip:${ip}`));
  }

  // Security Monitoring
  public async getSecurityMetrics(): Promise<{
    blockedIPs: number;
    activeSessions: number;
    failedLogins: number;
    apiRequests: number;
  }> {
    const [blockedIPs, activeSessions, failedLogins, apiRequests] = await Promise.all([
      this.redis.keys('blocked_ip:*').then(keys => keys.length),
      this.redis.keys('session:*').then(keys => keys.length),
      this.redis.get('failed_logins') || '0',
      this.redis.get('api_requests') || '0'
    ]);

    return {
      blockedIPs,
      activeSessions,
      failedLogins: parseInt(failedLogins),
      apiRequests: parseInt(apiRequests)
    };
  }

  // Cleanup
  public async cleanup(): Promise<void> {
    await this.redis.quit();
  }
} 