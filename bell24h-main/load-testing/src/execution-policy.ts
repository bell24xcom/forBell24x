import { 
  TestConfig, 
  ExecutionPolicy, 
  ResourceLimits,
  SafetyMeasures,
  PolicyViolation 
} from './types';

export class ExecutionPolicyManager {
  private policies: Map<string, ExecutionPolicy> = new Map();
  private resourceLimits: ResourceLimits;
  private safetyMeasures: SafetyMeasures;
  private violations: PolicyViolation[] = [];
  private isEnabled: boolean = true;

  constructor() {
    this.initializeDefaultPolicies();
    this.initializeResourceLimits();
    this.initializeSafetyMeasures();
  }

  private initializeDefaultPolicies(): void {
    // Production safety policy
    this.policies.set('production', {
      name: 'Production Safety',
      description: 'Strict safety measures for production environments',
      rules: {
        maxConcurrentUsers: 50,
        maxRequestsPerSecond: 100,
        maxTestDuration: 300, // 5 minutes
        allowedEnvironments: ['staging', 'development'],
        blockedEndpoints: ['/admin', '/internal', '/debug'],
        requiredApproval: true,
        maxErrorRate: 5.0,
        maxLatency: 2000,
        resourceThresholds: {
          cpuUsage: 70,
          memoryUsage: 80,
          diskUsage: 85
        }
      },
      actions: {
        onViolation: 'stop',
        onHighErrorRate: 'pause',
        onResourceExhaustion: 'stop',
        onTimeout: 'stop'
      }
    });

    // Development policy
    this.policies.set('development', {
      name: 'Development Testing',
      description: 'Relaxed policy for development testing',
      rules: {
        maxConcurrentUsers: 200,
        maxRequestsPerSecond: 500,
        maxTestDuration: 1800, // 30 minutes
        allowedEnvironments: ['development', 'staging'],
        blockedEndpoints: ['/admin'],
        requiredApproval: false,
        maxErrorRate: 10.0,
        maxLatency: 5000,
        resourceThresholds: {
          cpuUsage: 90,
          memoryUsage: 90,
          diskUsage: 95
        }
      },
      actions: {
        onViolation: 'warn',
        onHighErrorRate: 'warn',
        onResourceExhaustion: 'pause',
        onTimeout: 'warn'
      }
    });

    // Performance testing policy
    this.policies.set('performance', {
      name: 'Performance Testing',
      description: 'Policy for performance and stress testing',
      rules: {
        maxConcurrentUsers: 1000,
        maxRequestsPerSecond: 2000,
        maxTestDuration: 3600, // 1 hour
        allowedEnvironments: ['staging', 'development'],
        blockedEndpoints: ['/admin', '/internal'],
        requiredApproval: true,
        maxErrorRate: 15.0,
        maxLatency: 10000,
        resourceThresholds: {
          cpuUsage: 95,
          memoryUsage: 95,
          diskUsage: 98
        }
      },
      actions: {
        onViolation: 'pause',
        onHighErrorRate: 'pause',
        onResourceExhaustion: 'stop',
        onTimeout: 'pause'
      }
    });
  }

  private initializeResourceLimits(): void {
    this.resourceLimits = {
      maxCpuUsage: 90,
      maxMemoryUsage: 85,
      maxDiskUsage: 90,
      maxNetworkBandwidth: 1000, // Mbps
      maxDatabaseConnections: 100,
      maxFileDescriptors: 10000,
      maxProcesses: 1000,
      maxMemoryPerProcess: 512 // MB
    };
  }

  private initializeSafetyMeasures(): void {
    this.safetyMeasures = {
      circuitBreaker: {
        enabled: true,
        errorThreshold: 10,
        timeout: 5000,
        resetTimeout: 30000
      },
      rateLimiting: {
        enabled: true,
        requestsPerMinute: 1000,
        burstLimit: 100
      },
      resourceMonitoring: {
        enabled: true,
        checkInterval: 5000,
        alertThreshold: 80
      },
      automaticRollback: {
        enabled: true,
        errorRateThreshold: 20,
        latencyThreshold: 5000
      },
      backupAndRecovery: {
        enabled: true,
        backupInterval: 300000, // 5 minutes
        maxBackups: 10
      }
    };
  }

  public async validateTestConfig(config: TestConfig, policyName: string = 'development'): Promise<{
    isValid: boolean;
    violations: PolicyViolation[];
    warnings: string[];
  }> {
    console.log(`🔍 Validating test config against policy: ${policyName}`);

    const policy = this.policies.get(policyName);
    if (!policy) {
      throw new Error(`Policy not found: ${policyName}`);
    }

    const violations: PolicyViolation[] = [];
    const warnings: string[] = [];

    // Check concurrent users
    if (config.maxUsers > policy.rules.maxConcurrentUsers) {
      violations.push({
        type: 'maxConcurrentUsers',
        severity: 'high',
        message: `Max users (${config.maxUsers}) exceeds policy limit (${policy.rules.maxConcurrentUsers})`,
        currentValue: config.maxUsers,
        limitValue: policy.rules.maxConcurrentUsers,
        policy: policyName
      });
    }

    // Check test duration
    if (config.duration > policy.rules.maxTestDuration) {
      violations.push({
        type: 'maxTestDuration',
        severity: 'medium',
        message: `Test duration (${config.duration}s) exceeds policy limit (${policy.rules.maxTestDuration}s)`,
        currentValue: config.duration,
        limitValue: policy.rules.maxTestDuration,
        policy: policyName
      });
    }

    // Check environment
    if (!policy.rules.allowedEnvironments.includes(config.environment)) {
      violations.push({
        type: 'environment',
        severity: 'high',
        message: `Environment '${config.environment}' not allowed by policy`,
        currentValue: config.environment,
        limitValue: policy.rules.allowedEnvironments,
        policy: policyName
      });
    }

    // Check scenarios for blocked endpoints
    for (const scenario of config.scenarios) {
      for (const step of scenario.flow) {
        if (step.type === 'http' && step.http) {
          const url = step.http.url;
          for (const blockedEndpoint of policy.rules.blockedEndpoints) {
            if (url.includes(blockedEndpoint)) {
              violations.push({
                type: 'blockedEndpoint',
                severity: 'critical',
                message: `Endpoint '${url}' is blocked by policy`,
                currentValue: url,
                limitValue: blockedEndpoint,
                policy: policyName
              });
            }
          }
        }
      }
    }

    // Check for required approval
    if (policy.rules.requiredApproval) {
      warnings.push('This test requires approval before execution');
    }

    // Check resource requirements
    const estimatedCpuUsage = this.estimateCpuUsage(config);
    if (estimatedCpuUsage > policy.rules.resourceThresholds.cpuUsage) {
      warnings.push(`Estimated CPU usage (${estimatedCpuUsage}%) may exceed policy threshold (${policy.rules.resourceThresholds.cpuUsage}%)`);
    }

    const estimatedMemoryUsage = this.estimateMemoryUsage(config);
    if (estimatedMemoryUsage > policy.rules.resourceThresholds.memoryUsage) {
      warnings.push(`Estimated memory usage (${estimatedMemoryUsage}%) may exceed policy threshold (${policy.rules.resourceThresholds.memoryUsage}%)`);
    }

    this.violations = violations;

    return {
      isValid: violations.length === 0,
      violations,
      warnings
    };
  }

  public async monitorTestExecution(
    config: TestConfig, 
    currentMetrics: any, 
    policyName: string = 'development'
  ): Promise<{
    shouldStop: boolean;
    shouldPause: boolean;
    violations: PolicyViolation[];
    actions: string[];
  }> {
    if (!this.isEnabled) {
      return {
        shouldStop: false,
        shouldPause: false,
        violations: [],
        actions: []
      };
    }

    const policy = this.policies.get(policyName);
    if (!policy) {
      throw new Error(`Policy not found: ${policyName}`);
    }

    const violations: PolicyViolation[] = [];
    const actions: string[] = [];

    // Check error rate
    if (currentMetrics.errorRate > policy.rules.maxErrorRate) {
      violations.push({
        type: 'errorRate',
        severity: 'high',
        message: `Error rate (${currentMetrics.errorRate}%) exceeds policy limit (${policy.rules.maxErrorRate}%)`,
        currentValue: currentMetrics.errorRate,
        limitValue: policy.rules.maxErrorRate,
        policy: policyName
      });

      if (policy.actions.onHighErrorRate === 'stop') {
        actions.push('stop');
      } else if (policy.actions.onHighErrorRate === 'pause') {
        actions.push('pause');
      }
    }

    // Check latency
    if (currentMetrics.avgLatency > policy.rules.maxLatency) {
      violations.push({
        type: 'latency',
        severity: 'medium',
        message: `Average latency (${currentMetrics.avgLatency}ms) exceeds policy limit (${policy.rules.maxLatency}ms)`,
        currentValue: currentMetrics.avgLatency,
        limitValue: policy.rules.maxLatency,
        policy: policyName
      });
    }

    // Check resource usage
    if (currentMetrics.cpuUsage > policy.rules.resourceThresholds.cpuUsage) {
      violations.push({
        type: 'cpuUsage',
        severity: 'high',
        message: `CPU usage (${currentMetrics.cpuUsage}%) exceeds policy threshold (${policy.rules.resourceThresholds.cpuUsage}%)`,
        currentValue: currentMetrics.cpuUsage,
        limitValue: policy.rules.resourceThresholds.cpuUsage,
        policy: policyName
      });

      if (policy.actions.onResourceExhaustion === 'stop') {
        actions.push('stop');
      }
    }

    if (currentMetrics.memoryUsage > policy.rules.resourceThresholds.memoryUsage) {
      violations.push({
        type: 'memoryUsage',
        severity: 'high',
        message: `Memory usage (${currentMetrics.memoryUsage}%) exceeds policy threshold (${policy.rules.resourceThresholds.memoryUsage}%)`,
        currentValue: currentMetrics.memoryUsage,
        limitValue: policy.rules.resourceThresholds.memoryUsage,
        policy: policyName
      });

      if (policy.actions.onResourceExhaustion === 'stop') {
        actions.push('stop');
      }
    }

    // Check circuit breaker
    if (this.safetyMeasures.circuitBreaker.enabled) {
      const circuitBreakerStatus = this.checkCircuitBreaker(currentMetrics);
      if (circuitBreakerStatus.triggered) {
        violations.push({
          type: 'circuitBreaker',
          severity: 'critical',
          message: `Circuit breaker triggered: ${circuitBreakerStatus.reason}`,
          currentValue: circuitBreakerStatus.value,
          limitValue: this.safetyMeasures.circuitBreaker.errorThreshold,
          policy: policyName
        });
        actions.push('stop');
      }
    }

    // Check rate limiting
    if (this.safetyMeasures.rateLimiting.enabled) {
      const rateLimitStatus = this.checkRateLimiting(currentMetrics);
      if (rateLimitStatus.exceeded) {
        violations.push({
          type: 'rateLimit',
          severity: 'medium',
          message: `Rate limit exceeded: ${currentMetrics.requestsPerSecond} req/s`,
          currentValue: currentMetrics.requestsPerSecond,
          limitValue: this.safetyMeasures.rateLimiting.requestsPerMinute / 60,
          policy: policyName
        });
        actions.push('pause');
      }
    }

    const shouldStop = actions.includes('stop') || 
      (policy.actions.onViolation === 'stop' && violations.length > 0);
    const shouldPause = actions.includes('pause') || 
      (policy.actions.onViolation === 'pause' && violations.length > 0);

    return {
      shouldStop,
      shouldPause,
      violations,
      actions
    };
  }

  private estimateCpuUsage(config: TestConfig): number {
    // Simple estimation based on concurrent users and request complexity
    const baseCpuPerUser = 0.5; // 0.5% CPU per user
    const scenarioComplexity = config.scenarios.length * 0.2; // 0.2% per scenario
    return Math.min(100, config.maxUsers * baseCpuPerUser + scenarioComplexity);
  }

  private estimateMemoryUsage(config: TestConfig): number {
    // Simple estimation based on concurrent users and data size
    const baseMemoryPerUser = 2; // 2MB per user
    const totalMemory = config.maxUsers * baseMemoryPerUser;
    const systemMemory = 8192; // 8GB assumed
    return Math.min(100, (totalMemory / systemMemory) * 100);
  }

  private checkCircuitBreaker(metrics: any): {
    triggered: boolean;
    reason: string;
    value: number;
  } {
    const errorRate = metrics.errorRate || 0;
    const latency = metrics.avgLatency || 0;
    
    if (errorRate > this.safetyMeasures.circuitBreaker.errorThreshold) {
      return {
        triggered: true,
        reason: `Error rate ${errorRate}% exceeds threshold ${this.safetyMeasures.circuitBreaker.errorThreshold}%`,
        value: errorRate
      };
    }

    if (latency > this.safetyMeasures.circuitBreaker.timeout) {
      return {
        triggered: true,
        reason: `Latency ${latency}ms exceeds timeout ${this.safetyMeasures.circuitBreaker.timeout}ms`,
        value: latency
      };
    }

    return {
      triggered: false,
      reason: '',
      value: 0
    };
  }

  private checkRateLimiting(metrics: any): {
    exceeded: boolean;
    currentRate: number;
    limit: number;
  } {
    const currentRate = metrics.requestsPerSecond || 0;
    const limit = this.safetyMeasures.rateLimiting.requestsPerMinute / 60;
    
    return {
      exceeded: currentRate > limit,
      currentRate,
      limit
    };
  }

  public addPolicy(name: string, policy: ExecutionPolicy): void {
    this.policies.set(name, policy);
    console.log(`📋 Added policy: ${name}`);
  }

  public removePolicy(name: string): boolean {
    const removed = this.policies.delete(name);
    if (removed) {
      console.log(`🗑️ Removed policy: ${name}`);
    }
    return removed;
  }

  public getPolicy(name: string): ExecutionPolicy | undefined {
    return this.policies.get(name);
  }

  public listPolicies(): Array<{
    name: string;
    policy: ExecutionPolicy;
  }> {
    return Array.from(this.policies.entries()).map(([name, policy]) => ({
      name,
      policy
    }));
  }

  public updateResourceLimits(limits: Partial<ResourceLimits>): void {
    this.resourceLimits = { ...this.resourceLimits, ...limits };
    console.log('🔧 Updated resource limits');
  }

  public updateSafetyMeasures(measures: Partial<SafetyMeasures>): void {
    this.safetyMeasures = { ...this.safetyMeasures, ...measures };
    console.log('🔧 Updated safety measures');
  }

  public enable(): void {
    this.isEnabled = true;
    console.log('✅ Execution policy manager enabled');
  }

  public disable(): void {
    this.isEnabled = false;
    console.log('❌ Execution policy manager disabled');
  }

  public isPolicyEnabled(): boolean {
    return this.isEnabled;
  }

  public getViolations(): PolicyViolation[] {
    return [...this.violations];
  }

  public clearViolations(): void {
    this.violations = [];
  }

  public exportPolicy(name: string): string {
    const policy = this.policies.get(name);
    if (!policy) {
      throw new Error(`Policy not found: ${name}`);
    }

    return JSON.stringify(policy, null, 2);
  }

  public importPolicy(name: string, policyData: string): void {
    try {
      const policy = JSON.parse(policyData);
      this.policies.set(name, policy);
      console.log(`📥 Imported policy: ${name}`);
    } catch (error) {
      throw new Error(`Failed to import policy: ${error instanceof Error ? error.message : 'Invalid JSON'}`);
    }
  }

  public getPolicySummary(): {
    totalPolicies: number;
    enabled: boolean;
    resourceLimits: ResourceLimits;
    safetyMeasures: SafetyMeasures;
  } {
    return {
      totalPolicies: this.policies.size,
      enabled: this.isEnabled,
      resourceLimits: this.resourceLimits,
      safetyMeasures: this.safetyMeasures
    };
  }
} 