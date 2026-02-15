'use client';
import { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { AIExplanation, FeatureImportance } from '@/types/aiExplanation';

interface FeatureImportanceChartProps {
  explanations: AIExplanation[];
  maxFeatures?: number;
  height?: number;
}

interface ChartDataPoint {
  feature: string;
  importance: number;
  impact: string;
  description: string;
  category: string;
  count: number;
}

export function FeatureImportanceChart({
  explanations,
  maxFeatures = 10,
  height = 400,
}: FeatureImportanceChartProps) {
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);

  const chartData = useMemo(() => {
    if (!explanations.length) return [];

    // Aggregate feature importance across all explanations
    const featureMap = new Map<
      string,
      {
        totalImportance: number;
        count: number;
        impacts: string[];
        descriptions: string[];
        categories: string[];
      }
    >();

    explanations.forEach(explanation => {
      explanation.featureImportance.forEach(feature => {
        const existing = featureMap.get(feature.feature) || {
          totalImportance: 0,
          count: 0,
          impacts: [],
          descriptions: [],
          categories: [],
        };

        existing.totalImportance += feature.importance;
        existing.count += 1;
        existing.impacts.push(feature.impact);
        existing.descriptions.push(feature.description);
        if (feature.category) {
          existing.categories.push(feature.category);
        }

        featureMap.set(feature.feature, existing);
      });
    });

    // Convert to chart data format
    const data: ChartDataPoint[] = Array.from(featureMap.entries())
      .map(([feature, data]) => ({
        feature,
        importance: data.totalImportance / data.count, // Average importance
        impact: data.impacts[0], // Most common impact
        description: data.descriptions[0], // Most common description
        category: data.categories[0] || 'General',
        count: data.count,
      }))
      .sort((a, b) => b.importance - a.importance)
      .slice(0, maxFeatures);

    return data;
  }, [explanations, maxFeatures]);

  const getColor = (impact: string, isHovered: boolean = false) => {
    if (isHovered) return '#3b82f6'; // Blue for hover

    switch (impact) {
      case 'positive':
        return '#10b981'; // Green
      case 'negative':
        return '#ef4444'; // Red
      case 'neutral':
        return '#6b7280'; // Gray
      default:
        return '#8b5cf6'; // Purple
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as ChartDataPoint;
      return (
        <div className='bg-slate-800 border border-slate-600 rounded-lg p-4 shadow-lg'>
          <p className='font-semibold text-white mb-2'>{data.feature}</p>
          <div className='space-y-1 text-sm'>
            <p>
              <span className='text-slate-400'>Importance:</span>{' '}
              <span className='text-white'>{data.importance.toFixed(2)}</span>
            </p>
            <p>
              <span className='text-slate-400'>Impact:</span>{' '}
              <span className='text-white capitalize'>{data.impact}</span>
            </p>
            <p>
              <span className='text-slate-400'>Category:</span>{' '}
              <span className='text-white'>{data.category}</span>
            </p>
            <p>
              <span className='text-slate-400'>Occurrences:</span>{' '}
              <span className='text-white'>{data.count}</span>
            </p>
            <p className='text-slate-300 mt-2'>{data.description}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  const handleBarClick = (data: any) => {
    setSelectedFeature(data.feature);
    // You can implement drill-down functionality here
    console.log('Selected feature:', data.feature);
  };

  const handleExport = () => {
    const csvContent = [
      'Feature,Importance,Impact,Category,Description,Occurrences',
      ...chartData.map(
        item =>
          `"${item.feature}",${item.importance.toFixed(2)},"${item.impact}","${item.category}","${
            item.description
          }",${item.count}`
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `feature-importance-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!chartData.length) {
    return (
      <div className='flex items-center justify-center h-64 text-slate-400'>
        No feature importance data available
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {/* Chart Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-lg font-semibold text-white'>Feature Importance Analysis</h3>
          <p className='text-sm text-slate-400'>
            Top {maxFeatures} most important features across {explanations.length} explanations
          </p>
        </div>
        <button
          onClick={handleExport}
          className='bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded text-sm transition-colors'
        >
          Export CSV
        </button>
      </div>

      {/* Chart */}
      <div className='bg-slate-900 rounded-lg p-4'>
        <ResponsiveContainer width='100%' height={height}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            onMouseMove={data => {
              if (data.activeLabel) {
                setHoveredFeature(data.activeLabel);
              }
            }}
            onMouseLeave={() => setHoveredFeature(null)}
          >
            <CartesianGrid strokeDasharray='3 3' stroke='#374151' />
            <XAxis
              dataKey='feature'
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              axisLine={{ stroke: '#374151' }}
              tickLine={{ stroke: '#374151' }}
              angle={-45}
              textAnchor='end'
              height={80}
            />
            <YAxis
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              axisLine={{ stroke: '#374151' }}
              tickLine={{ stroke: '#374151' }}
              label={{
                value: 'Importance Score',
                angle: -90,
                position: 'insideLeft',
                style: { textAnchor: 'middle', fill: '#9ca3af' },
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey='importance' onClick={handleBarClick} cursor='pointer'>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getColor(entry.impact, hoveredFeature === entry.feature)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className='flex items-center justify-center space-x-6 text-sm'>
        <div className='flex items-center space-x-2'>
          <div className='w-3 h-3 bg-green-500 rounded'></div>
          <span className='text-slate-400'>Positive Impact</span>
        </div>
        <div className='flex items-center space-x-2'>
          <div className='w-3 h-3 bg-red-500 rounded'></div>
          <span className='text-slate-400'>Negative Impact</span>
        </div>
        <div className='flex items-center space-x-2'>
          <div className='w-3 h-3 bg-gray-500 rounded'></div>
          <span className='text-slate-400'>Neutral Impact</span>
        </div>
      </div>

      {/* Selected Feature Details */}
      {selectedFeature && (
        <div className='bg-slate-800 rounded-lg p-4 border border-slate-600'>
          <h4 className='font-semibold text-white mb-2'>Feature Details: {selectedFeature}</h4>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
            <div>
              <p className='text-slate-400'>Average Importance</p>
              <p className='text-white font-medium'>
                {chartData.find(d => d.feature === selectedFeature)?.importance.toFixed(2)}
              </p>
            </div>
            <div>
              <p className='text-slate-400'>Impact Type</p>
              <p className='text-white font-medium capitalize'>
                {chartData.find(d => d.feature === selectedFeature)?.impact}
              </p>
            </div>
            <div>
              <p className='text-slate-400'>Category</p>
              <p className='text-white font-medium'>
                {chartData.find(d => d.feature === selectedFeature)?.category}
              </p>
            </div>
            <div>
              <p className='text-slate-400'>Occurrences</p>
              <p className='text-white font-medium'>
                {chartData.find(d => d.feature === selectedFeature)?.count}
              </p>
            </div>
          </div>
          <p className='text-slate-300 mt-3'>
            {chartData.find(d => d.feature === selectedFeature)?.description}
          </p>
        </div>
      )}
    </div>
  );
}
