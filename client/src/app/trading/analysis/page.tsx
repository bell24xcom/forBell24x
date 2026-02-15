'use client';
import React from 'react';
import { Target } from 'lucide-react';

export default function AnalysisPage() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-blue-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='text-center py-20'>
          <span>??</span>
          <h1 className='text-3xl font-bold text-slate-900 mb-4'>Market Analysis</h1>
          <p className='text-slate-600 mb-8 max-w-2xl mx-auto'>
            Advanced market analysis tools and insights for commodity trading decisions. Technical
            indicators, price forecasts, and market sentiment analysis.
          </p>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto'>
            <div className='bg-white p-6 rounded-xl shadow-sm border'>
              <span>??</span>
              <h3 className='text-lg font-semibold text-slate-900'>Technical Analysis</h3>
              <p className='text-slate-600 text-sm'>Price charts, indicators, and patterns</p>
            </div>
            <div className='bg-white p-6 rounded-xl shadow-sm border'>
              <Target className='text-blue-600 mb-4' size={48} />
              <h3 className='text-lg font-semibold text-slate-900'>Price Forecasting</h3>
              <p className='text-slate-600 text-sm'>AI-powered price predictions</p>
            </div>
            <div className='bg-white p-6 rounded-xl shadow-sm border'>
              <span>??</span>
              <h3 className='text-lg font-semibold text-slate-900'>Market Sentiment</h3>
              <p className='text-slate-600 text-sm'>Real-time market mood analysis</p>
            </div>
          </div>

          <div className='mt-12 bg-amber-50 border border-amber-200 rounded-xl p-6 max-w-3xl mx-auto'>
            <p className='text-amber-800'>
              <strong>Advanced Market Analysis</strong> - Coming in Phase 2 P3. This section will
              feature comprehensive technical analysis tools, AI-powered forecasting, and
              institutional-grade market insights.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
