import { 
  TestConfig, 
  TestResults, 
  TestError, 
  Metrics, 
  RequestMetrics, 
  LatencyMetrics, 
  ThroughputMetrics, 
  ErrorMetrics, 
  WebSocketMetrics,
  TestSummary,
  Bottleneck,
  PerformanceRating
} from './types';

export class LoadTestProcessor {
  private config: TestConfig;
  private results: TestResults;
  private startTime: Date;
  private metrics: Metrics;
  private errors: TestError[] = [];
  private warnings: string[] = [];

  constructor(config: TestConfig) {
    this.config = config;
    this.startTime = new Date();
    this.initializeMetrics();
  }

  private initializeMetrics(): void {
    this.metrics = {
      requests: {
        total: 0,
        successful: 0,
        failed: 0,
        successRate: 0,
        byEndpoint: {}
      },
      latency: {
        average: 0,
        median: 0,
        p95: 0,
        p99: 0,
        max: 0,
        min: Infinity
      },
      throughput: {
        requestsPerSecond: 0,
        bytesPerSecond: 0,
        concurrentUsers: 0,
        maxConcurrentUsers: 0
      },
      errors: {
        total: 0,
        byType: {},
        byEndpoint: {},
        mostCommon: []
      },
      websockets: {
        connections: 0,
        messagesSent: 0,
        messagesReceived: 0,
        connectionErrors: 0,
        avgMessageLatency: 0
      },
      custom: {}
    };
  }

  public async runTest(): Promise<TestResults> {
    try {
      console.log(`🚀 Starting load test: ${this.config.name}`);
      console.log(`📊 Target: ${this.config.maxUsers} users over ${this.config.duration}s`);

      // Simulate test execution with lightweight processing
      await this.executeScenarios();
      await this.calculateMetrics();
      await this.generateSummary();

      this.results = {
        testId: this.generateTestId(),
        config: this.config,
        startTime: this.startTime,
        endTime: new Date(),
        duration: Date.now() - this.startTime.getTime(),
        metrics: this.metrics,
        errors: this.errors,
        warnings: this.warnings,
        summary: this.generateSummary()
      };

      console.log(`✅ Load test completed: ${this.results.summary.overall}`);
      return this.results;

    } catch (error) {
      console.error('❌ Load test failed:', error);
      throw new Error(`Load test execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async executeScenarios(): Promise<void> {
    const totalWeight = this.config.scenarios.reduce((sum, scenario) => sum + scenario.weight, 0);
    
    for (const scenario of this.config.scenarios) {
      const scenarioWeight = scenario.weight / totalWeight;
      const scenarioUsers = Math.floor(this.config.maxUsers * scenarioWeight);
      
      console.log(`📋 Executing scenario: ${scenario.name} (${scenarioUsers} users)`);
      
      await this.executeScenario(scenario, scenarioUsers);
    }
  }

  private async executeScenario(scenario: any, userCount: number): Promise<void> {
    const batchSize = Math.min(50, userCount); // Lightweight batch processing
    const batches = Math.ceil(userCount / batchSize);

    for (let batch = 0; batch < batches; batch++) {
      const currentBatchSize = Math.min(batchSize, userCount - batch * batchSize);
      
      // Simulate concurrent user execution
      const promises = Array.from({ length: currentBatchSize }, () => 
        this.executeUserFlow(scenario)
      );

      await Promise.allSettled(promises);
      
      // Add small delay to prevent overwhelming
      if (batch < batches - 1) {
        await this.delay(100);
      }
    }
  }

  private async executeUserFlow(scenario: any): Promise<void> {
    try {
      for (const step of scenario.flow) {
        await this.executeStep(step);
        
        // Add think time between steps
        if (step.think) {
          await this.delay(step.think);
        }
      }
    } catch (error) {
      this.recordError('custom', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  private async executeStep(step: any): Promise<void> {
    const startTime = Date.now();
    
    try {
      switch (step.type) {
        case 'request':
          await this.executeRequest(step);
          break;
        case 'websocket':
          await this.executeWebSocket(step);
          break;
        case 'function':
          await this.executeFunction(step);
          break;
        default:
          console.warn(`⚠️ Unknown step type: ${step.type}`);
      }

      const responseTime = Date.now() - startTime;
      this.recordRequest(step.url || step.type, responseTime, true);

    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.recordRequest(step.url || step.type, responseTime, false);
      this.recordError('network', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  private async executeRequest(step: any): Promise<void> {
    // Lightweight HTTP request simulation
    const response = await fetch(step.url, {
      method: step.method || 'GET',
      headers: step.headers || {},
      body: step.body ? JSON.stringify(step.body) : undefined
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Validate expectations
    if (step.expect) {
      this.validateExpectations(step.expect, response);
    }
  }

  private async executeWebSocket(step: any): Promise<void> {
    // Lightweight WebSocket simulation
    this.metrics.websockets.connections++;
    
    if (step.websocket?.action === 'send') {
      this.metrics.websockets.messagesSent++;
    }
    
    if (step.websocket?.action === 'close') {
      this.metrics.websockets.connections--;
    }
  }

  private async executeFunction(step: any): Promise<void> {
    // Execute custom function if provided
    if (step.function && typeof step.function === 'function') {
      await step.function();
    }
  }

  private validateExpectations(expectations: any[], response: Response): void {
    for (const expectation of expectations) {
      if (expectation.statusCode && response.status !== expectation.statusCode) {
        throw new Error(`Expected status ${expectation.statusCode}, got ${response.status}`);
      }
      
      if (expectation.contentType && !response.headers.get('content-type')?.includes(expectation.contentType)) {
        throw new Error(`Expected content-type ${expectation.contentType}`);
      }
    }
  }

  private recordRequest(endpoint: string, responseTime: number, success: boolean): void {
    this.metrics.requests.total++;
    
    if (success) {
      this.metrics.requests.successful++;
    } else {
      this.metrics.requests.failed++;
    }

    // Update endpoint metrics
    if (!this.metrics.requests.byEndpoint[endpoint]) {
      this.metrics.requests.byEndpoint[endpoint] = {
        count: 0,
        successRate: 0,
        avgLatency: 0,
        maxLatency: 0,
        minLatency: Infinity,
        p95Latency: 0,
        p99Latency: 0
      };
    }

    const endpointMetrics = this.metrics.requests.byEndpoint[endpoint];
    endpointMetrics.count++;
    endpointMetrics.avgLatency = (endpointMetrics.avgLatency * (endpointMetrics.count - 1) + responseTime) / endpointMetrics.count;
    endpointMetrics.maxLatency = Math.max(endpointMetrics.maxLatency, responseTime);
    endpointMetrics.minLatency = Math.min(endpointMetrics.minLatency, responseTime);

    // Update latency metrics
    this.metrics.latency.max = Math.max(this.metrics.latency.max, responseTime);
    this.metrics.latency.min = Math.min(this.metrics.latency.min, responseTime);
  }

  private recordError(type: string, message: string): void {
    this.errors.push({
      timestamp: new Date(),
      type: type as any,
      message,
      context: { config: this.config.name }
    });

    this.metrics.errors.total++;
    this.metrics.errors.byType[type] = (this.metrics.errors.byType[type] || 0) + 1;
  }

  private async calculateMetrics(): Promise<void> {
    // Calculate success rate
    this.metrics.requests.successRate = this.metrics.requests.total > 0 
      ? (this.metrics.requests.successful / this.metrics.requests.total) * 100 
      : 0;

    // Calculate throughput
    const duration = (Date.now() - this.startTime.getTime()) / 1000;
    this.metrics.throughput.requestsPerSecond = duration > 0 
      ? this.metrics.requests.total / duration 
      : 0;

    // Calculate latency percentiles (simplified)
    this.calculateLatencyPercentiles();

    // Calculate error statistics
    this.calculateErrorStatistics();
  }

  private calculateLatencyPercentiles(): void {
    // Simplified percentile calculation
    const latencies = Object.values(this.metrics.requests.byEndpoint)
      .map(m => m.avgLatency)
      .filter(l => l > 0);

    if (latencies.length > 0) {
      latencies.sort((a, b) => a - b);
      const p95Index = Math.floor(latencies.length * 0.95);
      const p99Index = Math.floor(latencies.length * 0.99);
      
      this.metrics.latency.p95 = latencies[p95Index] || 0;
      this.metrics.latency.p99 = latencies[p99Index] || 0;
      this.metrics.latency.average = latencies.reduce((sum, l) => sum + l, 0) / latencies.length;
      this.metrics.latency.median = latencies[Math.floor(latencies.length / 2)] || 0;
    }
  }

  private calculateErrorStatistics(): void {
    // Calculate most common errors
    const errorCounts = this.metrics.errors.byType;
    this.metrics.errors.mostCommon = Object.entries(errorCounts)
      .map(([type, count]) => ({
        type,
        message: type,
        count,
        percentage: (count / this.metrics.errors.total) * 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private generateSummary(): TestSummary {
    const score = this.calculatePerformanceScore();
    const bottlenecks = this.identifyBottlenecks();
    const performance = this.ratePerformance(score);

    return {
      overall: score >= 80 ? 'PASS' : score >= 60 ? 'WARNING' : 'FAIL',
      score,
      recommendations: this.generateRecommendations(bottlenecks),
      bottlenecks,
      performance
    };
  }

  private calculatePerformanceScore(): number {
    let score = 100;

    // Deduct points for errors
    const errorRate = this.metrics.errors.total / this.metrics.requests.total;
    score -= errorRate * 50;

    // Deduct points for slow responses
    if (this.metrics.latency.p95 > 1000) score -= 20;
    if (this.metrics.latency.p99 > 2000) score -= 20;

    // Deduct points for low success rate
    if (this.metrics.requests.successRate < 95) score -= 30;

    return Math.max(0, score);
  }

  private identifyBottlenecks(): Bottleneck[] {
    const bottlenecks: Bottleneck[] = [];

    // Check for high error rates
    if (this.metrics.requests.successRate < 95) {
      bottlenecks.push({
        type: 'network',
        severity: this.metrics.requests.successRate < 80 ? 'critical' : 'high',
        description: `Low success rate: ${this.metrics.requests.successRate.toFixed(1)}%`,
        impact: 'User experience degradation',
        recommendation: 'Investigate network issues and API stability'
      });
    }

    // Check for slow responses
    if (this.metrics.latency.p95 > 1000) {
      bottlenecks.push({
        type: 'network',
        severity: this.metrics.latency.p95 > 2000 ? 'critical' : 'high',
        description: `Slow response times: P95 = ${this.metrics.latency.p95}ms`,
        impact: 'Poor user experience',
        recommendation: 'Optimize API performance and database queries'
      });
    }

    // Check for high error rates by type
    const highErrorTypes = Object.entries(this.metrics.errors.byType)
      .filter(([_, count]) => count > this.metrics.requests.total * 0.05);

    for (const [type, count] of highErrorTypes) {
      bottlenecks.push({
        type: 'network',
        severity: 'medium',
        description: `High ${type} errors: ${count} occurrences`,
        impact: 'Service reliability issues',
        recommendation: `Investigate and fix ${type} error patterns`
      });
    }

    return bottlenecks;
  }

  private ratePerformance(score: number): PerformanceRating {
    let grade: 'A' | 'B' | 'C' | 'D' | 'F';
    let description: string;
    const improvements: string[] = [];

    if (score >= 90) {
      grade = 'A';
      description = 'Excellent performance with minimal issues';
    } else if (score >= 80) {
      grade = 'B';
      description = 'Good performance with minor issues';
      improvements.push('Optimize slow endpoints');
    } else if (score >= 70) {
      grade = 'C';
      description = 'Acceptable performance with some issues';
      improvements.push('Fix error patterns', 'Optimize response times');
    } else if (score >= 60) {
      grade = 'D';
      description = 'Poor performance with significant issues';
      improvements.push('Critical performance optimization needed', 'Fix error handling');
    } else {
      grade = 'F';
      description = 'Unacceptable performance with critical issues';
      improvements.push('Immediate performance intervention required', 'Fix all error patterns');
    }

    return { score, grade, description, improvements };
  }

  private generateRecommendations(bottlenecks: Bottleneck[]): string[] {
    const recommendations: string[] = [];

    if (this.metrics.requests.successRate < 95) {
      recommendations.push('Implement better error handling and retry mechanisms');
    }

    if (this.metrics.latency.p95 > 1000) {
      recommendations.push('Optimize database queries and implement caching');
      recommendations.push('Consider CDN for static assets');
    }

    if (this.metrics.errors.total > 0) {
      recommendations.push('Set up comprehensive monitoring and alerting');
    }

    if (this.metrics.throughput.requestsPerSecond < 100) {
      recommendations.push('Scale horizontally with load balancers');
    }

    return recommendations;
  }

  private generateTestId(): string {
    return `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public getResults(): TestResults {
    return this.results;
  }

  public exportResults(format: 'json' | 'csv' = 'json'): string {
    if (format === 'json') {
      return JSON.stringify(this.results, null, 2);
    } else {
      // Simplified CSV export
      const csv = [
        'Metric,Value',
        `Total Requests,${this.metrics.requests.total}`,
        `Success Rate,${this.metrics.requests.successRate.toFixed(2)}%`,
        `Average Latency,${this.metrics.latency.average.toFixed(2)}ms`,
        `P95 Latency,${this.metrics.latency.p95.toFixed(2)}ms`,
        `Requests/Second,${this.metrics.throughput.requestsPerSecond.toFixed(2)}`,
        `Total Errors,${this.metrics.errors.total}`
      ].join('\n');
      return csv;
    }
  }
} 