import { NextRequest } from 'next/server';
import { EventEmitter } from 'events';

// Transaction monitoring types and interfaces
export enum TransactionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  DISPUTED = 'disputed'
}

export enum MonitoringEventType {
  TRANSACTION_CREATED = 'transaction_created',
  TRANSACTION_UPDATED = 'transaction_updated',
  TRANSACTION_COMPLETED = 'transaction_completed',
  TRANSACTION_FAILED = 'transaction_failed',
  FRAUD_DETECTED = 'fraud_detected',
  HIGH_VALUE_TRANSACTION = 'high_value_transaction',
  UNUSUAL_PATTERN = 'unusual_pattern',
  VELOCITY_EXCEEDED = 'velocity_exceeded',
  LOCATION_ANOMALY = 'location_anomaly',
  DEVICE_ANOMALY = 'device_anomaly',
  PAYMENT_METHOD_CHANGE = 'payment_method_change',
  CHARGEBACK_RECEIVED = 'chargeback_received',
  REFUND_REQUESTED = 'refund_requested',
  DISPUTE_OPENED = 'dispute_opened',
  KYC_VERIFICATION_FAILED = 'kyc_verification_failed',
  ACCOUNT_SUSPENDED = 'account_suspended'
}

export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface TransactionEvent {
  id: string;
  type: MonitoringEventType;
  transactionId: string;
  userId: string;
  timestamp: string;
  severity: AlertSeverity;
  data: Record<string, any>;
  metadata: {
    source: string;
    version: string;
    requestId: string;
  };
}

export interface TransactionAlert {
  id: string;
  transactionId: string;
  userId: string;
  type: MonitoringEventType;
  severity: AlertSeverity;
  title: string;
  description: string;
  timestamp: string;
  acknowledged: boolean;
  resolved: boolean;
  data: Record<string, any>;
  actions: AlertAction[];
}

export interface AlertAction {
  id: string;
  type: 'block' | 'review' | 'notify' | 'escalate' | 'auto_resolve';
  description: string;
  executed: boolean;
  executedAt?: string;
  result?: string;
}

export interface TransactionMetrics {
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  pendingTransactions: number;
  totalVolume: number;
  averageTransactionValue: number;
  fraudRate: number;
  chargebackRate: number;
  refundRate: number;
  processingTime: {
    average: number;
    p95: number;
    p99: number;
  };
  velocity: {
    perMinute: number;
    perHour: number;
    perDay: number;
  };
}

export interface MonitoringConfig {
  enabled: boolean;
  realTimeAlerts: boolean;
  batchProcessing: boolean;
  alertThresholds: {
    highValueAmount: number;
    velocityLimit: number;
    fraudScore: number;
    processingTime: number;
  };
  notificationChannels: string[];
  escalationRules: Array<{
    condition: string;
    severity: AlertSeverity;
    actions: AlertAction[];
  }>;
  retentionPeriod: number; // in days
}

// Real-time Transaction Monitor
export class TransactionMonitor extends EventEmitter {
  private config: MonitoringConfig;
  private activeTransactions: Map<string, any>;
  private alerts: Map<string, TransactionAlert>;
  private metrics: TransactionMetrics;
  private eventQueue: TransactionEvent[];
  private isProcessing: boolean;

  constructor(config: MonitoringConfig) {
    super();
    this.config = config;
    this.activeTransactions = new Map();
    this.alerts = new Map();
    this.metrics = this.initializeMetrics();
    this.eventQueue = [];
    this.isProcessing = false;

    // Start processing events
    this.startEventProcessing();
  }

  // Monitor new transaction
  async monitorTransaction(transactionData: {
    id: string;
    userId: string;
    amount: number;
    currency: string;
    status: TransactionStatus;
    paymentMethod: string;
    deviceFingerprint: string;
    ipAddress: string;
    location: any;
    timestamp: string;
    metadata: Record<string, any>;
  }): Promise<void> {
    try {
      // Store active transaction
      this.activeTransactions.set(transactionData.id, {
        ...transactionData,
        startTime: Date.now(),
        lastUpdate: Date.now()
      });

      // Create transaction created event
      const event: TransactionEvent = {
        id: this.generateEventId(),
        type: MonitoringEventType.TRANSACTION_CREATED,
        transactionId: transactionData.id,
        userId: transactionData.userId,
        timestamp: new Date().toISOString(),
        severity: AlertSeverity.LOW,
        data: transactionData,
        metadata: {
          source: 'transaction_monitor',
          version: '1.0.0',
          requestId: this.generateRequestId()
        }
      };

      // Queue event for processing
      this.eventQueue.push(event);

      // Check for immediate alerts
      await this.checkImmediateAlerts(transactionData);

      // Update metrics
      this.updateMetrics('transaction_created', transactionData);

      // Emit event
      this.emit('transaction_monitored', event);

    } catch (error: any) {
      console.error('Error monitoring transaction:', error);
      this.emit('monitoring_error', { error: error.message, transactionId: transactionData.id });
    }
  }

  // Update transaction status
  async updateTransactionStatus(
    transactionId: string,
    status: TransactionStatus,
    additionalData?: Record<string, any>
  ): Promise<void> {
    try {
      const transaction = this.activeTransactions.get(transactionId);
      if (!transaction) {
        console.warn(`Transaction ${transactionId} not found in active transactions`);
        return;
      }

      const previousStatus = transaction.status;
      transaction.status = status;
      transaction.lastUpdate = Date.now();
      transaction.processingTime = Date.now() - transaction.startTime;

      // Create update event
      const event: TransactionEvent = {
        id: this.generateEventId(),
        type: MonitoringEventType.TRANSACTION_UPDATED,
        transactionId,
        userId: transaction.userId,
        timestamp: new Date().toISOString(),
        severity: this.getSeverityForStatus(status),
        data: {
          previousStatus,
          newStatus: status,
          processingTime: transaction.processingTime,
          ...additionalData
        },
        metadata: {
          source: 'transaction_monitor',
          version: '1.0.0',
          requestId: this.generateRequestId()
        }
      };

      // Queue event
      this.eventQueue.push(event);

      // Check for status-specific alerts
      await this.checkStatusAlerts(transaction, status);

      // Update metrics
      this.updateMetrics('transaction_updated', { transaction, status });

      // Emit event
      this.emit('transaction_updated', event);

      // Remove completed transactions from active map
      if (this.isFinalStatus(status)) {
        this.activeTransactions.delete(transactionId);
      }

    } catch (error: any) {
      console.error('Error updating transaction status:', error);
      this.emit('monitoring_error', { error: error.message, transactionId });
    }
  }

  // Detect fraud and create alert
  async detectFraud(
    transactionId: string,
    fraudData: {
      riskScore: number;
      fraudTypes: string[];
      confidence: number;
      reasons: string[];
    }
  ): Promise<void> {
    try {
      const transaction = this.activeTransactions.get(transactionId);
      if (!transaction) {
        console.warn(`Transaction ${transactionId} not found for fraud detection`);
        return;
      }

      // Create fraud detected event
      const event: TransactionEvent = {
        id: this.generateEventId(),
        type: MonitoringEventType.FRAUD_DETECTED,
        transactionId,
        userId: transaction.userId,
        timestamp: new Date().toISOString(),
        severity: fraudData.riskScore > 80 ? AlertSeverity.CRITICAL : 
                  fraudData.riskScore > 60 ? AlertSeverity.HIGH : AlertSeverity.MEDIUM,
        data: {
          ...fraudData,
          transaction: {
            amount: transaction.amount,
            currency: transaction.currency,
            paymentMethod: transaction.paymentMethod
          }
        },
        metadata: {
          source: 'fraud_detector',
          version: '1.0.0',
          requestId: this.generateRequestId()
        }
      };

      // Queue event
      this.eventQueue.push(event);

      // Create fraud alert
      const alert: TransactionAlert = {
        id: this.generateAlertId(),
        transactionId,
        userId: transaction.userId,
        type: MonitoringEventType.FRAUD_DETECTED,
        severity: event.severity,
        title: 'Fraud Detected',
        description: `Fraud detected in transaction ${transactionId}. Risk score: ${fraudData.riskScore}. Types: ${fraudData.fraudTypes.join(', ')}`,
        timestamp: new Date().toISOString(),
        acknowledged: false,
        resolved: false,
        data: fraudData,
        actions: [
          {
            id: 'auto_block',
            type: 'block',
            description: 'Block transaction automatically',
            executed: false
          },
          {
            id: 'notify_security',
            type: 'escalate',
            description: 'Notify security team',
            executed: false
          }
        ]
      };

      this.alerts.set(alert.id, alert);

      // Update metrics
      this.updateMetrics('fraud_detected', fraudData);

      // Emit events
      this.emit('fraud_detected', event);
      this.emit('alert_created', alert);

    } catch (error: any) {
      console.error('Error detecting fraud:', error);
      this.emit('monitoring_error', { error: error.message, transactionId });
    }
  }

  // Check for immediate alerts on transaction creation
  private async checkImmediateAlerts(transactionData: any): Promise<void> {
    const alerts: TransactionAlert[] = [];

    // High value transaction alert
    if (transactionData.amount >= this.config.alertThresholds.highValueAmount) {
      alerts.push({
        id: this.generateAlertId(),
        transactionId: transactionData.id,
        userId: transactionData.userId,
        type: MonitoringEventType.HIGH_VALUE_TRANSACTION,
        severity: AlertSeverity.MEDIUM,
        title: 'High Value Transaction',
        description: `High value transaction detected: ₹${transactionData.amount.toLocaleString()}`,
        timestamp: new Date().toISOString(),
        acknowledged: false,
        resolved: false,
        data: { amount: transactionData.amount },
        actions: [
          {
            id: 'review_transaction',
            type: 'review',
            description: 'Review transaction details',
            executed: false
          }
        ]
      });
    }

    // New device alert
    if (await this.isNewDevice(transactionData.deviceFingerprint, transactionData.userId)) {
      alerts.push({
        id: this.generateAlertId(),
        transactionId: transactionData.id,
        userId: transactionData.userId,
        type: MonitoringEventType.DEVICE_ANOMALY,
        severity: AlertSeverity.LOW,
        title: 'New Device Detected',
        description: 'Transaction from new device',
        timestamp: new Date().toISOString(),
        acknowledged: false,
        resolved: false,
        data: { deviceFingerprint: transactionData.deviceFingerprint },
        actions: [
          {
            id: 'verify_device',
            type: 'notify',
            description: 'Send device verification',
            executed: false
          }
        ]
      });
    }

    // Store alerts
    alerts.forEach(alert => {
      this.alerts.set(alert.id, alert);
      this.emit('alert_created', alert);
    });
  }

  // Check for status-specific alerts
  private async checkStatusAlerts(transaction: any, status: TransactionStatus): Promise<void> {
    const alerts: TransactionAlert[] = [];

    switch (status) {
      case TransactionStatus.FAILED:
        alerts.push({
          id: this.generateAlertId(),
          transactionId: transaction.id,
          userId: transaction.userId,
          type: MonitoringEventType.TRANSACTION_FAILED,
          severity: AlertSeverity.MEDIUM,
          title: 'Transaction Failed',
          description: `Transaction ${transaction.id} failed`,
          timestamp: new Date().toISOString(),
          acknowledged: false,
          resolved: false,
          data: { status, processingTime: transaction.processingTime },
          actions: [
            {
              id: 'investigate_failure',
              type: 'review',
              description: 'Investigate failure reason',
              executed: false
            }
          ]
        });
        break;

      case TransactionStatus.COMPLETED:
        // Check processing time
        if (transaction.processingTime > this.config.alertThresholds.processingTime) {
          alerts.push({
            id: this.generateAlertId(),
            transactionId: transaction.id,
            userId: transaction.userId,
            type: MonitoringEventType.TRANSACTION_COMPLETED,
            severity: AlertSeverity.LOW,
            title: 'Slow Transaction',
            description: `Transaction took ${transaction.processingTime}ms to complete`,
            timestamp: new Date().toISOString(),
            acknowledged: false,
            resolved: false,
            data: { processingTime: transaction.processingTime },
            actions: [
              {
                id: 'analyze_performance',
                type: 'review',
                description: 'Analyze performance bottleneck',
                executed: false
              }
            ]
          });
        }
        break;
    }

    // Store alerts
    alerts.forEach(alert => {
      this.alerts.set(alert.id, alert);
      this.emit('alert_created', alert);
    });
  }

  // Start event processing loop
  private startEventProcessing(): void {
    setInterval(async () => {
      if (!this.isProcessing && this.eventQueue.length > 0) {
        this.isProcessing = true;
        await this.processEventQueue();
        this.isProcessing = false;
      }
    }, 1000); // Process every second
  }

  // Process event queue
  private async processEventQueue(): Promise<void> {
    const eventsToProcess = this.eventQueue.splice(0, 100); // Process up to 100 events at a time

    for (const event of eventsToProcess) {
      try {
        await this.processEvent(event);
      } catch (error: any) {
        console.error('Error processing event:', error);
      }
    }
  }

  // Process individual event
  private async processEvent(event: TransactionEvent): Promise<void> {
    // Store event in database (mock implementation)
    await this.storeEvent(event);

    // Send real-time notifications if enabled
    if (this.config.realTimeAlerts) {
      await this.sendRealTimeNotification(event);
    }

    // Update dashboards
    await this.updateDashboards(event);

    // Check escalation rules
    await this.checkEscalationRules(event);
  }

  // Store event (mock implementation)
  private async storeEvent(event: TransactionEvent): Promise<void> {
    // In production, store in database
    console.log('Storing event:', event.id, event.type);
  }

  // Send real-time notification
  private async sendRealTimeNotification(event: TransactionEvent): Promise<void> {
    try {
      // Send to WebSocket clients
      this.emit('real_time_notification', event);

      // Send to external systems
      for (const channel of this.config.notificationChannels) {
        await this.sendToNotificationChannel(channel, event);
      }

    } catch (error: any) {
      console.error('Error sending real-time notification:', error);
    }
  }

  // Send to notification channel
  private async sendToNotificationChannel(channel: string, event: TransactionEvent): Promise<void> {
    // Mock implementation for different notification channels
    switch (channel) {
      case 'webhook':
        await this.sendWebhookNotification(event);
        break;
      case 'email':
        await this.sendEmailNotification(event);
        break;
      case 'sms':
        await this.sendSMSNotification(event);
        break;
      case 'slack':
        await this.sendSlackNotification(event);
        break;
    }
  }

  // Mock notification methods
  private async sendWebhookNotification(event: TransactionEvent): Promise<void> {
    console.log('Sending webhook notification:', event.id);
  }

  private async sendEmailNotification(event: TransactionEvent): Promise<void> {
    console.log('Sending email notification:', event.id);
  }

  private async sendSMSNotification(event: TransactionEvent): Promise<void> {
    console.log('Sending SMS notification:', event.id);
  }

  private async sendSlackNotification(event: TransactionEvent): Promise<void> {
    console.log('Sending Slack notification:', event.id);
  }

  // Update dashboards
  private async updateDashboards(event: TransactionEvent): Promise<void> {
    // Emit dashboard update event
    this.emit('dashboard_update', {
      eventType: event.type,
      timestamp: event.timestamp,
      data: event.data
    });
  }

  // Check escalation rules
  private async checkEscalationRules(event: TransactionEvent): Promise<void> {
    for (const rule of this.config.escalationRules) {
      if (this.evaluateEscalationCondition(rule.condition, event)) {
        // Execute escalation actions
        for (const action of rule.actions) {
          await this.executeAlertAction(action);
        }
      }
    }
  }

  // Evaluate escalation condition
  private evaluateEscalationCondition(condition: string, event: TransactionEvent): boolean {
    // Mock implementation - in production, use a proper expression evaluator
    try {
      // Simple condition evaluation (replace with proper parser in production)
      if (condition.includes('fraud_detected') && event.type === MonitoringEventType.FRAUD_DETECTED) {
        return true;
      }
      if (condition.includes('high_value') && event.data.amount > 100000) {
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error evaluating escalation condition:', error);
      return false;
    }
  }

  // Execute alert action
  private async executeAlertAction(action: AlertAction): Promise<void> {
    try {
      action.executed = true;
      action.executedAt = new Date().toISOString();

      switch (action.type) {
        case 'block':
          action.result = 'Transaction blocked';
          break;
        case 'review':
          action.result = 'Transaction flagged for review';
          break;
        case 'notify':
          action.result = 'Notification sent';
          break;
        case 'escalate':
          action.result = 'Escalated to security team';
          break;
        case 'auto_resolve':
          action.result = 'Automatically resolved';
          break;
      }

      this.emit('action_executed', action);

    } catch (error: any) {
      console.error('Error executing alert action:', error);
      action.result = `Error: ${error.message}`;
    }
  }

  // Utility methods
  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getSeverityForStatus(status: TransactionStatus): AlertSeverity {
    switch (status) {
      case TransactionStatus.COMPLETED:
        return AlertSeverity.LOW;
      case TransactionStatus.FAILED:
        return AlertSeverity.MEDIUM;
      case TransactionStatus.DISPUTED:
        return AlertSeverity.HIGH;
      default:
        return AlertSeverity.LOW;
    }
  }

  private isFinalStatus(status: TransactionStatus): boolean {
    return [
      TransactionStatus.COMPLETED,
      TransactionStatus.FAILED,
      TransactionStatus.CANCELLED,
      TransactionStatus.REFUNDED
    ].includes(status);
  }

  private async isNewDevice(deviceFingerprint: string, userId: string): Promise<boolean> {
    // Mock implementation - in production, check against database
    return Math.random() > 0.8;
  }

  private initializeMetrics(): TransactionMetrics {
    return {
      totalTransactions: 0,
      successfulTransactions: 0,
      failedTransactions: 0,
      pendingTransactions: 0,
      totalVolume: 0,
      averageTransactionValue: 0,
      fraudRate: 0,
      chargebackRate: 0,
      refundRate: 0,
      processingTime: {
        average: 0,
        p95: 0,
        p99: 0
      },
      velocity: {
        perMinute: 0,
        perHour: 0,
        perDay: 0
      }
    };
  }

  private updateMetrics(eventType: string, data: any): void {
    switch (eventType) {
      case 'transaction_created':
        this.metrics.totalTransactions++;
        this.metrics.pendingTransactions++;
        this.metrics.totalVolume += data.amount || 0;
        break;
      case 'transaction_updated':
        if (data.status === TransactionStatus.COMPLETED) {
          this.metrics.successfulTransactions++;
          this.metrics.pendingTransactions--;
        } else if (data.status === TransactionStatus.FAILED) {
          this.metrics.failedTransactions++;
          this.metrics.pendingTransactions--;
        }
        break;
      case 'fraud_detected':
        // Update fraud metrics
        break;
    }

    // Recalculate derived metrics
    this.metrics.averageTransactionValue = this.metrics.totalVolume / this.metrics.totalTransactions;
    this.metrics.fraudRate = this.metrics.totalTransactions > 0 ? 
      (this.metrics.failedTransactions / this.metrics.totalTransactions) * 100 : 0;
  }

  // Public methods for external access
  getActiveTransactions(): Map<string, any> {
    return this.activeTransactions;
  }

  getAlerts(): Map<string, TransactionAlert> {
    return this.alerts;
  }

  getMetrics(): TransactionMetrics {
    return { ...this.metrics };
  }

  getAlertsBySeverity(severity: AlertSeverity): TransactionAlert[] {
    return Array.from(this.alerts.values()).filter(alert => alert.severity === severity);
  }

  getUnacknowledgedAlerts(): TransactionAlert[] {
    return Array.from(this.alerts.values()).filter(alert => !alert.acknowledged);
  }

  acknowledgeAlert(alertId: string): boolean {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.acknowledged = true;
      this.emit('alert_acknowledged', alert);
      return true;
    }
    return false;
  }

  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.resolved = true;
      this.emit('alert_resolved', alert);
      return true;
    }
    return false;
  }
}

// Real-time Dashboard Service
export class RealTimeDashboardService {
  private monitor: TransactionMonitor;
  private connectedClients: Set<any>;

  constructor(monitor: TransactionMonitor) {
    this.monitor = monitor;
    this.connectedClients = new Set();

    // Listen for monitor events
    this.monitor.on('dashboard_update', (data) => {
      this.broadcastToClients('dashboard_update', data);
    });

    this.monitor.on('alert_created', (alert) => {
      this.broadcastToClients('alert_created', alert);
    });

    this.monitor.on('transaction_monitored', (event) => {
      this.broadcastToClients('transaction_monitored', event);
    });
  }

  // Add client connection
  addClient(client: any): void {
    this.connectedClients.add(client);
    
    // Send initial data
    client.send(JSON.stringify({
      type: 'initial_data',
      data: {
        metrics: this.monitor.getMetrics(),
        alerts: Array.from(this.monitor.getAlerts().values()),
        activeTransactions: Array.from(this.monitor.getActiveTransactions().values())
      }
    }));
  }

  // Remove client connection
  removeClient(client: any): void {
    this.connectedClients.delete(client);
  }

  // Broadcast to all connected clients
  private broadcastToClients(type: string, data: any): void {
    const message = JSON.stringify({ type, data });
    
    this.connectedClients.forEach(client => {
      try {
        client.send(message);
      } catch (error) {
        console.error('Error sending message to client:', error);
        this.connectedClients.delete(client);
      }
    });
  }

  // Get dashboard data
  getDashboardData(): {
    metrics: TransactionMetrics;
    recentAlerts: TransactionAlert[];
    activeTransactions: any[];
    alertsBySeverity: Record<AlertSeverity, number>;
  } {
    const alerts = Array.from(this.monitor.getAlerts().values());
    const alertsBySeverity = {
      [AlertSeverity.LOW]: 0,
      [AlertSeverity.MEDIUM]: 0,
      [AlertSeverity.HIGH]: 0,
      [AlertSeverity.CRITICAL]: 0
    };

    alerts.forEach(alert => {
      alertsBySeverity[alert.severity]++;
    });

    return {
      metrics: this.monitor.getMetrics(),
      recentAlerts: alerts.slice(-10), // Last 10 alerts
      activeTransactions: Array.from(this.monitor.getActiveTransactions().values()),
      alertsBySeverity
    };
  }
}

// Default monitoring configuration
export const defaultMonitoringConfig: MonitoringConfig = {
  enabled: true,
  realTimeAlerts: true,
  batchProcessing: true,
  alertThresholds: {
    highValueAmount: 100000, // ₹1 lakh
    velocityLimit: 10, // 10 transactions per minute
    fraudScore: 70,
    processingTime: 30000 // 30 seconds
  },
  notificationChannels: ['webhook', 'email'],
  escalationRules: [
    {
      condition: 'fraud_detected',
      severity: AlertSeverity.CRITICAL,
      actions: [
        {
          id: 'auto_block',
          type: 'block',
          description: 'Automatically block transaction',
          executed: false
        }
      ]
    }
  ],
  retentionPeriod: 30 // 30 days
};

// Export types and enums
export { TransactionStatus, MonitoringEventType, AlertSeverity };
