'use client';

import { useState } from 'react';

interface SHAPValue {
  featureName: string;
  shapValue: number;
  contribution: 'positive' | 'negative';
  explanation: string;
  importance: number;
  category: 'high' | 'medium' | 'low';
}

interface InteractiveSHAPChartsProps {
  shapValues: SHAPValue[];
  supplierName: string;
  overallScore: number;
  confidence: number;
  className?: string;
}

export default function InteractiveSHAPCharts({
  shapValues,
  supplierName,
  overallScore,
  confidence,
  className = '',
}: InteractiveSHAPChartsProps) {
  const [selectedFeature, setSelectedFeature] = useState<SHAPValue | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [sortBy, setSortBy] = useState<'importance' | 'impact' | 'alphabetical'>('importance');

  const sortedValues = [...shapValues].sort((a, b) => {
    switch (sortBy) {
      case 'importance':
        return b.importance - a.importance;
      case 'impact':
        return Math.abs(b.shapValue) - Math.abs(a.shapValue);
      case 'alphabetical':
        return a.featureName.localeCompare(b.featureName);
      default:
        return 0;
    }
  });

  const positiveValues = sortedValues.filter(v => v.contribution === 'positive');
  const negativeValues = sortedValues.filter(v => v.contribution === 'negative');

  const getFeatureColor = (contribution: 'positive' | 'negative', intensity: number = 1) => {
    const opacity = Math.min(Math.max(intensity, 0.3), 1);
    return contribution === 'positive'
      ? `rgba(34, 197, 94, ${opacity})` // green
      : `rgba(239, 68, 68, ${opacity})`; // red
  };

  const getImportanceIcon = (category: 'high' | 'medium' | 'low') => {
    switch (category) {
      case 'high':
        return <Target className='h-4 w-4 text-red-600' />;
      case 'medium':
        return <span>📈</span>;
      case 'low':
        return <Info className='h-4 w-4 text-gray-600' />;
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className='bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white rounded-t-lg'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-3'>
            <div className='w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center'>
              <span>📊</span>
            </div>
            <div>
              <h3 className='text-lg font-bold'>SHAP Feature Analysis</h3>
              <p className='text-purple-100'>{supplierName}</p>
            </div>
          </div>
          <div className='text-right'>
            <div className='text-2xl font-bold'>{(overallScore * 100).toFixed(1)}%</div>
            <div className='text-purple-200 text-sm'>Match Score</div>
          </div>
        </div>

        <div className='mt-4 flex items-center justify-between'>
          <div className='flex items-center space-x-4'>
            <div className='text-sm'>
              <span className='text-purple-200'>Confidence: </span>
              <span className='font-semibold'>{(confidence * 100).toFixed(0)}%</span>
            </div>
            <div className='text-sm'>
              <span className='text-purple-200'>Features: </span>
              <span className='font-semibold'>{shapValues.length}</span>
            </div>
          </div>

          <button
            onClick={() => setShowDetails(!showDetails)}
            className='flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg transition-colors'
          >
            {showDetails ? <span>👁️</span> : <span>👁️</span>}
            <span className='text-sm'>{showDetails ? 'Hide' : 'Show'} Details</span>
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className='p-4 border-b border-gray-200 bg-gray-50'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-3'>
            <span className='text-sm font-medium text-gray-700'>Sort by:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className='px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent'
            >
              <option value='importance'>Feature Importance</option>
              <option value='impact'>SHAP Impact</option>
              <option value='alphabetical'>Alphabetical</option>
            </select>
          </div>

          <div className='flex items-center space-x-4 text-sm text-gray-600'>
            <div className='flex items-center space-x-1'>
              <div className='w-3 h-3 bg-green-500 rounded-full'></div>
              <span>Positive Impact</span>
            </div>
            <div className='flex items-center space-x-1'>
              <div className='w-3 h-3 bg-red-500 rounded-full'></div>
              <span>Negative Impact</span>
            </div>
          </div>
        </div>
      </div>

      <div className='p-6'>
        {/* Summary Stats */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
          <div className='bg-green-50 rounded-lg p-4 border border-green-200'>
            <div className='flex items-center space-x-2 mb-2'>
              <span>📈</span>
              <span className='font-medium text-green-900'>Positive Factors</span>
            </div>
            <div className='text-2xl font-bold text-green-600'>{positiveValues.length}</div>
            <div className='text-green-700 text-sm'>
              Avg: +
              {positiveValues.length > 0
                ? (
                    positiveValues.reduce((sum, v) => sum + v.shapValue, 0) / positiveValues.length
                  ).toFixed(3)
                : '0.000'}
            </div>
          </div>

          <div className='bg-red-50 rounded-lg p-4 border border-red-200'>
            <div className='flex items-center space-x-2 mb-2'>
              <span>📉</span>
              <span className='font-medium text-red-900'>Risk Factors</span>
            </div>
            <div className='text-2xl font-bold text-red-600'>{negativeValues.length}</div>
            <div className='text-red-700 text-sm'>
              Avg:{' '}
              {negativeValues.length > 0
                ? (
                    negativeValues.reduce((sum, v) => sum + v.shapValue, 0) / negativeValues.length
                  ).toFixed(3)
                : '0.000'}
            </div>
          </div>

          <div className='bg-purple-50 rounded-lg p-4 border border-purple-200'>
            <div className='flex items-center space-x-2 mb-2'>
              <Award className='h-5 w-5 text-purple-600' />
              <span className='font-medium text-purple-900'>Net Impact</span>
            </div>
            <div className='text-2xl font-bold text-purple-600'>
              {shapValues.reduce((sum, v) => sum + v.shapValue, 0).toFixed(3)}
            </div>
            <div className='text-purple-700 text-sm'>Combined Effect</div>
          </div>
        </div>

        {/* Interactive SHAP Chart */}
        <div className='space-y-3'>
          <h4 className='font-semibold text-gray-900 mb-4'>Feature Impact Analysis</h4>

          {sortedValues.map((value, index) => (
            <div key={index} className='group'>
              <div
                className='flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer transition-all duration-200'
                onClick={() =>
                  setSelectedFeature(
                    selectedFeature?.featureName === value.featureName ? null : value
                  )
                }
              >
                <div className='flex items-center space-x-3 flex-1'>
                  {getImportanceIcon(value.category)}
                  <div className='flex-1'>
                    <div className='flex items-center justify-between'>
                      <span className='font-medium text-gray-900'>{value.featureName}</span>
                      <div className='flex items-center space-x-3'>
                        <span
                          className={`text-sm font-medium ${
                            value.contribution === 'positive' ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {value.contribution === 'positive' ? '+' : ''}
                          {value.shapValue.toFixed(3)}
                        </span>
                      </div>
                    </div>

                    {/* Visual Bar */}
                    <div className='mt-2 relative'>
                      <div className='w-full bg-gray-200 rounded-full h-2'>
                        <div
                          className='h-2 rounded-full transition-all duration-300'
                          style={{
                            width: `${Math.min(Math.abs(value.shapValue) * 200, 100)}%`,
                            backgroundColor: getFeatureColor(
                              value.contribution,
                              Math.abs(value.shapValue) * 2
                            ),
                          }}
                        />
                      </div>

                      {/* Importance indicator */}
                      <div
                        className='absolute right-0 top-0 h-2 w-1 bg-gray-400 rounded-full'
                        style={{ opacity: value.importance }}
                      />
                    </div>
                  </div>
                </div>

                <div className='flex items-center space-x-2 ml-3'>
                  <span className='text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded'>
                    {(value.importance * 100).toFixed(0)}%
                  </span>
                  {selectedFeature?.featureName === value.featureName ? (
                    <span>👁️</span>
                  ) : (
                    <span>👁️</span>
                  )}
                </div>
              </div>

              {/* Detailed Explanation */}
              {selectedFeature?.featureName === value.featureName && (
                <div className='mt-2 p-4 bg-white border border-gray-200 rounded-lg shadow-sm animate-in fade-in duration-200'>
                  <div className='flex items-start space-x-3'>
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        value.contribution === 'positive' ? 'bg-green-100' : 'bg-red-100'
                      }`}
                    >
                      {value.contribution === 'positive' ? (
                        <span>📈</span>
                      ) : (
                        <AlertTriangle className='h-4 w-4 text-red-600' />
                      )}
                    </div>

                    <div className='flex-1'>
                      <h5 className='font-medium text-gray-900 mb-2'>
                        {value.featureName} Analysis
                      </h5>
                      <p className='text-gray-700 text-sm mb-3'>{value.explanation}</p>

                      <div className='grid grid-cols-2 md:grid-cols-4 gap-3 text-sm'>
                        <div>
                          <span className='text-gray-600'>SHAP Value:</span>
                          <div
                            className={`font-medium ${
                              value.contribution === 'positive' ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {value.shapValue.toFixed(4)}
                          </div>
                        </div>
                        <div>
                          <span className='text-gray-600'>Importance:</span>
                          <div className='font-medium text-gray-900'>
                            {(value.importance * 100).toFixed(1)}%
                          </div>
                        </div>
                        <div>
                          <span className='text-gray-600'>Category:</span>
                          <div
                            className={`font-medium capitalize ${
                              value.category === 'high'
                                ? 'text-red-600'
                                : value.category === 'medium'
                                ? 'text-yellow-600'
                                : 'text-gray-600'
                            }`}
                          >
                            {value.category}
                          </div>
                        </div>
                        <div>
                          <span className='text-gray-600'>Impact:</span>
                          <div
                            className={`font-medium ${
                              value.contribution === 'positive' ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {value.contribution === 'positive' ? 'Positive' : 'Negative'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Feature Importance Summary */}
        {showDetails && (
          <div className='mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200'>
            <h5 className='font-semibold text-gray-900 mb-3'>SHAP Explanation Summary</h5>
            <div className='space-y-2 text-sm text-gray-700'>
              <p>
                <strong>SHAP values</strong> explain how each feature contributes to the supplier's
                overall score. Positive values increase the score, while negative values decrease
                it.
              </p>
              <p>
                <strong>Feature importance</strong> indicates how much each feature varies across
                different suppliers, helping you understand which factors matter most in the
                decision.
              </p>
              <p>
                <strong>Confidence score</strong> ({(confidence * 100).toFixed(0)}%) reflects how
                reliable this explanation is based on the available data and model certainty.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
