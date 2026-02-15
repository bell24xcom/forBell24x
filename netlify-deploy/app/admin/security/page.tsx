'use client';

import { AlertTriangle, CheckCircle, Clock, Database, Eye, Key, Lock, Shield, Users } from 'lucide-react';
import { useState } from 'react';

interface SecurityEvent {
  id: string;
  type: 'login' | 'failed_login' | 'permission_change' | 'data_access' | 'system_change';
  user: string;
  description: string;
  timestamp: string;
  ip: string;
  status: 'success' | 'warning' | 'error';
}

interface UserSession {
  id: string;
  user: string;
  ip: string;
  location: string;
  loginTime: string;
  lastActivity: string;
  status: 'active' | 'idle' | 'expired';
}

export default function SecurityPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [userSessions, setUserSessions] = useState<UserSession[]>([]);

  const mockSecurityEvents: SecurityEvent[] = [
    {
      id: '1',
      type: 'login',
      user: 'admin@bell24h.com',
      description: 'Successful login from admin panel',
      timestamp: '2024-08-30 15:30:00',
      ip: '192.168.1.100',
      status: 'success'
    },
    {
      id: '2',
      type: 'failed_login',
      user: 'unknown@example.com',
      description: 'Failed login attempt with invalid credentials',
      timestamp: '2024-08-30 15:25:00',
      ip: '192.168.1.101',
      status: 'error'
    },
    {
      id: '3',
      type: 'permission_change',
      user: 'admin@bell24h.com',
      description: 'User role updated for supplier@example.com',
      timestamp: '2024-08-30 14:45:00',
      ip: '192.168.1.100',
      status: 'success'
    },
    {
      id: '4',
      type: 'data_access',
      user: 'supplier@example.com',
      description: 'Accessed sensitive customer data',
      timestamp: '2024-08-30 14:30:00',
      ip: '192.168.1.102',
      status: 'warning'
    }
  ];

  const mockUserSessions: UserSession[] = [
    {
      id: '1',
      user: 'admin@bell24h.com',
      ip: '192.168.1.100',
      location: 'Mumbai, India',
      loginTime: '2024-08-30 15:30:00',
      lastActivity: '2024-08-30 16:45:00',
      status: 'active'
    },
    {
      id: '2',
      user: 'supplier@example.com',
      ip: '192.168.1.102',
      location: 'Delhi, India',
      loginTime: '2024-08-30 14:30:00',
      lastActivity: '2024-08-30 16:30:00',
      status: 'idle'
    },
    {
      id: '3',
      user: 'buyer@example.com',
      ip: '192.168.1.103',
      location: 'Bangalore, India',
      loginTime: '2024-08-30 13:15:00',
      lastActivity: '2024-08-30 15:00:00',
      status: 'expired'
    }
  ];

  const securityMetrics = [
    {
      name: 'Active Sessions',
      value: '1,247',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      name: 'Failed Logins (24h)',
      value: '23',
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      name: 'Security Score',
      value: '98%',
      icon: Shield,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      name: 'Data Breaches',
      value: '0',
      icon: Database,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    }
  ];

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'login':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed_login':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'permission_change':
        return <Key className="h-4 w-4 text-blue-600" />;
      case 'data_access':
        return <Eye className="h-4 w-4 text-yellow-600" />;
      case 'system_change':
        return <Database className="h-4 w-4 text-purple-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getSessionStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'idle':
        return 'text-yellow-600 bg-yellow-100';
      case 'expired':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Security & Compliance</h1>
          <p className="mt-2 text-gray-600">Monitor security events, user access, and compliance status</p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: Shield },
              { id: 'events', name: 'Security Events', icon: AlertTriangle },
              { id: 'sessions', name: 'Active Sessions', icon: Users },
              { id: 'compliance', name: 'Compliance', icon: Lock }
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
            {/* Security Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {securityMetrics.map((metric, index) => (
                <div key={index} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className={`p-2 ${metric.bgColor} rounded-lg`}>
                      <metric.icon className={`h-6 w-6 ${metric.color}`} />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">{metric.name}</p>
                      <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Security Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Security Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Authentication</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-900">2FA Enabled</span>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-900">Password Policy</span>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-900">Session Timeout</span>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Data Protection</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-900">Data Encryption</span>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-900">Backup Encryption</span>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-900">GDPR Compliance</span>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Events Tab */}
        {activeTab === 'events' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Security Events</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {mockSecurityEvents.map((event) => (
                  <div key={event.id} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center">
                      {getEventIcon(event.type)}
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">{event.description}</p>
                        <p className="text-sm text-gray-500">
                          {event.user} • {event.ip} • {event.timestamp}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(event.status)}`}>
                        {event.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Active Sessions Tab */}
        {activeTab === 'sessions' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Active User Sessions</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Login Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Activity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mockUserSessions.map((session) => (
                      <tr key={session.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {session.user}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {session.ip}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {session.location}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {session.loginTime}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {session.lastActivity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSessionStatusColor(session.status)}`}>
                            {session.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-red-600 hover:text-red-900">
                            Revoke
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Compliance Tab */}
        {activeTab === 'compliance' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">GDPR Compliance</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Data Processing Consent</span>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Right to Erasure</span>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Data Portability</span>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Privacy Policy</span>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Security Standards</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">ISO 27001</span>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">SOC 2 Type II</span>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">PCI DSS</span>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">OWASP Top 10</span>
                    <CheckCircle className="h-5 w-5 text-green-600" />
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