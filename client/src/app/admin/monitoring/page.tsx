'use client';

import { Monitor, Activity, Server, Database, Globe, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { useState } from 'react';

interface SystemStatus {
  name: string;
  status: 'healthy' | 'warning' | 'critical';
  uptime: string;
  responseTime: string;
  lastCheck: string;
}

export default function SystemMonitoringPage() {
  const [refreshInterval, setRefreshInterval] = useState('30s');

  const systemServices: SystemStatus[] = [
    {
      name: 'Web Server',
      status: 'healthy',
      uptime: '99.98%',
      responseTime: '45ms',
      lastCheck: '2 minutes ago'
    },
    {
      name: 'Database',
      status: 'healthy',
      uptime: '99.95%',
      responseTime: '12ms',
      lastCheck: '1 minute ago'
    },
    {
      name: 'Payment Gateway',
      status: 'warning',
      uptime: '99.87%',
      responseTime: '180ms',
      lastCheck: '30 seconds ago'
    },
    {
      name: 'AI Services',
      status: 'healthy',
      uptime: '99.92%',
      responseTime: '89ms',
      lastCheck: '45 seconds ago'
    },
    {
      name: 'File Storage',
      status: 'healthy',
      uptime: '99.99%',
      responseTime: '23ms',
      lastCheck: '1 minute ago'
    },
    {
      name: 'Email Service',
      status: 'critical',
      uptime: '98.45%',
      responseTime: '2.3s',
      lastCheck: '15 seconds ago'
    }
  ];

  const performanceMetrics = {
    cpu: { current: 23, threshold: 80, status: 'healthy' },
    memory: { current: 67, threshold: 85, status: 'warning' },
    disk: { current: 45, threshold: 90, status: 'healthy' },
    network: { current: 34, threshold: 75, status: 'healthy' }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <CheckCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">System Monitoring</h1>
              <p className="mt-2 text-gray-600">Real-time performance and health monitoring</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="15s">15 seconds</option>
                <option value="30s">30 seconds</option>
                <option value="1m">1 minute</option>
                <option value="5m">5 minutes</option>
              </select>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Refresh Now
              </button>
            </div>
          </div>
        </div>

        {/* System Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Server className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">System Health</p>
                <p className="text-2xl font-bold text-green-600">Good</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Uptime</p>
                <p className="text-2xl font-bold text-gray-900">99.96%</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Globe className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Response Time</p>
                <p className="text-2xl font-bold text-gray-900">67ms</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Shield className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Security</p>
                <p className="text-2xl font-bold text-green-600">Secure</p>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Resource Usage</h3>
            <div className="space-y-6">
              {Object.entries(performanceMetrics).map(([key, metric]) => (
                <div key={key}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700 capitalize">{key}</span>
                    <span className="text-sm text-gray-500">{metric.current}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        metric.current > metric.threshold ? 'bg-red-500' :
                        metric.current > metric.threshold * 0.8 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${metric.current}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0%</span>
                    <span>Threshold: {metric.threshold}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Recent Alerts</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-900">Email Service High Latency</p>
                  <p className="text-xs text-red-700">Response time exceeded 2 seconds</p>
                  <p className="text-xs text-red-600">2 minutes ago</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-900">Payment Gateway Slow Response</p>
                  <p className="text-xs text-yellow-700">Response time approaching threshold</p>
                  <p className="text-xs text-yellow-600">5 minutes ago</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-900">All Systems Operational</p>
                  <p className="text-xs text-green-700">No critical issues detected</p>
                  <p className="text-xs text-green-600">10 minutes ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Service Status */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Service Status</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uptime</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Response Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Check</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {systemServices.map((service, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="p-2 bg-gray-100 rounded-lg mr-3">
                          <Server className="h-4 w-4 text-gray-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{service.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(service.status)}
                        <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(service.status)}`}>
                          {service.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {service.uptime}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {service.responseTime}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {service.lastCheck}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
