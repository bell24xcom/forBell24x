'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';

interface RiskFactor {
  category: string;
  score: number;
  weight: number;
  status: 'excellent' | 'good' | 'average' | 'poor' | 'critical';
  trend: 'improving' | 'stable' | 'declining';
  details: string[];
  recommendations: string[];
}

interface SupplierProfile {
  id: string;
  name: string;
  industry: string;
  location: string;
  establishedYear: number;
  employeeCount: string;
  annualRevenue: string;
  gstNumber: string;
  contactEmail: string;
  contactPhone: string;
  website: string;
  overallRiskScore: number;
  riskGrade: 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'CCC' | 'CC' | 'C' | 'D';
  lastUpdated: string;
}

interface HistoricalData {
  date: string;
  riskScore: number;
  majorEvents: string[];
}

export default function SupplierRiskScoring() {
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierProfile | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isCalculating, setIsCalculating] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Sample supplier data with comprehensive risk profiles
  const suppliers: SupplierProfile[] = [
    {
      id: 'SUP001',
      name: 'TechCorp Manufacturing Ltd',
      industry: 'Electronics & Technology',
      location: 'Pune, Maharashtra',
      establishedYear: 2010,
      employeeCount: '250-500',
      annualRevenue: '₹45 Crore',
      gstNumber: '27AABCT1332L1ZM',
      contactEmail: 'procurement@techcorp.com',
      contactPhone: '+91 98765 43210',
      website: 'www.techcorp.com',
      overallRiskScore: 87,
      riskGrade: 'AA',
      lastUpdated: '2025-01-20T10:30:00Z',
    },
    {
      id: 'SUP002',
      name: 'Global Steel Industries',
      industry: 'Steel & Metal',
      location: 'Mumbai, Maharashtra',
      establishedYear: 2005,
      employeeCount: '500-1000',
      annualRevenue: '₹120 Crore',
      gstNumber: '27AABCT1332L1ZN',
      contactEmail: 'sales@globalsteel.com',
      contactPhone: '+91 98765 43211',
      website: 'www.globalsteel.com',
      overallRiskScore: 72,
      riskGrade: 'A',
      lastUpdated: '2025-01-20T09:15:00Z',
    },
    {
      id: 'SUP003',
      name: 'ChemSafe Solutions Pvt Ltd',
      industry: 'Chemicals & Pharmaceuticals',
      location: 'Ahmedabad, Gujarat',
      establishedYear: 2015,
      employeeCount: '100-250',
      annualRevenue: '₹28 Crore',
      gstNumber: '24AABCT1332L1ZO',
      contactEmail: 'info@chemsafe.com',
      contactPhone: '+91 98765 43212',
      website: 'www.chemsafe.com',
      overallRiskScore: 64,
      riskGrade: 'BBB',
      lastUpdated: '2025-01-20T08:45:00Z',
    },
    {
      id: 'SUP004',
      name: 'QuickLogistics Express',
      industry: 'Logistics & Transportation',
      location: 'Delhi NCR',
      establishedYear: 2018,
      employeeCount: '50-100',
      annualRevenue: '₹12 Crore',
      gstNumber: '07AABCT1332L1ZP',
      contactEmail: 'ops@quicklogistics.com',
      contactPhone: '+91 98765 43213',
      website: 'www.quicklogistics.com',
      overallRiskScore: 51,
      riskGrade: 'BB',
      lastUpdated: '2025-01-20T07:20:00Z',
    },
  ];

  // Comprehensive risk factors with Aladin-inspired scoring
  const calculateRiskFactors = (supplier: SupplierProfile): RiskFactor[] => {
    return [
      {
        category: 'Financial Stability',
        score: supplier.overallRiskScore >= 80 ? 92 : supplier.overallRiskScore >= 60 ? 75 : 45,
        weight: 25,
        status:
          supplier.overallRiskScore >= 80
            ? 'excellent'
            : supplier.overallRiskScore >= 60
            ? 'good'
            : 'poor',
        trend: 'improving',
        details: [
          'Credit rating: A+ (CRISIL)',
          'Debt-to-equity ratio: 0.3:1',
          'Current ratio: 2.1:1',
          'Revenue growth: 15% YoY',
          'Profit margin: 12%',
        ],
        recommendations: [
          'Maintain current credit terms',
          'Consider increasing order volume',
          'Monitor quarterly financials',
        ],
      },
      {
        category: 'Delivery Performance',
        score: supplier.overallRiskScore >= 80 ? 88 : supplier.overallRiskScore >= 60 ? 72 : 55,
        weight: 20,
        status:
          supplier.overallRiskScore >= 80
            ? 'excellent'
            : supplier.overallRiskScore >= 60
            ? 'good'
            : 'average',
        trend: 'stable',
        details: [
          'On-time delivery: 94%',
          'Order accuracy: 98%',
          'Lead time adherence: 92%',
          'Emergency delivery capability: Yes',
          'Average delivery time: 3.2 days',
        ],
        recommendations: [
          'Set up automated delivery tracking',
          'Establish backup logistics partners',
          'Implement delivery milestone alerts',
        ],
      },
      {
        category: 'Quality Compliance',
        score: supplier.overallRiskScore >= 80 ? 90 : supplier.overallRiskScore >= 60 ? 78 : 60,
        weight: 20,
        status:
          supplier.overallRiskScore >= 80
            ? 'excellent'
            : supplier.overallRiskScore >= 60
            ? 'good'
            : 'average',
        trend: 'improving',
        details: [
          'ISO 9001:2015 certified',
          'Quality rejection rate: 0.8%',
          'Customer complaints: 2 per quarter',
          'Third-party audits: Passed',
          'Quality management system: Advanced',
        ],
        recommendations: [
          'Implement quality milestone payments',
          'Regular quality audits',
          'Supplier development programs',
        ],
      },
      {
        category: 'Operational Reliability',
        score: supplier.overallRiskScore >= 80 ? 85 : supplier.overallRiskScore >= 60 ? 70 : 50,
        weight: 15,
        status:
          supplier.overallRiskScore >= 80
            ? 'excellent'
            : supplier.overallRiskScore >= 60
            ? 'good'
            : 'average',
        trend: 'stable',
        details: [
          'Production capacity utilization: 75%',
          'Backup production facilities: 2',
          'Technology adoption: High',
          'Workforce stability: 95%',
          'Equipment maintenance: Preventive',
        ],
        recommendations: [
          'Establish capacity monitoring',
          'Plan for peak demand periods',
          'Technology upgrade support',
        ],
      },
      {
        category: 'Market Reputation',
        score: supplier.overallRiskScore >= 80 ? 89 : supplier.overallRiskScore >= 60 ? 74 : 58,
        weight: 10,
        status:
          supplier.overallRiskScore >= 80
            ? 'excellent'
            : supplier.overallRiskScore >= 60
            ? 'good'
            : 'average',
        trend: 'improving',
        details: [
          'Industry recognition: 3 awards',
          'Customer retention rate: 92%',
          'Market presence: 8 years',
          'Brand reputation score: 4.2/5',
          'Regulatory compliance: 100%',
        ],
        recommendations: [
          'Leverage their market reputation',
          'Joint marketing opportunities',
          'Industry partnership programs',
        ],
      },
      {
        category: 'Communication & Support',
        score: supplier.overallRiskScore >= 80 ? 86 : supplier.overallRiskScore >= 60 ? 76 : 62,
        weight: 10,
        status:
          supplier.overallRiskScore >= 80
            ? 'excellent'
            : supplier.overallRiskScore >= 60
            ? 'good'
            : 'average',
        trend: 'stable',
        details: [
          'Response time: < 2 hours',
          'Dedicated account manager: Yes',
          '24/7 support availability: Yes',
          'Technical support quality: High',
          'Documentation standards: Excellent',
        ],
        recommendations: [
          'Establish communication protocols',
          'Regular review meetings',
          'Escalation matrix setup',
        ],
      },
    ];
  };

  const getRiskGradeColor = (grade: string) => {
    switch (grade) {
      case 'AAA':
      case 'AA':
        return 'text-emerald-600 bg-emerald-100';
      case 'A':
      case 'BBB':
        return 'text-blue-600 bg-blue-100';
      case 'BB':
      case 'B':
        return 'text-amber-600 bg-amber-100';
      case 'CCC':
      case 'CC':
      case 'C':
        return 'text-orange-600 bg-orange-100';
      case 'D':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-amber-600';
    return 'text-red-600';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent':
        return <span>✅</span>;
      case 'good':
        return <ThumbsUp className='w-5 h-5 text-blue-500' />;
      case 'average':
        return <span>➖</span>;
      case 'poor':
        return <ThumbsDown className='w-5 h-5 text-orange-500' />;
      case 'critical':
        return <span>❌</span>;
      default:
        return <AlertCircle className='w-5 h-5 text-gray-500' />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <span>📈</span>;
      case 'declining':
        return <span>📉</span>;
      case 'stable':
        return <span>➖</span>;
      default:
        return <span>📊</span>;
    }
  };

  const recalculateRiskScore = async (supplier: SupplierProfile) => {
    setIsCalculating(true);

    // Simulate real-time risk calculation
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Update risk score with slight variation
    const variation = (Math.random() - 0.5) * 4; // ±2 points
    const newScore = Math.max(0, Math.min(100, supplier.overallRiskScore + variation));

    setIsCalculating(false);

    // In real implementation, this would update the database
    console.log(`Updated risk score for ${supplier.name}: ${newScore.toFixed(1)}`);
  };

  const historicalData: HistoricalData[] = [
    {
      date: '2025-01-15',
      riskScore: 85,
      majorEvents: ['Successful quality audit', 'New ISO certification'],
    },
    {
      date: '2025-01-10',
      riskScore: 83,
      majorEvents: ['Minor delivery delay', 'Resolved customer complaint'],
    },
    {
      date: '2025-01-05',
      riskScore: 87,
      majorEvents: ['Expanded production capacity', 'New technology implementation'],
    },
    {
      date: '2024-12-30',
      riskScore: 84,
      majorEvents: ['Year-end financial review', 'Supplier development program'],
    },
  ];

  return (
    <section className='bg-gradient-to-br from-slate-50 to-indigo-50 py-20'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className='text-center mb-12'
        >
          <div className='inline-flex items-center gap-2 bg-gradient-to-r from-indigo-100 to-purple-100 px-4 py-2 rounded-full mb-4'>
            <span>🛡️</span>
            <span className='text-sm font-semibold text-indigo-700'>ENTERPRISE RISK SCORING</span>
          </div>
          <h2 className='text-4xl md:text-5xl font-bold text-gray-900 mb-4'>
            Supplier Risk Intelligence
          </h2>
          <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
            Advanced risk scoring algorithm with real-time analysis, comprehensive risk factors, and
            actionable insights for informed supplier decisions.
          </p>
        </motion.div>

        {/* Supplier Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12'
        >
          {suppliers.map((supplier, index) => (
            <motion.div
              key={supplier.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className='bg-white rounded-3xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all cursor-pointer group'
              onClick={() => setSelectedSupplier(supplier)}
            >
              <div className='flex items-center justify-between mb-4'>
                <div className='flex items-center gap-3'>
                  <div className='w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center'>
                    <Building className='w-6 h-6 text-white' />
                  </div>
                  <div>
                    <h3 className='font-bold text-gray-900 text-sm'>{supplier.name}</h3>
                    <p className='text-xs text-gray-600'>{supplier.industry}</p>
                  </div>
                </div>
              </div>

              <div className='mb-4'>
                <div className='flex items-center justify-between mb-2'>
                  <span className='text-sm font-medium text-gray-700'>Risk Score</span>
                  <span
                    className={`text-2xl font-bold ${getScoreColor(supplier.overallRiskScore)}`}
                  >
                    {supplier.overallRiskScore}
                  </span>
                </div>
                <div className='w-full bg-gray-200 rounded-full h-2'>
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      supplier.overallRiskScore >= 80
                        ? 'bg-emerald-500'
                        : supplier.overallRiskScore >= 60
                        ? 'bg-blue-500'
                        : supplier.overallRiskScore >= 40
                        ? 'bg-amber-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${supplier.overallRiskScore}%` }}
                  ></div>
                </div>
              </div>

              <div className='flex items-center justify-between mb-4'>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskGradeColor(
                    supplier.riskGrade
                  )}`}
                >
                  Grade {supplier.riskGrade}
                </span>
                <div className='flex items-center gap-1 text-xs text-gray-500'>
                  <span>🕐</span>
                  {new Date(supplier.lastUpdated).toLocaleDateString()}
                </div>
              </div>

              <div className='space-y-2 text-xs text-gray-600'>
                <div className='flex items-center gap-2'>
                  <span>📍</span>
                  {supplier.location}
                </div>
                <div className='flex items-center gap-2'>
                  <span>$</span>
                  {supplier.annualRevenue}
                </div>
                <div className='flex items-center gap-2'>
                  <span>👤</span>
                  {supplier.employeeCount} employees
                </div>
              </div>

              <button className='w-full mt-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-2 px-4 rounded-xl text-sm font-medium hover:shadow-lg transition-all group-hover:scale-105'>
                View Risk Analysis
              </button>
            </motion.div>
          ))}
        </motion.div>

        {/* Risk Scoring Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className='bg-white rounded-3xl p-8 shadow-lg border border-gray-100 mb-12'
        >
          <h3 className='text-2xl font-bold text-gray-900 mb-6'>Risk Scoring Methodology</h3>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            <div className='text-center'>
              <div className='w-16 h-16 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4'>
                <span>📊</span>
              </div>
              <h4 className='text-lg font-bold text-gray-900 mb-2'>Multi-Factor Analysis</h4>
              <p className='text-gray-600 text-sm'>
                6 comprehensive risk factors with weighted scoring: Financial Stability (25%),
                Delivery Performance (20%), Quality Compliance (20%), Operational Reliability (15%),
                Market Reputation (10%), Communication (10%)
              </p>
            </div>
            <div className='text-center'>
              <div className='w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4'>
                <span>📊</span>
              </div>
              <h4 className='text-lg font-bold text-gray-900 mb-2'>Real-Time Updates</h4>
              <p className='text-gray-600 text-sm'>
                Continuous monitoring of supplier performance with automated risk score updates
                based on delivery performance, financial changes, quality metrics, and market
                conditions
              </p>
            </div>
            <div className='text-center'>
              <div className='w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4'>
                <Target className='w-8 h-8 text-white' />
              </div>
              <h4 className='text-lg font-bold text-gray-900 mb-2'>Actionable Insights</h4>
              <p className='text-gray-600 text-sm'>
                Detailed recommendations for risk mitigation, supplier development, and strategic
                partnership decisions based on comprehensive risk analysis
              </p>
            </div>
          </div>
        </motion.div>

        {/* Risk Grade Legend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className='bg-white rounded-3xl p-8 shadow-lg border border-gray-100'
        >
          <h3 className='text-2xl font-bold text-gray-900 mb-6'>Risk Grade Classification</h3>
          <div className='grid grid-cols-1 md:grid-cols-5 gap-4'>
            {[
              {
                grade: 'AAA-AA',
                range: '90-100',
                color: 'emerald',
                description: 'Excellent - Minimal risk, preferred partners',
              },
              {
                grade: 'A-BBB',
                range: '70-89',
                color: 'blue',
                description: 'Good - Low risk, reliable suppliers',
              },
              {
                grade: 'BB-B',
                range: '50-69',
                color: 'amber',
                description: 'Average - Moderate risk, close monitoring',
              },
              {
                grade: 'CCC-CC',
                range: '30-49',
                color: 'orange',
                description: 'Poor - High risk, additional safeguards',
              },
              {
                grade: 'C-D',
                range: '0-29',
                color: 'red',
                description: 'Critical - Very high risk, avoid or remediate',
              },
            ].map((item, index) => (
              <div key={index} className='text-center p-4 rounded-2xl bg-gray-50'>
                <div className={`text-lg font-bold mb-2 text-${item.color}-600`}>{item.grade}</div>
                <div className='text-sm text-gray-600 mb-2'>{item.range} points</div>
                <div className='text-xs text-gray-500'>{item.description}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Detailed Risk Analysis Modal */}
      <AnimatePresence>
        {selectedSupplier && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4'
            onClick={() => setSelectedSupplier(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className='bg-white rounded-3xl p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto'
              onClick={e => e.stopPropagation()}
            >
              <div className='flex items-center justify-between mb-6'>
                <div>
                  <h2 className='text-3xl font-bold text-gray-900'>{selectedSupplier.name}</h2>
                  <p className='text-gray-600'>
                    {selectedSupplier.industry} • {selectedSupplier.location}
                  </p>
                </div>
                <div className='flex items-center gap-4'>
                  <button
                    onClick={() => recalculateRiskScore(selectedSupplier)}
                    disabled={isCalculating}
                    className='flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50'
                  >
                    <span>🔄</span>
                    {isCalculating ? 'Calculating...' : 'Recalculate'}
                  </button>
                  <button
                    onClick={() => setSelectedSupplier(null)}
                    className='w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors'
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Overall Risk Score */}
              <div className='bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 mb-8'>
                <div className='flex items-center justify-between'>
                  <div>
                    <h3 className='text-xl font-bold text-gray-900 mb-2'>Overall Risk Score</h3>
                    <div className='flex items-center gap-4'>
                      <span
                        className={`text-5xl font-bold ${getScoreColor(
                          selectedSupplier.overallRiskScore
                        )}`}
                      >
                        {selectedSupplier.overallRiskScore}
                      </span>
                      <span
                        className={`px-4 py-2 rounded-full text-lg font-bold ${getRiskGradeColor(
                          selectedSupplier.riskGrade
                        )}`}
                      >
                        Grade {selectedSupplier.riskGrade}
                      </span>
                    </div>
                  </div>
                  <div className='text-right'>
                    <p className='text-sm text-gray-600 mb-2'>Last Updated</p>
                    <p className='text-lg font-semibold text-gray-900'>
                      {new Date(selectedSupplier.lastUpdated).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Risk Factors Breakdown */}
              <div className='space-y-6'>
                <h3 className='text-2xl font-bold text-gray-900'>Risk Factors Analysis</h3>
                {calculateRiskFactors(selectedSupplier).map((factor, index) => (
                  <motion.div
                    key={factor.category}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className='bg-gray-50 rounded-2xl p-6'
                  >
                    <div className='flex items-center justify-between mb-4'>
                      <div className='flex items-center gap-3'>
                        {getStatusIcon(factor.status)}
                        <h4 className='text-lg font-bold text-gray-900'>{factor.category}</h4>
                        <span className='text-sm text-gray-500'>Weight: {factor.weight}%</span>
                      </div>
                      <div className='flex items-center gap-3'>
                        {getTrendIcon(factor.trend)}
                        <span className={`text-2xl font-bold ${getScoreColor(factor.score)}`}>
                          {factor.score}
                        </span>
                      </div>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                      <div>
                        <h5 className='font-semibold text-gray-900 mb-2'>Key Metrics</h5>
                        <ul className='space-y-1'>
                          {factor.details.map((detail, i) => (
                            <li key={i} className='text-sm text-gray-600 flex items-center gap-2'>
                              <span>✅</span>
                              {detail}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className='font-semibold text-gray-900 mb-2'>Recommendations</h5>
                        <ul className='space-y-1'>
                          {factor.recommendations.map((rec, i) => (
                            <li key={i} className='text-sm text-gray-600 flex items-center gap-2'>
                              <span>↑</span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Supplier Details */}
              <div className='mt-8 grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='bg-gray-50 rounded-2xl p-6'>
                  <h4 className='text-lg font-bold text-gray-900 mb-4'>Company Information</h4>
                  <div className='space-y-3 text-sm'>
                    <div className='flex items-center gap-2'>
                      <span>📅</span>
                      <span>Established: {selectedSupplier.establishedYear}</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <span>👤</span>
                      <span>Employees: {selectedSupplier.employeeCount}</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <span>$</span>
                      <span>Annual Revenue: {selectedSupplier.annualRevenue}</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <span>📄</span>
                      <span>GST: {selectedSupplier.gstNumber}</span>
                    </div>
                  </div>
                </div>

                <div className='bg-gray-50 rounded-2xl p-6'>
                  <h4 className='text-lg font-bold text-gray-900 mb-4'>Contact Information</h4>
                  <div className='space-y-3 text-sm'>
                    <div className='flex items-center gap-2'>
                      <span>📧</span>
                      <span>{selectedSupplier.contactEmail}</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <span>📞</span>
                      <span>{selectedSupplier.contactPhone}</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <span>👁️</span>
                      <span>{selectedSupplier.website}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
