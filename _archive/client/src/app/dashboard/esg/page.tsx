'use client';

import { useState } from 'react';
import ESGScoringDashboard from '@/components/esg/ESGScoringDashboard';

type TabType = 'scoring' | 'compliance' | 'reporting' | 'analytics';

export default function ESGDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('scoring');

  const tabs = [
    { id: 'scoring', name: 'ESG Scoring', icon: '📊' },
    { id: 'compliance', name: 'Compliance', icon: '✅' },
    { id: 'reporting', name: 'Reporting', icon: '📋' },
    { id: 'analytics', name: 'Analytics', icon: '📈' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'scoring':
        return <ESGScoringDashboard />;
      case 'compliance':
        return <ComplianceTab />;
      case 'reporting':
        return <ReportingTab />;
      case 'analytics':
        return <AnalyticsTab />;
      default:
        return <ESGScoringDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">ESG & Sustainability</h1>
              <p className="text-gray-600">Environmental, Social, and Governance Intelligence</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Generate Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-8">
        {renderTabContent()}
      </div>
    </div>
  );
}

// Compliance Tab Component
function ComplianceTab() {
  const [complianceData] = useState({
    regulations: [
      { name: 'SEBI ESG Regulations', status: 'Compliant', lastUpdated: '2024-01-15', score: 95 },
      { name: 'BRSR Framework', status: 'In Progress', lastUpdated: '2024-01-10', score: 78 },
      { name: 'GRI Standards', status: 'Compliant', lastUpdated: '2024-01-12', score: 92 },
      { name: 'TCFD Guidelines', status: 'Non-Compliant', lastUpdated: '2024-01-08', score: 45 }
    ],
    upcomingDeadlines: [
      { regulation: 'BRSR Annual Report', deadline: '2024-03-31', priority: 'High' },
      { regulation: 'ESG Disclosure', deadline: '2024-04-15', priority: 'Medium' },
      { regulation: 'Sustainability Report', deadline: '2024-05-30', priority: 'Low' }
    ]
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Compliance Status */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Regulatory Compliance</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {complianceData.regulations.map((regulation, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">{regulation.name}</h4>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      regulation.status === 'Compliant' ? 'bg-green-100 text-green-800' :
                      regulation.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {regulation.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>Score: {regulation.score}%</span>
                    <span>Updated: {regulation.lastUpdated}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Deadlines</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {complianceData.upcomingDeadlines.map((deadline, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">{deadline.regulation}</h4>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      deadline.priority === 'High' ? 'bg-red-100 text-red-800' :
                      deadline.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {deadline.priority}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Deadline: {deadline.deadline}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reporting Tab Component
function ReportingTab() {
  const [reports] = useState([
    {
      id: 'ESG-2024-001',
      title: 'Annual ESG Report 2024',
      type: 'Annual',
      status: 'Draft',
      created: '2024-01-15',
      lastModified: '2024-01-20'
    },
    {
      id: 'ESG-2023-002',
      title: 'Sustainability Report 2023',
      type: 'Annual',
      status: 'Published',
      created: '2023-12-01',
      lastModified: '2023-12-15'
    },
    {
      id: 'ESG-2024-003',
      title: 'Q1 ESG Update',
      type: 'Quarterly',
      status: 'In Progress',
      created: '2024-01-10',
      lastModified: '2024-01-18'
    }
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">ESG Reports</h3>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              Create New Report
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Report ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Modified
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {report.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {report.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      report.status === 'Published' ? 'bg-green-100 text-green-800' :
                      report.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {report.lastModified}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">
                      Edit
                    </button>
                    <button className="text-green-600 hover:text-green-900">
                      Export
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Analytics Tab Component
function AnalyticsTab() {
  const [analytics] = useState({
    esgScore: 78.5,
    trend: '+2.3%',
    industryRank: 'Top 25%',
    complianceRate: 92,
    sustainabilityGoals: [
      { goal: 'Carbon Neutral by 2030', progress: 65, target: 100 },
      { goal: '100% Renewable Energy', progress: 45, target: 100 },
      { goal: 'Zero Waste', progress: 78, target: 100 },
      { goal: 'Gender Diversity 50%', progress: 42, target: 50 }
    ]
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">ESG Score</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.esgScore}</p>
              <p className="text-sm text-green-600">{analytics.trend}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Industry Rank</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.industryRank}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Compliance Rate</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.complianceRate}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Goals Progress</p>
              <p className="text-2xl font-bold text-gray-900">57%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sustainability Goals */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Sustainability Goals Progress</h3>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            {analytics.sustainabilityGoals.map((goal, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-900">{goal.goal}</span>
                  <span className="text-sm text-gray-600">{goal.progress}% / {goal.target}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${(goal.progress / goal.target) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 
