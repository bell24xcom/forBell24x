'use client';

import React, { useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

// Lazy load heavy components with proper loading states
const AIInsightsDashboard = dynamic(() => import('@/components/AIInsightsDashboard'), {
  loading: () => <ComponentLoadingState />,
  ssr: false,
});

const PredictiveAnalytics = dynamic(() => import('@/components/PredictiveAnalyticsDashboard'), {
  loading: () => <ComponentLoadingState />,
  ssr: false,
});

// Placeholder for VoiceRFQComponent - will be implemented separately
const VoiceRFQComponent = () => (
  <div className='p-8 text-center'>
    <div className='mb-4'>
      <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto'>
        <span>🎤</span>
      </div>
    </div>
    <h3 className='text-lg font-semibold text-gray-900 mb-2'>Voice RFQ System</h3>
    <p className='text-gray-600 mb-4'>
      AI-powered voice recognition for requirement capture with 98.5% accuracy
    </p>
    <div className='space-y-2'>
      <div className='bg-green-50 p-3 rounded-lg'>
        <p className='text-sm text-green-800 font-medium'>✓ Real-time transcription</p>
      </div>
      <div className='bg-blue-50 p-3 rounded-lg'>
        <p className='text-sm text-blue-800 font-medium'>✓ AI categorization</p>
      </div>
      <div className='bg-purple-50 p-3 rounded-lg'>
        <p className='text-sm text-purple-800 font-medium'>✓ Instant supplier matching</p>
      </div>
    </div>
    <Link
      href='/voice-rfq'
      className='mt-4 inline-flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors'
    >
      <span>🎤</span>
      <span>Start Voice RFQ</span>
    </Link>
  </div>
);

const RiskScoringDashboard = dynamic(() => import('@/components/RiskScoringDashboard'), {
  loading: () => <ComponentLoadingState />,
  ssr: false,
});

function ComponentLoadingState() {
  return (
    <div className='flex flex-col items-center justify-center p-12 space-y-4'>
      <div className='relative'>
        <Loader2 className='h-8 w-8 animate-spin text-blue-600' />
        <div className='absolute inset-0 h-8 w-8 animate-ping bg-blue-400 rounded-full opacity-20'></div>
      </div>
      <div className='text-center'>
        <p className='text-lg font-medium text-gray-900'>Loading AI Component...</p>
        <p className='text-sm text-gray-600'>Initializing advanced analytics</p>
      </div>
      <div className='w-full max-w-xs bg-gray-200 rounded-full h-2'>
        <div className='bg-blue-600 h-2 rounded-full animate-pulse' style={{ width: '60%' }}></div>
      </div>
    </div>
  );
}

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  component?:
    | 'ai-insights'
    | 'predictive-analytics'
    | 'voice-rfq'
    | 'risk-scoring'
    | 'supply-chain'
    | 'delivery-tracking';
  href?: string;
  badge?: string;
  metrics?: {
    accuracy?: string;
    speed?: string;
    value?: string;
  };
  onClick?: () => void;
  expandable?: boolean;
}

export function FeatureCard({
  title,
  description,
  icon,
  component,
  href,
  badge,
  metrics,
  onClick,
  expandable = true,
}: FeatureCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (href) {
      // External navigation
      window.location.href = href;
      return;
    }

    if (!expandable) {
      onClick?.();
      return;
    }

    // Inline expansion with loading state
    setIsLoading(true);

    // Simulate brief loading for UX (actual components load via dynamic import)
    setTimeout(() => {
      setIsLoading(false);
      setIsExpanded(true);
      onClick?.();
    }, 300);
  };

  const renderComponent = () => {
    if (!component) return null;

    switch (component) {
      case 'ai-insights':
        return (
          <Suspense fallback={<ComponentLoadingState />}>
            <AIInsightsDashboard />
          </Suspense>
        );
      case 'predictive-analytics':
        return (
          <Suspense fallback={<ComponentLoadingState />}>
            <PredictiveAnalytics />
          </Suspense>
        );
      case 'voice-rfq':
        return (
          <Suspense fallback={<ComponentLoadingState />}>
            <VoiceRFQComponent />
          </Suspense>
        );
      case 'risk-scoring':
        return (
          <Suspense fallback={<ComponentLoadingState />}>
            <RiskScoringDashboard />
          </Suspense>
        );
      default:
        return (
          <div className='p-8 text-center'>
            <div className='mb-4'>
              <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto'>
                {icon}
              </div>
            </div>
            <h3 className='text-lg font-semibold text-gray-900 mb-2'>{title}</h3>
            <p className='text-gray-600'>This feature is coming soon. Stay tuned for updates!</p>
            <div className='mt-4'>
              <span className='bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium'>
                Coming Soon
              </span>
            </div>
          </div>
        );
    }
  };

  if (isExpanded) {
    return (
      <div className='col-span-full'>
        <div className='bg-white rounded-xl shadow-sm border border-gray-200'>
          <div className='p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50 rounded-t-xl'>
            <div className='flex items-center space-x-3'>
              <div className='w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center'>
                {icon}
              </div>
              <div>
                <h3 className='text-lg font-semibold text-gray-900'>{title}</h3>
                <p className='text-sm text-gray-600'>{description}</p>
              </div>
            </div>
            <div className='flex items-center space-x-2'>
              {href && (
                <Link
                  href={href}
                  className='flex items-center space-x-1 bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors'
                >
                  <span>🔗</span>
                  <span>Open Full View</span>
                </Link>
              )}
              <button
                onClick={() => setIsExpanded(false)}
                className='text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100'
              >
                <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M6 18L18 6M6 6l12 12'
                  />
                </svg>
              </button>
            </div>
          </div>
          <div className='relative'>{renderComponent()}</div>
        </div>
      </div>
    );
  }

  return (
    <div className='relative group'>
      {/* Badge */}
      {badge && (
        <div
          className={`absolute -top-2 -right-2 px-2 py-1 rounded-full text-xs font-medium z-10 ${
            badge === 'New'
              ? 'bg-green-100 text-green-800'
              : badge === 'Premium'
              ? 'bg-purple-100 text-purple-800'
              : badge === 'Enterprise'
              ? 'bg-blue-100 text-blue-800'
              : badge === 'Beta'
              ? 'bg-orange-100 text-orange-800'
              : badge === 'Coming Soon'
              ? 'bg-gray-100 text-gray-800'
              : badge === 'Active'
              ? 'bg-green-100 text-green-800'
              : 'bg-amber-100 text-amber-800'
          }`}
        >
          {badge}
        </div>
      )}

      {/* Main Card */}
      <div
        onClick={handleClick}
        className='bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200 cursor-pointer group-hover:border-blue-300 relative overflow-hidden'
      >
        {/* Loading Overlay */}
        {isLoading && (
          <div className='absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-20'>
            <div className='flex items-center space-x-2'>
              <Loader2 className='h-5 w-5 animate-spin text-blue-600' />
              <span className='text-sm text-gray-600'>Loading...</span>
            </div>
          </div>
        )}

        <div className='p-6'>
          {/* Header */}
          <div className='flex items-start justify-between mb-4'>
            <div className='w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center group-hover:from-blue-500 group-hover:to-purple-500 transition-all duration-300 group-hover:scale-110'>
              <div className='text-blue-600 group-hover:text-white transition-colors'>{icon}</div>
            </div>
            {expandable && (
              <div className='opacity-0 group-hover:opacity-100 transition-opacity'>
                <span>→</span>
              </div>
            )}
          </div>

          {/* Content */}
          <h3 className='text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors'>
            {title}
          </h3>
          <p className='text-gray-600 text-sm mb-4 line-clamp-2'>{description}</p>

          {/* Metrics */}
          {metrics && (
            <div className='grid grid-cols-3 gap-2 mb-4'>
              {metrics.accuracy && (
                <div className='text-center'>
                  <div className='text-xs font-medium text-green-600'>{metrics.accuracy}</div>
                  <div className='text-xs text-gray-500'>Accuracy</div>
                </div>
              )}
              {metrics.speed && (
                <div className='text-center'>
                  <div className='text-xs font-medium text-blue-600'>{metrics.speed}</div>
                  <div className='text-xs text-gray-500'>Speed</div>
                </div>
              )}
              {metrics.value && (
                <div className='text-center'>
                  <div className='text-xs font-medium text-purple-600'>{metrics.value}</div>
                  <div className='text-xs text-gray-500'>Value</div>
                </div>
              )}
            </div>
          )}

          {/* Action */}
          <div className='flex items-center justify-between'>
            <span className='text-blue-600 text-sm font-medium group-hover:text-blue-700 transition-colors'>
              {expandable ? 'Click to explore' : 'View details'} →
            </span>
            {component && (
              <div className='flex items-center space-x-1 text-xs text-gray-500'>
                <span>⚡</span>
                <span>AI-Powered</span>
              </div>
            )}
          </div>
        </div>

        {/* Hover Effect */}
        <div className='absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-300'></div>
      </div>
    </div>
  );
}

// Quick Stats Card Component
export function QuickStatsCard({
  label,
  value,
  change,
  icon,
  color = 'blue',
}: {
  label: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  color?: 'blue' | 'green' | 'purple' | 'amber' | 'red';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
  };

  const changeColor = change.startsWith('+') ? 'text-green-600' : 'text-red-600';

  return (
    <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow'>
      <div className='flex items-center justify-between'>
        <div className='flex-1'>
          <p className='text-sm font-medium text-gray-600 mb-1'>{label}</p>
          <p className='text-2xl font-bold text-gray-900 mb-1'>{value}</p>
          <p className={`text-sm font-medium ${changeColor}`}>{change} vs last month</p>
        </div>
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color]}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
