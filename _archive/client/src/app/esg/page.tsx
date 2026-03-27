'use client';

import MinimalLayout from '@/components/layouts/MinimalLayout';
import { Brain, Leaf, Award } from 'lucide-react';
import { useState } from 'react';

interface ESGMetrics {
  overall: number;
  environmental: number;
  social: number;
  governance: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  trend: 'improving' | 'stable' | 'declining';
  confidence: number;
}

interface CompanyData {
  name: string;
  industry: string;
  marketCap: number;
  revenue: number;
  employees: number;
  esgScore: ESGMetrics;
  compliance: number;
  certifications: number;
  ranking: number;
  totalCompanies: number;
  sustainabilityGoals: number;
  carbonFootprint: number;
  waterUsage: number;
  wasteReduction: number;
}

export default function MinimalESGDashboard() {
  const [selectedCompany, setSelectedCompany] = useState<string>('tata-steel');
  const [timeframe, setTimeframe] = useState<string>('12M');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  // Enhanced demo ESG data with enterprise metrics
  const companiesData: Record<string, CompanyData> = {
    'tata-steel': {
      name: 'Tata Steel Limited',
      industry: 'Steel & Metal',
      marketCap: 850000,
      revenue: 950000,
      employees: 65000,
      esgScore: {
        overall: 78.5,
        environmental: 76.8,
        social: 83.2,
        governance: 76.5,
        riskLevel: 'medium',
        trend: 'improving',
        confidence: 94,
      },
      compliance: 97,
      certifications: 8,
      ranking: 18,
      totalCompanies: 150,
      sustainabilityGoals: 12,
      carbonFootprint: 2.4,
      waterUsage: 150,
      wasteReduction: 23,
    },
    infosys: {
      name: 'Infosys Limited',
      industry: 'Information Technology',
      marketCap: 750000,
      revenue: 180000,
      employees: 320000,
      esgScore: {
        overall: 85.2,
        environmental: 88.1,
        social: 87.3,
        governance: 80.2,
        riskLevel: 'low',
        trend: 'improving',
        confidence: 96,
      },
      compliance: 98,
      certifications: 12,
      ranking: 7,
      totalCompanies: 150,
      sustainabilityGoals: 15,
      carbonFootprint: 0.8,
      waterUsage: 45,
      wasteReduction: 35,
    },
    reliance: {
      name: 'Reliance Industries Ltd',
      industry: 'Oil & Gas',
      marketCap: 1500000,
      revenue: 870000,
      employees: 195000,
      esgScore: {
        overall: 71.3,
        environmental: 68.5,
        social: 75.8,
        governance: 70.0,
        riskLevel: 'medium',
        trend: 'stable',
        confidence: 91,
      },
      compliance: 94,
      certifications: 6,
      ranking: 35,
      totalCompanies: 150,
      sustainabilityGoals: 10,
      carbonFootprint: 4.2,
      waterUsage: 280,
      wasteReduction: 18,
    },
  };

  const currentData = companiesData[selectedCompany];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value * 10000);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-IN').format(value);
  };

  const handleAnalyzeCompany = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);

    // Simulate AI analysis progress
    const progressSteps = [20, 40, 60, 80, 100];
    for (const step of progressSteps) {
      await new Promise(resolve => setTimeout(resolve, 600));
      setAnalysisProgress(step);
    }

    setIsAnalyzing(false);
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 60) return 'text-gray-600';
    return 'text-gray-600';
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'low':
        return <span className='px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded'>Low Risk</span>;
      case 'medium':
        return (
          <span className='px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded'>Medium Risk</span>
        );
      case 'high':
        return (
          <span className='px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded'>High Risk</span>
        );
      case 'critical':
        return (
          <span className='px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded'>Critical Risk</span>
        );
      default:
        return <span className='px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded'>Unknown</span>;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <span>📈</span>;
      case 'declining':
        return <span>📈</span>;
      default:
        return <span>📊</span>;
    }
  };

  return (
    <MinimalLayout>
      <div className='space-y-6'>
        {/* Page Header */}
        <div className='border-b border-gray-200 pb-4'>
          <div className='flex items-center space-x-3'>
            <div className='w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center'>
              <Leaf className='h-4 w-4 text-white' />
            </div>
            <div>
              <h1 className='text-2xl font-semibold text-gray-900'>ESG Analytics</h1>
              <p className='text-sm text-gray-600 mt-1'>
                AI-powered sustainability scoring and compliance tracking
              </p>
            </div>
          </div>
        </div>

        {/* AI Analysis Features */}
        <div className='bg-white border border-gray-200 rounded-md p-4'>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            <div className='text-center'>
              <Brain className='h-5 w-5 text-blue-600 mx-auto mb-2' />
              <div className='text-sm font-medium text-gray-900'>AI Analysis</div>
              <div className='text-xs text-gray-600'>250+ parameters</div>
            </div>
            <div className='text-center'>
              <span>🕐</span>
              <div className='text-sm font-medium text-gray-900'>Real-time</div>
              <div className='text-xs text-gray-600'>Live data updates</div>
            </div>
            <div className='text-center'>
              <Award className='h-5 w-5 text-blue-600 mx-auto mb-2' />
              <div className='text-sm font-medium text-gray-900'>Benchmarking</div>
              <div className='text-xs text-gray-600'>Industry ranking</div>
            </div>
            <div className='text-center'>
              <span>✅</span>
              <div className='text-sm font-medium text-gray-900'>Compliance</div>
              <div className='text-xs text-gray-600'>Regulatory tracking</div>
            </div>
          </div>
        </div>

        {/* Analysis Controls */}
        <div className='bg-white border border-gray-200 rounded-md p-4'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-lg font-medium text-gray-900'>Analysis Controls</h2>
            <button
              onClick={handleAnalyzeCompany}
              disabled={isAnalyzing}
              className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50'
            >
              {isAnalyzing ? 'Analyzing...' : 'Run AI Analysis'}
            </button>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div>
              <label className='text-sm font-medium text-gray-700 mb-2 block'>
                Company Selection
              </label>
              <select
                value={selectedCompany}
                onChange={e => setSelectedCompany(e.target.value)}
                className='w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600'
              >
                <option value='tata-steel'>Tata Steel Limited</option>
                <option value='infosys'>Infosys Limited</option>
                <option value='reliance'>Reliance Industries Ltd</option>
              </select>
            </div>

            <div>
              <label className='text-sm font-medium text-gray-700 mb-2 block'>Timeframe</label>
              <select
                value={timeframe}
                onChange={e => setTimeframe(e.target.value)}
                className='w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600'
              >
                <option value='1M'>1 Month</option>
                <option value='3M'>3 Months</option>
                <option value='6M'>6 Months</option>
                <option value='12M'>12 Months</option>
              </select>
            </div>

            <div>
              <label className='text-sm font-medium text-gray-700 mb-2 block'>Analysis Type</label>
              <select className='w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600'>
                <option value='comprehensive'>Comprehensive</option>
                <option value='environmental'>Environmental Only</option>
                <option value='social'>Social Only</option>
                <option value='governance'>Governance Only</option>
              </select>
            </div>
          </div>

          {isAnalyzing && (
            <div className='mt-4'>
              <div className='flex justify-between text-sm text-gray-600 mb-2'>
                <span>AI Processing Progress</span>
                <span>{analysisProgress}%</span>
              </div>
              <div className='w-full bg-gray-200 rounded-full h-2'>
                <div
                  className='bg-blue-600 h-2 rounded-full transition-all duration-300'
                  style={{ width: `${analysisProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Company Information Table */}
        <div className='bg-white border border-gray-200 rounded-md'>
          <div className='px-4 py-3 border-b border-gray-200'>
            <h2 className='text-lg font-medium text-gray-900'>
              Company Overview - {currentData.name}
            </h2>
          </div>
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Industry
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Market Cap
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Revenue
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Employees
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    ESG Ranking
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white'>
                <tr className='hover:bg-gray-50'>
                  <td className='px-4 py-3 text-sm font-medium text-gray-900'>
                    {currentData.industry}
                  </td>
                  <td className='px-4 py-3 text-sm text-gray-900'>
                    {formatCurrency(currentData.marketCap)}
                  </td>
                  <td className='px-4 py-3 text-sm text-gray-900'>
                    {formatCurrency(currentData.revenue)}
                  </td>
                  <td className='px-4 py-3 text-sm text-gray-900'>
                    {formatNumber(currentData.employees)}
                  </td>
                  <td className='px-4 py-3 text-sm text-gray-900'>
                    #{currentData.ranking} of {currentData.totalCompanies}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ESG Scores Table */}
        <div className='bg-white border border-gray-200 rounded-md'>
          <div className='px-4 py-3 border-b border-gray-200'>
            <h2 className='text-lg font-medium text-gray-900'>ESG Score Breakdown</h2>
          </div>
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Category
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Score
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Trend
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Risk Level
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Confidence
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                <tr className='hover:bg-gray-50'>
                  <td className='px-4 py-3 text-sm font-medium text-gray-900'>Overall ESG</td>
                  <td className='px-4 py-3 text-sm'>
                    <span
                      className={`font-semibold ${getScoreColor(currentData.esgScore.overall)}`}
                    >
                      {currentData.esgScore.overall}/100
                    </span>
                  </td>
                  <td className='px-4 py-3 text-sm'>
                    <span className='flex items-center space-x-1'>
                      {getTrendIcon(currentData.esgScore.trend)}
                      <span className='text-gray-600 capitalize'>{currentData.esgScore.trend}</span>
                    </span>
                  </td>
                  <td className='px-4 py-3 text-sm'>
                    {getRiskBadge(currentData.esgScore.riskLevel)}
                  </td>
                  <td className='px-4 py-3 text-sm text-gray-900'>
                    {currentData.esgScore.confidence}%
                  </td>
                </tr>
                <tr className='hover:bg-gray-50 bg-gray-50'>
                  <td className='px-4 py-3 text-sm font-medium text-gray-900'>Environmental</td>
                  <td className='px-4 py-3 text-sm'>
                    <span
                      className={`font-semibold ${getScoreColor(
                        currentData.esgScore.environmental
                      )}`}
                    >
                      {currentData.esgScore.environmental}/100
                    </span>
                  </td>
                  <td className='px-4 py-3 text-sm'>
                    <span className='flex items-center space-x-1'>
                      {getTrendIcon('improving')}
                      <span className='text-gray-600'>Improving</span>
                    </span>
                  </td>
                  <td className='px-4 py-3 text-sm'>{getRiskBadge('medium')}</td>
                  <td className='px-4 py-3 text-sm text-gray-900'>92%</td>
                </tr>
                <tr className='hover:bg-gray-50'>
                  <td className='px-4 py-3 text-sm font-medium text-gray-900'>Social</td>
                  <td className='px-4 py-3 text-sm'>
                    <span className={`font-semibold ${getScoreColor(currentData.esgScore.social)}`}>
                      {currentData.esgScore.social}/100
                    </span>
                  </td>
                  <td className='px-4 py-3 text-sm'>
                    <span className='flex items-center space-x-1'>
                      {getTrendIcon('improving')}
                      <span className='text-gray-600'>Improving</span>
                    </span>
                  </td>
                  <td className='px-4 py-3 text-sm'>{getRiskBadge('low')}</td>
                  <td className='px-4 py-3 text-sm text-gray-900'>89%</td>
                </tr>
                <tr className='hover:bg-gray-50 bg-gray-50'>
                  <td className='px-4 py-3 text-sm font-medium text-gray-900'>Governance</td>
                  <td className='px-4 py-3 text-sm'>
                    <span
                      className={`font-semibold ${getScoreColor(currentData.esgScore.governance)}`}
                    >
                      {currentData.esgScore.governance}/100
                    </span>
                  </td>
                  <td className='px-4 py-3 text-sm'>
                    <span className='flex items-center space-x-1'>
                      {getTrendIcon('stable')}
                      <span className='text-gray-600'>Stable</span>
                    </span>
                  </td>
                  <td className='px-4 py-3 text-sm'>{getRiskBadge('medium')}</td>
                  <td className='px-4 py-3 text-sm text-gray-900'>95%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Key Metrics */}
          <div className='bg-white border border-gray-200 rounded-md p-4'>
            <h3 className='text-lg font-medium text-gray-900 mb-4'>Key Sustainability Metrics</h3>
            <div className='space-y-3'>
              <div className='flex justify-between'>
                <span className='text-sm text-gray-600'>Compliance Rate:</span>
                <span className='text-sm font-medium text-gray-900'>{currentData.compliance}%</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-sm text-gray-600'>Certifications:</span>
                <span className='text-sm font-medium text-gray-900'>
                  {currentData.certifications}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-sm text-gray-600'>Sustainability Goals:</span>
                <span className='text-sm font-medium text-gray-900'>
                  {currentData.sustainabilityGoals}/15
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-sm text-gray-600'>Carbon Footprint:</span>
                <span className='text-sm font-medium text-gray-900'>
                  {currentData.carbonFootprint} Mt CO₂e
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-sm text-gray-600'>Water Usage:</span>
                <span className='text-sm font-medium text-gray-900'>
                  {currentData.waterUsage} ML/year
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-sm text-gray-600'>Waste Reduction:</span>
                <span className='text-sm font-medium text-gray-900'>
                  {currentData.wasteReduction}%
                </span>
              </div>
            </div>
          </div>

          {/* AI Insights */}
          <div className='bg-white border border-gray-200 rounded-md p-4'>
            <h3 className='text-lg font-medium text-gray-900 mb-4'>
              AI Insights & Recommendations
            </h3>
            <div className='space-y-3'>
              <div className='border-l-2 border-blue-600 pl-3'>
                <div className='text-sm font-medium text-gray-900'>Strengths</div>
                <div className='text-sm text-gray-600'>
                  Strong social performance and employee engagement programs
                </div>
              </div>
              <div className='border-l-2 border-gray-300 pl-3'>
                <div className='text-sm font-medium text-gray-900'>Improvement Areas</div>
                <div className='text-sm text-gray-600'>
                  Environmental reporting could be enhanced with real-time monitoring
                </div>
              </div>
              <div className='border-l-2 border-blue-600 pl-3'>
                <div className='text-sm font-medium text-gray-900'>Next Actions</div>
                <div className='text-sm text-gray-600'>
                  Implement IoT sensors for carbon footprint tracking
                </div>
              </div>
            </div>

            <div className='mt-4 pt-4 border-t border-gray-200'>
              <div className='text-sm text-gray-600 mb-2'>AI Confidence Level</div>
              <div className='flex items-center space-x-2'>
                <div className='flex-1 bg-gray-200 rounded-full h-2'>
                  <div
                    className='bg-blue-600 h-2 rounded-full'
                    style={{ width: `${currentData.esgScore.confidence}%` }}
                  />
                </div>
                <span className='text-sm font-medium text-gray-900'>
                  {currentData.esgScore.confidence}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Export and Actions */}
        <div className='bg-white border border-gray-200 rounded-md p-4'>
          <div className='flex items-center justify-between'>
            <div>
              <h3 className='text-lg font-medium text-gray-900'>Export & Share</h3>
              <p className='text-sm text-gray-600 mt-1'>
                Download comprehensive ESG reports and analysis
              </p>
            </div>
            <div className='flex space-x-3'>
              <button className='px-4 py-2 border border-gray-200 text-gray-600 rounded-md hover:bg-gray-50 transition-colors'>
                <span>⬇️</span>
                Export PDF
              </button>
              <button className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'>
                Generate Report
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </MinimalLayout>
  );
}
