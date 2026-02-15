import { 
  TestResults, 
  Metrics, 
  Bottleneck, 
  PerformanceRating,
  Prediction,
  BottleneckAnalysis
} from './types';

export class WindsurfMetricsAnalyzer {
  private historicalData: TestResults[] = [];
  private anomalyThresholds: Record<string, number> = {};
  private performanceBaselines: Record<string, number> = {};

  constructor() {
    this.initializeThresholds();
  }

  private initializeThresholds(): void {
    this.anomalyThresholds = {
      errorRate: 5.0, // 5% error rate threshold
      latencyP95: 1000, // 1 second P95 latency threshold
      latencyP99: 2000, // 2 seconds P99 latency threshold
      throughputDrop: 20.0, // 20% throughput drop threshold
      memoryUsage: 80.0, // 80% memory usage threshold
      cpuUsage: 85.0 // 85% CPU usage threshold
    };

    this.performanceBaselines = {
      avgLatency: 300,
      avgThroughput: 100,
      avgSuccessRate: 98.0
    };
  }

  public async analyzeResults(results: TestResults): Promise<{
    anomalies: any[];
    trends: any[];
    recommendations: string[];
    performanceScore: number;
    bottlenecks: Bottleneck[];
  }> {
    console.log('🔍 Analyzing test results with AI-powered insights...');

    // Add to historical data
    this.historicalData.push(results);

    // Perform analysis
    const anomalies = await this.detectAnomalies(results);
    const trends = await this.analyzeTrends();
    const recommendations = await this.generateRecommendations(results, anomalies);
    const performanceScore = this.calculatePerformanceScore(results);
    const bottlenecks = this.identifyBottlenecks(results);

    return {
      anomalies,
      trends,
      recommendations,
      performanceScore,
      bottlenecks
    };
  }

  private async detectAnomalies(results: TestResults): Promise<any[]> {
    const anomalies: any[] = [];

    // Error rate anomaly detection
    const errorRate = (results.metrics.errors.total / results.metrics.requests.total) * 100;
    if (errorRate > this.anomalyThresholds.errorRate) {
      anomalies.push({
        type: 'error_rate',
        severity: errorRate > 10 ? 'critical' : 'high',
        value: errorRate,
        threshold: this.anomalyThresholds.errorRate,
        description: `Error rate ${errorRate.toFixed(2)}% exceeds threshold of ${this.anomalyThresholds.errorRate}%`,
        impact: 'User experience degradation and potential service unavailability'
      });
    }

    // Latency anomaly detection
    if (results.metrics.latency.p95 > this.anomalyThresholds.latencyP95) {
      anomalies.push({
        type: 'latency_p95',
        severity: results.metrics.latency.p95 > 2000 ? 'critical' : 'high',
        value: results.metrics.latency.p95,
        threshold: this.anomalyThresholds.latencyP95,
        description: `P95 latency ${results.metrics.latency.p95}ms exceeds threshold of ${this.anomalyThresholds.latencyP95}ms`,
        impact: 'Poor user experience and potential timeout issues'
      });
    }

    if (results.metrics.latency.p99 > this.anomalyThresholds.latencyP99) {
      anomalies.push({
        type: 'latency_p99',
        severity: results.metrics.latency.p99 > 5000 ? 'critical' : 'high',
        value: results.metrics.latency.p99,
        threshold: this.anomalyThresholds.latencyP99,
        description: `P99 latency ${results.metrics.latency.p99}ms exceeds threshold of ${this.anomalyThresholds.latencyP99}ms`,
        impact: 'Critical performance degradation for some users'
      });
    }

    // Throughput anomaly detection
    const currentThroughput = results.metrics.throughput.requestsPerSecond;
    if (this.historicalData.length > 1) {
      const previousThroughput = this.historicalData[this.historicalData.length - 2].metrics.throughput.requestsPerSecond;
      const throughputDrop = ((previousThroughput - currentThroughput) / previousThroughput) * 100;
      
      if (throughputDrop > this.anomalyThresholds.throughputDrop) {
        anomalies.push({
          type: 'throughput_drop',
          severity: throughputDrop > 50 ? 'critical' : 'high',
          value: throughputDrop,
          threshold: this.anomalyThresholds.throughputDrop,
          description: `Throughput dropped by ${throughputDrop.toFixed(2)}%`,
          impact: 'Reduced system capacity and potential bottlenecks'
        });
      }
    }

    // Endpoint-specific anomalies
    for (const [endpoint, metrics] of Object.entries(results.metrics.requests.byEndpoint)) {
      if (metrics.successRate < 90) {
        anomalies.push({
          type: 'endpoint_error_rate',
          severity: metrics.successRate < 70 ? 'critical' : 'high',
          endpoint,
          value: metrics.successRate,
          threshold: 90,
          description: `Endpoint ${endpoint} has ${metrics.successRate.toFixed(2)}% success rate`,
          impact: 'Specific endpoint reliability issues'
        });
      }

      if (metrics.avgLatency > 500) {
        anomalies.push({
          type: 'endpoint_latency',
          severity: metrics.avgLatency > 1000 ? 'critical' : 'high',
          endpoint,
          value: metrics.avgLatency,
          threshold: 500,
          description: `Endpoint ${endpoint} has ${metrics.avgLatency}ms average latency`,
          impact: 'Slow response times for specific endpoint'
        });
      }
    }

    return anomalies;
  }

  private async analyzeTrends(): Promise<any[]> {
    if (this.historicalData.length < 3) {
      return [];
    }

    const trends: any[] = [];
    const recentResults = this.historicalData.slice(-5); // Last 5 tests

    // Latency trend analysis
    const latencyTrend = this.calculateTrend(recentResults.map(r => r.metrics.latency.average));
    if (Math.abs(latencyTrend) > 10) {
      trends.push({
        type: 'latency_trend',
        direction: latencyTrend > 0 ? 'increasing' : 'decreasing',
        change: Math.abs(latencyTrend).toFixed(2),
        description: `Average latency is ${latencyTrend > 0 ? 'increasing' : 'decreasing'} by ${Math.abs(latencyTrend).toFixed(2)}ms per test`,
        impact: latencyTrend > 0 ? 'Performance degradation trend' : 'Performance improvement trend'
      });
    }

    // Error rate trend analysis
    const errorRateTrend = this.calculateTrend(recentResults.map(r => 
      (r.metrics.errors.total / r.metrics.requests.total) * 100
    ));
    if (Math.abs(errorRateTrend) > 2) {
      trends.push({
        type: 'error_rate_trend',
        direction: errorRateTrend > 0 ? 'increasing' : 'decreasing',
        change: Math.abs(errorRateTrend).toFixed(2),
        description: `Error rate is ${errorRateTrend > 0 ? 'increasing' : 'decreasing'} by ${Math.abs(errorRateTrend).toFixed(2)}% per test`,
        impact: errorRateTrend > 0 ? 'Reliability degradation trend' : 'Reliability improvement trend'
      });
    }

    // Throughput trend analysis
    const throughputTrend = this.calculateTrend(recentResults.map(r => r.metrics.throughput.requestsPerSecond));
    if (Math.abs(throughputTrend) > 5) {
      trends.push({
        type: 'throughput_trend',
        direction: throughputTrend > 0 ? 'increasing' : 'decreasing',
        change: Math.abs(throughputTrend).toFixed(2),
        description: `Throughput is ${throughputTrend > 0 ? 'increasing' : 'decreasing'} by ${Math.abs(throughputTrend).toFixed(2)} req/s per test`,
        impact: throughputTrend > 0 ? 'Capacity improvement trend' : 'Capacity degradation trend'
      });
    }

    return trends;
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;

    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, index) => sum + (index * val), 0);
    const sumX2 = values.reduce((sum, _, index) => sum + (index * index), 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope;
  }

  private async generateRecommendations(results: TestResults, anomalies: any[]): Promise<string[]> {
    const recommendations: string[] = [];

    // High error rate recommendations
    const errorRate = (results.metrics.errors.total / results.metrics.requests.total) * 100;
    if (errorRate > 5) {
      recommendations.push('Implement comprehensive error handling and retry mechanisms');
      recommendations.push('Set up monitoring and alerting for error rate spikes');
      recommendations.push('Review and optimize database queries to reduce errors');
    }

    // High latency recommendations
    if (results.metrics.latency.p95 > 1000) {
      recommendations.push('Implement caching for frequently accessed data');
      recommendations.push('Optimize database queries and add proper indexing');
      recommendations.push('Consider using CDN for static assets');
      recommendations.push('Implement connection pooling for database connections');
    }

    // Low throughput recommendations
    if (results.metrics.throughput.requestsPerSecond < 50) {
      recommendations.push('Scale horizontally with load balancers');
      recommendations.push('Optimize application code and reduce blocking operations');
      recommendations.push('Consider using async/await patterns for I/O operations');
    }

    // Memory usage recommendations
    if (results.metrics.custom.memoryUsage > 80) {
      recommendations.push('Implement memory leak detection and cleanup');
      recommendations.push('Optimize data structures and reduce memory footprint');
      recommendations.push('Consider implementing garbage collection tuning');
    }

    // Specific endpoint recommendations
    for (const [endpoint, metrics] of Object.entries(results.metrics.requests.byEndpoint)) {
      if (metrics.successRate < 90) {
        recommendations.push(`Investigate and fix issues with endpoint: ${endpoint}`);
      }
      if (metrics.avgLatency > 500) {
        recommendations.push(`Optimize performance for endpoint: ${endpoint}`);
      }
    }

    // Anomaly-specific recommendations
    for (const anomaly of anomalies) {
      switch (anomaly.type) {
        case 'error_rate':
          recommendations.push('Implement circuit breaker pattern for external dependencies');
          break;
        case 'latency_p95':
        case 'latency_p99':
          recommendations.push('Implement request timeout and fallback mechanisms');
          break;
        case 'throughput_drop':
          recommendations.push('Investigate resource constraints and scaling issues');
          break;
      }
    }

    return [...new Set(recommendations)]; // Remove duplicates
  }

  private calculatePerformanceScore(results: TestResults): number {
    let score = 100;

    // Deduct points for errors
    const errorRate = (results.metrics.errors.total / results.metrics.requests.total) * 100;
    score -= errorRate * 2;

    // Deduct points for slow responses
    if (results.metrics.latency.p95 > 1000) score -= 20;
    if (results.metrics.latency.p99 > 2000) score -= 20;

    // Deduct points for low success rate
    if (results.metrics.requests.successRate < 95) score -= 30;

    // Deduct points for low throughput
    if (results.metrics.throughput.requestsPerSecond < 50) score -= 20;

    return Math.max(0, score);
  }

  private identifyBottlenecks(results: TestResults): Bottleneck[] {
    const bottlenecks: Bottleneck[] = [];

    // High error rate bottleneck
    const errorRate = (results.metrics.errors.total / results.metrics.requests.total) * 100;
    if (errorRate > 5) {
      bottlenecks.push({
        type: 'network',
        severity: errorRate > 10 ? 'critical' : 'high',
        description: `High error rate: ${errorRate.toFixed(2)}%`,
        impact: 'Service reliability issues and poor user experience',
        recommendation: 'Investigate error patterns and implement proper error handling'
      });
    }

    // Latency bottleneck
    if (results.metrics.latency.p95 > 1000) {
      bottlenecks.push({
        type: 'network',
        severity: results.metrics.latency.p95 > 2000 ? 'critical' : 'high',
        description: `Slow response times: P95 = ${results.metrics.latency.p95}ms`,
        impact: 'Poor user experience and potential timeout issues',
        recommendation: 'Optimize API performance and implement caching'
      });
    }

    // Throughput bottleneck
    if (results.metrics.throughput.requestsPerSecond < 50) {
      bottlenecks.push({
        type: 'cpu',
        severity: 'high',
        description: `Low throughput: ${results.metrics.throughput.requestsPerSecond} req/s`,
        impact: 'Limited system capacity and scalability issues',
        recommendation: 'Scale horizontally and optimize application performance'
      });
    }

    // Database bottleneck (if detected)
    const slowEndpoints = Object.entries(results.metrics.requests.byEndpoint)
      .filter(([_, metrics]) => metrics.avgLatency > 500);

    if (slowEndpoints.length > 0) {
      bottlenecks.push({
        type: 'database',
        severity: 'medium',
        description: `${slowEndpoints.length} slow endpoints detected`,
        impact: 'Specific API performance issues',
        recommendation: 'Optimize database queries and add proper indexing'
      });
    }

    return bottlenecks;
  }

  public async predictLoad(currentMetrics: Metrics, targetLoad: number): Promise<Prediction> {
    console.log('🔮 Predicting performance under target load...');

    // Simple linear prediction model
    const currentThroughput = currentMetrics.throughput.requestsPerSecond;
    const currentLatency = currentMetrics.latency.average;
    const currentErrorRate = (currentMetrics.errors.total / currentMetrics.requests.total) * 100;

    // Predict capacity
    const capacityMultiplier = targetLoad / currentThroughput;
    const predictedLatency = currentLatency * Math.pow(capacityMultiplier, 1.5); // Non-linear scaling
    const predictedErrorRate = currentErrorRate * Math.pow(capacityMultiplier, 1.2);

    // Calculate confidence based on historical data
    const confidence = Math.max(0.5, Math.min(0.95, 1 - (this.historicalData.length / 20)));

    // Identify potential bottlenecks
    const bottlenecks: Bottleneck[] = [];
    if (predictedLatency > 2000) {
      bottlenecks.push({
        type: 'network',
        severity: 'high',
        description: 'Predicted high latency under target load',
        impact: 'Poor user experience',
        recommendation: 'Implement caching and optimization strategies'
      });
    }

    if (predictedErrorRate > 10) {
      bottlenecks.push({
        type: 'network',
        severity: 'critical',
        description: 'Predicted high error rate under target load',
        impact: 'Service reliability issues',
        recommendation: 'Scale infrastructure and implement error handling'
      });
    }

    const recommendations = [
      'Implement horizontal scaling',
      'Add load balancing',
      'Optimize database queries',
      'Implement caching strategies',
      'Set up monitoring and alerting'
    ];

    return {
      predictedLoad: targetLoad,
      confidence,
      bottlenecks,
      recommendations,
      estimatedCapacity: currentThroughput * 2 // Conservative estimate
    };
  }

  public async analyzeBottlenecks(testResults: TestResults): Promise<BottleneckAnalysis> {
    console.log('🔍 Analyzing performance bottlenecks...');

    const bottlenecks = this.identifyBottlenecks(testResults);
    
    const optimizationStrategies = [
      'Implement caching for frequently accessed data',
      'Optimize database queries and add proper indexing',
      'Use connection pooling for database connections',
      'Implement async/await patterns for I/O operations',
      'Add load balancing and horizontal scaling',
      'Implement circuit breaker pattern for external dependencies',
      'Use CDN for static assets',
      'Optimize memory usage and implement garbage collection tuning'
    ];

    const capacityLimits = {
      requestsPerSecond: testResults.metrics.throughput.requestsPerSecond * 1.5,
      concurrentUsers: testResults.config.maxUsers * 1.2,
      databaseConnections: 100,
      memoryUsage: 80,
      cpuUsage: 85
    };

    const scalingRecommendations = [
      'Scale horizontally with multiple application instances',
      'Implement auto-scaling based on CPU and memory usage',
      'Use database read replicas for read-heavy workloads',
      'Implement microservices architecture for better scalability',
      'Use message queues for asynchronous processing'
    ];

    return {
      bottlenecks,
      optimizationStrategies,
      capacityLimits,
      scalingRecommendations
    };
  }

  public exportAnalysis(format: 'json' | 'csv' = 'json'): string {
    const analysis = {
      timestamp: new Date().toISOString(),
      historicalDataCount: this.historicalData.length,
      thresholds: this.anomalyThresholds,
      baselines: this.performanceBaselines,
      recentResults: this.historicalData.slice(-5)
    };

    if (format === 'json') {
      return JSON.stringify(analysis, null, 2);
    } else {
      // Simplified CSV export
      const csv = [
        'Metric,Value,Threshold,Status',
        `Error Rate,${this.anomalyThresholds.errorRate}%,5%,Normal`,
        `P95 Latency,${this.anomalyThresholds.latencyP95}ms,1000ms,Normal`,
        `P99 Latency,${this.anomalyThresholds.latencyP99}ms,2000ms,Normal`,
        `Throughput Drop,${this.anomalyThresholds.throughputDrop}%,20%,Normal`
      ].join('\n');
      return csv;
    }
  }

  public clearHistoricalData(): void {
    this.historicalData = [];
    console.log('🗑️ Historical data cleared');
  }

  public getHistoricalDataCount(): number {
    return this.historicalData.length;
  }
} 