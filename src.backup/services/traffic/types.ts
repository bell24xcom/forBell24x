export interface TrafficConfig {
  callRouting: CallRoutingConfig;
  messageRouting: MessageRoutingConfig;
  queueManagement: QueueManagementConfig;
  loadBalancing: LoadBalancingConfig;
  analytics: AnalyticsConfig;
  alerts: AlertConfig;
  monitoring: MonitoringConfig;
}

export interface CallRoutingConfig {
  maxConcurrentCalls: number;
  skillBasedRouting: boolean;
  priorityRouting: boolean;
  geographicRouting: boolean;
  languageBasedRouting: boolean;
  departmentRouting: boolean;
  timeBasedRouting: boolean;
  overflowHandling: OverflowConfig;
  failover: FailoverConfig;
}

export interface MessageRoutingConfig {
  maxConcurrentMessages: number;
  channelPriority: ChannelPriority[];
  autoResponse: AutoResponseConfig;
  botHandling: BotHandlingConfig;
  humanHandoff: HumanHandoffConfig;
  bulkMessaging: BulkMessagingConfig;
}

export interface QueueManagementConfig {
  maxQueueLength: number;
  timeout: number;
  priorityLevels: number;
  overflowThreshold: number;
  retryAttempts: number;
  retryDelay: number;
}

export interface LoadBalancingConfig {
  algorithm: 'round-robin' | 'least-connections' | 'weighted' | 'ip-hash';
  maxConnectionsPerAgent: number;
  healthCheckInterval: number;
  failoverThreshold: number;
  autoScaling: AutoScalingConfig;
}

export interface AnalyticsConfig {
  collectionInterval: number;
  metrics: string[];
  retentionPeriod: number;
  realTimeProcessing: boolean;
  aggregationRules: AggregationRule[];
}

export interface AlertConfig {
  thresholds: AlertThreshold[];
  notificationChannels: string[];
  escalationRules: EscalationRule[];
  cooldownPeriod: number;
}

export interface MonitoringConfig {
  interval: number;
  metrics: string[];
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  retentionPeriod: number;
}

export interface OverflowConfig {
  enabled: boolean;
  threshold: number;
  backupAgents: string[];
  overflowMessage: string;
}

export interface FailoverConfig {
  enabled: boolean;
  backupSystem: string;
  failoverDelay: number;
  recoveryCheck: boolean;
}

export interface ChannelPriority {
  channel: string;
  priority: number;
  maxConcurrent: number;
}

export interface AutoResponseConfig {
  enabled: boolean;
  templates: AutoResponseTemplate[];
  conditions: AutoResponseCondition[];
}

export interface BotHandlingConfig {
  enabled: boolean;
  intentThreshold: number;
  fallbackEnabled: boolean;
  maxRetries: number;
}

export interface HumanHandoffConfig {
  enabled: boolean;
  threshold: number;
  priority: number;
  notificationEnabled: boolean;
}

export interface BulkMessagingConfig {
  maxBatchSize: number;
  rateLimit: number;
  retryStrategy: RetryStrategy;
}

export interface AutoScalingConfig {
  enabled: boolean;
  minInstances: number;
  maxInstances: number;
  scaleUpThreshold: number;
  scaleDownThreshold: number;
}

export interface AggregationRule {
  metric: string;
  interval: number;
  function: 'sum' | 'average' | 'min' | 'max';
}

export interface AlertThreshold {
  metric: string;
  operator: '>' | '<' | '>=' | '<=' | '==';
  value: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface EscalationRule {
  alertType: string;
  threshold: number;
  escalationDelay: number;
  notifyChannels: string[];
}

export interface RetryStrategy {
  maxAttempts: number;
  delay: number;
  backoff: 'linear' | 'exponential';
}

export interface AutoResponseTemplate {
  id: string;
  content: string;
  conditions: AutoResponseCondition[];
}

export interface AutoResponseCondition {
  field: string;
  operator: string;
  value: any;
}

export interface TrafficMetrics {
  activeCalls: number;
  queuedCalls: number;
  activeMessages: number;
  queuedMessages: number;
  agentUtilization: number;
  averageResponseTime: number;
  systemLoad: number;
}

export interface TrafficStats extends TrafficMetrics {
  timestamp: number;
  period: string;
}

export interface Call {
  id: string;
  type: 'inbound' | 'outbound';
  status: 'queued' | 'routing' | 'active' | 'completed' | 'failed';
  priority: number;
  customer: Customer;
  agent?: Agent;
  queue?: string;
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  metadata: Record<string, any>;
}

export interface Message {
  id: string;
  type: 'whatsapp' | 'chatbot' | 'voicebot';
  status: 'queued' | 'processing' | 'sent' | 'delivered' | 'failed';
  priority: number;
  customer: Customer;
  content: string;
  channel: string;
  timestamp: Date;
  metadata: Record<string, any>;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  language?: string;
  location?: string;
  vip?: boolean;
  metadata: Record<string, any>;
}

export interface Agent {
  id: string;
  name: string;
  skills: string[];
  languages: string[];
  status: 'available' | 'busy' | 'offline';
  currentLoad: number;
  maxLoad: number;
  metadata: Record<string, any>;
} 