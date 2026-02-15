'use client';

import { useState, useEffect } from 'react';
import MarketingDashboard from './MarketingDashboard';
import AnalyticsDashboard from './AnalyticsDashboard';
import TransactionsTab from './TransactionsTab';
import UGCTab from './UGCTab';
import SubscriptionsTab from './SubscriptionsTab';
import RoadmapTab from './RoadmapTab';
import DocsTab from './DocsTab';

interface Tab {
  id: string;
  name: string;
  icon: string;
  component: React.ComponentType;
}

const tabs: Tab[] = [
  {
    id: 'marketing',
    name: 'AI Marketing',
    icon: '🚀',
    component: MarketingDashboard,
  },
  {
    id: 'analytics',
    name: 'Analytics',
    icon: '📊',
    component: AnalyticsDashboard,
  },
  {
    id: 'transactions',
    name: 'Transactions',
    icon: '💰',
    component: TransactionsTab,
  },
  {
    id: 'ugc',
    name: 'UGC',
    icon: '📝',
    component: UGCTab,
  },
  {
    id: 'subscriptions',
    name: 'Subscriptions',
    icon: '📈',
    component: SubscriptionsTab,
  },
  {
    id: 'roadmap',
    name: 'Roadmap',
    icon: '🗺️',
    component: RoadmapTab,
  },
  {
    id: 'docs',
    name: 'Docs',
    icon: '📚',
    component: DocsTab,
  },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('marketing');
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    setLastUpdated(new Date().toLocaleString());
  }, []);

  const handleRefresh = () => {
    setLastUpdated(new Date().toLocaleString());
  };

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || MarketingDashboard;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">Bell24h Admin</h1>
              <span className="ml-3 px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                Command Center
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Last updated: {lastUpdated}
              </div>
              <button 
                onClick={handleRefresh}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Refresh Data
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ActiveComponent />
      </div>
    </div>
  );
}
