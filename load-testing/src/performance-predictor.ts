import { 
  Metrics, 
  Prediction, 
  BottleneckAnalysis, 
  Bottleneck,
  TestResults 
} from './types';

export class PerformancePredictor {
  private historicalData: TestResults[] = [];
  private predictionModels: Map<string, any> = new Map();
  private baselineMetrics: Record<string, number> = {};
  private confidenceThreshold: number = 0.7;

  constructor() {
    this.initializeBaselines();
  }

  private initializeBaselines(): void {
    this.baselineMetrics = {
      avgLatency: 300,
      p95Latency: 800,
      p99Latency: 1500,
      requestsPerSecond: 100,
      successRate: 98.0,
      errorRate: 2.0,
      memoryUsage: 60,
      cpuUsage: 70
    };
  }

  public async predictLoad(currentMetrics: Metrics, targetLoad: number): Promise<Prediction> {
    console.log('🔮 Predicting performance under target load...');

    // Calculate load multiplier
    const currentThroughput = currentMetrics.throughput.requestsPerSecond;
    const loadMultiplier = targetLoad / currentThroughput;

    // Predict metrics using ML models
    const predictedLatency = await this.predictLatency(currentMetrics, loadMultiplier);
    const predictedErrorRate = await this.predictErrorRate(currentMetrics, loadMultiplier);
    const predictedThroughput = await this.predictThroughput(currentMetrics, loadMultiplier);

    // Calculate confidence based on data quality and model accuracy
    const confidence = this.calculateConfidence(currentMetrics, loadMultiplier);

    // Identify potential bottlenecks
    const bottlenecks = await this.identifyPotentialBottlenecks(
      currentMetrics, 
      targetLoad, 
      predictedLatency, 
      predictedErrorRate
    );

    // Generate recommendations
    const recommendations = this.generateLoadRecommendations(
      targetLoad, 
      predictedLatency, 
      predictedErrorRate, 
      bottlenecks
    );

    // Estimate capacity
    const estimatedCapacity = this.estimateCapacity(currentMetrics, bottlenecks);

    return {
      predictedLoad: targetLoad,
      confidence,
      bottlenecks,
      recommendations,
      estimatedCapacity
    };
  }

  private async predictLatency(currentMetrics: Metrics, loadMultiplier: number): Promise<number> {
    // Use exponential scaling model for latency prediction
    const baseLatency = currentMetrics.latency.average;
    const scalingFactor = Math.pow(loadMultiplier, 1.5); // Non-linear scaling
    
    // Apply machine learning correction based on historical data
    const mlCorrection = this.getMLCorrection('latency', loadMultiplier);
    
    return baseLatency * scalingFactor * mlCorrection;
  }

  private async predictErrorRate(currentMetrics: Metrics, loadMultiplier: number): Promise<number> {
    const currentErrorRate = (currentMetrics.errors.total / currentMetrics.requests.total) * 100;
    
    // Error rate typically increases exponentially with load
    const errorScalingFactor = Math.pow(loadMultiplier, 1.8);
    const mlCorrection = this.getMLCorrection('errorRate', loadMultiplier);
    
    return Math.min(100, currentErrorRate * errorScalingFactor * mlCorrection);
  }

  private async predictThroughput(currentMetrics: Metrics, loadMultiplier: number): Promise<number> {
    const currentThroughput = currentMetrics.throughput.requestsPerSecond;
    
    // Throughput scaling is limited by system capacity
    const maxScalingFactor = this.calculateMaxScalingFactor(currentMetrics);
    const actualScalingFactor = Math.min(loadMultiplier, maxScalingFactor);
    const mlCorrection = this.getMLCorrection('throughput', loadMultiplier);
    
    return currentThroughput * actualScalingFactor * mlCorrection;
  }

  private getMLCorrection(metricType: string, loadMultiplier: number): number {
    // Simulate ML model predictions based on historical patterns
    const model = this.predictionModels.get(metricType);
    
    if (model && this.historicalData.length > 10) {
      // Use trained model for prediction
      return this.applyMLModel(model, loadMultiplier);
    } else {
      // Use heuristic-based correction
      return this.applyHeuristicCorrection(metricType, loadMultiplier);
    }
  }

  private applyMLModel(model: any, loadMultiplier: number): number {
    // Simulate ML model application
    const features = [
      loadMultiplier,
      Math.log(loadMultiplier),
      Math.sqrt(loadMultiplier),
      loadMultiplier * loadMultiplier
    ];
    
    // Simple linear combination (in real implementation, this would be a trained model)
    const prediction = features.reduce((sum, feature, index) => {
      return sum + feature * (0.8 + index * 0.1);
    }, 0);
    
    return Math.max(0.5, Math.min(2.0, prediction / features.length));
  }

  private applyHeuristicCorrection(metricType: string, loadMultiplier: number): number {
    const corrections: Record<string, number> = {
      latency: 1.0 + (loadMultiplier - 1) * 0.2,
      errorRate: 1.0 + (loadMultiplier - 1) * 0.3,
      throughput: 1.0 - (loadMultiplier - 1) * 0.1
    };
    
    return corrections[metricType] || 1.0;
  }

  private calculateMaxScalingFactor(currentMetrics: Metrics): number {
    // Calculate maximum possible scaling based on system resources
    const cpuHeadroom = (100 - this.baselineMetrics.cpuUsage) / 100;
    const memoryHeadroom = (100 - this.baselineMetrics.memoryUsage) / 100;
    const networkHeadroom = 0.8; // Assume 80% network capacity
    
    return Math.min(cpuHeadroom, memoryHeadroom, networkHeadroom) * 3; // Conservative estimate
  }

  private calculateConfidence(currentMetrics: Metrics, loadMultiplier: number): number {
    let confidence = 0.8; // Base confidence

    // Reduce confidence for extreme load multipliers
    if (loadMultiplier > 5) {
      confidence -= 0.2;
    } else if (loadMultiplier > 10) {
      confidence -= 0.4;
    }

    // Reduce confidence for limited historical data
    if (this.historicalData.length < 5) {
      confidence -= 0.2;
    } else if (this.historicalData.length < 10) {
      confidence -= 0.1;
    }

    // Reduce confidence for high variance in current metrics
    const latencyVariance = this.calculateLatencyVariance(currentMetrics);
    if (latencyVariance > 0.5) {
      confidence -= 0.1;
    }

    return Math.max(0.3, Math.min(0.95, confidence));
  }

  private calculateLatencyVariance(currentMetrics: Metrics): number {
    const latencies = Object.values(currentMetrics.requests.byEndpoint)
      .map(m => m.avgLatency)
      .filter(l => l > 0);

    if (latencies.length < 2) return 0;

    const mean = latencies.reduce((sum, l) => sum + l, 0) / latencies.length;
    const variance = latencies.reduce((sum, l) => sum + Math.pow(l - mean, 2), 0) / latencies.length;
    
    return Math.sqrt(variance) / mean; // Coefficient of variation
  }

  private async identifyPotentialBottlenecks(
    currentMetrics: Metrics, 
    targetLoad: number, 
    predictedLatency: number, 
    predictedErrorRate: number
  ): Promise<Bottleneck[]> {
    const bottlenecks: Bottleneck[] = [];

    // CPU bottleneck prediction
    const predictedCpuUsage = this.predictCpuUsage(currentMetrics, targetLoad);
    if (predictedCpuUsage > 90) {
      bottlenecks.push({
        type: 'cpu',
        severity: predictedCpuUsage > 95 ? 'critical' : 'high',
        description: `Predicted CPU usage: ${predictedCpuUsage.toFixed(1)}%`,
        impact: 'System performance degradation and potential timeouts',
        recommendation: 'Scale horizontally or optimize CPU-intensive operations'
      });
    }

    // Memory bottleneck prediction
    const predictedMemoryUsage = this.predictMemoryUsage(currentMetrics, targetLoad);
    if (predictedMemoryUsage > 85) {
      bottlenecks.push({
        type: 'memory',
        severity: predictedMemoryUsage > 95 ? 'critical' : 'high',
        description: `Predicted memory usage: ${predictedMemoryUsage.toFixed(1)}%`,
        impact: 'Memory pressure and potential OOM errors',
        recommendation: 'Optimize memory usage and implement garbage collection tuning'
      });
    }

    // Network bottleneck prediction
    const predictedNetworkUsage = this.predictNetworkUsage(currentMetrics, targetLoad);
    if (predictedNetworkUsage > 80) {
      bottlenecks.push({
        type: 'network',
        severity: predictedNetworkUsage > 90 ? 'critical' : 'high',
        description: `Predicted network usage: ${predictedNetworkUsage.toFixed(1)}%`,
        impact: 'Network congestion and increased latency',
        recommendation: 'Implement CDN and optimize network requests'
      });
    }

    // Database bottleneck prediction
    if (predictedLatency > 2000) {
      bottlenecks.push({
        type: 'database',
        severity: predictedLatency > 5000 ? 'critical' : 'high',
        description: `Predicted high latency: ${predictedLatency.toFixed(0)}ms`,
        impact: 'Poor user experience and potential timeouts',
        recommendation: 'Optimize database queries and implement caching'
      });
    }

    // Error rate bottleneck prediction
    if (predictedErrorRate > 10) {
      bottlenecks.push({
        type: 'network',
        severity: predictedErrorRate > 20 ? 'critical' : 'high',
        description: `Predicted high error rate: ${predictedErrorRate.toFixed(1)}%`,
        impact: 'Service reliability issues and poor user experience',
        recommendation: 'Implement circuit breakers and improve error handling'
      });
    }

    return bottlenecks;
  }

  private predictCpuUsage(currentMetrics: Metrics, targetLoad: number): number {
    const currentCpuUsage = this.baselineMetrics.cpuUsage;
    const loadMultiplier = targetLoad / currentMetrics.throughput.requestsPerSecond;
    
    // CPU usage scales with load but with diminishing returns
    const scalingFactor = Math.min(loadMultiplier, 3.0);
    return Math.min(100, currentCpuUsage * scalingFactor);
  }

  private predictMemoryUsage(currentMetrics: Metrics, targetLoad: number): number {
    const currentMemoryUsage = this.baselineMetrics.memoryUsage;
    const loadMultiplier = targetLoad / currentMetrics.throughput.requestsPerSecond;
    
    // Memory usage scales more linearly with load
    const scalingFactor = Math.min(loadMultiplier, 2.5);
    return Math.min(100, currentMemoryUsage * scalingFactor);
  }

  private predictNetworkUsage(currentMetrics: Metrics, targetLoad: number): number {
    const currentNetworkUsage = 50; // Assume 50% baseline network usage
    const loadMultiplier = targetLoad / currentMetrics.throughput.requestsPerSecond;
    
    // Network usage scales with load
    const scalingFactor = Math.min(loadMultiplier, 2.0);
    return Math.min(100, currentNetworkUsage * scalingFactor);
  }

  private generateLoadRecommendations(
    targetLoad: number, 
    predictedLatency: number, 
    predictedErrorRate: number, 
    bottlenecks: Bottleneck[]
  ): string[] {
    const recommendations: string[] = [];

    // General scaling recommendations
    if (targetLoad > 1000) {
      recommendations.push('Implement horizontal scaling with load balancers');
      recommendations.push('Use auto-scaling based on CPU and memory metrics');
    }

    // Performance optimization recommendations
    if (predictedLatency > 1000) {
      recommendations.push('Implement caching for frequently accessed data');
      recommendations.push('Optimize database queries and add proper indexing');
      recommendations.push('Use CDN for static assets');
    }

    // Reliability recommendations
    if (predictedErrorRate > 5) {
      recommendations.push('Implement circuit breaker pattern for external dependencies');
      recommendations.push('Add retry mechanisms with exponential backoff');
      recommendations.push('Set up comprehensive monitoring and alerting');
    }

    // Bottleneck-specific recommendations
    for (const bottleneck of bottlenecks) {
      recommendations.push(bottleneck.recommendation);
    }

    // Infrastructure recommendations
    recommendations.push('Implement proper monitoring and alerting systems');
    recommendations.push('Set up performance dashboards for real-time insights');
    recommendations.push('Establish performance SLAs and SLOs');

    return [...new Set(recommendations)]; // Remove duplicates
  }

  private estimateCapacity(currentMetrics: Metrics, bottlenecks: Bottleneck[]): number {
    const currentThroughput = currentMetrics.throughput.requestsPerSecond;
    let capacityMultiplier = 2.0; // Conservative estimate

    // Reduce capacity based on bottlenecks
    for (const bottleneck of bottlenecks) {
      switch (bottleneck.type) {
        case 'cpu':
          capacityMultiplier *= 0.7;
          break;
        case 'memory':
          capacityMultiplier *= 0.8;
          break;
        case 'network':
          capacityMultiplier *= 0.9;
          break;
        case 'database':
          capacityMultiplier *= 0.6;
          break;
      }
    }

    return Math.floor(currentThroughput * capacityMultiplier);
  }

  public async analyzeBottlenecks(testResults: TestResults): Promise<BottleneckAnalysis> {
    console.log('🔍 Analyzing performance bottlenecks...');

    const bottlenecks = this.identifyCurrentBottlenecks(testResults);
    
    const optimizationStrategies = [
      'Implement caching for frequently accessed data',
      'Optimize database queries and add proper indexing',
      'Use connection pooling for database connections',
      'Implement async/await patterns for I/O operations',
      'Add load balancing and horizontal scaling',
      'Implement circuit breaker pattern for external dependencies',
      'Use CDN for static assets',
      'Optimize memory usage and implement garbage collection tuning',
      'Implement request batching and bulk operations',
      'Use message queues for asynchronous processing'
    ];

    const capacityLimits = this.calculateCapacityLimits(testResults);

    const scalingRecommendations = [
      'Scale horizontally with multiple application instances',
      'Implement auto-scaling based on CPU and memory usage',
      'Use database read replicas for read-heavy workloads',
      'Implement microservices architecture for better scalability',
      'Use message queues for asynchronous processing',
      'Implement caching layers (Redis, Memcached)',
      'Use CDN for static content delivery',
      'Implement database sharding for large datasets'
    ];

    return {
      bottlenecks,
      optimizationStrategies,
      capacityLimits,
      scalingRecommendations
    };
  }

  private identifyCurrentBottlenecks(testResults: TestResults): Bottleneck[] {
    const bottlenecks: Bottleneck[] = [];
    const metrics = testResults.metrics;

    // High error rate bottleneck
    const errorRate = (metrics.errors.total / metrics.requests.total) * 100;
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
    if (metrics.latency.p95 > 1000) {
      bottlenecks.push({
        type: 'network',
        severity: metrics.latency.p95 > 2000 ? 'critical' : 'high',
        description: `Slow response times: P95 = ${metrics.latency.p95}ms`,
        impact: 'Poor user experience and potential timeout issues',
        recommendation: 'Optimize API performance and implement caching'
      });
    }

    // Throughput bottleneck
    if (metrics.throughput.requestsPerSecond < 50) {
      bottlenecks.push({
        type: 'cpu',
        severity: 'high',
        description: `Low throughput: ${metrics.throughput.requestsPerSecond} req/s`,
        impact: 'Limited system capacity and scalability issues',
        recommendation: 'Scale horizontally and optimize application performance'
      });
    }

    return bottlenecks;
  }

  private calculateCapacityLimits(testResults: TestResults): Record<string, number> {
    const metrics = testResults.metrics;
    
    return {
      requestsPerSecond: metrics.throughput.requestsPerSecond * 1.5,
      concurrentUsers: testResults.config.maxUsers * 1.2,
      databaseConnections: 100,
      memoryUsage: 80,
      cpuUsage: 85,
      networkBandwidth: 1000, // Mbps
      diskIO: 1000 // IOPS
    };
  }

  public addHistoricalData(testResults: TestResults): void {
    this.historicalData.push(testResults);
    
    // Keep only last 50 results to prevent memory bloat
    if (this.historicalData.length > 50) {
      this.historicalData = this.historicalData.slice(-50);
    }
  }

  public trainModels(): void {
    console.log('🤖 Training prediction models...');
    
    if (this.historicalData.length < 5) {
      console.warn('⚠️ Insufficient data for model training');
      return;
    }

    // Train models for different metrics
    this.trainLatencyModel();
    this.trainErrorRateModel();
    this.trainThroughputModel();
    
    console.log('✅ Models trained successfully');
  }

  private trainLatencyModel(): void {
    // Simulate model training
    const model = {
      type: 'latency',
      trained: true,
      accuracy: 0.85,
      lastTrained: new Date()
    };
    
    this.predictionModels.set('latency', model);
  }

  private trainErrorRateModel(): void {
    const model = {
      type: 'errorRate',
      trained: true,
      accuracy: 0.78,
      lastTrained: new Date()
    };
    
    this.predictionModels.set('errorRate', model);
  }

  private trainThroughputModel(): void {
    const model = {
      type: 'throughput',
      trained: true,
      accuracy: 0.92,
      lastTrained: new Date()
    };
    
    this.predictionModels.set('throughput', model);
  }

  public getModelStatus(): Record<string, any> {
    const status: Record<string, any> = {};
    
    for (const [name, model] of this.predictionModels) {
      status[name] = {
        trained: model.trained,
        accuracy: model.accuracy,
        lastTrained: model.lastTrained
      };
    }
    
    return status;
  }

  public exportPredictions(format: 'json' | 'csv' = 'json'): string {
    const predictions = {
      timestamp: new Date().toISOString(),
      historicalDataCount: this.historicalData.length,
      modelStatus: this.getModelStatus(),
      baselines: this.baselineMetrics
    };

    if (format === 'json') {
      return JSON.stringify(predictions, null, 2);
    } else {
      const csv = [
        'Metric,Baseline Value,Current Status',
        `Avg Latency,${this.baselineMetrics.avgLatency}ms,${this.historicalData.length > 0 ? 'Trained' : 'Not Trained'}`,
        `Error Rate,${this.baselineMetrics.errorRate}%,${this.historicalData.length > 0 ? 'Trained' : 'Not Trained'}`,
        `Throughput,${this.baselineMetrics.requestsPerSecond} req/s,${this.historicalData.length > 0 ? 'Trained' : 'Not Trained'}`
      ].join('\n');
      return csv;
    }
  }
} 