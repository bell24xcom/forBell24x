'use client';

import { useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface ESGData {
  environmental: {
    carbonFootprint: number;
    energyEfficiency: number;
    wasteManagement: number;
    waterConservation: number;
    renewableEnergy: number;
  };
  social: {
    laborRights: number;
    communityEngagement: number;
    diversityInclusion: number;
    healthSafety: number;
    supplyChainEthics: number;
  };
  governance: {
    boardDiversity: number;
    transparency: number;
    antiCorruption: number;
    riskManagement: number;
    stakeholderEngagement: number;
  };
}

interface ESGScore {
  environmental: number;
  social: number;
  governance: number;
  overall: number;
  grade: string;
  recommendations: string[];
  benchmark: any;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function ESGScoringDashboard() {
  const [esgData, setEsgData] = useState<ESGData>({
    environmental: {
      carbonFootprint: 70,
      energyEfficiency: 75,
      wasteManagement: 65,
      waterConservation: 80,
      renewableEnergy: 60,
    },
    social: {
      laborRights: 85,
      communityEngagement: 70,
      diversityInclusion: 75,
      healthSafety: 80,
      supplyChainEthics: 65,
    },
    governance: {
      boardDiversity: 70,
      transparency: 80,
      antiCorruption: 85,
      riskManagement: 75,
      stakeholderEngagement: 70,
    },
  });

  const [industry, setIndustry] = useState('manufacturing');
  const [scoreResult, setScoreResult] = useState<ESGScore | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const industries = [
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'technology', label: 'Technology' },
    { value: 'retail', label: 'Retail' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'finance', label: 'Finance' },
  ];

  const calculateScore = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/esg/scoring', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          esgData,
          industry,
          companyId: 'demo-company',
          userId: 'demo-user',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setScoreResult(data.data);
      } else {
        setError(data.error || 'Failed to calculate ESG score');
      }
    } catch (err) {
      setError('Failed to calculate ESG score');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (category: keyof ESGData, field: string, value: number) => {
    setEsgData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value,
      },
    }));
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+':
      case 'A':
      case 'A-':
        return 'text-green-600';
      case 'B+':
      case 'B':
      case 'B-':
        return 'text-blue-600';
      case 'C+':
      case 'C':
      case 'C-':
        return 'text-yellow-600';
      default:
        return 'text-red-600';
    }
  };

  const chartData = scoreResult
    ? [
        { name: 'Environmental', value: scoreResult.environmental, color: '#00C49F' },
        { name: 'Social', value: scoreResult.social, color: '#0088FE' },
        { name: 'Governance', value: scoreResult.governance, color: '#FFBB28' },
      ]
    : [];

  return (
    <div className='max-w-7xl mx-auto p-6'>
      <div className='bg-white rounded-lg shadow-lg p-6'>
        <h2 className='text-2xl font-bold text-gray-900 mb-6'>ESG Scoring Dashboard</h2>

        {/* Industry Selection */}
        <div className='mb-6'>
          <label className='block text-sm font-medium text-gray-700 mb-2'>Industry</label>
          <select
            value={industry}
            onChange={e => setIndustry(e.target.value)}
            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          >
            {industries.map(ind => (
              <option key={ind.value} value={ind.value}>
                {ind.label}
              </option>
            ))}
          </select>
        </div>

        {/* ESG Data Input Forms */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8'>
          {/* Environmental */}
          <div className='bg-green-50 rounded-lg p-4'>
            <h3 className='text-lg font-semibold text-green-800 mb-4'>Environmental (40%)</h3>
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Carbon Footprint
                </label>
                <input
                  type='range'
                  min='0'
                  max='100'
                  value={esgData.environmental.carbonFootprint}
                  onChange={e =>
                    handleInputChange('environmental', 'carbonFootprint', parseInt(e.target.value))
                  }
                  className='w-full'
                />
                <span className='text-sm text-gray-600'>
                  {esgData.environmental.carbonFootprint}%
                </span>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Energy Efficiency
                </label>
                <input
                  type='range'
                  min='0'
                  max='100'
                  value={esgData.environmental.energyEfficiency}
                  onChange={e =>
                    handleInputChange('environmental', 'energyEfficiency', parseInt(e.target.value))
                  }
                  className='w-full'
                />
                <span className='text-sm text-gray-600'>
                  {esgData.environmental.energyEfficiency}%
                </span>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Waste Management
                </label>
                <input
                  type='range'
                  min='0'
                  max='100'
                  value={esgData.environmental.wasteManagement}
                  onChange={e =>
                    handleInputChange('environmental', 'wasteManagement', parseInt(e.target.value))
                  }
                  className='w-full'
                />
                <span className='text-sm text-gray-600'>
                  {esgData.environmental.wasteManagement}%
                </span>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Water Conservation
                </label>
                <input
                  type='range'
                  min='0'
                  max='100'
                  value={esgData.environmental.waterConservation}
                  onChange={e =>
                    handleInputChange(
                      'environmental',
                      'waterConservation',
                      parseInt(e.target.value)
                    )
                  }
                  className='w-full'
                />
                <span className='text-sm text-gray-600'>
                  {esgData.environmental.waterConservation}%
                </span>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Renewable Energy
                </label>
                <input
                  type='range'
                  min='0'
                  max='100'
                  value={esgData.environmental.renewableEnergy}
                  onChange={e =>
                    handleInputChange('environmental', 'renewableEnergy', parseInt(e.target.value))
                  }
                  className='w-full'
                />
                <span className='text-sm text-gray-600'>
                  {esgData.environmental.renewableEnergy}%
                </span>
              </div>
            </div>
          </div>

          {/* Social */}
          <div className='bg-blue-50 rounded-lg p-4'>
            <h3 className='text-lg font-semibold text-blue-800 mb-4'>Social (30%)</h3>
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Labor Rights</label>
                <input
                  type='range'
                  min='0'
                  max='100'
                  value={esgData.social.laborRights}
                  onChange={e =>
                    handleInputChange('social', 'laborRights', parseInt(e.target.value))
                  }
                  className='w-full'
                />
                <span className='text-sm text-gray-600'>{esgData.social.laborRights}%</span>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Community Engagement
                </label>
                <input
                  type='range'
                  min='0'
                  max='100'
                  value={esgData.social.communityEngagement}
                  onChange={e =>
                    handleInputChange('social', 'communityEngagement', parseInt(e.target.value))
                  }
                  className='w-full'
                />
                <span className='text-sm text-gray-600'>{esgData.social.communityEngagement}%</span>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Diversity & Inclusion
                </label>
                <input
                  type='range'
                  min='0'
                  max='100'
                  value={esgData.social.diversityInclusion}
                  onChange={e =>
                    handleInputChange('social', 'diversityInclusion', parseInt(e.target.value))
                  }
                  className='w-full'
                />
                <span className='text-sm text-gray-600'>{esgData.social.diversityInclusion}%</span>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Health & Safety
                </label>
                <input
                  type='range'
                  min='0'
                  max='100'
                  value={esgData.social.healthSafety}
                  onChange={e =>
                    handleInputChange('social', 'healthSafety', parseInt(e.target.value))
                  }
                  className='w-full'
                />
                <span className='text-sm text-gray-600'>{esgData.social.healthSafety}%</span>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Supply Chain Ethics
                </label>
                <input
                  type='range'
                  min='0'
                  max='100'
                  value={esgData.social.supplyChainEthics}
                  onChange={e =>
                    handleInputChange('social', 'supplyChainEthics', parseInt(e.target.value))
                  }
                  className='w-full'
                />
                <span className='text-sm text-gray-600'>{esgData.social.supplyChainEthics}%</span>
              </div>
            </div>
          </div>

          {/* Governance */}
          <div className='bg-purple-50 rounded-lg p-4'>
            <h3 className='text-lg font-semibold text-purple-800 mb-4'>Governance (30%)</h3>
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Board Diversity
                </label>
                <input
                  type='range'
                  min='0'
                  max='100'
                  value={esgData.governance.boardDiversity}
                  onChange={e =>
                    handleInputChange('governance', 'boardDiversity', parseInt(e.target.value))
                  }
                  className='w-full'
                />
                <span className='text-sm text-gray-600'>{esgData.governance.boardDiversity}%</span>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Transparency</label>
                <input
                  type='range'
                  min='0'
                  max='100'
                  value={esgData.governance.transparency}
                  onChange={e =>
                    handleInputChange('governance', 'transparency', parseInt(e.target.value))
                  }
                  className='w-full'
                />
                <span className='text-sm text-gray-600'>{esgData.governance.transparency}%</span>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Anti-Corruption
                </label>
                <input
                  type='range'
                  min='0'
                  max='100'
                  value={esgData.governance.antiCorruption}
                  onChange={e =>
                    handleInputChange('governance', 'antiCorruption', parseInt(e.target.value))
                  }
                  className='w-full'
                />
                <span className='text-sm text-gray-600'>{esgData.governance.antiCorruption}%</span>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Risk Management
                </label>
                <input
                  type='range'
                  min='0'
                  max='100'
                  value={esgData.governance.riskManagement}
                  onChange={e =>
                    handleInputChange('governance', 'riskManagement', parseInt(e.target.value))
                  }
                  className='w-full'
                />
                <span className='text-sm text-gray-600'>{esgData.governance.riskManagement}%</span>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Stakeholder Engagement
                </label>
                <input
                  type='range'
                  min='0'
                  max='100'
                  value={esgData.governance.stakeholderEngagement}
                  onChange={e =>
                    handleInputChange(
                      'governance',
                      'stakeholderEngagement',
                      parseInt(e.target.value)
                    )
                  }
                  className='w-full'
                />
                <span className='text-sm text-gray-600'>
                  {esgData.governance.stakeholderEngagement}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={calculateScore}
          disabled={isLoading}
          className='w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
        >
          {isLoading ? (
            <div className='flex items-center justify-center'>
              <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2'></div>
              Calculating ESG Score...
            </div>
          ) : (
            'Calculate ESG Score'
          )}
        </button>

        {error && (
          <div className='mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded'>
            {error}
          </div>
        )}

        {/* Results */}
        {scoreResult && (
          <div className='mt-8 space-y-6'>
            {/* Score Summary */}
            <div className='bg-white border border-gray-200 rounded-lg p-6'>
              <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
                <div className='text-center'>
                  <h3 className='text-lg font-semibold text-gray-900'>Overall Score</h3>
                  <div className={`text-4xl font-bold ${getGradeColor(scoreResult.grade)}`}>
                    {scoreResult.overall}
                  </div>
                  <div className={`text-xl font-semibold ${getGradeColor(scoreResult.grade)}`}>
                    Grade: {scoreResult.grade}
                  </div>
                </div>
                <div className='text-center'>
                  <h3 className='text-lg font-semibold text-green-600'>Environmental</h3>
                  <div className='text-3xl font-bold text-green-600'>
                    {scoreResult.environmental}
                  </div>
                </div>
                <div className='text-center'>
                  <h3 className='text-lg font-semibold text-blue-600'>Social</h3>
                  <div className='text-3xl font-bold text-blue-600'>{scoreResult.social}</div>
                </div>
                <div className='text-center'>
                  <h3 className='text-lg font-semibold text-purple-600'>Governance</h3>
                  <div className='text-3xl font-bold text-purple-600'>{scoreResult.governance}</div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              <div className='bg-white border border-gray-200 rounded-lg p-6'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>ESG Breakdown</h3>
                <ResponsiveContainer width='100%' height={300}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx='50%'
                      cy='50%'
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={80}
                      fill='#8884d8'
                      dataKey='value'
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className='bg-white border border-gray-200 rounded-lg p-6'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>Industry Comparison</h3>
                <ResponsiveContainer width='100%' height={300}>
                  <BarChart
                    data={[
                      { name: 'Your Score', value: scoreResult.overall },
                      { name: 'Industry Avg', value: scoreResult.benchmark.overall },
                    ]}
                  >
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='name' />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey='value' fill='#3B82F6' />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recommendations */}
            <div className='bg-white border border-gray-200 rounded-lg p-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                Improvement Recommendations
              </h3>
              <div className='space-y-3'>
                {scoreResult.recommendations.map((recommendation, index) => (
                  <div key={index} className='flex items-start space-x-3'>
                    <div className='flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold'>
                      {index + 1}
                    </div>
                    <p className='text-gray-700'>{recommendation}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
