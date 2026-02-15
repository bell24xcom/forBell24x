'use client';

import AIExplainability from '@/components/AIExplainability';
import StockMarketDashboard from '@/components/StockMarketDashboard';
import SupplierRiskScore from '@/components/SupplierRiskScore';
import VoiceRFQ from '@/components/VoiceRFQ';
import {
  ArrowRight,
  Brain,
  Building2,
  CheckCircle,
  CreditCard,
  Globe,
  Mic,
  Shield,
  Star,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function AIFeaturesDashboard() {
  const [activeTab, setActiveTab] = useState('voice');
  const [showExplainability, setShowExplainability] = useState(false);
  const [showRiskScore, setShowRiskScore] = useState(false);
  const [showStockMarket, setShowStockMarket] = useState(false);

  const tabs = [
    {
      id: 'voice',
      name: 'Voice RFQ',
      icon: Mic,
      description: 'Create RFQs using natural voice commands',
    },
    {
      id: 'explain',
      name: 'AI Explainability',
      icon: Brain,
      description: 'Understand why suppliers match your needs',
    },
    {
      id: 'risk',
      name: 'Risk Scoring',
      icon: Shield,
      description: 'ML-powered supplier risk assessment',
    },
    {
      id: 'market',
      name: 'Market Data',
      icon: TrendingUp,
      description: 'Real-time stock market and commodity data',
    },
  ];

  const featureStats = [
    { label: 'Voice RFQs Created', value: '2,847', icon: Mic, color: 'text-blue-600' },
    { label: 'AI Explanations Generated', value: '15,234', icon: Brain, color: 'text-purple-600' },
    { label: 'Suppliers Analyzed', value: '8,956', icon: Shield, color: 'text-green-600' },
    { label: 'Market Signals', value: '1,234', icon: TrendingUp, color: 'text-orange-600' },
  ];

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-purple-50'>
      <div className='max-w-7xl mx-auto px-4 py-8'>
        {/* Enhanced Header */}
        <div className='text-center mb-12'>
          <div className='flex items-center justify-center space-x-3 mb-4'>
            <div className='w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center'>
              <Brain className='w-6 h-6 text-white' />
            </div>
            <h1 className='text-4xl font-bold text-gray-900'>Bell24h AI Features Dashboard</h1>
          </div>
          <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
            Experience the future of B2B commerce with cutting-edge AI features powered by advanced
            machine learning
          </p>
          <div className='flex items-center justify-center space-x-4 mt-4'>
            <div className='flex items-center space-x-2 text-green-600'>
              <CheckCircle className='w-5 h-5' />
              <span className='text-sm font-medium'>All Features Live</span>
            </div>
            <div className='flex items-center space-x-2 text-blue-600'>
              <Zap className='w-5 h-5' />
              <span className='text-sm font-medium'>Real-time Processing</span>
            </div>
            <div className='flex items-center space-x-2 text-purple-600'>
              <Globe className='w-5 h-5' />
              <span className='text-sm font-medium'>Global Coverage</span>
            </div>
          </div>
        </div>

        {/* Feature Stats */}
        <div className='grid md:grid-cols-4 gap-6 mb-12'>
          {featureStats.map((stat, index) => (
            <div
              key={index}
              className='bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow duration-300'
            >
              <div
                className={`w-12 h-12 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl flex items-center justify-center mx-auto mb-4`}
              >
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className='text-3xl font-bold text-gray-900 mb-2'>{stat.value}</div>
              <div className='text-sm text-gray-600'>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Enhanced Feature Overview Cards */}
        <div className='grid md:grid-cols-4 gap-6 mb-12'>
          <div className='bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-all duration-300 group'>
            <div className='w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300'>
              <Mic className='w-8 h-8 text-white' />
            </div>
            <h3 className='text-lg font-semibold mb-2'>Voice RFQ</h3>
            <p className='text-gray-600 text-sm mb-4'>Create RFQs using natural voice commands</p>
            <div className='flex items-center justify-center space-x-2'>
              <span className='bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium'>
                LIVE
              </span>
              <span className='text-xs text-gray-500'>99.2% Accuracy</span>
            </div>
          </div>
          <div className='bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-all duration-300 group'>
            <div className='w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300'>
              <Brain className='w-8 h-8 text-white' />
            </div>
            <h3 className='text-lg font-semibold mb-2'>AI Explainability</h3>
            <p className='text-gray-600 text-sm mb-4'>Understand why suppliers match your needs</p>
            <div className='flex items-center justify-center space-x-2'>
              <span className='bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium'>
                LIVE
              </span>
              <span className='text-xs text-gray-500'>SHAP Analysis</span>
            </div>
          </div>
          <div className='bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-all duration-300 group'>
            <div className='w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300'>
              <Shield className='w-8 h-8 text-white' />
            </div>
            <h3 className='text-lg font-semibold mb-2'>Risk Scoring</h3>
            <p className='text-gray-600 text-sm mb-4'>ML-powered supplier risk assessment</p>
            <div className='flex items-center justify-center space-x-2'>
              <span className='bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium'>
                LIVE
              </span>
              <span className='text-xs text-gray-500'>Real-time</span>
            </div>
          </div>
          <div className='bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-all duration-300 group'>
            <div className='w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300'>
              <TrendingUp className='w-8 h-8 text-white' />
            </div>
            <h3 className='text-lg font-semibold mb-2'>Market Intelligence</h3>
            <p className='text-gray-600 text-sm mb-4'>Real-time stock market and commodity data</p>
            <div className='flex items-center justify-center space-x-2'>
              <span className='bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium'>
                LIVE
              </span>
              <span className='text-xs text-gray-500'>Live Data</span>
            </div>
          </div>
        </div>

        {/* Enhanced Tab Navigation */}
        <div className='bg-white rounded-3xl shadow-2xl p-8'>
          <div className='border-b border-gray-200 mb-8'>
            <nav className='flex space-x-8 overflow-x-auto'>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-6 border-b-2 font-medium text-sm whitespace-nowrap transition-all duration-200 flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50 rounded-t-lg'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className='w-5 h-5' />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Enhanced Tab Content */}
          <div className='min-h-[600px]'>
            {activeTab === 'voice' && (
              <div>
                <div className='mb-8'>
                  <h2 className='text-3xl font-bold text-gray-900 mb-4'>Voice RFQ Creation</h2>
                  <p className='text-gray-600 text-lg'>
                    Create detailed RFQs using natural voice commands with our advanced speech
                    recognition technology.
                  </p>
                </div>
                <div className='grid lg:grid-cols-2 gap-8'>
                  <div>
                    <h3 className='text-xl font-semibold mb-6 text-gray-900'>
                      How Voice RFQ Works
                    </h3>
                    <div className='space-y-6'>
                      <div className='flex items-start space-x-4'>
                        <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0'>
                          <span className='text-blue-600 font-semibold'>1</span>
                        </div>
                        <div>
                          <h4 className='font-semibold text-gray-900'>Speak Your Requirements</h4>
                          <p className='text-gray-600'>
                            Simply describe your product needs, specifications, and quantity
                            requirements in natural language.
                          </p>
                        </div>
                      </div>
                      <div className='flex items-start space-x-4'>
                        <div className='w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0'>
                          <span className='text-purple-600 font-semibold'>2</span>
                        </div>
                        <div>
                          <h4 className='font-semibold text-gray-900'>AI Processing</h4>
                          <p className='text-gray-600'>
                            Our AI extracts key information and creates a structured RFQ with all
                            necessary details.
                          </p>
                        </div>
                      </div>
                      <div className='flex items-start space-x-4'>
                        <div className='w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0'>
                          <span className='text-green-600 font-semibold'>3</span>
                        </div>
                        <div>
                          <h4 className='font-semibold text-gray-900'>Smart Matching</h4>
                          <p className='text-gray-600'>
                            Get matched with the best suppliers based on your requirements and
                            supplier capabilities.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <VoiceRFQ 
                      userId="demo-user-123"
                      onRFQCreated={(rfqData) => {
                        console.log('RFQ Created:', rfqData);
                        // Handle RFQ creation
                      }} 
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'explain' && (
              <div>
                <div className='mb-8'>
                  <h2 className='text-3xl font-bold text-gray-900 mb-4'>AI Explainability</h2>
                  <p className='text-gray-600 text-lg'>
                    Understand why specific suppliers are matched with your requirements using
                    advanced AI explainability techniques.
                  </p>
                </div>
                <div className='grid lg:grid-cols-2 gap-8'>
                  <div>
                    <h3 className='text-xl font-semibold mb-6 text-gray-900'>
                      How AI Explainability Works
                    </h3>
                    <div className='space-y-6'>
                      <div className='flex items-start space-x-4'>
                        <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0'>
                          <span className='text-blue-600 font-semibold'>1</span>
                        </div>
                        <div>
                          <h4 className='font-semibold text-gray-900'>Match Analysis</h4>
                          <p className='text-gray-600'>
                            Our AI analyzes why a supplier matches your requirements based on
                            multiple factors.
                          </p>
                        </div>
                      </div>
                      <div className='flex items-start space-x-4'>
                        <div className='w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0'>
                          <span className='text-purple-600 font-semibold'>2</span>
                        </div>
                        <div>
                          <h4 className='font-semibold text-gray-900'>Feature Importance</h4>
                          <p className='text-gray-600'>
                            See which factors contributed most to the matching decision using SHAP
                            analysis.
                          </p>
                        </div>
                      </div>
                      <div className='flex items-start space-x-4'>
                        <div className='w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0'>
                          <span className='text-green-600 font-semibold'>3</span>
                        </div>
                        <div>
                          <h4 className='font-semibold text-gray-900'>Clear Explanation</h4>
                          <p className='text-gray-600'>
                            Get human-readable explanations of why this supplier is the best match
                            for your needs.
                          </p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowExplainability(true)}
                      className='mt-6 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2'
                    >
                      <Brain className='w-5 h-5' />
                      <span>Try AI Explainability</span>
                      <ArrowRight className='w-5 h-5' />
                    </button>
                  </div>
                  <div className='bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6'>
                    <h3 className='text-xl font-semibold mb-4 text-gray-900'>Key Benefits</h3>
                    <div className='space-y-4'>
                      <div className='flex items-center space-x-3'>
                        <CheckCircle className='w-5 h-5 text-green-600' />
                        <span className='text-gray-700'>Transparent decision-making</span>
                      </div>
                      <div className='flex items-center space-x-3'>
                        <CheckCircle className='w-5 h-5 text-green-600' />
                        <span className='text-gray-700'>Build trust with suppliers</span>
                      </div>
                      <div className='flex items-center space-x-3'>
                        <CheckCircle className='w-5 h-5 text-green-600' />
                        <span className='text-gray-700'>Optimize supplier selection</span>
                      </div>
                      <div className='flex items-center space-x-3'>
                        <CheckCircle className='w-5 h-5 text-green-600' />
                        <span className='text-gray-700'>Reduce procurement risks</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'risk' && (
              <div>
                <div className='mb-8'>
                  <h2 className='text-3xl font-bold text-gray-900 mb-4'>Supplier Risk Scoring</h2>
                  <p className='text-gray-600 text-lg'>
                    Advanced ML-powered risk assessment for suppliers with real-time monitoring and
                    predictive analytics.
                  </p>
                </div>
                <div className='grid lg:grid-cols-2 gap-8'>
                  <div>
                    <h3 className='text-xl font-semibold mb-6 text-gray-900'>
                      Risk Assessment Factors
                    </h3>
                    <div className='space-y-6'>
                      <div className='flex items-start space-x-4'>
                        <div className='w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0'>
                          <Shield className='w-4 h-4 text-red-600' />
                        </div>
                        <div>
                          <h4 className='font-semibold text-gray-900'>Financial Health</h4>
                          <p className='text-gray-600'>
                            Credit rating, payment history, and financial stability analysis.
                          </p>
                        </div>
                      </div>
                      <div className='flex items-start space-x-4'>
                        <div className='w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0'>
                          <Users className='w-4 h-4 text-yellow-600' />
                        </div>
                        <div>
                          <h4 className='font-semibold text-gray-900'>Operational Risk</h4>
                          <p className='text-gray-600'>
                            Production capacity, quality standards, and delivery reliability.
                          </p>
                        </div>
                      </div>
                      <div className='flex items-start space-x-4'>
                        <div className='w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0'>
                          <Globe className='w-4 h-4 text-green-600' />
                        </div>
                        <div>
                          <h4 className='font-semibold text-gray-900'>Market Position</h4>
                          <p className='text-gray-600'>
                            Market share, competitive position, and industry reputation.
                          </p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowRiskScore(true)}
                      className='mt-6 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2'
                    >
                      <Shield className='w-5 h-5' />
                      <span>View Risk Analysis</span>
                      <ArrowRight className='w-5 h-5' />
                    </button>
                  </div>
                  <div className='bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-6'>
                    <h3 className='text-xl font-semibold mb-4 text-gray-900'>Risk Categories</h3>
                    <div className='space-y-4'>
                      <div className='flex items-center justify-between'>
                        <span className='text-gray-700'>Low Risk</span>
                        <span className='text-green-600 font-semibold'>0-30%</span>
                      </div>
                      <div className='flex items-center justify-between'>
                        <span className='text-gray-700'>Medium Risk</span>
                        <span className='text-yellow-600 font-semibold'>31-60%</span>
                      </div>
                      <div className='flex items-center justify-between'>
                        <span className='text-gray-700'>High Risk</span>
                        <span className='text-red-600 font-semibold'>61-100%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'market' && (
              <div>
                <div className='mb-8'>
                  <h2 className='text-3xl font-bold text-gray-900 mb-4'>Market Intelligence</h2>
                  <p className='text-gray-600 text-lg'>
                    Real-time stock market data, commodity prices, and market trends to inform your
                    B2B decisions.
                  </p>
                </div>
                <div className='grid lg:grid-cols-2 gap-8'>
                  <div>
                    <h3 className='text-xl font-semibold mb-6 text-gray-900'>
                      Market Data Sources
                    </h3>
                    <div className='space-y-6'>
                      <div className='flex items-start space-x-4'>
                        <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0'>
                          <TrendingUp className='w-4 h-4 text-blue-600' />
                        </div>
                        <div>
                          <h4 className='font-semibold text-gray-900'>Stock Market Data</h4>
                          <p className='text-gray-600'>
                            Real-time data from major stock exchanges and indices.
                          </p>
                        </div>
                      </div>
                      <div className='flex items-start space-x-4'>
                        <div className='w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0'>
                          <Star className='w-4 h-4 text-orange-600' />
                        </div>
                        <div>
                          <h4 className='font-semibold text-gray-900'>Commodity Prices</h4>
                          <p className='text-gray-600'>
                            Live prices for metals, energy, and agricultural commodities.
                          </p>
                        </div>
                      </div>
                      <div className='flex items-start space-x-4'>
                        <div className='w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0'>
                          <Globe className='w-4 h-4 text-green-600' />
                        </div>
                        <div>
                          <h4 className='font-semibold text-gray-900'>Global Trends</h4>
                          <p className='text-gray-600'>
                            Market trends and economic indicators from around the world.
                          </p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowStockMarket(true)}
                      className='mt-6 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2'
                    >
                      <TrendingUp className='w-5 h-5' />
                      <span>View Market Data</span>
                      <ArrowRight className='w-5 h-5' />
                    </button>
                  </div>
                  <div>
                    <StockMarketDashboard />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className='mt-12 bg-white rounded-2xl shadow-lg p-8'>
          <h3 className='text-2xl font-bold text-gray-900 mb-6 text-center'>Quick Actions</h3>
          <div className='grid md:grid-cols-3 gap-6'>
            <Link
              href='/dashboard/voice-rfq'
              className='bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl hover:shadow-lg transition-all duration-300 group'
            >
              <div className='flex items-center space-x-3 mb-4'>
                <Mic className='w-6 h-6' />
                <h4 className='text-lg font-semibold'>Create Voice RFQ</h4>
              </div>
              <p className='text-blue-100'>Start creating RFQs using voice commands</p>
              <ArrowRight className='w-5 h-5 mt-4 group-hover:translate-x-2 transition-transform' />
            </Link>
            <Link
              href='/supplier/SUP001'
              className='bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl hover:shadow-lg transition-all duration-300 group'
            >
              <div className='flex items-center space-x-3 mb-4'>
                <Building2 className='w-6 h-6' />
                <h4 className='text-lg font-semibold'>View Supplier Profile</h4>
              </div>
              <p className='text-green-100'>Explore detailed supplier information</p>
              <ArrowRight className='w-5 h-5 mt-4 group-hover:translate-x-2 transition-transform' />
            </Link>
            <Link
              href='/fintech'
              className='bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl hover:shadow-lg transition-all duration-300 group'
            >
              <div className='flex items-center space-x-3 mb-4'>
                <CreditCard className='w-6 h-6' />
                <h4 className='text-lg font-semibold'>Fintech Services</h4>
              </div>
              <p className='text-purple-100'>Access invoice discounting and finance</p>
              <ArrowRight className='w-5 h-5 mt-4 group-hover:translate-x-2 transition-transform' />
            </Link>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showExplainability && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-2xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto'>
            <div className='flex justify-between items-center mb-6'>
              <h3 className='text-2xl font-bold text-gray-900'>AI Explainability Demo</h3>
              <button
                onClick={() => setShowExplainability(false)}
                className='text-gray-500 hover:text-gray-700'
              >
                ✕
              </button>
            </div>
            <AIExplainability />
          </div>
        </div>
      )}

      {showRiskScore && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-2xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto'>
            <div className='flex justify-between items-center mb-6'>
              <h3 className='text-2xl font-bold text-gray-900'>Supplier Risk Analysis</h3>
              <button
                onClick={() => setShowRiskScore(false)}
                className='text-gray-500 hover:text-gray-700'
              >
                ✕
              </button>
            </div>
            <SupplierRiskScore />
          </div>
        </div>
      )}

      {showStockMarket && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-2xl p-8 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto'>
            <div className='flex justify-between items-center mb-6'>
              <h3 className='text-2xl font-bold text-gray-900'>Market Intelligence Dashboard</h3>
              <button
                onClick={() => setShowStockMarket(false)}
                className='text-gray-500 hover:text-gray-700'
              >
                ✕
              </button>
            </div>
            <StockMarketDashboard />
          </div>
        </div>
      )}
    </div>
  );
}
