'use client';

import React, { useState, useEffect } from 'react';
import {
  Zap,
  Play,
  Pause,
  Settings,
  Plus,
  Trash2,
  Edit,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  Activity,
  Workflow,
  Database,
  Mail,
  MessageSquare,
  FileText,
  BarChart3,
  Users,
  Calendar,
  Globe,
  Shield,
  RefreshCw,
} from 'lucide-react';

// Mock N8N data
const mockN8NData = {
  workflows: [
    {
      id: 1,
      name: 'RFQ Auto-Processing',
      description: 'Automatically processes incoming RFQs and matches with suppliers',
      status: 'active',
      lastRun: '2024-09-29T10:30:00Z',
      nextRun: '2024-09-29T11:00:00Z',
      executions: 1247,
      successRate: 94.2,
      triggers: ['Webhook', 'Schedule'],
      nodes: 8,
      category: 'RFQ Management',
    },
    {
      id: 2,
      name: 'Supplier Onboarding',
      description: 'Automated KYC verification and supplier profile creation',
      status: 'active',
      lastRun: '2024-09-29T09:15:00Z',
      nextRun: '2024-09-29T12:00:00Z',
      executions: 89,
      successRate: 87.6,
      triggers: ['Form Submission'],
      nodes: 12,
      category: 'Supplier Management',
    },
    {
      id: 3,
      name: 'Payment Processing',
      description: 'Handles escrow payments and wallet transactions',
      status: 'paused',
      lastRun: '2024-09-28T16:45:00Z',
      nextRun: null,
      executions: 456,
      successRate: 98.1,
      triggers: ['Payment Webhook'],
      nodes: 6,
      category: 'Financial',
    },
    {
      id: 4,
      name: 'Market Intelligence',
      description: 'Collects market data and generates insights',
      status: 'active',
      lastRun: '2024-09-29T08:00:00Z',
      nextRun: '2024-09-30T08:00:00Z',
      executions: 30,
      successRate: 96.7,
      triggers: ['Schedule'],
      nodes: 15,
      category: 'Analytics',
    },
    {
      id: 5,
      name: 'Email Notifications',
      description: 'Sends automated emails for RFQ updates and matches',
      status: 'active',
      lastRun: '2024-09-29T10:45:00Z',
      nextRun: '2024-09-29T11:15:00Z',
      executions: 2341,
      successRate: 99.2,
      triggers: ['Event Trigger'],
      nodes: 4,
      category: 'Communication',
    },
    {
      id: 6,
      name: 'Data Synchronization',
      description: 'Syncs data between Bell24H and external systems',
      status: 'error',
      lastRun: '2024-09-29T07:30:00Z',
      nextRun: '2024-09-29T11:30:00Z',
      executions: 156,
      successRate: 78.9,
      triggers: ['Schedule'],
      nodes: 10,
      category: 'Integration',
    },
  ],
  executions: [
    {
      id: 1,
      workflowId: 1,
      workflowName: 'RFQ Auto-Processing',
      status: 'success',
      startTime: '2024-09-29T10:30:00Z',
      endTime: '2024-09-29T10:32:15Z',
      duration: '2m 15s',
      dataProcessed: 23,
    },
    {
      id: 2,
      workflowId: 2,
      workflowName: 'Supplier Onboarding',
      status: 'success',
      startTime: '2024-09-29T09:15:00Z',
      endTime: '2024-09-29T09:18:42Z',
      duration: '3m 42s',
      dataProcessed: 5,
    },
    {
      id: 3,
      workflowId: 6,
      workflowName: 'Data Synchronization',
      status: 'error',
      startTime: '2024-09-29T07:30:00Z',
      endTime: '2024-09-29T07:32:08Z',
      duration: '2m 8s',
      dataProcessed: 0,
    },
  ],
  statistics: {
    totalWorkflows: 6,
    activeWorkflows: 4,
    pausedWorkflows: 1,
    errorWorkflows: 1,
    totalExecutions: 4329,
    successRate: 94.2,
    avgExecutionTime: '2m 34s',
    dataProcessedToday: 1247,
  },
  integrations: [
    { name: 'Razorpay', status: 'connected', type: 'Payment' },
    { name: 'Shiprocket', status: 'connected', type: 'Logistics' },
    { name: 'Google Sheets', status: 'connected', type: 'Data' },
    { name: 'Slack', status: 'connected', type: 'Communication' },
    { name: 'WhatsApp Business', status: 'connected', type: 'Communication' },
    { name: 'MySQL Database', status: 'connected', type: 'Database' },
    { name: 'AWS S3', status: 'connected', type: 'Storage' },
    { name: 'SendGrid', status: 'connected', type: 'Email' },
  ],
};

export default function N8NDashboard() {
  const [workflows, setWorkflows] = useState(mockN8NData.workflows);
  const [executions, setExecutions] = useState(mockN8NData.executions);
  const [selectedWorkflow, setSelectedWorkflow] = useState<any>(null);
  const [showCreateWorkflow, setShowCreateWorkflow] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'paused':
        return 'text-yellow-600 bg-yellow-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />;
      case 'paused':
        return <Pause className="w-4 h-4" />;
      case 'error':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleWorkflowAction = (workflowId: number, action: string) => {
    setWorkflows(prev => prev.map(workflow => {
      if (workflow.id === workflowId) {
        return {
          ...workflow,
          status: action === 'start' ? 'active' : action === 'stop' ? 'paused' : workflow.status
        };
      }
      return workflow;
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Zap className="w-6 h-6 mr-2 text-blue-600" />
                N8N Automation Server
              </h1>
              <p className="text-gray-600">Workflow automation and integration management</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowCreateWorkflow(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Workflow
              </button>
              <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh All
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Workflows</p>
                <p className="text-2xl font-bold text-gray-900">{mockN8NData.statistics.totalWorkflows}</p>
              </div>
              <Workflow className="w-8 h-8 text-blue-600" />
            </div>
            <div className="mt-4">
              <span className="text-sm text-green-600">{mockN8NData.statistics.activeWorkflows} active</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">{mockN8NData.statistics.successRate}%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div className="mt-4">
              <span className="text-sm text-blue-600">Above average</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Executions</p>
                <p className="text-2xl font-bold text-gray-900">{mockN8NData.statistics.totalExecutions.toLocaleString()}</p>
              </div>
              <Activity className="w-8 h-8 text-purple-600" />
            </div>
            <div className="mt-4">
              <span className="text-sm text-green-600">+12% this month</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Data Processed Today</p>
                <p className="text-2xl font-bold text-gray-900">{mockN8NData.statistics.dataProcessedToday.toLocaleString()}</p>
              </div>
              <Database className="w-8 h-8 text-indigo-600" />
            </div>
            <div className="mt-4">
              <span className="text-sm text-blue-600">Records processed</span>
            </div>
          </div>
        </div>

        {/* Workflows Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Workflows</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Workflow
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Run
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Executions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Success Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {workflows.map((workflow) => (
                  <tr key={workflow.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                          <Workflow className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{workflow.name}</div>
                          <div className="text-sm text-gray-500">{workflow.description}</div>
                          <div className="text-xs text-gray-400">{workflow.category} • {workflow.nodes} nodes</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${getStatusColor(workflow.status)}`}>
                        {getStatusIcon(workflow.status)}
                        <span className="ml-1">{workflow.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDateTime(workflow.lastRun)}</div>
                      {workflow.nextRun && (
                        <div className="text-xs text-gray-500">Next: {formatDateTime(workflow.nextRun)}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{workflow.executions.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${workflow.successRate}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-900">{workflow.successRate}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {workflow.status === 'active' ? (
                          <button 
                            onClick={() => handleWorkflowAction(workflow.id, 'stop')}
                            className="text-yellow-600 hover:text-yellow-900"
                            aria-label="Pause workflow"
                          >
                            <Pause className="w-4 h-4" />
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleWorkflowAction(workflow.id, 'start')}
                            className="text-green-600 hover:text-green-900"
                            aria-label="Start workflow"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                        )}
                        <button className="text-blue-600 hover:text-blue-900" aria-label="View workflow">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900" aria-label="Edit workflow">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900" aria-label="Delete workflow">
                          <Trash2 className="w-4 h-4" />
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Executions</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {executions.map((execution) => (
                <div key={execution.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <Activity className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{execution.workflowName}</p>
                      <p className="text-xs text-gray-500">
                        {formatDateTime(execution.startTime)} • Duration: {execution.duration}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(execution.status)}`}>
                      {execution.status}
                    </span>
                    <span className="text-sm text-gray-500">{execution.dataProcessed} records</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Integrations */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Connected Integrations</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {mockN8NData.integrations.map((integration, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-900">{integration.name}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      integration.status === 'connected' 
                        ? 'text-green-600 bg-green-100' 
                        : 'text-red-600 bg-red-100'
                    }`}>
                      {integration.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{integration.type}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
