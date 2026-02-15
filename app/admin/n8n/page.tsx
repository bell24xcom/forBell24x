'use client';

import { useState, useEffect } from 'react';

interface N8NWorkflow {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'error';
  lastRun: string;
  successRate: number;
  totalRuns: number;
  type: 'email' | 'sms' | 'crm' | 'analytics' | 'onboarding' | 'scraping' | 'marketing' | 'verification';
}

interface N8NExecution {
  id: string;
  workflowId: string;
  status: 'success' | 'failed' | 'running';
  startedAt: string;
  finishedAt?: string;
  duration?: number;
  dataProcessed: number;
  errorMessage?: string;
}

export default function N8NAdminPage() {
  const [workflows, setWorkflows] = useState<N8NWorkflow[]>([
    {
      id: '1',
      name: 'Bell24H Integration',
      status: 'active',
      lastRun: '2025-01-16 14:30:00',
      successRate: 98.5,
      totalRuns: 1247,
      type: 'email'
    },
    {
      id: '2',
      name: 'RFQ Processing',
      status: 'active',
      lastRun: '2025-01-16 14:25:00',
      successRate: 99.2,
      totalRuns: 892,
      type: 'crm'
    },
    {
      id: '3',
      name: 'User Onboarding',
      status: 'active',
      lastRun: '2025-01-16 14:20:00',
      successRate: 97.8,
      totalRuns: 156,
      type: 'onboarding'
    },
    {
      id: '4',
      name: 'Category Analytics',
      status: 'active',
      lastRun: '2025-01-16 14:15:00',
      successRate: 100,
      totalRuns: 45,
      type: 'analytics'
    },
    {
      id: '5',
      name: 'Escrow Management',
      status: 'active',
      lastRun: '2025-01-16 14:10:00',
      successRate: 99.7,
      totalRuns: 234,
      type: 'verification'
    },
    {
      id: '6',
      name: 'Mock Order Generation',
      status: 'inactive',
      lastRun: '2025-01-15 10:00:00',
      successRate: 95.2,
      totalRuns: 12,
      type: 'marketing'
    }
  ]);

  const [executions, setExecutions] = useState<N8NExecution[]>([
    {
      id: '1',
      workflowId: '1',
      status: 'success',
      startedAt: '2025-01-16 14:30:00',
      finishedAt: '2025-01-16 14:30:15',
      duration: 15000,
      dataProcessed: 25
    },
    {
      id: '2',
      workflowId: '2',
      status: 'success',
      startedAt: '2025-01-16 14:25:00',
      finishedAt: '2025-01-16 14:25:08',
      duration: 8000,
      dataProcessed: 12
    },
    {
      id: '3',
      workflowId: '3',
      status: 'failed',
      startedAt: '2025-01-16 14:20:00',
      finishedAt: '2025-01-16 14:20:45',
      duration: 45000,
      dataProcessed: 0,
      errorMessage: 'Email service timeout'
    }
  ]);

  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400';
      case 'inactive': return 'bg-neutral-500/20 text-gray-400';
      case 'error': return 'bg-red-500/20 text-red-400';
      case 'success': return 'bg-green-500/20 text-green-400';
      case 'failed': return 'bg-red-500/20 text-red-400';
      case 'running': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-neutral-500/20 text-gray-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return '📧';
      case 'sms': return '📱';
      case 'crm': return '👥';
      case 'analytics': return '📊';
      case 'onboarding': return '🚀';
      case 'scraping': return '🕷️';
      case 'marketing': return '📢';
      case 'verification': return '✅';
      default: return '⚙️';
    }
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const toggleWorkflow = async (workflowId: string) => {
    setWorkflows(prev => prev.map(w => 
      w.id === workflowId 
        ? { ...w, status: w.status === 'active' ? 'inactive' : 'active' }
        : w
    ));
  };

  const totalWorkflows = workflows.length;
  const activeWorkflows = workflows.filter(w => w.status === 'active').length;
  const totalRuns = workflows.reduce((sum, w) => sum + w.totalRuns, 0);
  const avgSuccessRate = workflows.reduce((sum, w) => sum + w.successRate, 0) / workflows.length;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg font-bold">🔔</span>
            </div>
            <h1 className="text-2xl font-bold">Bell<span className="text-amber-400">24h</span> N8N Admin</h1>
          </div>
          <nav className="flex items-center space-x-4">
            <a href="/" className="text-white hover:text-amber-400 transition-colors">Home</a>
            <a href="/admin" className="text-white hover:text-amber-400 transition-colors">Admin</a>
            <button 
              onClick={refreshData}
              disabled={isRefreshing}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <span className={isRefreshing ? 'animate-spin' : ''}>🔄</span>
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">N8N Workflow Management</h1>
          <p className="text-gray-400">Monitor and manage your automation workflows</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Workflows</p>
                <p className="text-2xl font-bold text-white">{totalWorkflows}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⚙️</span>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Workflows</p>
                <p className="text-2xl font-bold text-green-400">{activeWorkflows}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Executions</p>
                <p className="text-2xl font-bold text-purple-400">{totalRuns.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Success Rate</p>
                <p className="text-2xl font-bold text-yellow-400">{avgSuccessRate.toFixed(1)}%</p>
              </div>
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📈</span>
              </div>
            </div>
          </div>
        </div>

        {/* Workflows Table */}
        <div className="bg-white/10 backdrop-blur rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-6">Workflow Status</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4">Workflow</th>
                  <th className="text-left py-3 px-4">Type</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Last Run</th>
                  <th className="text-left py-3 px-4">Success Rate</th>
                  <th className="text-left py-3 px-4">Total Runs</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {workflows.map((workflow) => (
                  <tr key={workflow.id} className="border-b border-gray-700/50 hover:bg-white/5">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getTypeIcon(workflow.type)}</span>
                        <div>
                          <p className="font-medium text-white">{workflow.name}</p>
                          <p className="text-sm text-gray-400">ID: {workflow.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-gray-700 rounded text-sm">
                        {workflow.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(workflow.status)}`}>
                        {workflow.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-gray-300">{workflow.lastRun}</p>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${workflow.successRate}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-300">{workflow.successRate}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-gray-300">{workflow.totalRuns.toLocaleString()}</p>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => toggleWorkflow(workflow.id)}
                          className={`px-3 py-1 rounded text-xs ${
                            workflow.status === 'active' 
                              ? 'bg-red-600 hover:bg-red-700 text-white' 
                              : 'bg-green-600 hover:bg-green-700 text-white'
                          }`}
                        >
                          {workflow.status === 'active' ? 'Stop' : 'Start'}
                        </button>
                        <button 
                          onClick={() => setSelectedWorkflow(workflow.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Executions */}
        <div className="bg-white/10 backdrop-blur rounded-lg p-6">
          <h2 className="text-xl font-bold mb-6">Recent Executions</h2>
          <div className="space-y-4">
            {executions.map((execution) => (
              <div key={execution.id} className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-2xl">{getTypeIcon(workflows.find(w => w.id === execution.workflowId)?.type || '')}</span>
                    <div>
                      <p className="font-medium text-white">
                        {workflows.find(w => w.id === execution.workflowId)?.name}
                      </p>
                      <p className="text-sm text-gray-400">
                        Started: {execution.startedAt}
                        {execution.finishedAt && ` • Finished: ${execution.finishedAt}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(execution.status)}`}>
                      {execution.status}
                    </span>
                    <div className="text-right">
                      <p className="text-sm text-gray-300">
                        {execution.dataProcessed} items processed
                      </p>
                      {execution.duration && (
                        <p className="text-xs text-gray-400">
                          {execution.duration}ms
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                {execution.errorMessage && (
                  <div className="mt-3 p-3 bg-red-900/20 border border-red-500/30 rounded">
                    <p className="text-red-400 text-sm">
                      <span className="font-semibold">Error:</span> {execution.errorMessage}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* N8N Integration Info */}
        <div className="mt-8 bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-400 mb-2">N8N Integration Status</h3>
          <p className="text-gray-300 mb-4">
            Your N8N workflows are integrated with Bell24h for automated processing of RFQs, user onboarding, and analytics.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-white mb-2">Available Workflows</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Bell24H Integration (Email automation)</li>
                <li>• RFQ Processing (CRM integration)</li>
                <li>• User Onboarding (Welcome sequences)</li>
                <li>• Category Analytics (Data processing)</li>
                <li>• Escrow Management (Payment verification)</li>
                <li>• Mock Order Generation (Testing)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Integration Features</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Real-time webhook triggers</li>
                <li>• Automated email sequences</li>
                <li>• CRM data synchronization</li>
                <li>• Analytics data processing</li>
                <li>• Error handling and retries</li>
                <li>• Performance monitoring</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
