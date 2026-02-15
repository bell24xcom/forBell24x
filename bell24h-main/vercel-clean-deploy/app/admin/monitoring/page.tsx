'use client';

import { Activity, AlertTriangle, CheckCircle, Clock, Cpu, Database, HardDrive, Monitor, Server } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SystemMetric {
  name: string;
  value: string;
  status: 'healthy' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  icon: any;
}

interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  timestamp: string;
  resolved: boolean;
}

export default function SystemMonitoringPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const systemMetrics: SystemMetric[] = [
    {
      name: 'CPU Usage',
      value: '45%',
      status: 'healthy',
      trend: 'stable',
      icon: Cpu
    },
    {
      name: 'Memory Usage',
      value: '2.1GB / 8GB',
      status: 'healthy',
      trend: 'stable',
      icon: HardDrive
    },
    {
      name: 'Database Connections',
      value: '12/100',
      status: 'healthy',
      trend: 'stable',
      icon: Database
    },
    {
      name: 'API Response Time',
      value: '142ms',
      status: 'healthy',
      trend: 'down',
      icon: Activity
    },
    {
      name: 'Disk Usage',
      value: '65%',
      status: 'warning',
      trend: 'up',
      icon: HardDrive
    },
    {
      name: 'Uptime',
      value: '99.8%',
      status: 'healthy',
      trend: 'stable',
      icon: Server
    }
  ];

  const mockAlerts: Alert[] = [
    {
      id: '1',
      type: 'warning',
      message: 'Disk usage is approaching 70% threshold',
      timestamp: '2024-08-30 14:30:00',
      resolved: false
    },
    {
      id: '2',
      type: 'info',
      message: 'Scheduled maintenance completed successfully',
      timestamp: '2024-08-30 12:00:00',
      resolved: true
    },
    {
      id: '3',
      type: 'error',
      message: 'Database connection timeout occurred',
      timestamp: '2024-08-30 10:15:00',
      resolved: true
    }
  ];

  useEffect(() => {
    setAlerts(mockAlerts);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'critical':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'info':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">System Monitoring</h1>
          <p className="mt-2 text-gray-600">Real-time system health and performance monitoring</p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: Monitor },
              { id: 'alerts', name: 'Alerts', icon: AlertTriangle },
              { id: 'performance', name: 'Performance', icon: Activity }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* System Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {systemMetrics.map((metric, index) => (
                <div key={index} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <metric.icon className={`h-6 w-6 ${metric.color}`} />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">{metric.name}</p>
                        <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(metric.status)}`}>
                        {metric.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* System Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">System Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Services</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-900">API Server</span>
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        <span className="text-sm text-green-600">Running</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-900">Database</span>
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        <span className="text-sm text-green-600">Connected</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-900">Cache</span>
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        <span className="text-sm text-green-600">Active</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Recent Activity</h4>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-900">Last backup: 2 hours ago</div>
                    <div className="text-sm text-gray-900">Active users: 1,247</div>
                    <div className="text-sm text-gray-900">API calls today: 45,678</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">System Alerts</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {alerts.map((alert) => (
                  <div key={alert.id} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center">
                      {getAlertIcon(alert.type)}
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                        <p className="text-sm text-gray-500">{alert.timestamp}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${alert.resolved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {alert.resolved ? 'Resolved' : 'Active'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === 'performance' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Response Times</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">API Endpoints</span>
                    <span className="text-sm font-medium text-gray-900">142ms</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Database Queries</span>
                    <span className="text-sm font-medium text-gray-900">23ms</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Static Assets</span>
                    <span className="text-sm font-medium text-gray-900">45ms</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Throughput</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Requests/min</span>
                    <span className="text-sm font-medium text-gray-900">1,247</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Active Sessions</span>
                    <span className="text-sm font-medium text-gray-900">847</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Error Rate</span>
                    <span className="text-sm font-medium text-gray-900">0.02%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}