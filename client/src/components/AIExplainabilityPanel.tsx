'use client';

import React, { useState, useEffect } from 'react';

interface Feature {
  name: string;
  value: any;
  importance: number;
  description?: string;
}

interface ExplanationResult {
  prediction: any;
  baseValue: number;
  features: Feature[];
  perplexity?: {
    score: number;
    normalizedScore: number;
    tokens: number;
    category: string;
    interpretation: string;
  };
  modelConfidence?: number;
  dataQualityScore?: number;
}

interface AIExplainabilityPanelProps {
  text: string;
  modelType: 'rfq_classification' | 'bid_pricing' | 'product_categorization';
  onExplanationChange?: (result: any) => void;
}

export default function AIExplainabilityPanel({
  text,
  modelType,
  onExplanationChange,
}: AIExplainabilityPanelProps) {
  const [explanation, setExplanation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'shap' | 'lime' | 'perplexity'>(
    'overview'
  );

  useEffect(() => {
    if (text.trim().length > 10) {
      generateExplanation();
    }
  }, [text, modelType]);

  const generateExplanation = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Mock API call since backend might not be running in development
      // In production, this would call: `/api/perplexity-explain/full`
      const mockExplanation = {
        shap: {
          features: [
            {
              name: 'Product Category',
              importance: 0.45,
              description: 'Electronics category strongly influences matching',
            },
            { name: 'Price Range', importance: 0.32, description: 'Budget alignment is crucial' },
            { name: 'Location', importance: 0.28, description: 'Geographic proximity matters' },
            { name: 'Quality Score', importance: 0.25, description: 'Supplier rating impact' },
            {
              name: 'Delivery Time',
              importance: -0.15,
              description: 'Longer delivery reduces match',
            },
          ],
          modelConfidence: 0.87,
          prediction: 'Highly Recommended',
        },
        lime: {
          features: [
            {
              name: 'Electronics Expertise',
              importance: 0.52,
              description: 'Local explanation for electronics specialization',
            },
            { name: 'Budget Match', importance: 0.38, description: 'Price compatibility analysis' },
            {
              name: 'Geographic Distance',
              importance: 0.22,
              description: 'Distance impact on recommendation',
            },
            {
              name: 'Response Time',
              importance: 0.18,
              description: 'Quick response positive factor',
            },
          ],
          modelConfidence: 0.82,
          prediction: 'Strong Match',
        },
        perplexity: {
          score: 23.4,
          normalizedScore: 68.5,
          tokens: 45,
          category: 'medium',
          interpretation:
            'Text complexity is moderate, indicating clear business communication with some technical terms.',
        },
        combinedConfidence: 0.845,
        dataQualitySummary:
          'Good data quality with standard business text and reliable model predictions.',
      };

      setExplanation(mockExplanation);
      onExplanationChange?.(mockExplanation);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-50 border-green-200';
    if (confidence >= 0.6) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (confidence >= 0.4) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const renderFeatureBar = (feature: Feature, maxImportance: number) => {
    const percentage = (Math.abs(feature.importance) / maxImportance) * 100;
    const isPositive = feature.importance > 0;

    return (
      <div key={feature.name} className='mb-3'>
        <div className='flex justify-between items-center mb-1'>
          <span className='text-sm font-medium text-gray-700'>{feature.name}</span>
          <span className={`text-xs font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? '+' : ''}
            {feature.importance.toFixed(3)}
          </span>
        </div>
        <div className='relative h-2 bg-gray-100 rounded-full overflow-hidden'>
          <div
            className={`absolute top-0 h-full transition-all duration-500 ${
              isPositive
                ? 'bg-gradient-to-r from-green-400 to-green-600 left-0'
                : 'bg-gradient-to-r from-red-400 to-red-600 right-0'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {feature.description && <p className='text-xs text-gray-500 mt-1'>{feature.description}</p>}
      </div>
    );
  };

  if (!text.trim()) {
    return (
      <div className='bg-white rounded-xl border border-gray-200 p-6'>
        <div className='text-center text-gray-500'>
          <Brain className='h-12 w-12 mx-auto mb-3 opacity-50' />
          <p>Enter text to see AI explainability analysis</p>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white rounded-xl border border-gray-200 shadow-sm'>
      {/* Header */}
      <div className='p-4 border-b border-gray-100'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-3'>
            <div className='p-2 bg-purple-100 rounded-lg'>
              <Brain className='h-5 w-5 text-purple-600' />
            </div>
            <div>
              <h3 className='font-semibold text-gray-900'>AI Explainability Analysis</h3>
              <p className='text-sm text-gray-500'>SHAP, LIME & Perplexity Analysis</p>
            </div>
          </div>
          {isLoading && <Loader className='h-5 w-5 animate-spin text-purple-600' />}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className='px-4 pt-4'>
        <div className='flex space-x-1 bg-gray-100 p-1 rounded-lg'>
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'shap', label: 'SHAP', icon: Target },
            { id: 'lime', label: 'LIME', icon: Zap },
            { id: 'perplexity', label: 'Perplexity', icon: AlertCircle },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className='h-4 w-4' />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className='p-4'>
        {error && (
          <div className='mb-4 p-3 bg-red-50 border border-red-200 rounded-lg'>
            <div className='flex items-center space-x-2'>
              <AlertCircle className='h-4 w-4 text-red-600' />
              <span className='text-sm text-red-700'>{error}</span>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className='text-center py-8'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-3'></div>
            <p className='text-gray-600'>Analyzing with AI explainability models...</p>
          </div>
        ) : explanation ? (
          <div>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className='space-y-6'>
                {/* Combined Confidence */}
                <div className='bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg'>
                  <div className='flex items-center justify-between mb-3'>
                    <h4 className='font-semibold text-gray-900'>Combined AI Confidence</h4>
                    <div
                      className={`px-3 py-1 rounded-full border text-sm font-medium ${getConfidenceColor(
                        explanation.combinedConfidence
                      )}`}
                    >
                      {Math.round(explanation.combinedConfidence * 100)}%
                    </div>
                  </div>
                  <div className='w-full bg-gray-200 rounded-full h-3 mb-2'>
                    <div
                      className='bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500'
                      style={{ width: `${explanation.combinedConfidence * 100}%` }}
                    />
                  </div>
                  <p className='text-sm text-gray-600'>{explanation.dataQualitySummary}</p>
                </div>

                {/* Quick Insights */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='border border-gray-200 rounded-lg p-4'>
                    <h5 className='font-medium text-gray-900 mb-2'>SHAP Analysis</h5>
                    <div className='text-2xl font-bold text-green-600 mb-1'>
                      {Math.round((explanation.shap.modelConfidence || 0) * 100)}%
                    </div>
                    <p className='text-sm text-gray-600'>Model confidence</p>
                    <p className='text-xs text-gray-500 mt-2'>
                      Prediction: {explanation.shap.prediction}
                    </p>
                  </div>

                  <div className='border border-gray-200 rounded-lg p-4'>
                    <h5 className='font-medium text-gray-900 mb-2'>LIME Analysis</h5>
                    <div className='text-2xl font-bold text-blue-600 mb-1'>
                      {Math.round((explanation.lime.modelConfidence || 0) * 100)}%
                    </div>
                    <p className='text-sm text-gray-600'>Local confidence</p>
                    <p className='text-xs text-gray-500 mt-2'>
                      Prediction: {explanation.lime.prediction}
                    </p>
                  </div>
                </div>

                {/* Perplexity Overview */}
                <div className='border border-gray-200 rounded-lg p-4'>
                  <h5 className='font-medium text-gray-900 mb-3'>Text Complexity</h5>
                  <div className='grid grid-cols-3 gap-4'>
                    <div>
                      <div className='text-xl font-bold text-gray-900'>
                        {explanation.perplexity.score.toFixed(1)}
                      </div>
                      <div className='text-xs text-gray-500'>Perplexity Score</div>
                    </div>
                    <div>
                      <div className='text-xl font-bold text-gray-900'>
                        {explanation.perplexity.tokens}
                      </div>
                      <div className='text-xs text-gray-500'>Tokens</div>
                    </div>
                    <div>
                      <div
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          explanation.perplexity.category === 'low'
                            ? 'bg-green-100 text-green-800'
                            : explanation.perplexity.category === 'medium'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {explanation.perplexity.category.charAt(0).toUpperCase() +
                          explanation.perplexity.category.slice(1)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SHAP Tab */}
            {activeTab === 'shap' && explanation.shap && (
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <h4 className='font-semibold text-gray-900'>SHAP Feature Attribution</h4>
                  <div className='text-sm text-gray-500'>
                    Global Explanation • Confidence:{' '}
                    {Math.round((explanation.shap.modelConfidence || 0) * 100)}%
                  </div>
                </div>
                <div className='space-y-3'>
                  {explanation.shap.features.map((feature: Feature) =>
                    renderFeatureBar(
                      feature,
                      Math.max(
                        ...explanation.shap.features.map((f: Feature) => Math.abs(f.importance))
                      )
                    )
                  )}
                </div>
              </div>
            )}

            {/* LIME Tab */}
            {activeTab === 'lime' && explanation.lime && (
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <h4 className='font-semibold text-gray-900'>LIME Local Explanation</h4>
                  <div className='text-sm text-gray-500'>
                    Local Explanation • Confidence:{' '}
                    {Math.round((explanation.lime.modelConfidence || 0) * 100)}%
                  </div>
                </div>
                <div className='space-y-3'>
                  {explanation.lime.features.map((feature: Feature) =>
                    renderFeatureBar(
                      feature,
                      Math.max(
                        ...explanation.lime.features.map((f: Feature) => Math.abs(f.importance))
                      )
                    )
                  )}
                </div>
              </div>
            )}

            {/* Perplexity Tab */}
            {activeTab === 'perplexity' && (
              <div className='space-y-4'>
                <h4 className='font-semibold text-gray-900'>Detailed Perplexity Analysis</h4>

                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <div className='bg-gray-50 p-3 rounded-lg'>
                    <div className='text-xl font-bold text-gray-900'>
                      {explanation.perplexity.score.toFixed(2)}
                    </div>
                    <div className='text-sm text-gray-500'>Raw Score</div>
                  </div>
                  <div className='bg-gray-50 p-3 rounded-lg'>
                    <div className='text-xl font-bold text-gray-900'>
                      {explanation.perplexity.normalizedScore.toFixed(1)}%
                    </div>
                    <div className='text-sm text-gray-500'>Normalized</div>
                  </div>
                  <div className='bg-gray-50 p-3 rounded-lg'>
                    <div className='text-xl font-bold text-gray-900'>
                      {explanation.perplexity.tokens}
                    </div>
                    <div className='text-sm text-gray-500'>Tokens</div>
                  </div>
                </div>

                <div className='bg-blue-50 p-4 rounded-lg'>
                  <h5 className='font-medium text-blue-900 mb-2'>Interpretation</h5>
                  <p className='text-blue-800'>{explanation.perplexity.interpretation}</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className='text-center py-8 text-gray-500'>
            <Brain className='h-8 w-8 mx-auto mb-2 opacity-50' />
            <p>No explanation generated yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
