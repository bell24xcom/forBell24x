/**
 * Bell24H Error Handling and Monitoring System
 *
 * Comprehensive error handling, logging, and monitoring for security infrastructure
 * Includes structured logging, error tracking, and alerting
 */

export interface ErrorContext {
  requestId: string;
  timestamp: number;
  userId?: string;
  ip: string;
  userAgent: string;
  method: string;
  path: string;
  apiKey?: string;
  tier?: 'free' | 'pro' | 'enterprise' | 'admin';
  additionalData?: Record<string, any>;
}

export interface SecurityError {
  code: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category:
    | 'authentication'
    | 'authorization'
    | 'rate_limit'
    | 'security'
    | 'validation'
    | 'system';
  context: ErrorContext;
  stackTrace?: string;
  remediation?: string;
}

export interface SecurityAlert {
  id: string;
  type:
    | 'security_breach'
    | 'rate_limit_exceeded'
    | 'authentication_failure'
    | 'suspicious_activity'
    | 'system_error';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  affectedResource: string;
  timestamp: number;
  context: ErrorContext;
  metrics?: Record<string, number>;
  actions?: string[];
}

export interface MonitoringMetrics {
  requestCount: number;
  errorCount: number;
  rateLimitHits: number;
  authenticationFailures: number;
  suspiciousActivities: number;
  averageResponseTime: number;
  uniqueIPs: Set<string>;
  topErrors: Map<string, number>;
  alertCount: number;
  lastReset: number;
}

// Error codes and messages
export const SECURITY_ERRORS = {
  // Authentication errors
  AUTH_INVALID_CREDENTIALS: {
    code: 'AUTH_001',
    message: 'Invalid credentials provided',
    severity: 'medium' as const,
    category: 'authentication' as const,
    remediation: 'Verify username and password',
  },
  AUTH_ACCOUNT_LOCKED: {
    code: 'AUTH_002',
    message: 'Account temporarily locked due to multiple failed attempts',
    severity: 'high' as const,
    category: 'authentication' as const,
    remediation: 'Wait for lockout period to expire or contact support',
  },
  AUTH_TOKEN_EXPIRED: {
    code: 'AUTH_003',
    message: 'Authentication token has expired',
    severity: 'low' as const,
    category: 'authentication' as const,
    remediation: 'Refresh token or re-authenticate',
  },
  AUTH_TOKEN_INVALID: {
    code: 'AUTH_004',
    message: 'Invalid authentication token',
    severity: 'medium' as const,
    category: 'authentication' as const,
    remediation: 'Obtain a new valid token',
  },

  // Authorization errors
  AUTHZ_INSUFFICIENT_PERMISSIONS: {
    code: 'AUTHZ_001',
    message: 'Insufficient permissions to access this resource',
    severity: 'medium' as const,
    category: 'authorization' as const,
    remediation: 'Contact administrator to request appropriate permissions',
  },
  AUTHZ_RESOURCE_NOT_FOUND: {
    code: 'AUTHZ_002',
    message: 'Requested resource not found or access denied',
    severity: 'low' as const,
    category: 'authorization' as const,
    remediation: 'Verify resource exists and you have access',
  },

  // Rate limiting errors
  RATE_LIMIT_EXCEEDED: {
    code: 'RATE_001',
    message: 'Rate limit exceeded',
    severity: 'medium' as const,
    category: 'rate_limit' as const,
    remediation: 'Reduce request frequency and retry after reset time',
  },
  RATE_LIMIT_BLOCKED: {
    code: 'RATE_002',
    message: 'IP temporarily blocked due to rate limit violations',
    severity: 'high' as const,
    category: 'rate_limit' as const,
    remediation: 'Wait for block period to expire',
  },

  // Security errors
  SECURITY_CSRF_INVALID: {
    code: 'SEC_001',
    message: 'Invalid CSRF token',
    severity: 'high' as const,
    category: 'security' as const,
    remediation: 'Refresh page and retry request',
  },
  SECURITY_IP_BLOCKED: {
    code: 'SEC_002',
    message: 'IP address blocked',
    severity: 'high' as const,
    category: 'security' as const,
    remediation: 'Contact administrator if you believe this is an error',
  },
  SECURITY_SUSPICIOUS_ACTIVITY: {
    code: 'SEC_003',
    message: 'Suspicious activity detected',
    severity: 'critical' as const,
    category: 'security' as const,
    remediation: 'Account may be compromised - change password immediately',
  },

  // Validation errors
  VALIDATION_INVALID_INPUT: {
    code: 'VAL_001',
    message: 'Invalid input data',
    severity: 'low' as const,
    category: 'validation' as const,
    remediation: 'Check input format and retry',
  },
  VALIDATION_MISSING_REQUIRED: {
    code: 'VAL_002',
    message: 'Required field missing',
    severity: 'low' as const,
    category: 'validation' as const,
    remediation: 'Provide all required fields',
  },

  // System errors
  SYSTEM_DATABASE_ERROR: {
    code: 'SYS_001',
    message: 'Database connection error',
    severity: 'critical' as const,
    category: 'system' as const,
    remediation: 'System administrators have been notified',
  },
  SYSTEM_SERVICE_UNAVAILABLE: {
    code: 'SYS_002',
    message: 'Service temporarily unavailable',
    severity: 'high' as const,
    category: 'system' as const,
    remediation: 'Please try again later',
  },
};

export class SecurityErrorHandler {
  private metrics: MonitoringMetrics;
  private alerts: SecurityAlert[] = [];
  private errorLog: SecurityError[] = [];
  private maxLogSize = 10000;
  private alertThresholds = {
    errorRate: 0.1, // 10% error rate
    authFailureRate: 0.05, // 5% auth failure rate
    rateLimitHitRate: 0.2, // 20% rate limit hit rate
    suspiciousActivityThreshold: 10, // 10 suspicious activities per hour
  };

  constructor() {
    this.metrics = this.initializeMetrics();
    this.startMetricsCleanup();
  }

  /**
   * Initialize monitoring metrics
   */
  private initializeMetrics(): MonitoringMetrics {
    return {
      requestCount: 0,
      errorCount: 0,
      rateLimitHits: 0,
      authenticationFailures: 0,
      suspiciousActivities: 0,
      averageResponseTime: 0,
      uniqueIPs: new Set(),
      topErrors: new Map(),
      alertCount: 0,
      lastReset: Date.now(),
    };
  }

  /**
   * Log security error
   */
  logError(
    errorType: keyof typeof SECURITY_ERRORS,
    context: ErrorContext,
    additionalData?: Record<string, any>,
    stackTrace?: string
  ): SecurityError {
    const errorTemplate = SECURITY_ERRORS[errorType];

    const error: SecurityError = {
      ...errorTemplate,
      context: {
        ...context,
        additionalData: { ...context.additionalData, ...additionalData },
      },
      stackTrace,
    };

    // Add to error log
    this.errorLog.push(error);

    // Maintain log size
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(-this.maxLogSize);
    }

    // Update metrics
    this.updateMetrics(error);

    // Check for alerts
    this.checkAlertConditions(error);

    // Log to console with structured format
    this.logToConsole(error);

    return error;
  }

  /**
   * Record request metrics
   */
  recordRequest(context: ErrorContext, responseTime: number, success: boolean): void {
    this.metrics.requestCount++;
    this.metrics.uniqueIPs.add(context.ip);

    // Update average response time
    this.metrics.averageResponseTime =
      (this.metrics.averageResponseTime * (this.metrics.requestCount - 1) + responseTime) /
      this.metrics.requestCount;

    if (!success) {
      this.metrics.errorCount++;
    }
  }

  /**
   * Record rate limit hit
   */
  recordRateLimitHit(context: ErrorContext): void {
    this.metrics.rateLimitHits++;
    this.logError('RATE_LIMIT_EXCEEDED', context);
  }

  /**
   * Record authentication failure
   */
  recordAuthFailure(context: ErrorContext, reason: string): void {
    this.metrics.authenticationFailures++;
    this.logError('AUTH_INVALID_CREDENTIALS', context, { reason });
  }

  /**
   * Record suspicious activity
   */
  recordSuspiciousActivity(context: ErrorContext, activity: string): void {
    this.metrics.suspiciousActivities++;
    this.logError('SECURITY_SUSPICIOUS_ACTIVITY', context, { activity });
  }

  /**
   * Update metrics based on error
   */
  private updateMetrics(error: SecurityError): void {
    // Update error count by type
    const errorKey = `${error.category}_${error.code}`;
    const currentCount = this.metrics.topErrors.get(errorKey) || 0;
    this.metrics.topErrors.set(errorKey, currentCount + 1);

    // Update specific metrics
    switch (error.category) {
      case 'authentication':
        this.metrics.authenticationFailures++;
        break;
      case 'rate_limit':
        this.metrics.rateLimitHits++;
        break;
      case 'security':
        this.metrics.suspiciousActivities++;
        break;
    }
  }

  /**
   * Check alert conditions
   */
  private checkAlertConditions(error: SecurityError): void {
    const now = Date.now();
    const hourAgo = now - 60 * 60 * 1000;

    // Check error rate
    if (this.metrics.requestCount > 0) {
      const errorRate = this.metrics.errorCount / this.metrics.requestCount;
      if (errorRate > this.alertThresholds.errorRate) {
        this.createAlert(
          'system_error',
          'high',
          'High Error Rate Detected',
          `Error rate is ${(errorRate * 100).toFixed(1)}% which exceeds threshold of ${
            this.alertThresholds.errorRate * 100
          }%`,
          error.context
        );
      }
    }

    // Check authentication failure rate
    if (this.metrics.authenticationFailures > 20) {
      this.createAlert(
        'authentication_failure',
        'medium',
        'High Authentication Failure Rate',
        `${this.metrics.authenticationFailures} authentication failures in the last hour`,
        error.context
      );
    }

    // Check suspicious activity
    if (this.metrics.suspiciousActivities > this.alertThresholds.suspiciousActivityThreshold) {
      this.createAlert(
        'suspicious_activity',
        'critical',
        'Suspicious Activity Spike',
        `${this.metrics.suspiciousActivities} suspicious activities detected in the last hour`,
        error.context
      );
    }

    // Check for brute force attacks
    if (error.category === 'authentication' && error.context.ip) {
      const ipFailures = this.errorLog.filter(
        e =>
          e.context.ip === error.context.ip &&
          e.category === 'authentication' &&
          e.context.timestamp > hourAgo
      ).length;

      if (ipFailures > 10) {
        this.createAlert(
          'security_breach',
          'critical',
          'Potential Brute Force Attack',
          `${ipFailures} authentication failures from IP ${error.context.ip} in the last hour`,
          error.context
        );
      }
    }
  }

  /**
   * Create security alert
   */
  private createAlert(
    type: SecurityAlert['type'],
    severity: SecurityAlert['severity'],
    title: string,
    description: string,
    context: ErrorContext
  ): void {
    const alert: SecurityAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      severity,
      title,
      description,
      affectedResource: context.path,
      timestamp: Date.now(),
      context,
      metrics: {
        requestCount: this.metrics.requestCount,
        errorCount: this.metrics.errorCount,
        rateLimitHits: this.metrics.rateLimitHits,
        authenticationFailures: this.metrics.authenticationFailures,
        suspiciousActivities: this.metrics.suspiciousActivities,
      },
      actions: this.getRecommendedActions(type, severity),
    };

    this.alerts.push(alert);
    this.metrics.alertCount++;

    // Log alert
    console.warn('🚨 SECURITY ALERT:', JSON.stringify(alert, null, 2));

    // In production, send to alerting system (Slack, PagerDuty, etc.)
    this.sendAlert(alert);
  }

  /**
   * Get recommended actions for alert type
   */
  private getRecommendedActions(
    type: SecurityAlert['type'],
    severity: SecurityAlert['severity']
  ): string[] {
    const actions = [];

    switch (type) {
      case 'security_breach':
        actions.push('Block suspicious IP addresses');
        actions.push('Review authentication logs');
        actions.push('Consider temporary account locks');
        break;
      case 'rate_limit_exceeded':
        actions.push('Review rate limit configurations');
        actions.push('Consider IP-based restrictions');
        break;
      case 'authentication_failure':
        actions.push('Monitor for brute force attacks');
        actions.push('Consider implementing CAPTCHA');
        break;
      case 'suspicious_activity':
        actions.push('Review user activity patterns');
        actions.push('Consider additional security measures');
        break;
      case 'system_error':
        actions.push('Check system health');
        actions.push('Review error logs');
        break;
    }

    if (severity === 'critical') {
      actions.push('Notify security team immediately');
      actions.push('Consider emergency response procedures');
    }

    return actions;
  }

  /**
   * Send alert to external systems
   */
  private sendAlert(alert: SecurityAlert): void {
    // In production, implement integrations with:
    // - Slack/Microsoft Teams
    // - PagerDuty/Opsgenie
    // - Email notifications
    // - SMS alerts for critical issues

    if (alert.severity === 'critical') {
      console.error('🚨 CRITICAL SECURITY ALERT - IMMEDIATE ACTION REQUIRED:', alert.title);
    }
  }

  /**
   * Log to console with structured format
   */
  private logToConsole(error: SecurityError): void {
    const logData = {
      timestamp: new Date(error.context.timestamp).toISOString(),
      level: this.getSeverityLogLevel(error.severity),
      code: error.code,
      message: error.message,
      category: error.category,
      context: {
        requestId: error.context.requestId,
        ip: error.context.ip,
        path: error.context.path,
        method: error.context.method,
        userId: error.context.userId,
        tier: error.context.tier,
      },
      ...(error.context.additionalData && { additionalData: error.context.additionalData }),
      ...(error.remediation && { remediation: error.remediation }),
    };

    switch (error.severity) {
      case 'low':
        console.info('🔵 Security Info:', JSON.stringify(logData, null, 2));
        break;
      case 'medium':
        console.warn('🟡 Security Warning:', JSON.stringify(logData, null, 2));
        break;
      case 'high':
        console.error('🟠 Security Error:', JSON.stringify(logData, null, 2));
        break;
      case 'critical':
        console.error('🔴 Critical Security Error:', JSON.stringify(logData, null, 2));
        break;
    }
  }

  /**
   * Get log level for severity
   */
  private getSeverityLogLevel(severity: SecurityError['severity']): string {
    switch (severity) {
      case 'low':
        return 'info';
      case 'medium':
        return 'warn';
      case 'high':
        return 'error';
      case 'critical':
        return 'error';
      default:
        return 'info';
    }
  }

  /**
   * Get current metrics
   */
  getMetrics(): MonitoringMetrics {
    return { ...this.metrics };
  }

  /**
   * Get recent alerts
   */
  getRecentAlerts(hours: number = 24): SecurityAlert[] {
    const cutoff = Date.now() - hours * 60 * 60 * 1000;
    return this.alerts.filter(alert => alert.timestamp > cutoff);
  }

  /**
   * Get error summary
   */
  getErrorSummary(hours: number = 24): {
    totalErrors: number;
    errorsByCategory: Record<string, number>;
    topErrors: Array<{ error: string; count: number }>;
    criticalErrors: number;
  } {
    const cutoff = Date.now() - hours * 60 * 60 * 1000;
    const recentErrors = this.errorLog.filter(error => error.context.timestamp > cutoff);

    const errorsByCategory: Record<string, number> = {};
    let criticalErrors = 0;

    recentErrors.forEach(error => {
      errorsByCategory[error.category] = (errorsByCategory[error.category] || 0) + 1;
      if (error.severity === 'critical') {
        criticalErrors++;
      }
    });

    const topErrors = Array.from(this.metrics.topErrors.entries())
      .map(([error, count]) => ({ error, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalErrors: recentErrors.length,
      errorsByCategory,
      topErrors,
      criticalErrors,
    };
  }

  /**
   * Reset metrics (called periodically)
   */
  private resetMetrics(): void {
    this.metrics = this.initializeMetrics();

    // Keep only recent errors (last 24 hours)
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    this.errorLog = this.errorLog.filter(error => error.context.timestamp > cutoff);
    this.alerts = this.alerts.filter(alert => alert.timestamp > cutoff);
  }

  /**
   * Start metrics cleanup process
   */
  private startMetricsCleanup(): void {
    // Reset metrics every hour
    setInterval(() => {
      this.resetMetrics();
    }, 60 * 60 * 1000);
  }
}

// Global error handler instance
export const globalErrorHandler = new SecurityErrorHandler();
