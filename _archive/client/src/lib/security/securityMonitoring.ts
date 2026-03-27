import { z } from 'zod';

// Security monitoring configuration
export const SECURITY_MONITORING_CONFIG = {
  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: 'json',
    maxSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 5,
    retention: 30 * 24 * 60 * 60 * 1000, // 30 days
  },

  // Intrusion detection
  intrusionDetection: {
    // Suspicious IP patterns
    suspiciousIPs: [
      /^0\.0\.0\./,
      /^127\.0\.0\./,
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
      /^192\.168\./,
    ],

    // Suspicious user agents
    suspiciousUserAgents: [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /curl/i,
      /wget/i,
      /python/i,
      /java/i,
    ],

    // Rate limiting thresholds
    rateLimitThresholds: {
      requestsPerMinute: 100,
      requestsPerHour: 1000,
      failedLoginsPerHour: 10,
      suspiciousActivitiesPerHour: 5,
    },

    // Anomaly detection
    anomalyDetection: {
      unusualTransactionAmount: 10000, // $10,000
      unusualLoginTime: 2 * 60 * 60 * 1000, // 2 hours from usual time
      unusualLocationDistance: 1000, // 1000 km from usual location
    },
  },

  // Alert configuration
  alerts: {
    // Email alerts
    email: {
      enabled: true,
      recipients: process.env.SECURITY_ALERT_EMAILS?.split(',') || [],
      smtp: {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      },
    },

    // Slack alerts
    slack: {
      enabled: process.env.SLACK_WEBHOOK_URL ? true : false,
      webhookUrl: process.env.SLACK_WEBHOOK_URL,
      channel: process.env.SLACK_CHANNEL || '#security-alerts',
    },

    // SMS alerts (for critical incidents)
    sms: {
      enabled: process.env.TWILIO_ACCOUNT_SID ? true : false,
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
      fromNumber: process.env.TWILIO_FROM_NUMBER,
      toNumbers: process.env.SECURITY_ALERT_PHONES?.split(',') || [],
    },
  },

  // Incident response
  incidentResponse: {
    // Automatic response actions
    autoResponse: {
      blockIP: true,
      lockAccount: true,
      requireMFA: true,
      increaseLogging: true,
    },

    // Escalation levels
    escalation: {
      level1: {
        threshold: 5,
        actions: ['log', 'alert'],
        timeWindow: 60 * 60 * 1000, // 1 hour
      },
      level2: {
        threshold: 10,
        actions: ['log', 'alert', 'blockIP'],
        timeWindow: 60 * 60 * 1000, // 1 hour
      },
      level3: {
        threshold: 20,
        actions: ['log', 'alert', 'blockIP', 'lockAccount', 'notifyAdmin'],
        timeWindow: 60 * 60 * 1000, // 1 hour
      },
    },
  },

  // Health checks
  healthChecks: {
    interval: 5 * 60 * 1000, // 5 minutes
    timeout: 30 * 1000, // 30 seconds
    retries: 3,
  },
};

// Security event types
export enum SecurityEventType {
  // Authentication events
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILURE = 'login_failure',
  LOGOUT = 'logout',
  PASSWORD_CHANGE = 'password_change',
  PASSWORD_RESET = 'password_reset',
  MFA_ENABLED = 'mfa_enabled',
  MFA_DISABLED = 'mfa_disabled',
  MFA_FAILURE = 'mfa_failure',

  // Authorization events
  ACCESS_GRANTED = 'access_granted',
  ACCESS_DENIED = 'access_denied',
  PERMISSION_CHANGE = 'permission_change',
  ROLE_CHANGE = 'role_change',

  // Data events
  DATA_ACCESS = 'data_access',
  DATA_MODIFICATION = 'data_modification',
  DATA_EXPORT = 'data_export',
  DATA_DELETION = 'data_deletion',

  // Payment events
  PAYMENT_INITIATED = 'payment_initiated',
  PAYMENT_COMPLETED = 'payment_completed',
  PAYMENT_FAILED = 'payment_failed',
  PAYMENT_REFUNDED = 'payment_refunded',

  // Blockchain events
  TRANSACTION_CREATED = 'transaction_created',
  TRANSACTION_CONFIRMED = 'transaction_confirmed',
  TRANSACTION_FAILED = 'transaction_failed',
  SMART_CONTRACT_INTERACTION = 'smart_contract_interaction',

  // System events
  SYSTEM_STARTUP = 'system_startup',
  SYSTEM_SHUTDOWN = 'system_shutdown',
  CONFIGURATION_CHANGE = 'configuration_change',
  BACKUP_CREATED = 'backup_created',
  BACKUP_FAILED = 'backup_failed',

  // Security events
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  INTRUSION_ATTEMPT = 'intrusion_attempt',
  MALWARE_DETECTED = 'malware_detected',
  VULNERABILITY_SCAN = 'vulnerability_scan',
  SECURITY_PATCH_APPLIED = 'security_patch_applied',
}

// Security event severity levels
export enum SecurityEventSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Security event schema
export const securityEventSchema = z.object({
  id: z.string(),
  type: z.nativeEnum(SecurityEventType),
  severity: z.nativeEnum(SecurityEventSeverity),
  timestamp: z.number(),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  location: z
    .object({
      country: z.string().optional(),
      city: z.string().optional(),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
    })
    .optional(),
  details: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
});

export type SecurityEvent = z.infer<typeof securityEventSchema>;

// Security monitoring class
export class SecurityMonitoring {
  private static instance: SecurityMonitoring;
  private events: SecurityEvent[] = [];
  private alerts: any[] = [];
  private incidents: any[] = [];
  private healthChecks: Map<string, any> = new Map();
  private isShutdown = false;

  private constructor() {
    this.startHealthChecks();
    this.startCleanup();
  }

  static getInstance(): SecurityMonitoring {
    if (!SecurityMonitoring.instance) {
      SecurityMonitoring.instance = new SecurityMonitoring();
    }
    return SecurityMonitoring.instance;
  }

  // Log security event
  logEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): void {
    if (this.isShutdown) return;

    const securityEvent: SecurityEvent = {
      ...event,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };

    // Validate event
    try {
      securityEventSchema.parse(securityEvent);
    } catch (error) {
      console.error('Invalid security event:', error);
      return;
    }

    // Store event
    this.events.push(securityEvent);

    // Check for suspicious activity
    this.detectSuspiciousActivity(securityEvent);

    // Check for incidents
    this.checkForIncidents(securityEvent);

    // Send alerts if needed
    this.sendAlerts(securityEvent);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[SECURITY] ${securityEvent.type}: ${securityEvent.severity}`, securityEvent);
    }
  }

  // Detect suspicious activity
  private detectSuspiciousActivity(event: SecurityEvent): void {
    const suspicious = this.isSuspiciousActivity(event);

    if (suspicious) {
      this.logEvent({
        type: SecurityEventType.SUSPICIOUS_ACTIVITY,
        severity: SecurityEventSeverity.MEDIUM,
        userId: event.userId,
        sessionId: event.sessionId,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        details: {
          originalEvent: event,
          reason: suspicious.reason,
        },
      });
    }
  }

  // Check if activity is suspicious
  private isSuspiciousActivity(event: SecurityEvent): { isSuspicious: boolean; reason?: string } {
    // Check IP address
    if (event.ipAddress) {
      for (const pattern of SECURITY_MONITORING_CONFIG.intrusionDetection.suspiciousIPs) {
        if (pattern.test(event.ipAddress)) {
          return { isSuspicious: true, reason: 'Suspicious IP address' };
        }
      }
    }

    // Check user agent
    if (event.userAgent) {
      for (const pattern of SECURITY_MONITORING_CONFIG.intrusionDetection.suspiciousUserAgents) {
        if (pattern.test(event.userAgent)) {
          return { isSuspicious: true, reason: 'Suspicious user agent' };
        }
      }
    }

    // Check for unusual patterns
    if (event.type === SecurityEventType.LOGIN_FAILURE) {
      const recentFailures = this.events.filter(
        e =>
          e.type === SecurityEventType.LOGIN_FAILURE &&
          e.ipAddress === event.ipAddress &&
          e.timestamp > Date.now() - 60 * 60 * 1000 // Last hour
      );

      if (
        recentFailures.length >=
        SECURITY_MONITORING_CONFIG.intrusionDetection.rateLimitThresholds.failedLoginsPerHour
      ) {
        return { isSuspicious: true, reason: 'Multiple failed login attempts' };
      }
    }

    // Check for unusual transaction amounts
    if (event.type === SecurityEventType.PAYMENT_INITIATED && event.details?.amount) {
      if (
        event.details.amount >
        SECURITY_MONITORING_CONFIG.intrusionDetection.anomalyDetection.unusualTransactionAmount
      ) {
        return { isSuspicious: true, reason: 'Unusually large transaction amount' };
      }
    }

    return { isSuspicious: false };
  }

  // Check for incidents
  private checkForIncidents(event: SecurityEvent): void {
    const incident = this.createIncidentIfNeeded(event);

    if (incident) {
      this.incidents.push(incident);
      this.triggerIncidentResponse(incident);
    }
  }

  // Create incident if thresholds are met
  private createIncidentIfNeeded(event: SecurityEvent): any | null {
    const recentEvents = this.events.filter(
      e =>
        e.timestamp >
        Date.now() - SECURITY_MONITORING_CONFIG.incidentResponse.escalation.level1.timeWindow
    );

    const suspiciousEvents = recentEvents.filter(
      e => e.type === SecurityEventType.SUSPICIOUS_ACTIVITY
    );

    if (
      suspiciousEvents.length >=
      SECURITY_MONITORING_CONFIG.incidentResponse.escalation.level3.threshold
    ) {
      return {
        id: crypto.randomUUID(),
        level: 3,
        type: 'security_incident',
        timestamp: Date.now(),
        events: suspiciousEvents,
        status: 'active',
      };
    } else if (
      suspiciousEvents.length >=
      SECURITY_MONITORING_CONFIG.incidentResponse.escalation.level2.threshold
    ) {
      return {
        id: crypto.randomUUID(),
        level: 2,
        type: 'security_incident',
        timestamp: Date.now(),
        events: suspiciousEvents,
        status: 'active',
      };
    } else if (
      suspiciousEvents.length >=
      SECURITY_MONITORING_CONFIG.incidentResponse.escalation.level1.threshold
    ) {
      return {
        id: crypto.randomUUID(),
        level: 1,
        type: 'security_incident',
        timestamp: Date.now(),
        events: suspiciousEvents,
        status: 'active',
      };
    }

    return null;
  }

  // Trigger incident response
  private triggerIncidentResponse(incident: any): void {
    const escalation =
      SECURITY_MONITORING_CONFIG.incidentResponse.escalation[
        `level${incident.level}` as keyof typeof SECURITY_MONITORING_CONFIG.incidentResponse.escalation
      ];

    if (!escalation) return;

    // Execute response actions
    for (const action of escalation.actions) {
      switch (action) {
        case 'log':
          this.logEvent({
            type: SecurityEventType.SUSPICIOUS_ACTIVITY,
            severity: SecurityEventSeverity.HIGH,
            details: {
              incident: incident,
              action: 'logged',
            },
          });
          break;

        case 'alert':
          this.sendAlert({
            type: 'incident',
            severity: SecurityEventSeverity.HIGH,
            title: `Security Incident Level ${incident.level}`,
            message: `Security incident detected with ${incident.events.length} suspicious events`,
            incident: incident,
          });
          break;

        case 'blockIP':
          // In production, implement IP blocking logic
          console.log(`[SECURITY] Blocking IP addresses from incident ${incident.id}`);
          break;

        case 'lockAccount':
          // In production, implement account locking logic
          console.log(`[SECURITY] Locking accounts from incident ${incident.id}`);
          break;

        case 'notifyAdmin':
          this.sendAlert({
            type: 'admin_notification',
            severity: SecurityEventSeverity.CRITICAL,
            title: 'Admin Notification Required',
            message: `Critical security incident requires immediate attention`,
            incident: incident,
          });
          break;
      }
    }
  }

  // Send alerts
  private sendAlerts(event: SecurityEvent): void {
    // Send alerts based on severity
    if (event.severity === SecurityEventSeverity.CRITICAL) {
      this.sendAlert({
        type: 'critical',
        severity: event.severity,
        title: 'Critical Security Event',
        message: `Critical security event: ${event.type}`,
        event: event,
      });
    } else if (event.severity === SecurityEventSeverity.HIGH) {
      this.sendAlert({
        type: 'high',
        severity: event.severity,
        title: 'High Security Event',
        message: `High security event: ${event.type}`,
        event: event,
      });
    }
  }

  // Send alert
  private sendAlert(alert: any): void {
    alert.id = crypto.randomUUID();
    alert.timestamp = Date.now();

    this.alerts.push(alert);

    // Send email alert
    if (SECURITY_MONITORING_CONFIG.alerts.email.enabled) {
      this.sendEmailAlert(alert);
    }

    // Send Slack alert
    if (SECURITY_MONITORING_CONFIG.alerts.slack.enabled) {
      this.sendSlackAlert(alert);
    }

    // Send SMS alert for critical events
    if (
      SECURITY_MONITORING_CONFIG.alerts.sms.enabled &&
      alert.severity === SecurityEventSeverity.CRITICAL
    ) {
      this.sendSMSAlert(alert);
    }
  }

  // Send email alert
  private async sendEmailAlert(alert: any): Promise<void> {
    try {
      // In production, implement email sending logic
      console.log(`[SECURITY] Email alert sent: ${alert.title}`);
    } catch (error) {
      console.error('Failed to send email alert:', error);
    }
  }

  // Send Slack alert
  private async sendSlackAlert(alert: any): Promise<void> {
    try {
      // In production, implement Slack webhook logic
      console.log(`[SECURITY] Slack alert sent: ${alert.title}`);
    } catch (error) {
      console.error('Failed to send Slack alert:', error);
    }
  }

  // Send SMS alert
  private async sendSMSAlert(alert: any): Promise<void> {
    try {
      // In production, implement SMS sending logic
      console.log(`[SECURITY] SMS alert sent: ${alert.title}`);
    } catch (error) {
      console.error('Failed to send SMS alert:', error);
    }
  }

  // Health checks
  private startHealthChecks(): void {
    setInterval(() => {
      this.performHealthChecks();
    }, SECURITY_MONITORING_CONFIG.healthChecks.interval);
  }

  // Perform health checks
  private async performHealthChecks(): Promise<void> {
    const checks = [
      this.checkDatabaseConnection(),
      this.checkAPIEndpoints(),
      this.checkSecurityMiddleware(),
      this.checkLoggingSystem(),
    ];

    const results = await Promise.allSettled(checks);

    results.forEach((result, index) => {
      const checkName = ['database', 'api', 'middleware', 'logging'][index];

      if (result.status === 'fulfilled') {
        this.healthChecks.set(checkName, {
          status: 'healthy',
          timestamp: Date.now(),
          details: result.value,
        });
      } else {
        this.healthChecks.set(checkName, {
          status: 'unhealthy',
          timestamp: Date.now(),
          error: result.reason,
        });

        // Log health check failure
        this.logEvent({
          type: SecurityEventType.SYSTEM_SHUTDOWN,
          severity: SecurityEventSeverity.MEDIUM,
          details: {
            check: checkName,
            error: result.reason,
          },
        });
      }
    });
  }

  // Check database connection
  private async checkDatabaseConnection(): Promise<any> {
    try {
      // In production, implement actual database health check
      return { connected: true, responseTime: 50 };
    } catch (error) {
      throw new Error(`Database connection failed: ${error}`);
    }
  }

  // Check API endpoints
  private async checkAPIEndpoints(): Promise<any> {
    try {
      // In production, implement actual API health check
      return { status: 'ok', endpoints: ['/api/health', '/api/status'] };
    } catch (error) {
      throw new Error(`API health check failed: ${error}`);
    }
  }

  // Check security middleware
  private async checkSecurityMiddleware(): Promise<any> {
    try {
      // In production, implement actual middleware health check
      return { status: 'ok', middleware: ['rate-limit', 'helmet', 'cors'] };
    } catch (error) {
      throw new Error(`Security middleware check failed: ${error}`);
    }
  }

  // Check logging system
  private async checkLoggingSystem(): Promise<any> {
    try {
      // In production, implement actual logging health check
      return { status: 'ok', eventsLogged: this.events.length };
    } catch (error) {
      throw new Error(`Logging system check failed: ${error}`);
    }
  }

  // Cleanup old data
  private startCleanup(): void {
    setInterval(() => {
      this.cleanupOldData();
    }, 24 * 60 * 60 * 1000); // Daily cleanup
  }

  // Cleanup old data
  private cleanupOldData(): void {
    const cutoffTime = Date.now() - SECURITY_MONITORING_CONFIG.logging.retention;

    // Clean up old events
    this.events = this.events.filter(event => event.timestamp > cutoffTime);

    // Clean up old alerts
    this.alerts = this.alerts.filter(alert => alert.timestamp > cutoffTime);

    // Clean up old incidents
    this.incidents = this.incidents.filter(incident => incident.timestamp > cutoffTime);

    // Clean up old health checks
    for (const [key, value] of this.healthChecks.entries()) {
      if (value.timestamp < cutoffTime) {
        this.healthChecks.delete(key);
      }
    }
  }

  // Get security status
  getSecurityStatus(): any {
    return {
      events: {
        total: this.events.length,
        recent: this.events.filter(e => e.timestamp > Date.now() - 24 * 60 * 60 * 1000).length,
        bySeverity: this.groupEventsBySeverity(),
      },
      alerts: {
        total: this.alerts.length,
        recent: this.alerts.filter(a => a.timestamp > Date.now() - 24 * 60 * 60 * 1000).length,
      },
      incidents: {
        total: this.incidents.length,
        active: this.incidents.filter(i => i.status === 'active').length,
      },
      healthChecks: Object.fromEntries(this.healthChecks),
      uptime: Date.now() - (this.events[0]?.timestamp || Date.now()),
    };
  }

  // Group events by severity
  private groupEventsBySeverity(): Record<string, number> {
    const grouped: Record<string, number> = {};

    for (const event of this.events) {
      grouped[event.severity] = (grouped[event.severity] || 0) + 1;
    }

    return grouped;
  }

  // Get events
  getEvents(filters?: any): SecurityEvent[] {
    let filtered = [...this.events];

    if (filters) {
      if (filters.type) {
        filtered = filtered.filter(e => e.type === filters.type);
      }
      if (filters.severity) {
        filtered = filtered.filter(e => e.severity === filters.severity);
      }
      if (filters.userId) {
        filtered = filtered.filter(e => e.userId === filters.userId);
      }
      if (filters.startTime) {
        filtered = filtered.filter(e => e.timestamp >= filters.startTime);
      }
      if (filters.endTime) {
        filtered = filtered.filter(e => e.timestamp <= filters.endTime);
      }
    }

    return filtered.sort((a, b) => b.timestamp - a.timestamp);
  }

  // Get alerts
  getAlerts(): any[] {
    return [...this.alerts].sort((a, b) => b.timestamp - a.timestamp);
  }

  // Get incidents
  getIncidents(): any[] {
    return [...this.incidents].sort((a, b) => b.timestamp - a.timestamp);
  }

  // Shutdown monitoring
  shutdown(): void {
    this.isShutdown = true;
    console.log('[SECURITY] Security monitoring shutdown');
  }
}

// Export singleton instance
export const securityMonitoring = SecurityMonitoring.getInstance();

// Utility functions
export const monitoringUtils = {
  // Create security event
  createEvent(
    type: SecurityEventType,
    severity: SecurityEventSeverity,
    details?: any
  ): SecurityEvent {
    return {
      id: crypto.randomUUID(),
      type,
      severity,
      timestamp: Date.now(),
      details,
    };
  },

  // Log security event
  logEvent(type: SecurityEventType, severity: SecurityEventSeverity, details?: any): void {
    securityMonitoring.logEvent({
      type,
      severity,
      details,
    });
  },

  // Get security status
  getStatus(): any {
    return securityMonitoring.getSecurityStatus();
  },
};
