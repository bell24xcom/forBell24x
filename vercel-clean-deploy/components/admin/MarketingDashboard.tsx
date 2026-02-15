'use client';

import { useEffect, useState } from 'react';

interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'completed';
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpc: number;
  roas: number;
  startDate: string;
  endDate: string;
}

interface AIInsight {
  id: string;
  type: 'optimization' | 'trend' | 'alert';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  action: string;
  timestamp: string;
}

export default function MarketingDashboard() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);

  // Fetch campaigns from database
  useEffect(() => {
    fetchCampaigns();
    
    // Set initial insights
    setInsights([
      {
        id: '1',
        type: 'optimization',
        title: 'Budget Reallocation Opportunity',
        description: 'Campaign 2 shows 40% higher ROAS. Consider reallocating budget from Campaign 3.',
        impact: 'high',
        action: 'Reallocate $1000 from Campaign 3 to Campaign 2',
        timestamp: '2024-01-20T10:30:00Z',
      },
      {
        id: '2',
        type: 'trend',
        title: 'Peak Performance Hours',
        description: 'CTR increases by 35% between 9-11 AM and 2-4 PM. Consider scheduling ads during these hours.',
        impact: 'medium',
        action: 'Adjust ad scheduling to peak hours',
        timestamp: '2024-01-20T09:15:00Z',
      },
      {
        id: '3',
        type: 'alert',
        title: 'Budget Alert',
        description: 'Campaign 1 has spent 32.5% of budget in 20 days. At current pace, budget will be exhausted before end date.',
        impact: 'high',
        action: 'Review and adjust daily spend limit',
        timestamp: '2024-01-20T08:45:00Z',
      },
    ]);
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await fetch('/api/campaigns');
      const data = await response.json();

      if (data.success) {
        // Transform database campaigns to match the interface
        const transformedCampaigns = data.campaigns.map((campaign: any) => ({
          id: campaign.id,
          name: campaign.name,
          status: campaign.status.toLowerCase(),
          budget: campaign.budget || 0,
          spent: campaign.spent || 0,
          impressions: Math.floor(Math.random() * 100000) + 10000, // Mock for now
          clicks: Math.floor(Math.random() * 2000) + 100,
          conversions: Math.floor(Math.random() * 100) + 10,
          ctr: 2.0,
          cpc: 1.30,
          roas: 3.8,
          startDate: campaign.startDate || '2024-01-01',
          endDate: campaign.endDate || '2024-03-31',
        }));

        setCampaigns(transformedCampaigns);
      } else {
        // Fallback to mock data if API fails
        setCampaigns([
          {
            id: '1',
            name: 'B2B Marketplace Launch',
            status: 'active',
            budget: 10000,
            spent: 3250,
            impressions: 125000,
            clicks: 2500,
            conversions: 125,
            ctr: 2.0,
            cpc: 1.30,
            roas: 3.8,
            startDate: '2024-01-01',
            endDate: '2024-03-31',
          },
          {
            id: '2',
            name: 'Supplier Acquisition',
            status: 'active',
            budget: 5000,
            spent: 1800,
            impressions: 75000,
            clicks: 1500,
            conversions: 75,
            ctr: 2.0,
            cpc: 1.20,
            roas: 4.2,
            startDate: '2024-01-15',
            endDate: '2024-04-15',
          },
          {
            id: '3',
            name: 'RFQ Feature Promotion',
            status: 'paused',
            budget: 3000,
            spent: 1200,
            impressions: 45000,
            clicks: 900,
            conversions: 45,
            ctr: 2.0,
            cpc: 1.33,
            roas: 3.5,
            startDate: '2024-02-01',
            endDate: '2024-05-01',
          },
        ]);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      // Use mock data as fallback
      setCampaigns([
        {
          id: '1',
          name: 'B2B Marketplace Launch',
          status: 'active',
          budget: 10000,
          spent: 3250,
          impressions: 125000,
          clicks: 2500,
          conversions: 125,
          ctr: 2.0,
          cpc: 1.30,
          roas: 3.8,
          startDate: '2024-01-01',
          endDate: '2024-03-31',
        },
      ]);
    }
  };

const generateAIInsights = async () => {
  setIsGenerating(true);

  // Simulate API call to Nano Banana AI
  try {
    // In production, this would call your Nano Banana API endpoint
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock new insight
    const newInsight: AIInsight = {
      id: Date.now().toString(),
      type: 'optimization',
      title: 'AI-Generated Insight',
      description: 'Based on current performance data, consider increasing budget for high-performing campaigns.',
      impact: 'medium',
      action: 'Increase budget by 20% for campaigns with ROAS > 3.5',
      timestamp: new Date().toISOString(),
    };

    setInsights(prev => [newInsight, ...prev]);
  } catch (error) {
    console.error('Error generating AI insights:', error);
  } finally {
    setIsGenerating(false);
  }
};

const createNewCampaign = async () => {
  try {
    const newCampaign = {
      name: `AI Campaign ${Date.now()}`,
      description: 'AI-generated marketing campaign',
      channels: ['google', 'facebook', 'linkedin'],
      budget: 5000,
      targetMarket: 'B2B Suppliers',
      productName: 'Bell24h Platform'
    };

    const response = await fetch('/api/campaigns', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newCampaign)
    });

    const data = await response.json();

    if (data.success) {
      // Refresh campaigns list
      await fetchCampaigns();
      alert('Campaign created successfully!');
    } else {
      alert('Failed to create campaign: ' + data.error);
    }
  } catch (error) {
    console.error('Error creating campaign:', error);
    alert('Error creating campaign');
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800';
    case 'paused': return 'bg-yellow-100 text-yellow-800';
    case 'completed': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getImpactColor = (impact: string) => {
  switch (impact) {
    case 'high': return 'bg-red-100 text-red-800';
    case 'medium': return 'bg-yellow-100 text-yellow-800';
    case 'low': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

return (
  <div className="space-y-6">
    {/* Header */}
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">AI-Powered Marketing Dashboard</h2>
        <p className="text-gray-600">Intelligent campaign management and optimization</p>
      </div>
      <div className="flex items-center space-x-3">
        <button
          onClick={() => window.open('/admin?tab=analytics', '_blank')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <span className="mr-2">📊</span>
          View Analytics
        </button>
        <button
          onClick={createNewCampaign}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
        >
          <span className="mr-2">➕</span>
          Create Campaign
        </button>
        <button
          onClick={generateAIInsights}
          disabled={isGenerating}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Generating...
            </>
          ) : (
            <>
              <span className="mr-2">🤖</span>
              Generate AI Insights
            </>
          )}
        </button>
      </div>
    </div>

    {/* Key Metrics */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <div className="p-2 bg-blue-100 rounded-lg">
            <span className="text-2xl">💰</span>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Spent</p>
            <p className="text-2xl font-bold text-gray-900">
              ${campaigns.reduce((sum, c) => sum + c.spent, 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <div className="p-2 bg-green-100 rounded-lg">
            <span className="text-2xl">🎯</span>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Conversions</p>
            <p className="text-2xl font-bold text-gray-900">
              {campaigns.reduce((sum, c) => sum + c.conversions, 0)}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <div className="p-2 bg-purple-100 rounded-lg">
            <span className="text-2xl">📊</span>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Avg ROAS</p>
            <p className="text-2xl font-bold text-gray-900">
              {campaigns.length > 0
                ? (campaigns.reduce((sum, c) => sum + c.roas, 0) / campaigns.length).toFixed(1)
                : '0.0'
              }
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <div className="p-2 bg-orange-100 rounded-lg">
            <span className="text-2xl">👁️</span>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Impressions</p>
            <p className="text-2xl font-bold text-gray-900">
              {campaigns.reduce((sum, c) => sum + c.impressions, 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>

    {/* Campaigns Table */}
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Active Campaigns</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Campaign
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Budget
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Spent
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                CTR
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ROAS
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {campaigns.map((campaign) => (
              <tr key={campaign.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                    <div className="text-sm text-gray-500">{campaign.conversions} conversions</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
                    {campaign.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${campaign.budget.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${campaign.spent.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {campaign.ctr}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {campaign.roas}x
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => setSelectedCampaign(campaign.id)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    View
                  </button>
                  <button className="text-green-600 hover:text-green-900">
                    Optimize
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    {/* AI Insights */}
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">AI Insights & Recommendations</h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {insights.map((insight) => (
            <div key={insight.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <span className="text-lg mr-2">
                      {insight.type === 'optimization' ? '⚡' :
                        insight.type === 'trend' ? '📈' : '🚨'}
                    </span>
                    <h4 className="text-sm font-medium text-gray-900">{insight.title}</h4>
                    <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getImpactColor(insight.impact)}`}>
                      {insight.impact} impact
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                  <p className="text-sm font-medium text-blue-600">{insight.action}</p>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(insight.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);
}
