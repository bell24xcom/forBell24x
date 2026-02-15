import { WindsurfMetricsAnalyzer } from '../windsurf-metrics-analyzer';
import { TestResults, Metrics, Bottleneck } from '../types';

describe('WindsurfMetricsAnalyzer', () => {
  let analyzer: WindsurfMetricsAnalyzer;

  beforeEach(() => {
    analyzer = new WindsurfMetricsAnalyzer();
  });

  describe('Initialization', () => {
    it('should initialize with default thresholds', () => {
      expect(analyzer).toBeDefined();
      expect(analyzer.getHistoricalDataCount()).toBe(0);
    });
  });

  describe('Anomaly Detection', () => {
    it('should detect high error rate anomalies', async () => {
      const testResults: TestResults = {
        config: {
          name: 'Error Test',
          description: 'Test with high error rate',
          environment: 'development',
          maxUsers: 100,
          duration: 300,
          scenarios: []
        },
        metrics: {
          requests: {
            total: 1000,
            successful: 800,
            failed: 200,
            successRate: 80,
            byEndpoint: {
              '/api/test': {
                total: 1000,
                successful: 800,
                failed: 200,
                successRate: 80,
                avgLatency: 500
              }
            }
          },
          errors: {
            total: 200,
            byType: {
              'network': 100,
              'timeout': 50,
              'server': 50
            }
          },
          latency: {
            average: 300,
            min: 100,
            max: 1000,
            p50: 250,
            p95: 800,
            p99: 1200
          },
          throughput: {
            requestsPerSecond: 50,
            bytesPerSecond: 1000000
          },
          custom: {
            memoryUsage: 60,
            cpuUsage: 70,
            networkIO: 50
          }
        },
        errors: [],
        summary: {
          score: 60,
          rating: 'fair',
          totalRequests: 1000,
          totalErrors: 200,
          avgLatency: 300,
          throughput: 50
        }
      };

      const analysis = await analyzer.analyzeResults(testResults);
      
      expect(analysis.anomalies.length).toBeGreaterThan(0);
      expect(analysis.anomalies.some(a => a.type === 'error_rate')).toBe(true);
      expect(analysis.performanceScore).toBeLessThan(80);
    });

    it('should detect high latency anomalies', async () => {
      const testResults: TestResults = {
        config: {
          name: 'Latency Test',
          description: 'Test with high latency',
          environment: 'development',
          maxUsers: 100,
          duration: 300,
          scenarios: []
        },
        metrics: {
          requests: {
            total: 1000,
            successful: 950,
            failed: 50,
            successRate: 95,
            byEndpoint: {
              '/api/test': {
                total: 1000,
                successful: 950,
                failed: 50,
                successRate: 95,
                avgLatency: 1500
              }
            }
          },
          errors: {
            total: 50,
            byType: {
              'timeout': 30,
              'server': 20
            }
          },
          latency: {
            average: 1200,
            min: 800,
            max: 3000,
            p50: 1100,
            p95: 2500,
            p99: 3500
          },
          throughput: {
            requestsPerSecond: 30,
            bytesPerSecond: 800000
          },
          custom: {
            memoryUsage: 70,
            cpuUsage: 80,
            networkIO: 60
          }
        },
        errors: [],
        summary: {
          score: 70,
          rating: 'fair',
          totalRequests: 1000,
          totalErrors: 50,
          avgLatency: 1200,
          throughput: 30
        }
      };

      const analysis = await analyzer.analyzeResults(testResults);
      
      expect(analysis.anomalies.length).toBeGreaterThan(0);
      expect(analysis.anomalies.some(a => a.type === 'latency_p95')).toBe(true);
      expect(analysis.anomalies.some(a => a.type === 'latency_p99')).toBe(true);
    });

    it('should detect throughput drop anomalies', async () => {
      // Add first test result
      const firstResult: TestResults = {
        config: {
          name: 'Baseline Test',
          description: 'Baseline performance',
          environment: 'development',
          maxUsers: 100,
          duration: 300,
          scenarios: []
        },
        metrics: {
          requests: {
            total: 1000,
            successful: 980,
            failed: 20,
            successRate: 98,
            byEndpoint: {
              '/api/test': {
                total: 1000,
                successful: 980,
                failed: 20,
                successRate: 98,
                avgLatency: 200
              }
            }
          },
          errors: {
            total: 20,
            byType: {
              'network': 10,
              'server': 10
            }
          },
          latency: {
            average: 200,
            min: 100,
            max: 500,
            p50: 180,
            p95: 400,
            p99: 600
          },
          throughput: {
            requestsPerSecond: 100,
            bytesPerSecond: 2000000
          },
          custom: {
            memoryUsage: 50,
            cpuUsage: 60,
            networkIO: 40
          }
        },
        errors: [],
        summary: {
          score: 90,
          rating: 'excellent',
          totalRequests: 1000,
          totalErrors: 20,
          avgLatency: 200,
          throughput: 100
        }
      };

      await analyzer.analyzeResults(firstResult);

      // Add second test result with throughput drop
      const secondResult: TestResults = {
        config: {
          name: 'Drop Test',
          description: 'Test with throughput drop',
          environment: 'development',
          maxUsers: 100,
          duration: 300,
          scenarios: []
        },
        metrics: {
          requests: {
            total: 1000,
            successful: 950,
            failed: 50,
            successRate: 95,
            byEndpoint: {
              '/api/test': {
                total: 1000,
                successful: 950,
                failed: 50,
                successRate: 95,
                avgLatency: 400
              }
            }
          },
          errors: {
            total: 50,
            byType: {
              'timeout': 30,
              'server': 20
            }
          },
          latency: {
            average: 400,
            min: 200,
            max: 1000,
            p50: 350,
            p95: 800,
            p99: 1200
          },
          throughput: {
            requestsPerSecond: 50, // 50% drop
            bytesPerSecond: 1000000
          },
          custom: {
            memoryUsage: 70,
            cpuUsage: 80,
            networkIO: 60
          }
        },
        errors: [],
        summary: {
          score: 75,
          rating: 'good',
          totalRequests: 1000,
          totalErrors: 50,
          avgLatency: 400,
          throughput: 50
        }
      };

      const analysis = await analyzer.analyzeResults(secondResult);
      
      expect(analysis.anomalies.length).toBeGreaterThan(0);
      expect(analysis.anomalies.some(a => a.type === 'throughput_drop')).toBe(true);
    });

    it('should detect endpoint-specific anomalies', async () => {
      const testResults: TestResults = {
        config: {
          name: 'Endpoint Test',
          description: 'Test endpoint anomalies',
          environment: 'development',
          maxUsers: 100,
          duration: 300,
          scenarios: []
        },
        metrics: {
          requests: {
            total: 1000,
            successful: 950,
            failed: 50,
            successRate: 95,
            byEndpoint: {
              '/api/fast': {
                total: 500,
                successful: 490,
                failed: 10,
                successRate: 98,
                avgLatency: 100
              },
              '/api/slow': {
                total: 500,
                successful: 400,
                failed: 100,
                successRate: 80, // Low success rate
                avgLatency: 800 // High latency
              }
            }
          },
          errors: {
            total: 50,
            byType: {
              'timeout': 30,
              'server': 20
            }
          },
          latency: {
            average: 450,
            min: 100,
            max: 1000,
            p50: 400,
            p95: 900,
            p99: 1200
          },
          throughput: {
            requestsPerSecond: 80,
            bytesPerSecond: 1600000
          },
          custom: {
            memoryUsage: 60,
            cpuUsage: 70,
            networkIO: 50
          }
        },
        errors: [],
        summary: {
          score: 80,
          rating: 'good',
          totalRequests: 1000,
          totalErrors: 50,
          avgLatency: 450,
          throughput: 80
        }
      };

      const analysis = await analyzer.analyzeResults(testResults);
      
      expect(analysis.anomalies.length).toBeGreaterThan(0);
      expect(analysis.anomalies.some(a => a.type === 'endpoint_error_rate')).toBe(true);
      expect(analysis.anomalies.some(a => a.type === 'endpoint_latency')).toBe(true);
    });
  });

  describe('Trend Analysis', () => {
    it('should analyze latency trends', async () => {
      // Add multiple test results with increasing latency
      const results = [];
      for (let i = 0; i < 5; i++) {
        const testResult: TestResults = {
          config: {
            name: `Trend Test ${i + 1}`,
            description: `Test ${i + 1}`,
            environment: 'development',
            maxUsers: 100,
            duration: 300,
            scenarios: []
          },
          metrics: {
            requests: {
              total: 1000,
              successful: 950,
              failed: 50,
              successRate: 95,
              byEndpoint: {
                '/api/test': {
                  total: 1000,
                  successful: 950,
                  failed: 50,
                  successRate: 95,
                  avgLatency: 200 + (i * 50) // Increasing latency
                }
              }
            },
            errors: {
              total: 50,
              byType: {
                'timeout': 30,
                'server': 20
              }
            },
            latency: {
              average: 200 + (i * 50),
              min: 100,
              max: 500 + (i * 100),
              p50: 180 + (i * 45),
              p95: 400 + (i * 80),
              p99: 600 + (i * 120)
            },
            throughput: {
              requestsPerSecond: 80 - (i * 5),
              bytesPerSecond: 1600000 - (i * 100000)
            },
            custom: {
              memoryUsage: 60 + (i * 5),
              cpuUsage: 70 + (i * 3),
              networkIO: 50 + (i * 2)
            }
          },
          errors: [],
          summary: {
            score: 85 - (i * 3),
            rating: i < 2 ? 'excellent' : i < 4 ? 'good' : 'fair',
            totalRequests: 1000,
            totalErrors: 50,
            avgLatency: 200 + (i * 50),
            throughput: 80 - (i * 5)
          }
        };
        results.push(testResult);
      }

      // Analyze each result
      for (const result of results) {
        await analyzer.analyzeResults(result);
      }

      // Get trends from the last analysis
      const analysis = await analyzer.analyzeResults(results[results.length - 1]);
      
      expect(analysis.trends.length).toBeGreaterThan(0);
      expect(analysis.trends.some(t => t.type === 'latency_trend')).toBe(true);
      expect(analysis.trends.some(t => t.type === 'throughput_trend')).toBe(true);
    });
  });

  describe('Recommendation Generation', () => {
    it('should generate recommendations for high error rate', async () => {
      const testResults: TestResults = {
        config: {
          name: 'Recommendation Test',
          description: 'Test recommendation generation',
          environment: 'development',
          maxUsers: 100,
          duration: 300,
          scenarios: []
        },
        metrics: {
          requests: {
            total: 1000,
            successful: 800,
            failed: 200,
            successRate: 80,
            byEndpoint: {
              '/api/test': {
                total: 1000,
                successful: 800,
                failed: 200,
                successRate: 80,
                avgLatency: 800
              }
            }
          },
          errors: {
            total: 200,
            byType: {
              'network': 100,
              'timeout': 50,
              'server': 50
            }
          },
          latency: {
            average: 800,
            min: 400,
            max: 2000,
            p50: 700,
            p95: 1500,
            p99: 2500
          },
          throughput: {
            requestsPerSecond: 40,
            bytesPerSecond: 800000
          },
          custom: {
            memoryUsage: 80,
            cpuUsage: 85,
            networkIO: 70
          }
        },
        errors: [],
        summary: {
          score: 60,
          rating: 'fair',
          totalRequests: 1000,
          totalErrors: 200,
          avgLatency: 800,
          throughput: 40
        }
      };

      const analysis = await analyzer.analyzeResults(testResults);
      
      expect(analysis.recommendations.length).toBeGreaterThan(0);
      expect(analysis.recommendations.some(r => r.includes('error handling'))).toBe(true);
      expect(analysis.recommendations.some(r => r.includes('caching'))).toBe(true);
      expect(analysis.recommendations.some(r => r.includes('scaling'))).toBe(true);
    });
  });

  describe('Performance Scoring', () => {
    it('should calculate performance score correctly', async () => {
      const testResults: TestResults = {
        config: {
          name: 'Score Test',
          description: 'Test performance scoring',
          environment: 'development',
          maxUsers: 100,
          duration: 300,
          scenarios: []
        },
        metrics: {
          requests: {
            total: 1000,
            successful: 950,
            failed: 50,
            successRate: 95,
            byEndpoint: {
              '/api/test': {
                total: 1000,
                successful: 950,
                failed: 50,
                successRate: 95,
                avgLatency: 300
              }
            }
          },
          errors: {
            total: 50,
            byType: {
              'timeout': 30,
              'server': 20
            }
          },
          latency: {
            average: 300,
            min: 100,
            max: 800,
            p50: 250,
            p95: 600,
            p99: 1000
          },
          throughput: {
            requestsPerSecond: 80,
            bytesPerSecond: 1600000
          },
          custom: {
            memoryUsage: 60,
            cpuUsage: 70,
            networkIO: 50
          }
        },
        errors: [],
        summary: {
          score: 85,
          rating: 'excellent',
          totalRequests: 1000,
          totalErrors: 50,
          avgLatency: 300,
          throughput: 80
        }
      };

      const analysis = await analyzer.analyzeResults(testResults);
      
      expect(analysis.performanceScore).toBeGreaterThan(0);
      expect(analysis.performanceScore).toBeLessThanOrEqual(100);
    });
  });

  describe('Bottleneck Identification', () => {
    it('should identify performance bottlenecks', async () => {
      const testResults: TestResults = {
        config: {
          name: 'Bottleneck Test',
          description: 'Test bottleneck identification',
          environment: 'development',
          maxUsers: 100,
          duration: 300,
          scenarios: []
        },
        metrics: {
          requests: {
            total: 1000,
            successful: 800,
            failed: 200,
            successRate: 80,
            byEndpoint: {
              '/api/test': {
                total: 1000,
                successful: 800,
                failed: 200,
                successRate: 80,
                avgLatency: 1500
              }
            }
          },
          errors: {
            total: 200,
            byType: {
              'timeout': 100,
              'server': 100
            }
          },
          latency: {
            average: 1500,
            min: 800,
            max: 3000,
            p50: 1200,
            p95: 2500,
            p99: 3500
          },
          throughput: {
            requestsPerSecond: 30,
            bytesPerSecond: 600000
          },
          custom: {
            memoryUsage: 85,
            cpuUsage: 90,
            networkIO: 75
          }
        },
        errors: [],
        summary: {
          score: 50,
          rating: 'poor',
          totalRequests: 1000,
          totalErrors: 200,
          avgLatency: 1500,
          throughput: 30
        }
      };

      const analysis = await analyzer.analyzeResults(testResults);
      
      expect(analysis.bottlenecks.length).toBeGreaterThan(0);
      expect(analysis.bottlenecks.some(b => b.type === 'network')).toBe(true);
      expect(analysis.bottlenecks.some(b => b.type === 'cpu')).toBe(true);
    });
  });

  describe('Load Prediction', () => {
    it('should predict performance under target load', async () => {
      const currentMetrics: Metrics = {
        requests: {
          total: 1000,
          successful: 950,
          failed: 50,
          successRate: 95,
          byEndpoint: {
            '/api/test': {
              total: 1000,
              successful: 950,
              failed: 50,
              successRate: 95,
              avgLatency: 300
            }
          }
        },
        errors: {
          total: 50,
          byType: {
            'timeout': 30,
            'server': 20
          }
        },
        latency: {
          average: 300,
          min: 100,
          max: 800,
          p50: 250,
          p95: 600,
          p99: 1000
        },
        throughput: {
          requestsPerSecond: 100,
          bytesPerSecond: 2000000
        },
        custom: {
          memoryUsage: 60,
          cpuUsage: 70,
          networkIO: 50
        }
      };

      const targetLoad = 200; // Double the current load
      const prediction = await analyzer.predictLoad(currentMetrics, targetLoad);
      
      expect(prediction.predictedLoad).toBe(targetLoad);
      expect(prediction.confidence).toBeGreaterThan(0);
      expect(prediction.confidence).toBeLessThanOrEqual(1);
      expect(prediction.bottlenecks).toBeDefined();
      expect(prediction.recommendations).toBeDefined();
      expect(prediction.estimatedCapacity).toBeGreaterThan(0);
    });
  });

  describe('Bottleneck Analysis', () => {
    it('should analyze bottlenecks comprehensively', async () => {
      const testResults: TestResults = {
        config: {
          name: 'Bottleneck Analysis Test',
          description: 'Test comprehensive bottleneck analysis',
          environment: 'development',
          maxUsers: 100,
          duration: 300,
          scenarios: []
        },
        metrics: {
          requests: {
            total: 1000,
            successful: 800,
            failed: 200,
            successRate: 80,
            byEndpoint: {
              '/api/test': {
                total: 1000,
                successful: 800,
                failed: 200,
                successRate: 80,
                avgLatency: 1200
              }
            }
          },
          errors: {
            total: 200,
            byType: {
              'timeout': 100,
              'server': 100
            }
          },
          latency: {
            average: 1200,
            min: 600,
            max: 2500,
            p50: 1000,
            p95: 2000,
            p99: 3000
          },
          throughput: {
            requestsPerSecond: 50,
            bytesPerSecond: 1000000
          },
          custom: {
            memoryUsage: 80,
            cpuUsage: 85,
            networkIO: 70
          }
        },
        errors: [],
        summary: {
          score: 65,
          rating: 'fair',
          totalRequests: 1000,
          totalErrors: 200,
          avgLatency: 1200,
          throughput: 50
        }
      };

      const analysis = await analyzer.analyzeBottlenecks(testResults);
      
      expect(analysis.bottlenecks).toBeDefined();
      expect(analysis.optimizationStrategies).toBeDefined();
      expect(analysis.capacityLimits).toBeDefined();
      expect(analysis.scalingRecommendations).toBeDefined();
      expect(analysis.bottlenecks.length).toBeGreaterThan(0);
      expect(analysis.optimizationStrategies.length).toBeGreaterThan(0);
      expect(analysis.scalingRecommendations.length).toBeGreaterThan(0);
    });
  });

  describe('Data Management', () => {
    it('should manage historical data correctly', () => {
      expect(analyzer.getHistoricalDataCount()).toBe(0);
      
      // Add some test data
      const testResult: TestResults = {
        config: {
          name: 'Data Test',
          description: 'Test data management',
          environment: 'development',
          maxUsers: 100,
          duration: 300,
          scenarios: []
        },
        metrics: {
          requests: {
            total: 1000,
            successful: 950,
            failed: 50,
            successRate: 95,
            byEndpoint: {}
          },
          errors: {
            total: 50,
            byType: {}
          },
          latency: {
            average: 300,
            min: 100,
            max: 800,
            p50: 250,
            p95: 600,
            p99: 1000
          },
          throughput: {
            requestsPerSecond: 80,
            bytesPerSecond: 1600000
          },
          custom: {
            memoryUsage: 60,
            cpuUsage: 70,
            networkIO: 50
          }
        },
        errors: [],
        summary: {
          score: 85,
          rating: 'excellent',
          totalRequests: 1000,
          totalErrors: 50,
          avgLatency: 300,
          throughput: 80
        }
      };

      analyzer.addHistoricalData(testResult);
      expect(analyzer.getHistoricalDataCount()).toBe(1);
    });

    it('should clear historical data', () => {
      analyzer.clearHistoricalData();
      expect(analyzer.getHistoricalDataCount()).toBe(0);
    });
  });

  describe('Model Training', () => {
    it('should train prediction models', () => {
      // Add some historical data first
      const testResult: TestResults = {
        config: {
          name: 'Training Test',
          description: 'Test model training',
          environment: 'development',
          maxUsers: 100,
          duration: 300,
          scenarios: []
        },
        metrics: {
          requests: {
            total: 1000,
            successful: 950,
            failed: 50,
            successRate: 95,
            byEndpoint: {}
          },
          errors: {
            total: 50,
            byType: {}
          },
          latency: {
            average: 300,
            min: 100,
            max: 800,
            p50: 250,
            p95: 600,
            p99: 1000
          },
          throughput: {
            requestsPerSecond: 80,
            bytesPerSecond: 1600000
          },
          custom: {
            memoryUsage: 60,
            cpuUsage: 70,
            networkIO: 50
          }
        },
        errors: [],
        summary: {
          score: 85,
          rating: 'excellent',
          totalRequests: 1000,
          totalErrors: 50,
          avgLatency: 300,
          throughput: 80
        }
      };

      for (let i = 0; i < 10; i++) {
        analyzer.addHistoricalData(testResult);
      }

      analyzer.trainModels();
      const modelStatus = analyzer.getModelStatus();
      
      expect(modelStatus.latency).toBeDefined();
      expect(modelStatus.errorRate).toBeDefined();
      expect(modelStatus.throughput).toBeDefined();
      expect(modelStatus.latency.trained).toBe(true);
      expect(modelStatus.errorRate.trained).toBe(true);
      expect(modelStatus.throughput.trained).toBe(true);
    });
  });

  describe('Export Functionality', () => {
    it('should export analysis in JSON format', () => {
      const exported = analyzer.exportAnalysis('json');
      expect(exported).toBeDefined();
      expect(typeof exported).toBe('string');
      
      const parsed = JSON.parse(exported);
      expect(parsed).toBeDefined();
      expect(parsed.timestamp).toBeDefined();
      expect(parsed.historicalDataCount).toBeDefined();
      expect(parsed.thresholds).toBeDefined();
      expect(parsed.baselines).toBeDefined();
    });

    it('should export analysis in CSV format', () => {
      const exported = analyzer.exportAnalysis('csv');
      expect(exported).toBeDefined();
      expect(typeof exported).toBe('string');
      expect(exported.includes(',')).toBe(true);
      expect(exported.includes('\n')).toBe(true);
    });
  });
}); 