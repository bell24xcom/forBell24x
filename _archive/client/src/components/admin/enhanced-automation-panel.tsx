'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Bot, 
  Mail, 
  Phone, 
  Users, 
  BarChart3, 
  Settings, 
  Play, 
  Pause, 
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
  Database,
  TrendingUp,
  DollarSign,
  Crown,
  Gift,
  Target,
  Activity
} from 'lucide-react';
import Header from '@/components/Header';

interface WorkflowIntegration {
  id: string;
  name: string;
  type: string;
  status: 'connected' | 'disconnected' | 'unknown';
  lastRun: string;
  nodes: number;
  connections: number;
  enhancements: string[];
  isActive: boolean;
}

interface IntegrationStatus {
  email: string;
  sms: string;
  crm: string;
  analytics: string;
  onboarding: string;
}

interface AutomationMetrics {
  totalWorkflows: number;
  activeWorkflows: number;
  totalRuns: number;
  successRate: number;
  last24Hours: {
    scrapedCompanies: number;
    sentEmails: number;
    sentSMS: number;
    newLeads: number;
    claims: number;
  };
}

export default function EnhancedAutomationPanel() {
  const [integrations, setIntegrations] = useState<WorkflowIntegration[]>([]);
  const [integrationStatus, setIntegrationStatus] = useState<IntegrationStatus | null>(null);
  const [metrics, setMetrics] = useState<AutomationMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchIntegrationData();
  }, []);

  const fetchIntegrationData = async () => {
    try {
      const [workflowsResponse, metricsResponse] = await Promise.all([
        fetch('/api/n8n/integration/workflows'),
        fetch('/api/n8n/analytics/dashboard')
      ]);

      const workflowsData = await workflowsResponse.json();
      const metricsData = await metricsResponse.json();

      if (workflowsData.success) {
        setIntegrations(workflowsData.existingWorkflows);
        setIntegrationStatus(workflowsData.integrationStatus);
      }

      if (metricsData.success) {
        setMetrics({
          totalWorkflows: 5,
          activeWorkflows: 4,
          totalRuns: metricsData.analytics.scraping.totalScraped,
          successRate: 95.2,
          last24Hours: {
            scrapedCompanies: metricsData.analytics.scraping.totalScraped,
            sentEmails: 150,
            sentSMS: 200,
            newLeads: 45,
            claims: 12
          }
        });
      }
    } catch (error) {
      console.error('Failed to fetch integration data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleWorkflow = async (workflowId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/n8n/integration/workflows/${workflowId}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive })
      });

      if (response.ok) {
        setIntegrations(prev => 
          prev.map(w => w.id === workflowId ? { ...w, isActive } : w)
        );
      }
    } catch (error) {
      console.error('Failed to toggle workflow:', error);
    }
  };

  const handleConfigureIntegration = async (workflowType: string) => {
    try {
      const response = await fetch('/api/n8n/integration/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflowType,
          workflowId: `existing-${workflowType}-workflow`,
          integrationConfig: {
            webhookUrl: `${window.location.origin}/api/n8n/integration/webhook/${workflowType}`,
            apiEndpoint: `${window.location.origin}/api/n8n/scraping/companies`
          }
        })
      });

      if (response.ok) {
        alert(`${workflowType} integration configured successfully!`);
        fetchIntegrationData();
      }
    } catch (error) {
      alert(`Failed to configure ${workflowType} integration`);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading automation panel...</p>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'workflows', name: 'Workflows', icon: Bot },
    { id: 'integrations', name: 'Integrations', icon: Settings },
    { id: 'metrics', name: 'Metrics', icon: TrendingUp },
    { id: 'scraping', name: 'Scraping', icon: Database }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800';
      case 'disconnected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4" />;
      case 'disconnected': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Enhanced Automation Panel</h2>
          <p className="text-gray-600">Unified control for all your N8N workflows and scraping system</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={fetchIntegrationData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Workflows</p>
                <p className="text-3xl font-bold text-blue-600">
                  {metrics?.totalWorkflows || 0}
                </p>
              </div>
              <Bot className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Workflows</p>
                <p className="text-3xl font-bold text-green-600">
                  {metrics?.activeWorkflows || 0}
                </p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-3xl font-bold text-purple-600">
                  {metrics?.successRate || 0}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Runs</p>
                <p className="text-3xl font-bold text-orange-600">
                  {metrics?.totalRuns?.toLocaleString() || 0}
                </p>
              </div>
              <Zap className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Integration Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Integration Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {integrationStatus && Object.entries(integrationStatus).map(([type, status]) => (
                  <div key={type} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {type === 'email' && <Mail className="h-5 w-5 text-blue-600" />}
                      {type === 'sms' && <Phone className="h-5 w-5 text-green-600" />}
                      {type === 'crm' && <Users className="h-5 w-5 text-purple-600" />}
                      {type === 'analytics' && <BarChart3 className="h-5 w-5 text-orange-600" />}
                      {type === 'onboarding' && <Crown className="h-5 w-5 text-yellow-600" />}
                      <span className="font-medium capitalize">{type}</span>
                    </div>
                    <Badge className={getStatusColor(status)}>
                      {getStatusIcon(status)}
                      <span className="ml-1 capitalize">{status}</span>
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 24-Hour Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Last 24 Hours Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Database className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-600">
                    {metrics?.last24Hours.scrapedCompanies || 0}
                  </p>
                  <p className="text-sm text-gray-600">Companies Scraped</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Mail className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">
                    {metrics?.last24Hours.sentEmails || 0}
                  </p>
                  <p className="text-sm text-gray-600">Emails Sent</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Phone className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-600">
                    {metrics?.last24Hours.sentSMS || 0}
                  </p>
                  <p className="text-sm text-gray-600">SMS Sent</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <Users className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-orange-600">
                    {metrics?.last24Hours.newLeads || 0}
                  </p>
                  <p className="text-sm text-gray-600">New Leads</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <Gift className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-yellow-600">
                    {metrics?.last24Hours.claims || 0}
                  </p>
                  <p className="text-sm text-gray-600">Claims</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'workflows' && (
        <div className="space-y-6">
          {integrations.map((workflow) => (
            <Card key={workflow.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {workflow.type === 'email' && <Mail className="h-5 w-5 text-blue-600" />}
                    {workflow.type === 'sms' && <Phone className="h-5 w-5 text-green-600" />}
                    {workflow.type === 'crm' && <Users className="h-5 w-5 text-purple-600" />}
                    {workflow.type === 'analytics' && <BarChart3 className="h-5 w-5 text-orange-600" />}
                    {workflow.type === 'onboarding' && <Crown className="h-5 w-5 text-yellow-600" />}
                    <div>
                      <CardTitle>{workflow.name}</CardTitle>
                      <p className="text-sm text-gray-600">
                        {workflow.nodes} nodes • {workflow.connections} connections
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Switch
                      checked={workflow.isActive}
                      onCheckedChange={(checked) => handleToggleWorkflow(workflow.id, checked)}
                    />
                    <Badge className={getStatusColor(workflow.status)}>
                      {getStatusIcon(workflow.status)}
                      <span className="ml-1 capitalize">{workflow.status}</span>
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Scraping Enhancements</h4>
                    <ul className="space-y-1">
                      {workflow.enhancements.map((enhancement, index) => (
                        <li key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span>{enhancement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Last run: {new Date(workflow.lastRun).toLocaleString()}</span>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Play className="h-3 w-3 mr-1" />
                        Run
                      </Button>
                      <Button size="sm" variant="outline">
                        <Settings className="h-3 w-3 mr-1" />
                        Configure
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'integrations' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configure Integrations</CardTitle>
              <p className="text-gray-600">
                Connect your existing N8N workflows with the scraping system for enhanced automation
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Available Integrations</h4>
                  {Object.entries(integrationStatus || {}).map(([type, status]) => (
                    <div key={type} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {type === 'email' && <Mail className="h-5 w-5 text-blue-600" />}
                        {type === 'sms' && <Phone className="h-5 w-5 text-green-600" />}
                        {type === 'crm' && <Users className="h-5 w-5 text-purple-600" />}
                        {type === 'analytics' && <BarChart3 className="h-5 w-5 text-orange-600" />}
                        {type === 'onboarding' && <Crown className="h-5 w-5 text-yellow-600" />}
                        <div>
                          <p className="font-medium capitalize">{type} Workflow</p>
                          <p className="text-sm text-gray-600">Connect with scraping system</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant={status === 'connected' ? 'outline' : 'default'}
                        onClick={() => handleConfigureIntegration(type)}
                      >
                        {status === 'connected' ? 'Reconfigure' : 'Connect'}
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Integration Benefits</h4>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <Target className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Enhanced Data Flow</p>
                        <p className="text-sm text-gray-600">
                          Scraped companies automatically feed into your existing workflows
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Zap className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Automated Triggers</p>
                        <p className="text-sm text-gray-600">
                          Your workflows automatically trigger when new companies are scraped
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <TrendingUp className="h-5 w-5 text-purple-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Improved Performance</p>
                        <p className="text-sm text-gray-600">
                          Better targeting and personalization with scraped company data
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <DollarSign className="h-5 w-5 text-orange-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Higher ROI</p>
                        <p className="text-sm text-gray-600">
                          Track complete funnel from scraping to conversion
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'metrics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5 text-blue-600" />
                  <span>Scraping Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Companies Scraped</span>
                    <span className="font-medium">{metrics?.totalRuns?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Success Rate</span>
                    <Badge className="bg-green-100 text-green-800">
                      {metrics?.successRate || 0}%
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Avg Trust Score</span>
                    <span className="font-medium">78.5</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-green-600" />
                  <span>Conversion Metrics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Claim Rate</span>
                    <Badge className="bg-blue-100 text-blue-800">3.2%</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Email Open Rate</span>
                    <Badge className="bg-purple-100 text-purple-800">24.8%</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">SMS Delivery</span>
                    <Badge className="bg-orange-100 text-orange-800">98.5%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-yellow-600" />
                  <span>Revenue Impact</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Value Given</span>
                    <span className="font-medium">₹2.4L</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Expected MRR</span>
                    <span className="font-medium">₹1.2L</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">ROI</span>
                    <Badge className="bg-green-100 text-green-800">450%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'scraping' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>Scraping System Control</span>
              </CardTitle>
              <p className="text-gray-600">
                Control the autonomous scraping system and monitor its performance
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">System Controls</h4>
                  <div className="space-y-3">
                    <Button className="w-full">
                      <Play className="h-4 w-4 mr-2" />
                      Start Scraping System
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Pause className="h-4 w-4 mr-2" />
                      Pause Scraping
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Settings className="h-4 w-4 mr-2" />
                      Configure Sources
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Current Status</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">System Status</span>
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Running
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Next Run</span>
                      <span className="text-sm font-medium">2 hours</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Categories Processed</span>
                      <span className="text-sm font-medium">45/400</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Companies in Queue</span>
                      <span className="text-sm font-medium">2,847</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
