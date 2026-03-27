'use client';

import React, { useState, useEffect } from 'react';
import {
  tfLoader,
  getPerformanceMetrics,
  getMemoryUsage,
  optimizeMemory,
  clearModelCache,
} from '@/lib/tensorflow-loader';

interface TensorFlowPerformanceMonitorProps {
  className?: string;
}

interface PerformanceSnapshot {
  timestamp: number;
  memoryUsage: number;
  inferenceTime: number;
  modelCount: number;
  backend: string;
}

export default function TensorFlowPerformanceMonitor({
  className = '',
}: TensorFlowPerformanceMonitorProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [performanceHistory, setPerformanceHistory] = useState<PerformanceSnapshot[]>([]);
  const [currentMetrics, setCurrentMetrics] = useState<any>(null);
  const [memoryInfo, setMemoryInfo] = useState<any>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [lastOptimization, setLastOptimization] = useState<number>(0);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  const [activeTab, setActiveTab] = useState<'performance' | 'memory' | 'optimization'>(
    'performance'
  );

  useEffect(() => {
    // Initialize monitoring
    initializeMonitoring();

    // Set up real-time monitoring
    const interval = setInterval(updateMetrics, 2000); // Update every 2 seconds
    setRefreshInterval(interval);

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, []);

  const initializeMonitoring = async () => {
    try {
      setIsInitialized(tfLoader.isInitialized());
      await updateMetrics();
    } catch (error) {
      console.error('Failed to initialize TensorFlow.js monitoring:', error);
    }
  };

  const updateMetrics = async () => {
    try {
      const metrics = getPerformanceMetrics();
      const memory = getMemoryUsage();

      setCurrentMetrics(metrics);
      setMemoryInfo(memory);

      // Add to performance history
      if (metrics) {
        const snapshot: PerformanceSnapshot = {
          timestamp: Date.now(),
          memoryUsage: memory.numBytes,
          inferenceTime: metrics.inferenceTime,
          modelCount: memory.numTensors,
          backend: tfLoader.getBackend(),
        };

        setPerformanceHistory(prev => {
          const newHistory = [...prev, snapshot];
          // Keep only last 50 snapshots
          return newHistory.slice(-50);
        });
      }
    } catch (error) {
      console.error('Failed to update metrics:', error);
    }
  };

  const handleOptimizeMemory = async () => {
    try {
      setIsOptimizing(true);
      await optimizeMemory();
      await updateMetrics();
      setLastOptimization(Date.now());
    } catch (error) {
      console.error('Memory optimization failed:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleClearCache = async () => {
    try {
      clearModelCache();
      await updateMetrics();
    } catch (error) {
      console.error('Cache clearing failed:', error);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (ms: number): string => {
    if (ms < 1000) return `${ms.toFixed(2)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getMemoryUsageLevel = (): 'low' | 'medium' | 'high' => {
    if (!memoryInfo) return 'low';
    const mb = memoryInfo.numBytes / (1024 * 1024);
    if (mb < 100) return 'low';
    if (mb < 500) return 'medium';
    return 'high';
  };

  const getBackendColor = (backend: string): string => {
    switch (backend) {
      case 'webgl':
        return 'bg-green-100 text-green-800';
      case 'cpu':
        return 'bg-blue-100 text-blue-800';
      case 'webgpu':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getBackendIcon = (backend: string) => {
    switch (backend) {
      case 'webgl':
        return <span>⚡</span>;
      case 'cpu':
        return <Cpu className='h-4 w-4' />;
      case 'webgpu':
        return <Monitor className='h-4 w-4' />;
      default:
        return <Server className='h-4 w-4' />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Status Overview Card */}
      <div className='bg-white rounded-lg border border-gray-200 shadow-sm'>
        <div className='p-6 border-b border-gray-200'>
          <h3 className='text-lg font-semibold text-gray-900 flex items-center gap-2'>
            <Brain className='h-5 w-5 text-blue-600' />
            TensorFlow.js Performance Monitor
          </h3>
          <p className='text-sm text-gray-600 mt-1'>
            Real-time monitoring of AI model performance and resource usage
          </p>
        </div>
        <div className='p-6'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            {/* Initialization Status */}
            <div className='flex items-center gap-3'>
              {isInitialized ? (
                <span>✅</span>
              ) : (
                <AlertTriangle className='h-5 w-5 text-orange-500' />
              )}
              <div>
                <p className='font-medium'>{isInitialized ? 'Initialized' : 'Not Initialized'}</p>
                <p className='text-sm text-gray-500'>TensorFlow.js Status</p>
              </div>
            </div>

            {/* Backend Status */}
            <div className='flex items-center gap-3'>
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getBackendColor(
                  tfLoader.getBackend()
                )}`}
              >
                {getBackendIcon(tfLoader.getBackend())}
                <span className='ml-1'>{tfLoader.getBackend().toUpperCase()}</span>
              </span>
              <div>
                <p className='font-medium'>Backend</p>
                <p className='text-sm text-gray-500'>Computation Engine</p>
              </div>
            </div>

            {/* Memory Status */}
            <div className='flex items-center gap-3'>
              <div
                className={`p-2 rounded-full ${
                  getMemoryUsageLevel() === 'high'
                    ? 'bg-red-100'
                    : getMemoryUsageLevel() === 'medium'
                    ? 'bg-yellow-100'
                    : 'bg-green-100'
                }`}
              >
                <HardDrive
                  className={`h-4 w-4 ${
                    getMemoryUsageLevel() === 'high'
                      ? 'text-red-600'
                      : getMemoryUsageLevel() === 'medium'
                      ? 'text-yellow-600'
                      : 'text-green-600'
                  }`}
                />
              </div>
              <div>
                <p className='font-medium'>
                  {memoryInfo ? formatBytes(memoryInfo.numBytes) : 'N/A'}
                </p>
                <p className='text-sm text-gray-500'>Memory Usage</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Metrics Tabs */}
      <div className='bg-white rounded-lg border border-gray-200 shadow-sm'>
        {/* Tab Navigation */}
        <div className='border-b border-gray-200'>
          <nav className='flex space-x-8 px-6'>
            {[
              { id: 'performance', label: 'Performance', icon: Activity },
              { id: 'memory', label: 'Memory', icon: HardDrive },
              { id: 'optimization', label: 'Optimization', icon: Gauge },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className='h-4 w-4' />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className='p-6'>
          {activeTab === 'performance' && (
            <div className='space-y-4'>
              <div className='flex items-center gap-2 mb-4'>
                <span>📊</span>
                <h4 className='text-lg font-semibold'>Performance Metrics</h4>
              </div>

              {currentMetrics ? (
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <div className='flex justify-between items-center'>
                      <span className='text-sm font-medium'>Model Load Time</span>
                      <span className='text-sm'>{formatTime(currentMetrics.modelLoadTime)}</span>
                    </div>
                    <div className='w-full bg-gray-200 rounded-full h-2'>
                      <div
                        className='bg-blue-600 h-2 rounded-full transition-all duration-300'
                        style={{ width: `${Math.min(currentMetrics.modelLoadTime / 10, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <div className='flex justify-between items-center'>
                      <span className='text-sm font-medium'>Inference Time</span>
                      <span className='text-sm'>{formatTime(currentMetrics.inferenceTime)}</span>
                    </div>
                    <div className='w-full bg-gray-200 rounded-full h-2'>
                      <div
                        className='bg-green-600 h-2 rounded-full transition-all duration-300'
                        style={{ width: `${Math.min(currentMetrics.inferenceTime / 5, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <div className='flex justify-between items-center'>
                      <span className='text-sm font-medium'>Backend Optimizations</span>
                      <span className='text-sm'>{currentMetrics.backendOptimizations.length}</span>
                    </div>
                    <div className='flex flex-wrap gap-1'>
                      {currentMetrics.backendOptimizations.map((opt: string, idx: number) => (
                        <span
                          key={idx}
                          className='px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs'
                        >
                          {opt}
                        </span>
                      ))}
                    </div>
                  </div>

                  {currentMetrics.gpuMemoryUsage && (
                    <div className='space-y-2'>
                      <div className='flex justify-between items-center'>
                        <span className='text-sm font-medium'>GPU Memory</span>
                        <span className='text-sm'>
                          {formatBytes(currentMetrics.gpuMemoryUsage)}
                        </span>
                      </div>
                      <div className='w-full bg-gray-200 rounded-full h-2'>
                        <div
                          className='bg-purple-600 h-2 rounded-full transition-all duration-300'
                          style={{ width: '50%' }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className='bg-orange-50 border border-orange-200 rounded-lg p-4'>
                  <div className='flex items-center gap-2'>
                    <AlertTriangle className='h-4 w-4 text-orange-600' />
                    <span className='text-orange-800 text-sm'>
                      No performance metrics available. Initialize TensorFlow.js first.
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'memory' && (
            <div className='space-y-4'>
              <div className='flex items-center gap-2 mb-4'>
                <HardDrive className='h-5 w-5' />
                <h4 className='text-lg font-semibold'>Memory Usage</h4>
              </div>

              {memoryInfo ? (
                <div className='space-y-4'>
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    <div className='text-center p-4 bg-gray-50 rounded-lg'>
                      <div className='text-2xl font-bold text-blue-600'>
                        {formatBytes(memoryInfo.numBytes)}
                      </div>
                      <div className='text-sm text-gray-600'>Total Memory</div>
                    </div>

                    <div className='text-center p-4 bg-gray-50 rounded-lg'>
                      <div className='text-2xl font-bold text-green-600'>
                        {memoryInfo.numTensors}
                      </div>
                      <div className='text-sm text-gray-600'>Active Tensors</div>
                    </div>

                    <div className='text-center p-4 bg-gray-50 rounded-lg'>
                      <div className='text-2xl font-bold text-purple-600'>
                        {memoryInfo.numDataBuffers}
                      </div>
                      <div className='text-sm text-gray-600'>Data Buffers</div>
                    </div>
                  </div>

                  {memoryInfo.reasons && (
                    <div className='space-y-2'>
                      <h5 className='font-medium'>Memory Allocation Reasons:</h5>
                      <div className='space-y-1'>
                        {memoryInfo.reasons.map((reason: string, idx: number) => (
                          <div key={idx} className='text-sm text-gray-600 flex items-center gap-2'>
                            <div className='w-2 h-2 bg-blue-400 rounded-full' />
                            {reason}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className='bg-orange-50 border border-orange-200 rounded-lg p-4'>
                  <div className='flex items-center gap-2'>
                    <AlertTriangle className='h-4 w-4 text-orange-600' />
                    <span className='text-orange-800 text-sm'>
                      Memory information not available.
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'optimization' && (
            <div className='space-y-4'>
              <div className='flex items-center gap-2 mb-4'>
                <Gauge className='h-5 w-5' />
                <h4 className='text-lg font-semibold'>Optimization Tools</h4>
              </div>
              <p className='text-gray-600 text-sm mb-4'>
                Tools to optimize TensorFlow.js performance and memory usage
              </p>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <button
                  onClick={handleOptimizeMemory}
                  disabled={isOptimizing}
                  className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {isOptimizing ? (
                    <span>🔄</span>
                  ) : (
                    <span>📈</span>
                  )}
                  Optimize Memory
                </button>

                <button
                  onClick={handleClearCache}
                  className='flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50'
                >
                  <span>🗑️</span>
                  Clear Model Cache
                </button>
              </div>

              {lastOptimization > 0 && (
                <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
                  <div className='flex items-center gap-2'>
                    <span>✅</span>
                    <span className='text-green-800 text-sm'>
                      Last optimization: {new Date(lastOptimization).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              )}

              <div className='space-y-2'>
                <h5 className='font-medium'>Performance Tips:</h5>
                <ul className='text-sm text-gray-600 space-y-1'>
                  <li>• Use WebGL backend for GPU acceleration</li>
                  <li>• Dispose tensors after use to prevent memory leaks</li>
                  <li>• Enable model caching for better performance</li>
                  <li>• Monitor memory usage during inference</li>
                  <li>• Use production mode for optimal performance</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
