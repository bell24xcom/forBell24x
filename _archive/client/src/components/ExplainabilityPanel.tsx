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

interface FullExplanationResult {
  shap: ExplanationResult;
  lime: ExplanationResult;
  perplexity: {
    score: number;
    normalizedScore: number;
    tokens: number;
    category: string;
    interpretation: string;
  };
  combinedConfidence: number;
  dataQualitySummary: string;
  businessRecommendations?: string[];
}

interface ExplainabilityPanelProps {
  text: string;
  modelType: 'rfq_classification' | 'bid_pricing' | 'product_categorization';
  onExplanationChange?: (result: FullExplanationResult) => void;
}

export default function ExplainabilityPanel({
  text,
  modelType,
  onExplanationChange,
}: ExplainabilityPanelProps) {
  const [explanation, setExplanation] = useState<FullExplanationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'shap' | 'lime' | 'perplexity'>(
    'overview'
  );
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['confidence']));

  useEffect(() => {
    if (text.trim().length > 10) {
      generateExplanation();
    }
  }, [text, modelType]);

  const generateExplanation = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/perplexity-explain/full', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_type: modelType,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate explanation');
      }

      const result: FullExplanationResult = await response.json();
      setExplanation(result);
      onExplanationChange?.(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-50 border-green-200';
    if (confidence >= 0.6) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (confidence >= 0.4) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getPerplexityColor = (category: string) => {
    switch (category) {
      case 'low':
        return 'text-green-600 bg-green-50';
      case 'medium':
        return 'text-blue-600 bg-blue-50';
      case 'high':
        return 'text-yellow-600 bg-yellow-50';
      case 'very-high':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
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
            <div className='p-2 bg-blue-100 rounded-lg'>
              <Brain className='h-5 w-5 text-blue-600' />
            </div>
            <div>
              <h3 className='font-semibold text-gray-900'>AI Explainability Analysis</h3>
              <p className='text-sm text-gray-500'>SHAP, LIME & Perplexity Analysis</p>
            </div>
          </div>
          {isLoading && <Loader className='h-5 w-5 animate-spin text-blue-600' />}
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
                  ? 'bg-white text-blue-600 shadow-sm'
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
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3'></div>
            <p className='text-gray-600'>Analyzing with AI explainability models...</p>
          </div>
        ) : explanation ? (
          <div>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className='space-y-6'>
                {/* Combined Confidence */}
                <div className='bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg'>
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
                      className='bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500'
                      style={{ width: `${explanation.combinedConfidence * 100}%` }}
                    />
                  </div>
                  <p className='text-sm text-gray-600'>{explanation.dataQualitySummary}</p>
                </div>

                {/* Perplexity Overview */}
                <div className='border border-gray-200 rounded-lg p-4'>
                  <button
                    onClick={() => toggleSection('perplexity-overview')}
                    className='w-full flex items-center justify-between'
                  >
                    <h4 className='font-semibold text-gray-900'>Text Complexity Analysis</h4>
                    {expandedSections.has('perplexity-overview') ? (
                      <ChevronUp className='h-4 w-4' />
                    ) : (
                      <ChevronDown className='h-4 w-4' />
                    )}
                  </button>

                  {expandedSections.has('perplexity-overview') && (
                    <div className='mt-3 space-y-3'>
                      <div className='grid grid-cols-2 gap-4'>
                        <div>
                          <div className='text-2xl font-bold text-gray-900'>
                            {explanation.perplexity.score.toFixed(1)}
                          </div>
                          <div className='text-sm text-gray-500'>Perplexity Score</div>
                        </div>
                        <div>
                          <div
                            className={`inline-flex px-2 py-1 rounded-full text-sm font-medium ${getPerplexityColor(
                              explanation.perplexity.category
                            )}`}
                          >
                            {explanation.perplexity.category.charAt(0).toUpperCase() +
                              explanation.perplexity.category.slice(1)}{' '}
                            Complexity
                          </div>
                        </div>
                      </div>
                      <p className='text-sm text-gray-700'>
                        {explanation.perplexity.interpretation}
                      </p>
                    </div>
                  )}
                </div>

                {/* Business Recommendations */}
                {explanation.businessRecommendations &&
                  explanation.businessRecommendations.length > 0 && (
                    <div className='border border-gray-200 rounded-lg p-4'>
                      <h4 className='font-semibold text-gray-900 mb-3'>Business Recommendations</h4>
                      <ul className='space-y-2'>
                        {explanation.businessRecommendations.map((rec, idx) => (
                          <li key={idx} className='flex items-start space-x-2'>
                            <div className='w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0' />
                            <span className='text-sm text-gray-700'>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>
            )}

            {/* SHAP Tab */}
            {activeTab === 'shap' && explanation.shap && (
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <h4 className='font-semibold text-gray-900'>SHAP Feature Attribution</h4>
                  <div className='text-sm text-gray-500'>
                    Confidence: {Math.round((explanation.shap.modelConfidence || 0) * 100)}%
                  </div>
                </div>
                <div className='space-y-3'>
                  {explanation.shap.features
                    .slice(0, 10)
                    .map(feature =>
                      renderFeatureBar(
                        feature,
                        Math.max(...explanation.shap.features.map(f => Math.abs(f.importance)))
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
                    Confidence: {Math.round((explanation.lime.modelConfidence || 0) * 100)}%
                  </div>
                </div>
                <div className='space-y-3'>
                  {explanation.lime.features
                    .slice(0, 10)
                    .map(feature =>
                      renderFeatureBar(
                        feature,
                        Math.max(...explanation.lime.features.map(f => Math.abs(f.importance)))
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
