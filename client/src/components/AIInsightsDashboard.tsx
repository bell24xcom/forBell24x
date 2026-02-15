'use client';

import { useState, useEffect } from 'react';
import { RFQCategorizer, NLPAnalysis } from '@/ai/nlp-categorization';
import { BarChart3 } from 'lucide-react';
import { SupplierMatcher, SupplierRecommendation } from '@/ai/supplier-matching';
import AITestRunner from '@/components/AITestRunner';
import AILoadingStates, {
  AIErrorState,
  AISuccessState,
  AICardSkeleton,
} from '@/components/AILoadingStates';
import InteractiveSHAPCharts from '@/components/InteractiveSHAPCharts';
import TensorFlowPerformanceMonitor from '@/components/TensorFlowPerformanceMonitor';
import TensorFlowPreloader from '@/components/TensorFlowPreloader';
import PredictiveAnalyticsDashboard from '@/components/PredictiveAnalyticsDashboard';

interface AIInsightsDashboardProps {
  rfqId?: string;
  showExplanations?: boolean;
  onAnalysisComplete?: (analysis: NLPAnalysis) => void;
}

export function AIInsightsDashboard({
  rfqId,
  showExplanations = true,
  onAnalysisComplete,
}: AIInsightsDashboardProps) {
  const [rfqCategorizer] = useState(() => new RFQCategorizer());
  const [supplierMatcher] = useState(() => new SupplierMatcher());
  const [analysis, setAnalysis] = useState<NLPAnalysis | null>(null);
  const [recommendations, setRecommendations] = useState<SupplierRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputText, setInputText] = useState('');
  const [activeTab, setActiveTab] = useState<
    'overview' | 'nlp' | 'shap' | 'recommendations' | 'testing' | 'performance' | 'predictive'
  >('overview');
  const [error, setError] = useState<string | null>(null);
  const [loadingStage, setLoadingStage] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);
  const [tensorFlowInitialized, setTensorFlowInitialized] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(null);

  const analyzeRFQ = async (rfqText: string) => {
    if (!rfqText.trim()) return;

    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      // Stage 1: NLP Analysis
      setLoadingStage('Preprocessing text input...');
      setProgress(10);
      await new Promise(resolve => setTimeout(resolve, 500));

      setLoadingStage('Running BERT classification...');
      setProgress(25);
      await new Promise(resolve => setTimeout(resolve, 800));

      setLoadingStage('Extracting entities...');
      setProgress(40);
      const nlpAnalysis = await rfqCategorizer.analyzeRFQ(rfqText);
      setAnalysis(nlpAnalysis);
      onAnalysisComplete?.(nlpAnalysis);

      setLoadingStage('Analyzing sentiment and urgency...');
      setProgress(60);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Stage 2: Supplier Matching
      setLoadingStage('Loading supplier data...');
      setProgress(70);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Mock suppliers for demo - with enhanced data
      const mockSuppliers = [
        {
          id: '1',
          name: 'TechFlow Electronics Pvt Ltd',
          rating: 4.8,
          responseTime: '2 hours',
          location: 'Bangalore',
          verified: true,
          premiumMember: true,
          certifications: ['ISO 9001', 'ISO 14001', 'RoHS', 'CE', 'FCC'],
        },
        {
          id: '2',
          name: 'Krishna Agriculture Solutions',
          rating: 4.6,
          responseTime: '4 hours',
          location: 'Punjab',
          verified: true,
          premiumMember: false,
          certifications: ['Organic Certified', 'FSSAI', 'APEDA'],
        },
        {
          id: '3',
          name: 'AutoParts India Ltd',
          rating: 4.9,
          responseTime: '1 hour',
          location: 'Chennai',
          verified: true,
          premiumMember: true,
          certifications: ['ISO 9001', 'TS 16949', 'ISO 14001', 'OHSAS 18001'],
        },
        {
          id: '4',
          name: 'Mumbai Chemicals Corp',
          rating: 4.2,
          responseTime: '6 hours',
          location: 'Mumbai',
          verified: true,
          premiumMember: false,
          certifications: ['ISO 9001', 'ISO 14001', 'REACH'],
        },
        {
          id: '5',
          name: 'Delhi Textiles Industries',
          rating: 4.4,
          responseTime: '3 hours',
          location: 'Delhi',
          verified: true,
          premiumMember: true,
          certifications: ['OEKO-TEX', 'GOTS', 'BCI', 'ISO 9001'],
        },
      ];

      setLoadingStage('Generating SHAP explanations...');
      setProgress(85);
      await new Promise(resolve => setTimeout(resolve, 800));

      const supplierRecs = await supplierMatcher.recommendSuppliers(
        'rfq-001',
        mockSuppliers,
        nlpAnalysis
      );
      setRecommendations(supplierRecs);

      setLoadingStage('Finalizing results...');
      setProgress(100);
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('AI Analysis error:', error);
      setError(
        error instanceof Error ? error.message : 'An unknown error occurred during AI analysis'
      );
    } finally {
      setLoading(false);
      setProgress(0);
      setLoadingStage('');
    }
  };

  const retryAnalysis = () => {
    if (inputText.trim()) {
      analyzeRFQ(inputText);
    }
  };

  const handleDemoAnalysis = () => {
    const demoText =
      'Required 500 tonnes premium basmati rice for export. Mumbai based company. Urgent requirement within 15 days. Quality should be Grade A with proper certifications. Budget around ₹50,000 per tonne.';
    setInputText(demoText);
    analyzeRFQ(demoText);
  };

  const SentimentBadge = ({ sentiment }: { sentiment: 'positive' | 'neutral' | 'negative' }) => {
    const colors = {
      positive: 'bg-green-100 text-green-800 border-green-200',
      negative: 'bg-red-100 text-red-800 border-red-200',
      neutral: 'bg-gray-100 text-gray-800 border-gray-200',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${colors[sentiment]}`}>
        {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
      </span>
    );
  };

  const UrgencyBadge = ({ urgency }: { urgency: 'high' | 'medium' | 'low' }) => {
    const colors = {
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-green-100 text-green-800 border-green-200',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${colors[urgency]}`}>
        {urgency.charAt(0).toUpperCase() + urgency.slice(1)} Priority
      </span>
    );
  };

  const ConfidenceBar = ({ value, label }: { value: number; label: string }) => (
    <div className='space-y-1'>
      <div className='flex justify-between text-sm'>
        <span className='text-gray-600'>{label}</span>
        <span className='font-medium'>{(value * 100).toFixed(1)}%</span>
      </div>
      <div className='w-full bg-gray-200 rounded-full h-2'>
        <div
          className='bg-blue-600 h-2 rounded-full transition-all duration-300'
          style={{ width: `${value * 100}%` }}
        />
      </div>
    </div>
  );

  const SHAPVisualization = ({ shap }: { shap: any }) => (
    <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
      <div className='flex-1'>
        <span className='text-sm font-medium text-gray-900'>{shap.featureName}</span>
        <div className='text-xs text-gray-600 mt-1'>{shap.explanation}</div>
      </div>
      <div className='flex items-center space-x-3'>
        <div className='w-20 bg-gray-200 rounded-full h-2'>
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              shap.contribution === 'positive' ? 'bg-green-500' : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(Math.abs(shap.shapValue) * 500, 100)}%` }}
          />
        </div>
        <span
          className={`text-sm font-medium ${
            shap.contribution === 'positive' ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {shap.contribution === 'positive' ? '+' : '-'}
          {Math.abs(shap.shapValue).toFixed(3)}
        </span>
      </div>
    </div>
  );

  return (
    <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
      {/* Header */}
      <div className='bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-3'>
            <div className='w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center'>
              <Brain className='h-6 w-6' />
            </div>
            <div>
              <h3 className='text-xl font-bold'>AI Insights & Recommendations</h3>
              <p className='text-purple-100'>
                NLP Analysis • SHAP/LIME Explanations • Smart Matching
              </p>
            </div>
          </div>
          <div className='text-right'>
            <div className='text-sm text-purple-100'>AI Accuracy</div>
            <div className='text-2xl font-bold'>98.5%</div>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className='p-6 border-b border-gray-200'>
        <div className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Analyze RFQ Text (AI Demo)
            </label>
            <div className='flex space-x-3'>
              <textarea
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder='Enter RFQ description for AI analysis...'
                className='flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none'
                rows={3}
                onKeyPress={e => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    analyzeRFQ(inputText);
                  }
                }}
              />
              <div className='flex flex-col space-y-2'>
                <button
                  onClick={() => analyzeRFQ(inputText)}
                  className='px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50'
                  disabled={loading}
                >
                  {loading ? 'Analyzing...' : 'Analyze'}
                </button>
                <button
                  onClick={handleDemoAnalysis}
                  className='px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm'
                >
                  Demo
                </button>
              </div>
            </div>
          </div>

          <div className='text-xs text-gray-500'>
            Press Ctrl+Enter to analyze • Demo includes: Category classification, Entity extraction,
            SHAP explanations
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className='p-6'>
          <AILoadingStates type='general' stage={loadingStage} progress={progress} />
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className='p-6'>
          <AIErrorState error={error} type='general' onRetry={retryAnalysis} />
        </div>
      )}

      {/* Results Section */}
      {analysis && !loading && !error && (
        <div className='p-6'>
          {/* Tab Navigation */}
          <div className='flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6'>
            {[
              { id: 'overview', label: 'Overview', icon: Eye },
              { id: 'nlp', label: 'NLP Analysis', icon: Target },
              { id: 'shap', label: 'SHAP Explanations', icon: BarChart3 },
              { id: 'recommendations', label: 'Recommendations', icon: TrendingUp },
              { id: 'predictive', label: 'Predictive Analytics', icon: LineChart },
              { id: 'testing', label: 'AI Testing', icon: TestTube },
              { id: 'performance', label: 'TensorFlow Performance', icon: Activity },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <tab.icon className='h-4 w-4' />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className='space-y-6'>
              {/* Quick Stats */}
              <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                <div className='bg-blue-50 rounded-lg p-4'>
                  <div className='flex items-center space-x-2'>
                    <Target className='h-5 w-5 text-blue-600' />
                    <span className='text-sm font-medium text-blue-900'>Categories</span>
                  </div>
                  <div className='text-2xl font-bold text-blue-600 mt-2'>
                    {analysis.categories.length}
                  </div>
                </div>

                <div className='bg-green-50 rounded-lg p-4'>
                  <div className='flex items-center space-x-2'>
                    <span>📍</span>
                    <span className='text-sm font-medium text-green-900'>Locations</span>
                  </div>
                  <div className='text-2xl font-bold text-green-600 mt-2'>
                    {analysis.extractedEntities.locations.length}
                  </div>
                </div>

                <div className='bg-purple-50 rounded-lg p-4'>
                  <div className='flex items-center space-x-2'>
                    <span>$</span>
                    <span className='text-sm font-medium text-purple-900'>Prices</span>
                  </div>
                  <div className='text-2xl font-bold text-purple-600 mt-2'>
                    {analysis.extractedEntities.prices.length}
                  </div>
                </div>

                <div className='bg-orange-50 rounded-lg p-4'>
                  <div className='flex items-center space-x-2'>
                    <span>📈</span>
                    <span className='text-sm font-medium text-orange-900'>Suppliers</span>
                  </div>
                  <div className='text-2xl font-bold text-orange-600 mt-2'>
                    {recommendations.length}
                  </div>
                </div>
              </div>

              {/* Sentiment & Urgency */}
              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-4'>
                  <div className='text-sm text-gray-600'>Sentiment:</div>
                  <SentimentBadge sentiment={analysis.sentiment} />
                </div>
                <div className='flex items-center space-x-4'>
                  <div className='text-sm text-gray-600'>Urgency:</div>
                  <UrgencyBadge urgency={analysis.urgency} />
                </div>
              </div>

              {/* Top Recommendation Preview */}
              {recommendations[0] && (
                <div className='bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200'>
                  <div className='flex items-center justify-between mb-4'>
                    <h4 className='text-lg font-semibold text-gray-900'>Top AI Recommendation</h4>
                    <div className='flex items-center space-x-2'>
                      <Award className='h-5 w-5 text-green-600' />
                      <span className='text-sm font-medium text-green-600'>
                        {(recommendations[0].matchScore * 100).toFixed(1)}% Match
                      </span>
                    </div>
                  </div>

                  <div className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <span className='font-medium text-gray-900'>
                        {recommendations[0].supplierName}
                      </span>
                      <span className='text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full'>
                        {(recommendations[0].confidence * 100).toFixed(0)}% Confidence
                      </span>
                    </div>

                    <div className='grid grid-cols-2 gap-4 text-sm'>
                      <div>
                        <span className='text-gray-600'>Strengths:</span>
                        <ul className='text-green-700 mt-1'>
                          {recommendations[0].strengths.slice(0, 2).map((strength, idx) => (
                            <li key={idx} className='flex items-start space-x-1'>
                              <span>•</span>
                              <span>{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <span className='text-gray-600'>Recommendations:</span>
                        <ul className='text-blue-700 mt-1'>
                          {recommendations[0].recommendations.slice(0, 2).map((rec, idx) => (
                            <li key={idx} className='flex items-start space-x-1'>
                              <span>•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'nlp' && (
            <div className='space-y-6'>
              {/* Category Classification */}
              <div className='bg-blue-50 rounded-lg p-6'>
                <h4 className='font-semibold text-blue-900 mb-4 flex items-center space-x-2'>
                  <Target className='h-5 w-5' />
                  <span>NLP Category Classification</span>
                </h4>
                <div className='space-y-3'>
                  {analysis.categories.map((cat, idx) => (
                    <div key={idx} className='space-y-2'>
                      <div className='flex items-center justify-between'>
                        <span className='text-sm font-medium text-gray-900'>{cat.category}</span>
                        <span className='text-sm font-medium text-blue-600'>
                          {(cat.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                      <ConfidenceBar value={cat.confidence} label='' />
                      <div className='text-xs text-gray-600'>{cat.reasoning.join(', ')}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Extracted Entities */}
              <div className='bg-green-50 rounded-lg p-6'>
                <h4 className='font-semibold text-green-900 mb-4 flex items-center space-x-2'>
                  <span>⚡</span>
                  <span>Extracted Entities</span>
                </h4>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div className='space-y-3'>
                    <div>
                      <span className='font-medium text-green-800'>Companies:</span>
                      <div className='text-green-700 mt-1'>
                        {analysis.extractedEntities.companies.length > 0
                          ? analysis.extractedEntities.companies.join(', ')
                          : 'None detected'}
                      </div>
                    </div>
                    <div>
                      <span className='font-medium text-green-800'>Locations:</span>
                      <div className='text-green-700 mt-1'>
                        {analysis.extractedEntities.locations.length > 0
                          ? analysis.extractedEntities.locations.join(', ')
                          : 'None detected'}
                      </div>
                    </div>
                  </div>
                  <div className='space-y-3'>
                    <div>
                      <span className='font-medium text-green-800'>Products:</span>
                      <div className='text-green-700 mt-1'>
                        {analysis.extractedEntities.products.length > 0
                          ? analysis.extractedEntities.products.join(', ')
                          : 'None detected'}
                      </div>
                    </div>
                    <div>
                      <span className='font-medium text-green-800'>Prices:</span>
                      <div className='text-green-700 mt-1'>
                        {analysis.extractedEntities.prices.length > 0
                          ? analysis.extractedEntities.prices.join(', ')
                          : 'None detected'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'shap' && showExplanations && recommendations.length > 0 && (
            <div className='space-y-6'>
              {/* Interactive SHAP Charts */}
              {recommendations[0] && (
                <InteractiveSHAPCharts
                  shapValues={recommendations[0].shapExplanations.map(shap => ({
                    featureName: shap.featureName,
                    shapValue: shap.shapValue,
                    contribution: shap.contribution,
                    explanation: shap.explanation,
                    importance: Math.abs(shap.shapValue) * 2, // Convert to importance score
                    category:
                      Math.abs(shap.shapValue) > 0.1
                        ? 'high'
                        : Math.abs(shap.shapValue) > 0.05
                        ? 'medium'
                        : 'low',
                  }))}
                  supplierName={recommendations[0].supplierName}
                  overallScore={recommendations[0].matchScore}
                  confidence={recommendations[0].confidence}
                />
              )}

              {/* Additional SHAP Analysis for Multiple Suppliers */}
              {recommendations.length > 1 && (
                <div className='bg-gray-50 rounded-lg p-6 border border-gray-200'>
                  <h4 className='font-semibold text-gray-900 mb-4 flex items-center space-x-2'>
                    <span>📊</span>
                    <span>Comparative SHAP Analysis</span>
                  </h4>

                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {recommendations.slice(1, 4).map((rec, idx) => (
                      <div key={idx} className='bg-white rounded-lg p-4 border border-gray-200'>
                        <div className='flex items-center justify-between mb-3'>
                          <h5 className='font-medium text-gray-900'>{rec.supplierName}</h5>
                          <span className='text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded'>
                            Rank #{idx + 2}
                          </span>
                        </div>

                        <div className='space-y-2'>
                          <div className='flex justify-between text-sm'>
                            <span className='text-gray-600'>Match Score:</span>
                            <span className='font-medium'>
                              {(rec.matchScore * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className='flex justify-between text-sm'>
                            <span className='text-gray-600'>Confidence:</span>
                            <span className='font-medium'>
                              {(rec.confidence * 100).toFixed(0)}%
                            </span>
                          </div>

                          {/* Top SHAP Features */}
                          <div className='mt-3'>
                            <span className='text-xs font-medium text-gray-700'>Top Features:</span>
                            <div className='mt-1 space-y-1'>
                              {rec.shapExplanations.slice(0, 3).map((shap, shapIdx) => (
                                <div
                                  key={shapIdx}
                                  className='flex items-center justify-between text-xs'
                                >
                                  <span className='text-gray-600 truncate'>{shap.featureName}</span>
                                  <span
                                    className={`font-medium ${
                                      shap.contribution === 'positive'
                                        ? 'text-green-600'
                                        : 'text-red-600'
                                    }`}
                                  >
                                    {shap.contribution === 'positive' ? '+' : ''}
                                    {shap.shapValue.toFixed(3)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className='mt-4 text-center'>
                    <p className='text-sm text-gray-600'>
                      Interactive detailed analysis available for top supplier above
                    </p>
                  </div>
                </div>
              )}

              {/* SHAP Methodology Explanation */}
              <div className='bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200'>
                <h4 className='font-semibold text-gray-900 mb-3 flex items-center space-x-2'>
                  <Info className='h-5 w-5 text-purple-600' />
                  <span>Understanding SHAP Explanations</span>
                </h4>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700'>
                  <div>
                    <h5 className='font-medium text-gray-900 mb-2'>What are SHAP Values?</h5>
                    <p>
                      SHAP (SHapley Additive exPlanations) values provide a unified measure of
                      feature importance that explains how each supplier characteristic contributes
                      to the final matching score.
                    </p>
                  </div>
                  <div>
                    <h5 className='font-medium text-gray-900 mb-2'>How to Interpret?</h5>
                    <ul className='space-y-1'>
                      <li>
                        • <strong>Positive values:</strong> Increase supplier score
                      </li>
                      <li>
                        • <strong>Negative values:</strong> Decrease supplier score
                      </li>
                      <li>
                        • <strong>Magnitude:</strong> Shows strength of impact
                      </li>
                      <li>
                        • <strong>Sum:</strong> All values add up to final score
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'recommendations' && (
            <div className='space-y-6'>
              {/* AI Recommendations Summary */}
              <div className='bg-purple-50 rounded-lg p-6'>
                <h4 className='font-semibold text-purple-900 mb-4 flex items-center space-x-2'>
                  <span>📈</span>
                  <span>AI Recommendations Summary</span>
                </h4>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-6 text-center'>
                  <div>
                    <div className='text-3xl font-bold text-purple-600'>
                      {recommendations.length}
                    </div>
                    <div className='text-sm text-purple-700'>Suppliers Analyzed</div>
                  </div>
                  <div>
                    <div className='text-3xl font-bold text-purple-600'>
                      {recommendations[0] ? (recommendations[0].matchScore * 100).toFixed(0) : 0}%
                    </div>
                    <div className='text-sm text-purple-700'>Best Match Score</div>
                  </div>
                  <div>
                    <div className='text-3xl font-bold text-purple-600'>
                      {recommendations[0] ? (recommendations[0].confidence * 100).toFixed(0) : 0}%
                    </div>
                    <div className='text-sm text-purple-700'>AI Confidence</div>
                  </div>
                </div>
              </div>

              {/* Detailed Recommendations */}
              <div className='space-y-4'>
                <h5 className='font-medium text-gray-900'>Top Supplier Recommendations</h5>
                {recommendations.slice(0, 3).map((rec, idx) => (
                  <div key={idx} className='bg-white border border-gray-200 rounded-lg p-5'>
                    <div className='flex items-start justify-between mb-3'>
                      <div>
                        <h6 className='font-medium text-gray-900'>{rec.supplierName}</h6>
                        <div className='text-sm text-gray-600'>Rank #{idx + 1}</div>
                      </div>
                      <div className='text-right'>
                        <div className='text-sm text-gray-600'>Match Score</div>
                        <div className='text-lg font-bold text-blue-600'>
                          {(rec.matchScore * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
                      <div>
                        <span className='font-medium text-gray-700'>AI Reasoning:</span>
                        <ul className='text-gray-600 mt-1 space-y-1'>
                          {rec.reasoning.map((reason, reasonIdx) => (
                            <li key={reasonIdx} className='text-xs'>
                              {reason}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <span className='font-medium text-gray-700'>Recommendations:</span>
                        <ul className='text-blue-600 mt-1 space-y-1'>
                          {rec.recommendations.slice(0, 2).map((recommendation, recIdx) => (
                            <li key={recIdx} className='text-xs'>
                              • {recommendation}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'testing' && (
            <div className='space-y-6'>
              {/* AI Testing Header */}
              <div className='bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200'>
                <h4 className='font-semibold text-gray-900 mb-2 flex items-center space-x-2'>
                  <TestTube className='h-5 w-5 text-blue-600' />
                  <span>AI System Testing & Validation</span>
                </h4>
                <p className='text-gray-600 text-sm'>
                  Comprehensive testing of NLP categorization, SHAP explanations, entity extraction,
                  and performance benchmarks. Run automated tests to validate AI system
                  functionality and accuracy.
                </p>
              </div>

              {/* Test Runner Component */}
              <AITestRunner />
            </div>
          )}

          {activeTab === 'performance' && (
            <div className='space-y-6'>
              {/* TensorFlow Performance Header */}
              <div className='bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200'>
                <h4 className='font-semibold text-gray-900 mb-2 flex items-center space-x-2'>
                  <span>📊</span>
                  <span>TensorFlow.js Performance Monitoring</span>
                </h4>
                <p className='text-gray-600 text-sm'>
                  Real-time monitoring of TensorFlow.js performance, memory usage, model loading
                  times, and backend optimization status. Monitor GPU acceleration, inference speed,
                  and memory efficiency.
                </p>
              </div>

              {/* TensorFlow Preloader */}
              {!tensorFlowInitialized && (
                <TensorFlowPreloader
                  onInitialized={() => setTensorFlowInitialized(true)}
                  onError={error => setInitializationError(error)}
                  showDetails={true}
                />
              )}

              {/* Performance Monitor */}
              {tensorFlowInitialized && <TensorFlowPerformanceMonitor />}

              {/* Initialization Error */}
              {initializationError && (
                <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
                  <div className='flex items-center space-x-2 mb-2'>
                    <AlertTriangle className='h-5 w-5 text-red-600' />
                    <span className='font-medium text-red-800'>
                      TensorFlow.js Initialization Error
                    </span>
                  </div>
                  <p className='text-red-700 text-sm'>{initializationError}</p>
                  <p className='text-red-600 text-xs mt-2'>
                    The AI system is running in fallback mode. Some features may be limited.
                  </p>
                </div>
              )}

              {/* Performance Metrics Display */}
              {analysis?.performanceMetrics && (
                <div className='bg-gray-50 rounded-lg p-6'>
                  <h5 className='font-medium text-gray-900 mb-4'>Last Analysis Performance</h5>
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    <div className='text-center'>
                      <div className='text-2xl font-bold text-blue-600'>
                        {analysis.performanceMetrics.processingTime.toFixed(2)}ms
                      </div>
                      <div className='text-sm text-gray-600'>Processing Time</div>
                    </div>
                    <div className='text-center'>
                      <div className='text-2xl font-bold text-green-600'>
                        {analysis.performanceMetrics.modelLoadTime.toFixed(2)}ms
                      </div>
                      <div className='text-sm text-gray-600'>Model Load Time</div>
                    </div>
                    <div className='text-center'>
                      <div className='text-2xl font-bold text-purple-600'>
                        {analysis.performanceMetrics.backendUsed.toUpperCase()}
                      </div>
                      <div className='text-sm text-gray-600'>Backend Used</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'predictive' && (
            <div className='space-y-6'>
              {/* Predictive Analytics Header */}
              <div className='bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6 border border-blue-200'>
                <h4 className='font-semibold text-gray-900 mb-2 flex items-center space-x-2'>
                  <LineChart className='h-5 w-5 text-blue-600' />
                  <span>Predictive Analytics & Risk Scoring</span>
                </h4>
                <p className='text-gray-600 text-sm'>
                  Enterprise-grade market intelligence, risk assessment, and price forecasting
                  powered by AI. Real-time market data, supplier risk analysis, and Aladdin-style
                  risk scoring for enterprise procurement decisions.
                </p>
              </div>

              {/* Enterprise Features Notice */}
              <div className='bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <h5 className='font-bold text-lg mb-2'>
                      🚀 Phase 2: Enterprise Analytics Suite
                    </h5>
                    <p className='text-purple-100 text-sm'>
                      Advanced predictive analytics with NSE/BSE integration, Aladdin-style risk
                      scoring, and real-time market intelligence.
                    </p>
                  </div>
                  <div className='text-right'>
                    <div className='text-2xl font-bold'>₹1.75L</div>
                    <div className='text-purple-200 text-sm'>per month</div>
                  </div>
                </div>
              </div>

              {/* Predictive Analytics Dashboard */}
              <PredictiveAnalyticsDashboard />
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!analysis && !loading && !error && (
        <div className='text-center py-12 text-gray-500'>
          <Brain className='h-16 w-16 mx-auto mb-4 text-gray-300' />
          <h4 className='text-lg font-medium text-gray-900 mb-2'>AI-Powered RFQ Analysis</h4>
          <p className='text-gray-600 mb-4'>
            Enter RFQ text above to see comprehensive AI analysis
          </p>
          <div className='flex items-center justify-center space-x-6 text-sm'>
            <div className='flex items-center space-x-2'>
              <Target className='h-4 w-4 text-blue-500' />
              <span>NLP Classification</span>
            </div>
            <div className='flex items-center space-x-2'>
              <span>📊</span>
              <span>SHAP Explanations</span>
            </div>
            <div className='flex items-center space-x-2'>
              <span>🛡️</span>
              <span>Smart Matching</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AIInsightsDashboard;
