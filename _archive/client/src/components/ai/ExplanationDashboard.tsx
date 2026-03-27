'use client';
import { useState, useEffect } from 'react';
import { AIExplanation, DecisionType } from '@/types/aiExplanation';
import { aiExplanationService } from '@/services/aiExplanation';
import { FeatureImportanceChart } from './FeatureImportanceChart';
import { ExplanationHistory } from './ExplanationHistory';

interface DashboardMetrics {
  totalExplanations: number;
  averageConfidence: number;
  mostCommonDecisionType: DecisionType;
  recentActivity: number;
}

export default function ExplanationDashboard() {
  const [explanations, setExplanations] = useState<AIExplanation[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedExplanation, setSelectedExplanation] = useState<AIExplanation | null>(null);
  const [filters, setFilters] = useState<{
    decisionType?: DecisionType[];
    dateRange?: { start: Date; end: Date };
    confidenceMin?: number;
  }>({});

  useEffect(() => {
    loadDashboardData();
    setupRealTimeUpdates();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load recent explanations
      const history = await aiExplanationService.getExplanationHistory(1, 10);
      setExplanations(history.explanations);

      // Calculate metrics
      const calculatedMetrics = calculateMetrics(history.explanations);
      setMetrics(calculatedMetrics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const setupRealTimeUpdates = () => {
    const unsubscribe = aiExplanationService.subscribeToUpdates(update => {
      if (update.type === 'new_explanation') {
        setExplanations(prev => [update.explanation, ...prev.slice(0, 9)]);
        // Update metrics
        setMetrics(prev =>
          prev ? calculateMetrics([update.explanation, ...explanations.slice(0, 9)]) : null
        );
      }
    });

    return unsubscribe;
  };

  const calculateMetrics = (data: AIExplanation[]): DashboardMetrics => {
    if (data.length === 0) {
      return {
        totalExplanations: 0,
        averageConfidence: 0,
        mostCommonDecisionType: 'supplier_recommendation',
        recentActivity: 0,
      };
    }

    const totalExplanations = data.length;
    const averageConfidence =
      data.reduce((sum, exp) => sum + exp.confidence, 0) / totalExplanations;

    const decisionTypeCounts = data.reduce((acc, exp) => {
      acc[exp.decisionType] = (acc[exp.decisionType] || 0) + 1;
      return acc;
    }, {} as Record<DecisionType, number>);

    const mostCommonDecisionType = Object.entries(decisionTypeCounts).sort(
      ([, a], [, b]) => b - a
    )[0][0] as DecisionType;

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentActivity = data.filter(exp => new Date(exp.timestamp) > oneHourAgo).length;

    return {
      totalExplanations,
      averageConfidence: Math.round(averageConfidence * 100) / 100,
      mostCommonDecisionType,
      recentActivity,
    };
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    // Apply filters to current data or reload with filters
  };

  const handleExport = async () => {
    try {
      const response = await fetch('/api/ai/explanations/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai-explanations-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-slate-900 flex items-center justify-center'>
        <div className='text-white text-xl'>Loading AI Explanation Dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen bg-slate-900 flex items-center justify-center'>
        <div className='text-red-400 text-xl'>Error: {error}</div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-slate-900 text-white p-8'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold mb-2'>AI Explanation Dashboard</h1>
              <p className='text-slate-400'>
                Understand and analyze AI-driven procurement decisions
              </p>
            </div>
            <div className='flex space-x-4'>
              <button
                onClick={loadDashboardData}
                className='flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg transition-colors'
              >
                <span>🔄</span>
                <span>Refresh</span>
              </button>
              <button
                onClick={handleExport}
                className='flex items-center space-x-2 bg-amber-600 hover:bg-amber-700 px-4 py-2 rounded-lg transition-colors'
              >
                <span>⬇️</span>
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Metrics Cards */}
        {metrics && (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
            <div className='bg-slate-800 rounded-xl p-6 border border-slate-700'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-slate-400 text-sm'>Total Explanations</p>
                  <p className='text-2xl font-bold text-white'>{metrics.totalExplanations}</p>
                </div>
                <span>📊</span>
              </div>
            </div>

            <div className='bg-slate-800 rounded-xl p-6 border border-slate-700'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-slate-400 text-sm'>Avg Confidence</p>
                  <p className='text-2xl font-bold text-white'>{metrics.averageConfidence}%</p>
                </div>
                <span>📈</span>
              </div>
            </div>

            <div className='bg-slate-800 rounded-xl p-6 border border-slate-700'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-slate-400 text-sm'>Most Common Type</p>
                  <p className='text-lg font-semibold text-white capitalize'>
                    {metrics.mostCommonDecisionType.replace('_', ' ')}
                  </p>
                </div>
                <span>🔍</span>
              </div>
            </div>

            <div className='bg-slate-800 rounded-xl p-6 border border-slate-700'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-slate-400 text-sm'>Recent Activity</p>
                  <p className='text-2xl font-bold text-white'>{metrics.recentActivity}</p>
                </div>
                <span>🕐</span>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Feature Importance Chart */}
          <div className='lg:col-span-2'>
            <div className='bg-slate-800 rounded-xl p-6 border border-slate-700'>
              <h2 className='text-xl font-semibold mb-4'>Feature Importance Analysis</h2>
              {explanations.length > 0 ? (
                <FeatureImportanceChart explanations={explanations} />
              ) : (
                <div className='text-slate-400 text-center py-8'>
                  No explanations available for analysis
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className='space-y-6'>
            <div className='bg-slate-800 rounded-xl p-6 border border-slate-700'>
              <h3 className='text-lg font-semibold mb-4'>Quick Actions</h3>
              <div className='space-y-3'>
                <button className='w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors'>
                  Generate New Explanation
                </button>
                <button className='w-full bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg transition-colors'>
                  View All Explanations
                </button>
                <button className='w-full bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg transition-colors'>
                  Export Report
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className='bg-slate-800 rounded-xl p-6 border border-slate-700'>
              <h3 className='text-lg font-semibold mb-4'>Recent Activity</h3>
              <div className='space-y-3'>
                {explanations.slice(0, 5).map(explanation => (
                  <div
                    key={explanation.id}
                    className='p-3 bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-600 transition-colors'
                    onClick={() => setSelectedExplanation(explanation)}
                  >
                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='text-sm font-medium capitalize'>
                          {explanation.decisionType.replace('_', ' ')}
                        </p>
                        <p className='text-xs text-slate-400'>
                          {new Date(explanation.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      <div className='text-right'>
                        <p className='text-sm font-medium'>{explanation.confidence}%</p>
                        <p className='text-xs text-slate-400'>confidence</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Explanation History */}
        <div className='mt-8'>
          <ExplanationHistory
            explanations={explanations}
            onExplanationSelect={setSelectedExplanation}
            filters={filters}
            onFiltersChange={handleFilterChange}
          />
        </div>
      </div>
    </div>
  );
}
