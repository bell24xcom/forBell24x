export interface TestConfig {
  name: string;
  description?: string;
  environment: 'development' | 'production' | 'staging';
  maxUsers: number;
  duration: number;
  rampUpTime: number;
  scenarios: TestScenario[];
  metadata?: Record<string, any>;
}

export interface TestScenario {
  name: string;
  weight: number;
  flow: TestStep[];
  variables?: Record<string, any>;
}

export interface TestStep {
  type: 'request' | 'think' | 'function' | 'websocket';
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url?: string;
  headers?: Record<string, string>;
  body?: any;
  capture?: string[];
  expect?: Expectation[];
  function?: string;
  think?: number;
  websocket?: WebSocketConfig;
}

export interface WebSocketConfig {
  action: 'connect' | 'send' | 'close';
  message?: any;
  waitFor?: string;
}

export interface Expectation {
  statusCode?: number;
  contentType?: string;
  hasHeader?: string;
  jsonPath?: string;
  jsonValue?: any;
  maxTime?: number;
}

export interface TestResults {
  testId: string;
  config: TestConfig;
  startTime: Date;
  endTime: Date;
  duration: number;
  metrics: Metrics;
  errors: TestError[];
  warnings: string[];
  summary: TestSummary;
}

export interface Metrics {
  requests: RequestMetrics;
  latency: LatencyMetrics;
  throughput: ThroughputMetrics;
  errors: ErrorMetrics;
  websockets: WebSocketMetrics;
  custom: Record<string, number>;
}

export interface RequestMetrics {
  total: number;
  successful: number;
  failed: number;
  successRate: number;
  byEndpoint: Record<string, EndpointMetrics>;
}

export interface EndpointMetrics {
  count: number;
  successRate: number;
  avgLatency: number;
  maxLatency: number;
  minLatency: number;
  p95Latency: number;
  p99Latency: number;
}

export interface LatencyMetrics {
  average: number;
  median: number;
  p95: number;
  p99: number;
  max: number;
  min: number;
}

export interface ThroughputMetrics {
  requestsPerSecond: number;
  bytesPerSecond: number;
  concurrentUsers: number;
  maxConcurrentUsers: number;
}

export interface ErrorMetrics {
  total: number;
  byType: Record<string, number>;
  byEndpoint: Record<string, number>;
  mostCommon: ErrorInfo[];
}

export interface ErrorInfo {
  type: string;
  message: string;
  count: number;
  percentage: number;
}

export interface WebSocketMetrics {
  connections: number;
  messagesSent: number;
  messagesReceived: number;
  connectionErrors: number;
  avgMessageLatency: number;
}

export interface TestError {
  timestamp: Date;
  type: 'network' | 'validation' | 'timeout' | 'websocket' | 'custom';
  message: string;
  endpoint?: string;
  statusCode?: number;
  responseTime?: number;
  context?: Record<string, any>;
}

export interface TestSummary {
  overall: 'PASS' | 'FAIL' | 'WARNING';
  score: number;
  recommendations: string[];
  bottlenecks: Bottleneck[];
  performance: PerformanceRating;
}

export interface Bottleneck {
  type: 'cpu' | 'memory' | 'network' | 'database' | 'external';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  impact: string;
  recommendation: string;
}

export interface PerformanceRating {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  description: string;
  improvements: string[];
}

export interface ValidationCache {
  lastValidation: Date;
  errors: TypeScriptError[];
  warnings: TypeScriptWarning[];
  isValid: boolean;
  fileHash: string;
}

export interface TypeScriptError {
  file: string;
  line: number;
  column: number;
  message: string;
  code: string;
  category: 'error' | 'warning';
}

export interface TypeScriptWarning extends TypeScriptError {
  category: 'warning';
}

export interface ValidationResult {
  isValid: boolean;
  errors: TypeScriptError[];
  warnings: TypeScriptWarning[];
  cacheHit: boolean;
  validationTime: number;
}

export interface FixResult {
  fixed: boolean;
  errorsFixed: number;
  remainingErrors: TypeScriptError[];
  appliedFixes: string[];
  fixTime: number;
}

export interface Prediction {
  predictedLoad: number;
  confidence: number;
  bottlenecks: Bottleneck[];
  recommendations: string[];
  estimatedCapacity: number;
}

export interface BottleneckAnalysis {
  bottlenecks: Bottleneck[];
  optimizationStrategies: string[];
  capacityLimits: Record<string, number>;
  scalingRecommendations: string[];
}

export interface SessionData {
  sessionId: string;
  config: TestConfig;
  results?: TestResults;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExecutionRequest {
  domain: string;
  action: string;
  parameters: Record<string, any>;
  timestamp: Date;
  userId?: string;
}

export interface ExecutionPolicy {
  allowList: string[];
  blockList: string[];
  maxConcurrentExecutions: number;
  maxExecutionTime: number;
  requireAuthentication: boolean;
}

export interface PerformanceMetrics {
  cpu: CPUMetrics;
  memory: MemoryMetrics;
  network: NetworkMetrics;
  database: DatabaseMetrics;
  external: ExternalMetrics;
}

export interface CPUMetrics {
  usage: number;
  load: number;
  cores: number;
  temperature?: number;
}

export interface MemoryMetrics {
  used: number;
  total: number;
  available: number;
  usagePercentage: number;
}

export interface NetworkMetrics {
  bytesIn: number;
  bytesOut: number;
  packetsIn: number;
  packetsOut: number;
  errors: number;
}

export interface DatabaseMetrics {
  connections: number;
  queries: number;
  slowQueries: number;
  avgQueryTime: number;
}

export interface ExternalMetrics {
  apiCalls: number;
  avgResponseTime: number;
  errors: number;
  timeouts: number;
} 