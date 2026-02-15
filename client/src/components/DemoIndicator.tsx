'use client';

import React from 'react';

interface DemoIndicatorProps {
  variant?: 'banner' | 'badge' | 'card' | 'compact';
  type?: 'rfq' | 'product' | 'category' | 'general';
  showStats?: boolean;
  className?: string;
}

export default function DemoIndicator({
  variant = 'badge',
  type = 'general',
  showStats = false,
  className = '',
}: DemoIndicatorProps) {
  const getIcon = () => {
    switch (type) {
      case 'rfq':
        return <span>🕐</span>;
      case 'product':
        return <Sparkles className='w-4 h-4' />;
      case 'category':
        return <span>📈</span>;
      default:
        return <span>👁️</span>;
    }
  };

  const getText = () => {
    switch (type) {
      case 'rfq':
        return 'Demo RFQ';
      case 'product':
        return 'Demo Product';
      case 'category':
        return 'Demo Category';
      default:
        return 'Demo Content';
    }
  };

  const getDescription = () => {
    switch (type) {
      case 'rfq':
        return 'Sample requirement for platform demonstration';
      case 'product':
        return 'Sample product for platform showcase';
      case 'category':
        return 'Category populated with demo content';
      default:
        return 'Demonstration content for platform preview';
    }
  };

  if (variant === 'banner') {
    return (
      <div
        className={`bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6 ${className}`}
      >
        <div className='flex items-start gap-3'>
          <div className='flex-shrink-0 mt-0.5'>
            <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center'>
              <span>👁️</span>
            </div>
          </div>
          <div className='flex-1'>
            <div className='flex items-center gap-2 mb-2'>
              <h3 className='text-lg font-semibold text-blue-900'>
                🚀 Bell24H Marketplace Demonstration
              </h3>
              <span className='px-2 py-0.5 bg-blue-600 text-white text-xs font-medium rounded-full'>
                PREVIEW
              </span>
            </div>
            <p className='text-blue-800 text-sm leading-relaxed mb-3'>
              You're experiencing a fully functional B2B marketplace with{' '}
              <strong>1000+ demo RFQs</strong> across
              <strong> 52 professional categories</strong>. This showcase demonstrates
              enterprise-grade features ready for real business operations.
            </p>
            {showStats && (
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mt-4'>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-blue-700'>1000+</div>
                  <div className='text-xs text-blue-600'>Demo RFQs</div>
                </div>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-blue-700'>52</div>
                  <div className='text-xs text-blue-600'>Categories</div>
                </div>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-blue-700'>20+</div>
                  <div className='text-xs text-blue-600'>Business Hubs</div>
                </div>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-blue-700'>Fortune 500</div>
                  <div className='text-xs text-blue-600'>Ready</div>
                </div>
              </div>
            )}
            <div className='mt-4 text-xs text-blue-700'>
              💡 <strong>Ready for Production:</strong> Replace demo content with real supplier data
              for live marketplace operations
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div
        className={`bg-white border border-orange-200 rounded-lg shadow-sm overflow-hidden ${className}`}
      >
        <div className='bg-orange-50 px-4 py-3 border-b border-orange-200'>
          <div className='flex items-center gap-2'>
            <AlertCircle className='w-5 h-5 text-orange-600' />
            <h4 className='font-semibold text-orange-900'>Demo Content Notice</h4>
            <span className='px-2 py-0.5 bg-orange-200 text-orange-800 text-xs font-medium rounded'>
              PREVIEW
            </span>
          </div>
        </div>
        <div className='p-4'>
          <p className='text-sm text-gray-700 leading-relaxed'>
            This marketplace showcases <strong>professional B2B functionality</strong> with
            realistic demo content. All RFQs, products, and company names are generated for
            demonstration purposes.
          </p>
          <div className='mt-4 grid grid-cols-2 gap-4 text-sm'>
            <div className='flex items-center gap-2 text-gray-600'>
              <span>👤</span>
              <span>Enterprise Companies</span>
            </div>
            <div className='flex items-center gap-2 text-gray-600'>
              <span>📈</span>
              <span>Real Market Data</span>
            </div>
          </div>
          <div className='mt-4 pt-4 border-t border-gray-200'>
            <p className='text-xs text-gray-500'>
              <strong>Production Ready:</strong> Replace with verified supplier network for live
              operations
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div
        className={`inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium ${className}`}
      >
        {getIcon()}
        <span>{getText()}</span>
      </div>
    );
  }

  // Default badge variant
  return (
    <div
      className={`inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium ${className}`}
    >
      {getIcon()}
      <span>{getText()}</span>
      <span className='w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse'></span>
    </div>
  );
}

// Specialized demo indicators for different contexts
export const RFQDemoIndicator = () => <DemoIndicator variant='compact' type='rfq' />;

export const ProductDemoIndicator = () => <DemoIndicator variant='compact' type='product' />;

export const CategoryDemoIndicator = () => <DemoIndicator variant='compact' type='category' />;

export const MarketplaceDemoBanner = () => <DemoIndicator variant='banner' showStats={true} />;

export const DemoContentCard = () => <DemoIndicator variant='card' />;
