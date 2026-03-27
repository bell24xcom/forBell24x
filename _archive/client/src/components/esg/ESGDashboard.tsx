'use client';
import React, { useState, useEffect } from 'react';
import { getDemoESGData } from '@/services/esg/esgScoringService';
import { CompanyESGProfile, ESGScore } from '@/types/esg';

interface ESGDashboardProps {
  companyId?: string;
}

const ESGDashboard: React.FC<ESGDashboardProps> = ({ companyId = 'TATA_STEEL_001' }) => {
  const [selectedCompany, setSelectedCompany] = useState<CompanyESGProfile | null>(null);
  const [companies, setCompanies] = useState<CompanyESGProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading ESG data
    setTimeout(() => {
      const demoData = getDemoESGData();
      setCompanies(demoData.companies);
      const company = demoData.companies.find(c => c.companyId === companyId);
      setSelectedCompany(company || demoData.companies[0]);
      setLoading(false);
    }, 1000);
  }, [companyId]);

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number): string => {
    if (score >= 80) return 'bg-green-100 border-green-200';
    if (score >= 60) return 'bg-yellow-100 border-yellow-200';
    if (score >= 40) return 'bg-orange-100 border-orange-200';
    return 'bg-red-100 border-red-200';
  };

  const getRiskLevelColor = (level: string): string => {
    switch (level) {
      case 'low':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      case 'critical':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <span>📈</span>;
      case 'declining':
        return <span>📉</span>;
      default:
        return <span>📊</span>;
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4'></div>
          <p className='text-gray-600'>Loading ESG Assessment...</p>
        </div>
      </div>
    );
  }

  if (!selectedCompany) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center'>
        <div className='text-center'>
          <AlertTriangle className='text-red-500 mx-auto mb-4' size={48} />
          <p className='text-gray-600'>Company data not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-green-50 to-blue-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900 mb-2'>ESG Scoring Dashboard</h1>
              <p className='text-gray-600'>
                Environmental, Social & Governance Assessment Platform
              </p>
            </div>
            <div className='flex items-center space-x-4'>
              <select
                value={selectedCompany.companyId}
                onChange={e => {
                  const company = companies.find(c => c.companyId === e.target.value);
                  if (company) setSelectedCompany(company);
                }}
                className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500'
              >
                {companies.map(company => (
                  <option key={company.companyId} value={company.companyId}>
                    {company.companyName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Company Overview */}
        <div className='bg-white rounded-xl shadow-lg p-6 mb-8'>
          <div className='flex items-center justify-between mb-6'>
            <div className='flex items-center space-x-4'>
              <div className='p-3 bg-green-100 rounded-full'>
                <Building className='text-green-600' size={24} />
              </div>
              <div>
                <h2 className='text-2xl font-bold text-gray-900'>{selectedCompany.companyName}</h2>
                <p className='text-gray-600'>
                  {selectedCompany.industry} • {selectedCompany.employees.toLocaleString()}{' '}
                  employees
                </p>
              </div>
            </div>
            <div className='text-right'>
              <div className='text-sm text-gray-600'>Market Cap</div>
              <div className='text-xl font-bold text-gray-900'>
                ₹{(selectedCompany.marketCap / 1000).toFixed(0)}K Cr
              </div>
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
            <div className='text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg'>
              <span>$</span>
              <div className='text-2xl font-bold text-blue-800'>
                ₹{(selectedCompany.revenue / 1000).toFixed(0)}K Cr
              </div>
              <div className='text-sm text-blue-600'>Annual Revenue</div>
            </div>
            <div className='text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg'>
              <span>👤</span>
              <div className='text-2xl font-bold text-green-800'>
                {(selectedCompany.employees / 1000).toFixed(0)}K
              </div>
              <div className='text-sm text-green-600'>Employees</div>
            </div>
            <div className='text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg'>
              <Award className='text-purple-600 mx-auto mb-2' size={24} />
              <div className='text-2xl font-bold text-purple-800'>
                {selectedCompany.certifications.length}
              </div>
              <div className='text-sm text-purple-600'>Certifications</div>
            </div>
            <div className='text-center p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg'>
              <span>🛡️</span>
              <div className='text-2xl font-bold text-indigo-800'>
                {selectedCompany.complianceStatus.overallCompliance}%
              </div>
              <div className='text-sm text-indigo-600'>Compliance</div>
            </div>
          </div>
        </div>

        {/* ESG Score Overview */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
          {/* Overall ESG Score */}
          <div className='bg-white rounded-xl shadow-lg p-6'>
            <div className='flex items-center justify-between mb-6'>
              <h3 className='text-xl font-semibold text-gray-900'>Overall ESG Score</h3>
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskLevelColor(
                  selectedCompany.esgScore.riskLevel
                )}`}
              >
                {selectedCompany.esgScore.riskLevel.toUpperCase()} RISK
              </div>
            </div>

            <div className='text-center mb-6'>
              <div
                className={`text-6xl font-bold mb-2 ${getScoreColor(
                  selectedCompany.esgScore.overall
                )}`}
              >
                {selectedCompany.esgScore.overall}
              </div>
              <div className='flex items-center justify-center space-x-2'>
                {getTrendIcon(selectedCompany.esgScore.trend)}
                <span className='text-sm text-gray-600 capitalize'>
                  {selectedCompany.esgScore.trend}
                </span>
              </div>
            </div>

            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-gray-600'>Industry Average</span>
                <span className='font-semibold'>
                  {selectedCompany.benchmarkData.industryAverage.overall}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-gray-600'>Top Performers</span>
                <span className='font-semibold'>
                  {selectedCompany.benchmarkData.topPerformers.overall}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-gray-600'>Industry Ranking</span>
                <span className='font-semibold'>
                  #{selectedCompany.benchmarkData.ranking.overall} of{' '}
                  {selectedCompany.benchmarkData.ranking.totalCompanies}
                </span>
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className='bg-white rounded-xl shadow-lg p-6'>
            <h3 className='text-xl font-semibold text-gray-900 mb-6'>Category Breakdown</h3>

            <div className='space-y-6'>
              {/* Environmental */}
              <div
                className={`p-4 rounded-lg border ${getScoreBgColor(
                  selectedCompany.esgScore.environmental
                )}`}
              >
                <div className='flex items-center justify-between mb-2'>
                  <div className='flex items-center space-x-2'>
                    <Leaf className='text-green-600' size={20} />
                    <span className='font-semibold'>Environmental</span>
                  </div>
                  <span
                    className={`text-2xl font-bold ${getScoreColor(
                      selectedCompany.esgScore.environmental
                    )}`}
                  >
                    {selectedCompany.esgScore.environmental}
                  </span>
                </div>
                <div className='text-sm text-gray-600'>
                  Carbon emissions, water usage, waste management
                </div>
              </div>

              {/* Social */}
              <div
                className={`p-4 rounded-lg border ${getScoreBgColor(
                  selectedCompany.esgScore.social
                )}`}
              >
                <div className='flex items-center justify-between mb-2'>
                  <div className='flex items-center space-x-2'>
                    <span>👤</span>
                    <span className='font-semibold'>Social</span>
                  </div>
                  <span
                    className={`text-2xl font-bold ${getScoreColor(
                      selectedCompany.esgScore.social
                    )}`}
                  >
                    {selectedCompany.esgScore.social}
                  </span>
                </div>
                <div className='text-sm text-gray-600'>
                  Employee welfare, diversity, community impact
                </div>
              </div>

              {/* Governance */}
              <div
                className={`p-4 rounded-lg border ${getScoreBgColor(
                  selectedCompany.esgScore.governance
                )}`}
              >
                <div className='flex items-center justify-between mb-2'>
                  <div className='flex items-center space-x-2'>
                    <span>🛡️</span>
                    <span className='font-semibold'>Governance</span>
                  </div>
                  <span
                    className={`text-2xl font-bold ${getScoreColor(
                      selectedCompany.esgScore.governance
                    )}`}
                  >
                    {selectedCompany.esgScore.governance}
                  </span>
                </div>
                <div className='text-sm text-gray-600'>
                  Board structure, transparency, risk management
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Notice */}
        <div className='bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6'>
          <div className='flex items-start'>
            <span>🌍</span>
            <div>
              <h3 className='text-lg font-semibold text-green-900 mb-2'>
                🌱 ESG Scoring Platform - Demo Environment
              </h3>
              <p className='text-green-800 leading-relaxed mb-4'>
                This comprehensive ESG scoring dashboard demonstrates Bell24H's enterprise
                sustainability compliance capabilities. Our platform offers automated ESG scoring,
                SEBI BRSR reporting, and industry benchmarking for comprehensive sustainability
                management and compliance.
              </p>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm'>
                <div className='flex items-center space-x-2'>
                  <span>✅</span>
                  <span>Automated ESG Scoring</span>
                </div>
                <div className='flex items-center space-x-2'>
                  <span>✅</span>
                  <span>SEBI BRSR Compliance</span>
                </div>
                <div className='flex items-center space-x-2'>
                  <span>✅</span>
                  <span>Industry Benchmarking</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ESGDashboard;
