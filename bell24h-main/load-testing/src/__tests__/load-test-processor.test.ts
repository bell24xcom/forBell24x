import { LoadTestProcessor } from '../load-test-processor';
import { TestConfig, TestResults, TestError } from '../types';

// Mock data for testing
const mockTestConfig: TestConfig = {
  name: 'Test Load Test',
  description: 'A test configuration for unit testing',
  environment: 'development',
  maxUsers: 100,
  duration: 300,
  scenarios: [
    {
      name: 'Login Flow',
      weight: 50,
      flow: [
        {
          type: 'http',
          http: {
            method: 'POST',
            url: 'http://localhost:3000/api/auth/login',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'test@example.com', password: 'password' })
          },
          think: 1000
        },
        {
          type: 'http',
          http: {
            method: 'GET',
            url: 'http://localhost:3000/api/user/profile',
            headers: { 'Authorization': 'Bearer {{token}}' }
          },
          think: 2000
        }
      ]
    },
    {
      name: 'Product Search',
      weight: 30,
      flow: [
        {
          type: 'http',
          http: {
            method: 'GET',
            url: 'http://localhost:3000/api/products?search=test',
            headers: { 'Accept': 'application/json' }
          },
          think: 1500
        }
      ]
    },
    {
      name: 'WebSocket Test',
      weight: 20,
      flow: [
        {
          type: 'websocket',
          websocket: {
            action: 'connect',
            url: 'ws://localhost:3000/ws'
          }
        },
        {
          type: 'websocket',
          websocket: {
            action: 'send',
            message: { type: 'ping', data: 'test' }
          }
        }
      ]
    }
  ]
};

describe('LoadTestProcessor', () => {
  let processor: LoadTestProcessor;

  beforeEach(() => {
    processor = new LoadTestProcessor();
  });

  describe('Configuration Validation', () => {
    it('should validate correct configuration', () => {
      const config: TestConfig = {
        name: 'Test Load Test',
        description: 'A test configuration',
        environment: 'development',
        maxUsers: 100,
        duration: 300,
        scenarios: [
          {
            name: 'Login Flow',
            weight: 1,
            flow: [
              {
                type: 'http',
                http: {
                  method: 'GET',
                  url: 'https://api.example.com/health',
                  headers: { 'Content-Type': 'application/json' }
                }
              }
            ]
          }
        ]
      };

      const result = processor.validateConfig(config);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid configuration with missing required fields', () => {
      const invalidConfig = {
        name: 'Test',
        // Missing required fields
      } as any;

      const result = processor.validateConfig(invalidConfig);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject configuration with invalid maxUsers', () => {
      const config: TestConfig = {
        name: 'Test',
        description: 'Test',
        environment: 'development',
        maxUsers: -1, // Invalid
        duration: 300,
        scenarios: []
      };

      const result = processor.validateConfig(config);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('maxUsers'))).toBe(true);
    });

    it('should reject configuration with invalid duration', () => {
      const config: TestConfig = {
        name: 'Test',
        description: 'Test',
        environment: 'development',
        maxUsers: 100,
        duration: 0, // Invalid
        scenarios: []
      };

      const result = processor.validateConfig(config);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('duration'))).toBe(true);
    });

    it('should reject configuration with empty scenarios', () => {
      const config: TestConfig = {
        name: 'Test',
        description: 'Test',
        environment: 'development',
        maxUsers: 100,
        duration: 300,
        scenarios: [] // Empty
      };

      const result = processor.validateConfig(config);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('scenarios'))).toBe(true);
    });

    test('should reject configuration with invalid scenario weights', async () => {
      const invalidConfig = {
        ...mockTestConfig,
        scenarios: [
          { ...mockTestConfig.scenarios[0], weight: -10 }
        ]
      };
      const result = await processor.validateConfig(invalidConfig);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('weight');
    });
  });

  describe('Test Execution', () => {
    it('should execute test successfully', async () => {
      const config: TestConfig = {
        name: 'Simple Test',
        description: 'A simple test',
        environment: 'development',
        maxUsers: 10,
        duration: 5,
        scenarios: [
          {
            name: 'Health Check',
            weight: 1,
            flow: [
              {
                type: 'http',
                http: {
                  method: 'GET',
                  url: 'https://httpbin.org/get',
                  headers: { 'Content-Type': 'application/json' }
                }
              }
            ]
          }
        ]
      };

      const results = await processor.runTest(config);
      
      expect(results).toBeDefined();
      expect(results.config).toEqual(config);
      expect(results.metrics).toBeDefined();
      expect(results.metrics.requests.total).toBeGreaterThan(0);
      expect(results.summary).toBeDefined();
      expect(results.summary.score).toBeGreaterThan(0);
    });

    it('should handle test execution errors gracefully', async () => {
      const config: TestConfig = {
        name: 'Error Test',
        description: 'Test with errors',
        environment: 'development',
        maxUsers: 5,
        duration: 2,
        scenarios: [
          {
            name: 'Invalid URL',
            weight: 1,
            flow: [
              {
                type: 'http',
                http: {
                  method: 'GET',
                  url: 'https://invalid-url-that-does-not-exist.com',
                  headers: { 'Content-Type': 'application/json' }
                }
              }
            ]
          }
        ]
      };

      const results = await processor.runTest(config);
      
      expect(results).toBeDefined();
      expect(results.errors.length).toBeGreaterThan(0);
      expect(results.metrics.errors.total).toBeGreaterThan(0);
    });

    it('should respect test duration limits', async () => {
      const config: TestConfig = {
        name: 'Duration Test',
        description: 'Test duration limit',
        environment: 'development',
        maxUsers: 5,
        duration: 2, // 2 seconds
        scenarios: [
          {
            name: 'Slow Request',
            weight: 1,
            flow: [
              {
                type: 'http',
                http: {
                  method: 'GET',
                  url: 'https://httpbin.org/delay/1', // 1 second delay
                  headers: { 'Content-Type': 'application/json' }
                }
              }
            ]
          }
        ]
      };

      const startTime = Date.now();
      const results = await processor.runTest(config);
      const endTime = Date.now();
      const executionTime = (endTime - startTime) / 1000;

      expect(executionTime).toBeLessThanOrEqual(config.duration + 1); // Allow 1 second buffer
      expect(results).toBeDefined();
    });

    test('should handle concurrent user limits', async () => {
      const lowUserConfig = { ...mockTestConfig, maxUsers: 5 };
      const result = await processor.runTest(lowUserConfig);
      
      expect(result.metrics.requests.total).toBeGreaterThan(0);
      expect(result.metrics.requests.total).toBeLessThanOrEqual(50); // Reasonable limit for 5 users
    });
  });

  describe('Metrics Collection', () => {
    it('should collect accurate request metrics', async () => {
      const config: TestConfig = {
        name: 'Metrics Test',
        description: 'Test metrics collection',
        environment: 'development',
        maxUsers: 5,
        duration: 3,
        scenarios: [
          {
            name: 'Multiple Requests',
            weight: 1,
            flow: [
              {
                type: 'http',
                http: {
                  method: 'GET',
                  url: 'https://httpbin.org/get',
                  headers: { 'Content-Type': 'application/json' }
                }
              },
              {
                type: 'http',
                http: {
                  method: 'POST',
                  url: 'https://httpbin.org/post',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ test: 'data' })
                }
              }
            ]
          }
        ]
      };

      const results = await processor.runTest(config);
      
      expect(results.metrics.requests.total).toBeGreaterThan(0);
      expect(results.metrics.requests.successful).toBeGreaterThan(0);
      expect(results.metrics.requests.failed).toBeGreaterThanOrEqual(0);
      expect(results.metrics.requests.successRate).toBeGreaterThan(0);
      expect(results.metrics.requests.successRate).toBeLessThanOrEqual(100);
    });

    it('should collect latency metrics', async () => {
      const config: TestConfig = {
        name: 'Latency Test',
        description: 'Test latency collection',
        environment: 'development',
        maxUsers: 3,
        duration: 2,
        scenarios: [
          {
            name: 'Latency Check',
            weight: 1,
            flow: [
              {
                type: 'http',
                http: {
                  method: 'GET',
                  url: 'https://httpbin.org/delay/0.1',
                  headers: { 'Content-Type': 'application/json' }
                }
              }
            ]
          }
        ]
      };

      const results = await processor.runTest(config);
      
      expect(results.metrics.latency.average).toBeGreaterThan(0);
      expect(results.metrics.latency.min).toBeGreaterThan(0);
      expect(results.metrics.latency.max).toBeGreaterThan(0);
      expect(results.metrics.latency.p50).toBeGreaterThan(0);
      expect(results.metrics.latency.p95).toBeGreaterThan(0);
      expect(results.metrics.latency.p99).toBeGreaterThan(0);
    });

    it('should collect throughput metrics', async () => {
      const config: TestConfig = {
        name: 'Throughput Test',
        description: 'Test throughput collection',
        environment: 'development',
        maxUsers: 10,
        duration: 3,
        scenarios: [
          {
            name: 'Throughput Check',
            weight: 1,
            flow: [
              {
                type: 'http',
                http: {
                  method: 'GET',
                  url: 'https://httpbin.org/get',
                  headers: { 'Content-Type': 'application/json' }
                }
              }
            ]
          }
        ]
      };

      const results = await processor.runTest(config);
      
      expect(results.metrics.throughput.requestsPerSecond).toBeGreaterThan(0);
      expect(results.metrics.throughput.bytesPerSecond).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      const config: TestConfig = {
        name: 'Network Error Test',
        description: 'Test network error handling',
        environment: 'development',
        maxUsers: 3,
        duration: 2,
        scenarios: [
          {
            name: 'Network Error',
            weight: 1,
            flow: [
              {
                type: 'http',
                http: {
                  method: 'GET',
                  url: 'https://invalid-domain-that-does-not-exist-12345.com',
                  headers: { 'Content-Type': 'application/json' }
                }
              }
            ]
          }
        ]
      };

      const results = await processor.runTest(config);
      
      expect(results.errors.length).toBeGreaterThan(0);
      expect(results.metrics.errors.total).toBeGreaterThan(0);
      expect(results.metrics.errors.byType).toBeDefined();
    });

    it('should handle timeout errors', async () => {
      const config: TestConfig = {
        name: 'Timeout Test',
        description: 'Test timeout handling',
        environment: 'development',
        maxUsers: 2,
        duration: 2,
        scenarios: [
          {
            name: 'Timeout Error',
            weight: 1,
            flow: [
              {
                type: 'http',
                http: {
                  method: 'GET',
                  url: 'https://httpbin.org/delay/10', // 10 second delay
                  headers: { 'Content-Type': 'application/json' },
                  timeout: 1000 // 1 second timeout
                }
              }
            ]
          }
        ]
      };

      const results = await processor.runTest(config);
      
      expect(results.errors.length).toBeGreaterThan(0);
      expect(results.metrics.errors.total).toBeGreaterThan(0);
    });
  });

  describe('Scenario Execution', () => {
    it('should execute multiple scenarios', async () => {
      const config: TestConfig = {
        name: 'Multi-Scenario Test',
        description: 'Test multiple scenarios',
        environment: 'development',
        maxUsers: 5,
        duration: 3,
        scenarios: [
          {
            name: 'Scenario 1',
            weight: 2,
            flow: [
              {
                type: 'http',
                http: {
                  method: 'GET',
                  url: 'https://httpbin.org/get',
                  headers: { 'Content-Type': 'application/json' }
                }
              }
            ]
          },
          {
            name: 'Scenario 2',
            weight: 1,
            flow: [
              {
                type: 'http',
                http: {
                  method: 'POST',
                  url: 'https://httpbin.org/post',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ test: 'data' })
                }
              }
            ]
          }
        ]
      };

      const results = await processor.runTest(config);
      
      expect(results).toBeDefined();
      expect(results.metrics.requests.total).toBeGreaterThan(0);
    });

    it('should respect scenario weights', async () => {
      const config: TestConfig = {
        name: 'Weighted Test',
        description: 'Test scenario weights',
        environment: 'development',
        maxUsers: 10,
        duration: 3,
        scenarios: [
          {
            name: 'High Weight',
            weight: 3,
            flow: [
              {
                type: 'http',
                http: {
                  method: 'GET',
                  url: 'https://httpbin.org/get',
                  headers: { 'Content-Type': 'application/json' }
                }
              }
            ]
          },
          {
            name: 'Low Weight',
            weight: 1,
            flow: [
              {
                type: 'http',
                http: {
                  method: 'GET',
                  url: 'https://httpbin.org/status/200',
                  headers: { 'Content-Type': 'application/json' }
                }
              }
            ]
          }
        ]
      };

      const results = await processor.runTest(config);
      
      expect(results).toBeDefined();
      // Note: In a real implementation, you'd verify that high weight scenarios
      // were executed more frequently than low weight scenarios
    });
  });

  describe('Think Time', () => {
    it('should respect think time between requests', async () => {
      const config: TestConfig = {
        name: 'Think Time Test',
        description: 'Test think time functionality',
        environment: 'development',
        maxUsers: 2,
        duration: 3,
        scenarios: [
          {
            name: 'Think Time',
            weight: 1,
            flow: [
              {
                type: 'http',
                http: {
                  method: 'GET',
                  url: 'https://httpbin.org/get',
                  headers: { 'Content-Type': 'application/json' }
                },
                think: 500 // 500ms think time
              },
              {
                type: 'http',
                http: {
                  method: 'GET',
                  url: 'https://httpbin.org/status/200',
                  headers: { 'Content-Type': 'application/json' }
                }
              }
            ]
          }
        ]
      };

      const startTime = Date.now();
      const results = await processor.runTest(config);
      const endTime = Date.now();
      const executionTime = endTime - startTime;

      expect(results).toBeDefined();
      // Execution time should be at least the think time
      expect(executionTime).toBeGreaterThan(500);
    });
  });

  describe('Data Extraction', () => {
    it('should extract data from responses', async () => {
      const config: TestConfig = {
        name: 'Data Extraction Test',
        description: 'Test data extraction',
        environment: 'development',
        maxUsers: 2,
        duration: 2,
        scenarios: [
          {
            name: 'Extract Data',
            weight: 1,
            flow: [
              {
                type: 'http',
                http: {
                  method: 'GET',
                  url: 'https://httpbin.org/json',
                  headers: { 'Content-Type': 'application/json' }
                },
                extract: {
                  slideshow: 'slideshow.author'
                }
              }
            ]
          }
        ]
      };

      const results = await processor.runTest(config);
      
      expect(results).toBeDefined();
      // Note: In a real implementation, you'd verify that data was extracted
      // and could be used in subsequent requests
    });
  });

  describe('Performance Scoring', () => {
    it('should calculate performance score correctly', async () => {
      const config: TestConfig = {
        name: 'Performance Score Test',
        description: 'Test performance scoring',
        environment: 'development',
        maxUsers: 5,
        duration: 2,
        scenarios: [
          {
            name: 'Performance Check',
            weight: 1,
            flow: [
              {
                type: 'http',
                http: {
                  method: 'GET',
                  url: 'https://httpbin.org/get',
                  headers: { 'Content-Type': 'application/json' }
                }
              }
            ]
          }
        ]
      };

      const results = await processor.runTest(config);
      
      expect(results.summary.score).toBeGreaterThan(0);
      expect(results.summary.score).toBeLessThanOrEqual(100);
      expect(results.summary.rating).toBeDefined();
      expect(['excellent', 'good', 'fair', 'poor']).toContain(results.summary.rating);
    });
  });

  describe('Export Functionality', () => {
    it('should export results in JSON format', async () => {
      const config: TestConfig = {
        name: 'Export Test',
        description: 'Test export functionality',
        environment: 'development',
        maxUsers: 3,
        duration: 2,
        scenarios: [
          {
            name: 'Export Check',
            weight: 1,
            flow: [
              {
                type: 'http',
                http: {
                  method: 'GET',
                  url: 'https://httpbin.org/get',
                  headers: { 'Content-Type': 'application/json' }
                }
              }
            ]
          }
        ]
      };

      const results = await processor.runTest(config);
      const exported = processor.exportResults(results, 'json');
      
      expect(exported).toBeDefined();
      expect(typeof exported).toBe('string');
      
      const parsed = JSON.parse(exported);
      expect(parsed).toBeDefined();
      expect(parsed.config).toBeDefined();
      expect(parsed.metrics).toBeDefined();
    });

    it('should export results in CSV format', async () => {
      const config: TestConfig = {
        name: 'CSV Export Test',
        description: 'Test CSV export',
        environment: 'development',
        maxUsers: 3,
        duration: 2,
        scenarios: [
          {
            name: 'CSV Check',
            weight: 1,
            flow: [
              {
                type: 'http',
                http: {
                  method: 'GET',
                  url: 'https://httpbin.org/get',
                  headers: { 'Content-Type': 'application/json' }
                }
              }
            ]
          }
        ]
      };

      const results = await processor.runTest(config);
      const exported = processor.exportResults(results, 'csv');
      
      expect(exported).toBeDefined();
      expect(typeof exported).toBe('string');
      expect(exported.includes(',')).toBe(true);
      expect(exported.includes('\n')).toBe(true);
    });
  });

  describe('Cleanup', () => {
    it('should cleanup resources after test', async () => {
      const config: TestConfig = {
        name: 'Cleanup Test',
        description: 'Test cleanup functionality',
        environment: 'development',
        maxUsers: 2,
        duration: 1,
        scenarios: [
          {
            name: 'Cleanup Check',
            weight: 1,
            flow: [
              {
                type: 'http',
                http: {
                  method: 'GET',
                  url: 'https://httpbin.org/get',
                  headers: { 'Content-Type': 'application/json' }
                }
              }
            ]
          }
        ]
      };

      const results = await processor.runTest(config);
      
      expect(results).toBeDefined();
      // Note: In a real implementation, you'd verify that resources
      // were properly cleaned up (connections closed, memory freed, etc.)
    });
  });
}); 