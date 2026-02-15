'use client';

import React from 'react';
import { MatchResult } from '@/lib/ai-matching';

interface SmartMatchResultsProps {
  matches: MatchResult[];
  isLoading?: boolean;
  searchQuery?: string;
}

export function SmartMatchResults({
  matches,
  isLoading = false,
  searchQuery = '',
}: SmartMatchResultsProps) {
  if (isLoading) {
    return (
      <div className='space-y-4'>
        <div className='flex items-center justify-center py-12'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
            <p className='text-gray-600'>AI is analyzing suppliers...</p>
            <p className='text-sm text-gray-500 mt-2'>
              Finding the perfect matches for your requirements
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className='text-center py-12'>
        <div className='text-gray-400 mb-4'>
          <span>📈</span>
        </div>
        <h3 className='text-lg font-semibold text-gray-900 mb-2'>No matches found</h3>
        <p className='text-gray-600'>
          Try adjusting your requirements or expanding your search criteria.
        </p>
      </div>
    );
  }

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'highly_recommended':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'recommended':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'consider':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRecommendationText = (recommendation: string) => {
    switch (recommendation) {
      case 'highly_recommended':
        return 'Highly Recommended';
      case 'recommended':
        return 'Recommended';
      case 'consider':
        return 'Consider';
      default:
        return 'Review Required';
    }
  };

  const getVerificationIcon = (level: string) => {
    switch (level) {
      case 'premium':
        return <Award className='h-4 w-4 text-yellow-500' />;
      case 'verified':
        return <span>✅</span>;
      default:
        return <span>👤</span>;
    }
  };

  return (
    <div className='space-y-6'>
      {/* Results Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold text-gray-900'>Smart Match Results</h2>
          <p className='text-gray-600 mt-1'>
            Found {matches.length} supplier{matches.length !== 1 ? 's' : ''} matching your
            requirements
          </p>
        </div>
        <div className='text-right'>
          <div className='text-sm text-gray-500'>Powered by AI</div>
          <div className='text-xs text-gray-400'>98.5% Accuracy Rate</div>
        </div>
      </div>

      {/* Match Results */}
      <div className='space-y-4'>
        {matches.map((match, index) => (
          <div
            key={match.supplier.id}
            className='bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200'
          >
            {/* Header Row */}
            <div className='flex items-start justify-between mb-4'>
              <div className='flex-1'>
                <div className='flex items-center gap-3 mb-2'>
                  <div className='flex items-center gap-2'>
                    <span className='bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full'>
                      #{index + 1}
                    </span>
                    {getVerificationIcon(match.supplier.verificationLevel)}
                  </div>
                  <h3 className='text-xl font-semibold text-gray-900'>{match.supplier.name}</h3>
                </div>

                <div className='flex items-center gap-4 text-sm text-gray-600 mb-3'>
                  <div className='flex items-center gap-1'>
                    <span>📍</span>
                    {match.supplier.location}
                  </div>
                  <div className='flex items-center gap-1'>
                    <span>⭐</span>
                    {match.supplier.rating}
                    <span className='text-gray-400'>({match.supplier.reviewCount} reviews)</span>
                  </div>
                  <div className='flex items-center gap-1'>
                    <span>🕐</span>
                    {match.supplier.responseTime}h response
                  </div>
                  <div className='flex items-center gap-1'>
                    <span>📅</span>
                    Est. {match.estimatedDelivery}
                  </div>
                </div>

                {/* Categories */}
                <div className='flex flex-wrap gap-2 mb-3'>
                  {match.supplier.categories.slice(0, 3).map(category => (
                    <span
                      key={category}
                      className='bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs font-medium'
                    >
                      {category}
                    </span>
                  ))}
                  {match.supplier.categories.length > 3 && (
                    <span className='text-gray-500 text-xs'>
                      +{match.supplier.categories.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Score and Recommendation */}
              <div className='text-right'>
                <div className='mb-2'>
                  <div className='text-2xl font-bold text-blue-600'>
                    {Math.round(match.score * 100)}%
                  </div>
                  <div className='text-xs text-gray-500'>Match Score</div>
                </div>
                <div
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getRecommendationColor(
                    match.recommendation
                  )}`}
                >
                  {getRecommendationText(match.recommendation)}
                </div>
                <div className='mt-2 text-sm text-gray-600'>
                  <div className='font-medium'>{match.estimatedPrice}</div>
                  <div className='text-xs text-gray-500'>Estimated Price</div>
                </div>
              </div>
            </div>

            {/* Confidence Bar */}
            <div className='mb-4'>
              <div className='flex items-center justify-between text-xs text-gray-600 mb-1'>
                <span>AI Confidence</span>
                <span>{Math.round(match.confidence * 100)}%</span>
              </div>
              <div className='w-full bg-gray-200 rounded-full h-2'>
                <div
                  className='bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500'
                  style={{ width: `${match.confidence * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Match Reasons and Concerns */}
            <div className='grid md:grid-cols-2 gap-4'>
              {/* Match Reasons */}
              {match.matchReasons.length > 0 && (
                <div>
                  <div className='flex items-center gap-2 mb-2'>
                    <span>✅</span>
                    <span className='text-sm font-medium text-gray-900'>
                      Why this supplier matches:
                    </span>
                  </div>
                  <ul className='space-y-1'>
                    {match.matchReasons.map((reason, idx) => (
                      <li key={idx} className='text-sm text-gray-600 flex items-start gap-2'>
                        <div className='w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0'></div>
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Concerns */}
              {match.concerns.length > 0 && (
                <div>
                  <div className='flex items-center gap-2 mb-2'>
                    <AlertCircle className='h-4 w-4 text-yellow-500' />
                    <span className='text-sm font-medium text-gray-900'>Points to consider:</span>
                  </div>
                  <ul className='space-y-1'>
                    {match.concerns.map((concern, idx) => (
                      <li key={idx} className='text-sm text-gray-600 flex items-start gap-2'>
                        <div className='w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0'></div>
                        {concern}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className='flex items-center gap-3 mt-6 pt-4 border-t border-gray-100'>
              <button className='bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors'>
                Contact Supplier
              </button>
              <button className='bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors'>
                View Profile
              </button>
              <button className='bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors'>
                Request Quote
              </button>
              <button className='ml-auto bg-gray-50 text-gray-600 px-3 py-2 rounded-lg text-sm hover:bg-gray-100 transition-colors'>
                Save
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* AI Insights */}
      <div className='bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100'>
        <div className='flex items-start gap-3'>
          <div className='bg-blue-600 rounded-full p-2'>
            <span>📈</span>
          </div>
          <div>
            <h3 className='font-semibold text-gray-900 mb-2'>AI Insights</h3>
            <div className='space-y-2 text-sm text-gray-700'>
              <p>
                •{' '}
                <strong>
                  {matches.filter(m => m.recommendation === 'highly_recommended').length}
                </strong>{' '}
                suppliers are highly recommended based on your requirements
              </p>
              <p>
                • Average match score:{' '}
                <strong>
                  {Math.round(
                    (matches.reduce((sum, m) => sum + m.score, 0) / matches.length) * 100
                  )}
                  %
                </strong>
              </p>
              <p>
                • Price range:{' '}
                <strong>
                  ₹
                  {Math.min(
                    ...matches.map(m => parseInt(m.estimatedPrice.replace(/[₹,]/g, '')) || 0)
                  ).toLocaleString('en-IN')}{' '}
                  - ₹
                  {Math.max(
                    ...matches.map(m => parseInt(m.estimatedPrice.replace(/[₹,]/g, '')) || 0)
                  ).toLocaleString('en-IN')}
                </strong>
              </p>
              <p>
                • Fastest delivery:{' '}
                <strong>
                  {matches.reduce((min, m) => {
                    const days = m.estimatedDelivery.includes('day')
                      ? parseInt(m.estimatedDelivery)
                      : 999;
                    return days < min ? days : min;
                  }, 999)}{' '}
                  days
                </strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
