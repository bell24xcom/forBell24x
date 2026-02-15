'use client';

import { Award, CheckCircle, Globe, Shield, Users, Zap } from 'lucide-react';

export default function EnterpriseDemoPage() {
  const demoFeatures = [
    {
      id: 'smart-matching',
      title: 'AI-Powered Smart Matching',
      description: 'Advanced algorithms match buyers with the most relevant suppliers',
      revenue: '₹25+ Cr',
      metrics: '95% match accuracy, 70% faster procurement',
    },
    {
      id: 'esg-scoring',
      title: 'ESG Compliance Platform',
      description: 'Comprehensive ESG scoring and sustainability tracking',
      revenue: '₹15+ Cr',
      metrics: 'Real-time ESG monitoring, 85% compliance improvement',
    },
    {
      id: 'trading-platform',
      title: 'B2B Trading Exchange',
      description: 'Real-time commodity trading with market insights',
      revenue: '₹12+ Cr',
      metrics: '24/7 trading, 0.1% transaction fees',
    },
    {
      id: 'smart-escrow',
      title: 'Smart Contract Escrow',
      description: 'Blockchain-secured payments and automated dispute resolution',
      revenue: '₹18+ Cr',
      metrics: '99.9% transaction security, instant settlements',
    },
  ];

  const enterpriseStats = [
    { label: 'Enterprise Clients', value: '500+', icon: Users },
    { label: 'Transaction Success', value: '99.8%', icon: CheckCircle },
    { label: 'Processing Speed', value: '<2 sec', icon: Zap },
    { label: 'Global Reach', value: '25+ Countries', icon: Globe },
    { label: 'Security Rating', value: 'AAA+', icon: Shield },
    { label: 'Countries Served', value: '150+', icon: Globe },
  ];

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900'>
      {/* Hero Section */}
      <div className='relative overflow-hidden'>
        <div className='absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10'></div>
        <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20'>
          <div className='text-center'>
            <div className='inline-flex items-center px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-sm font-medium mb-6'>
              <Award className='w-4 h-4 mr-2' />
              Fortune 500 Ready Enterprise Solution
            </div>

            <h1 className='text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6'>
              Bell24H Enterprise
              <span className='block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600'>
                Demo Experience
              </span>
            </h1>

            <p className='text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto'>
              Experience the complete B2B marketplace ecosystem designed for enterprise efficiency
              through integrated trading, ESG compliance, smart escrow, and AI-powered matching.
            </p>

            <div className='flex flex-col sm:flex-row gap-4 justify-center items-center'>
              <button className='group inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl'>
                <span>▶️</span>
                Start Live Demo
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16'>
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6'>
          {enterpriseStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className='text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg'
              >
                <Icon className='w-8 h-8 text-blue-600 mx-auto mb-2' />
                <div className='text-2xl font-bold text-gray-900 dark:text-white'>{stat.value}</div>
                <div className='text-sm text-gray-600 dark:text-gray-300'>{stat.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Demo Features */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16'>
        <div className='text-center mb-12'>
          <h2 className='text-4xl font-bold text-gray-900 dark:text-white mb-4'>
            Complete Enterprise Feature Set
          </h2>
          <p className='text-xl text-gray-600 dark:text-gray-300'>
            Each module is designed for maximum revenue generation and enterprise efficiency
          </p>
        </div>

        <div className='grid md:grid-cols-2 gap-8'>
          {demoFeatures.map(feature => (
            <div
              key={feature.id}
              className='group bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700'
            >
              <div className='flex items-start justify-between mb-4'>
                <div className='flex-1'>
                  <h3 className='text-2xl font-bold text-gray-900 dark:text-white mb-2'>
                    {feature.title}
                  </h3>
                  <p className='text-gray-600 dark:text-gray-300 mb-4'>{feature.description}</p>
                </div>
                <div className='text-right ml-4'>
                  <div className='text-2xl font-bold text-green-600'>{feature.revenue}</div>
                  <div className='text-sm text-gray-500'>Annual Revenue</div>
                </div>
              </div>

              <div className='text-sm text-gray-600 dark:text-gray-300'>{feature.metrics}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
