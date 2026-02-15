'use client';

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Database, 
  Cpu, 
  MemoryStick, 
  Clock, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Download,
  BarChart3,
  Server
} from 'lucide-react';

interface PerformanceMetrics {
  coreWebVitals: {
    LCP: number;
    FID: number;
    CLS: number;
    FCP: number;
    TTFB: number;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  database: {
    connections: number;
    maxConnections: number;
    queryTime: number;
    slowQueries: number;
  };
  cache: {
    hitRate: number;
    size: number;
    keys: number;
  };
  api: {
    responseTime: number;
    requestsPerMinute: number;
    errorRate: number;
  };
}

export default function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000);

  useEffect(() => {
    fetchMetrics();
    
    if (autoRefresh) {
      const interval = setInterval(fetchMetrics, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/admin/performance');
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error('Failed to fetch performance metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceStatus = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'good';
    if (value <= thresholds.warning) return 'warning';
    return 'poor';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'poor': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'poor': return <AlertTriangle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  if (loading && !metrics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading performance metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Performance Dashboard</h1>
              <p className="mt-2 text-gray-600">Real-time system performance monitoring</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Auto Refresh</label>
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="rounded-md border-gray-300 text-sm"
              >
                <option value={1000}>1s</option>
                <option value={5000}>5s</option>
                <option value={10000}>10s</option>
                <option value={30000}>30s</option>
              </select>
              <button
                onClick={fetchMetrics}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {metrics && (
          <>
            {/* Core Web Vitals */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Core Web Vitals</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {Object.entries(metrics.coreWebVitals).map(([metric, value]) => {
                  const thresholds = {
                    LCP: { good: 2500, warning: 4000 },
                    FID: { good: 100, warning: 300 },
                    CLS: { good: 0.1, warning: 0.25 },
                    FCP: { good: 1800, warning: 3000 },
                    TTFB: { good: 800, warning: 1800 },
                  }[metric] || { good: 0, warning: 0 };
                  
                  const status = getPerformanceStatus(value, thresholds);
                  
                  return (
                    <div key={metric} className="bg-white rounded-lg p-6 shadow-sm border">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-600">{metric}</h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                          {getStatusIcon(status)}
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        {typeof value === 'number' ? value.toFixed(2) : value}
                        {metric === 'CLS' ? '' : 'ms'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* System Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Memory Usage */}
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Memory Usage</h3>
                  <MemoryStick className="w-5 h-5 text-blue-600" />
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Used</span>
                      <span>{Math.round(metrics.memory.used / 1024 / 1024)}MB</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${metrics.memory.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    Total: {Math.round(metrics.memory.total / 1024 / 1024)}MB
                  </div>
                </div>
              </div>

              {/* Database Performance */}
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Database</h3>
                  <Database className="w-5 h-5 text-green-600" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Connections</span>
                    <span className="text-sm font-medium">
                      {metrics.database.connections}/{metrics.database.maxConnections}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Avg Query Time</span>
                    <span className="text-sm font-medium">{metrics.database.queryTime}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Slow Queries</span>
                    <span className="text-sm font-medium text-red-600">{metrics.database.slowQueries}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cache & API Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Cache Performance */}
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Cache Performance</h3>
                  <Server className="w-5 h-5 text-purple-600" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Hit Rate</span>
                    <span className="text-sm font-medium">{metrics.cache.hitRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Cache Size</span>
                    <span className="text-sm font-medium">{Math.round(metrics.cache.size / 1024)}KB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Keys</span>
                    <span className="text-sm font-medium">{metrics.cache.keys}</span>
                  </div>
                </div>
              </div>

              {/* API Performance */}
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">API Performance</h3>
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Response Time</span>
                    <span className="text-sm font-medium">{metrics.api.responseTime}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Requests/min</span>
                    <span className="text-sm font-medium">{metrics.api.requestsPerMinute}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Error Rate</span>
                    <span className="text-sm font-medium text-red-600">{metrics.api.errorRate}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex justify-end space-x-4">
              <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </button>
              <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <BarChart3 className="w-4 h-4 mr-2" />
                Detailed Analytics
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
