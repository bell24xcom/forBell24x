import { EventEmitter } from 'events';
import { TrafficConfig, TrafficMetrics, TrafficStats } from './types';
import { CallRouter } from './routers/CallRouter';
import { MessageRouter } from './routers/MessageRouter';
import { QueueManager } from './queue/QueueManager';
import { LoadBalancer } from './load/LoadBalancer';
import { AnalyticsManager } from './analytics/AnalyticsManager';
import { AlertManager } from './monitoring/AlertManager';

export class TrafficManager extends EventEmitter {
  private static instance: TrafficManager;
  private config: TrafficConfig;
  private callRouter: CallRouter;
  private messageRouter: MessageRouter;
  private queueManager: QueueManager;
  private loadBalancer: LoadBalancer;
  private analyticsManager: AnalyticsManager;
  private alertManager: AlertManager;
  private metrics: TrafficMetrics;
  private isInitialized: boolean = false;

  private constructor() {
    super();
    this.metrics = {
      activeCalls: 0,
      queuedCalls: 0,
      activeMessages: 0,
      queuedMessages: 0,
      agentUtilization: 0,
      averageResponseTime: 0,
      systemLoad: 0
    };
  }

  public static getInstance(): TrafficManager {
    if (!TrafficManager.instance) {
      TrafficManager.instance = new TrafficManager();
    }
    return TrafficManager.instance;
  }

  public async initialize(config: TrafficConfig): Promise<void> {
    if (this.isInitialized) {
      throw new Error('TrafficManager already initialized');
    }

    this.config = config;
    
    // Initialize components
    this.callRouter = new CallRouter(config.callRouting);
    this.messageRouter = new MessageRouter(config.messageRouting);
    this.queueManager = new QueueManager(config.queueManagement);
    this.loadBalancer = new LoadBalancer(config.loadBalancing);
    this.analyticsManager = new AnalyticsManager(config.analytics);
    this.alertManager = new AlertManager(config.alerts);

    // Set up event listeners
    this.setupEventListeners();

    // Start monitoring
    await this.startMonitoring();

    this.isInitialized = true;
  }

  private setupEventListeners(): void {
    // Call events
    this.callRouter.on('call:queued', this.handleCallQueued.bind(this));
    this.callRouter.on('call:routed', this.handleCallRouted.bind(this));
    this.callRouter.on('call:completed', this.handleCallCompleted.bind(this));

    // Message events
    this.messageRouter.on('message:queued', this.handleMessageQueued.bind(this));
    this.messageRouter.on('message:routed', this.handleMessageRouted.bind(this));
    this.messageRouter.on('message:completed', this.handleMessageCompleted.bind(this));

    // Queue events
    this.queueManager.on('queue:overflow', this.handleQueueOverflow.bind(this));
    this.queueManager.on('queue:timeout', this.handleQueueTimeout.bind(this));

    // Load balancer events
    this.loadBalancer.on('load:high', this.handleHighLoad.bind(this));
    this.loadBalancer.on('load:critical', this.handleCriticalLoad.bind(this));

    // Analytics events
    this.analyticsManager.on('metrics:updated', this.handleMetricsUpdated.bind(this));

    // Alert events
    this.alertManager.on('alert:triggered', this.handleAlertTriggered.bind(this));
  }

  private async startMonitoring(): Promise<void> {
    // Start real-time monitoring
    setInterval(() => {
      this.updateMetrics();
    }, this.config.monitoring.interval);

    // Start analytics collection
    await this.analyticsManager.startCollection();
  }

  private async updateMetrics(): Promise<void> {
    const stats = await this.collectStats();
    this.metrics = {
      ...this.metrics,
      ...stats
    };
    this.emit('metrics:updated', this.metrics);
  }

  private async collectStats(): Promise<TrafficStats> {
    return {
      activeCalls: await this.callRouter.getActiveCallCount(),
      queuedCalls: await this.queueManager.getQueueLength('calls'),
      activeMessages: await this.messageRouter.getActiveMessageCount(),
      queuedMessages: await this.queueManager.getQueueLength('messages'),
      agentUtilization: await this.loadBalancer.getAgentUtilization(),
      averageResponseTime: await this.analyticsManager.getAverageResponseTime(),
      systemLoad: await this.loadBalancer.getSystemLoad()
    };
  }

  // Event handlers
  private async handleCallQueued(call: any): Promise<void> {
    this.metrics.queuedCalls++;
    await this.analyticsManager.trackCallQueued(call);
    this.emit('call:queued', call);
  }

  private async handleCallRouted(call: any): Promise<void> {
    this.metrics.activeCalls++;
    this.metrics.queuedCalls--;
    await this.analyticsManager.trackCallRouted(call);
    this.emit('call:routed', call);
  }

  private async handleCallCompleted(call: any): Promise<void> {
    this.metrics.activeCalls--;
    await this.analyticsManager.trackCallCompleted(call);
    this.emit('call:completed', call);
  }

  private async handleMessageQueued(message: any): Promise<void> {
    this.metrics.queuedMessages++;
    await this.analyticsManager.trackMessageQueued(message);
    this.emit('message:queued', message);
  }

  private async handleMessageRouted(message: any): Promise<void> {
    this.metrics.activeMessages++;
    this.metrics.queuedMessages--;
    await this.analyticsManager.trackMessageRouted(message);
    this.emit('message:routed', message);
  }

  private async handleMessageCompleted(message: any): Promise<void> {
    this.metrics.activeMessages--;
    await this.analyticsManager.trackMessageCompleted(message);
    this.emit('message:completed', message);
  }

  private async handleQueueOverflow(queue: string): Promise<void> {
    await this.alertManager.triggerAlert('queue:overflow', { queue });
    this.emit('queue:overflow', queue);
  }

  private async handleQueueTimeout(queue: string): Promise<void> {
    await this.alertManager.triggerAlert('queue:timeout', { queue });
    this.emit('queue:timeout', queue);
  }

  private async handleHighLoad(): Promise<void> {
    await this.alertManager.triggerAlert('load:high');
    this.emit('load:high');
  }

  private async handleCriticalLoad(): Promise<void> {
    await this.alertManager.triggerAlert('load:critical');
    this.emit('load:critical');
  }

  private async handleMetricsUpdated(metrics: TrafficMetrics): Promise<void> {
    this.metrics = metrics;
    this.emit('metrics:updated', metrics);
  }

  private async handleAlertTriggered(alert: any): Promise<void> {
    this.emit('alert:triggered', alert);
  }

  // Public methods
  public async routeCall(call: any): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('TrafficManager not initialized');
    }
    await this.callRouter.route(call);
  }

  public async routeMessage(message: any): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('TrafficManager not initialized');
    }
    await this.messageRouter.route(message);
  }

  public getMetrics(): TrafficMetrics {
    return { ...this.metrics };
  }

  public async getAnalytics(timeframe: string): Promise<any> {
    return await this.analyticsManager.getAnalytics(timeframe);
  }

  public async getAlerts(): Promise<any[]> {
    return await this.alertManager.getActiveAlerts();
  }
} 