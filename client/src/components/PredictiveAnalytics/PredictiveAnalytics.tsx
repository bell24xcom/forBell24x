'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Target, AlertTriangle, CheckCircle, BarChart3, Download, Eye } from 'lucide-react';

interface Prediction {
  id: number;
  supplierName: string;
  successRate: number;
  confidence: number;
  riskFactors: string[];
  recommendations: string[];
  lastUpdated: string;
}

interface SupplierReliability {
  id: number;
  name: string;
  reliabilityScore: number;
  trend: 'improving' | 'stable' | 'declining';
  riskLevel: 'low' | 'medium' | 'high';
  keyMetrics: {
    onTimeDelivery: number;
    qualityRating: number;
    complianceScore: number;
    financialHealth: number;
  };
}

interface MarketTrend {
  category: string;
  demandTrend: 'rising' | 'stable' | 'falling';
  priceVolatility: number;
  supplierCompetition: number;
  forecast: {
    nextMonth: number;
    nextQuarter: number;
    nextYear: number;
  };
}

export default function PredictiveAnalytics() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [reliabilityData, setReliabilityData] = useState<SupplierReliability[]>([]);
  const [marketTrends, setMarketTrends] = useState<MarketTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'month' | 'quarter' | 'year'>('month');

  useEffect(() => {
    fetchPredictiveData();
  }, [selectedTimeframe]);

  const fetchPredictiveData = async () => {
    try {
      setLoading(true);
      
      // Fetch predictions
      const predictionsResponse = await fetch('/api/analytics/success-predictions');
      if (predictionsResponse.ok) {
        const predictionsData = await predictionsResponse.json();
        setPredictions(predictionsData);
      }

      // Fetch reliability data
      const reliabilityResponse = await fetch('/api/analytics/supplier-reliability');
      if (reliabilityResponse.ok) {
        const reliabilityData = await reliabilityResponse.json();
        setReliabilityData(reliabilityData);
      }

      // Fetch market trends
      const trendsResponse = await fetch('/api/analytics/market-trends');
      if (trendsResponse.ok) {
        const trendsData = await trendsResponse.json();
        setMarketTrends(trendsData);
      }
    } catch (error) {
      console.error('Error fetching predictive data:', error);
      // Fallback to mock data
      setPredictions(generateMockPredictions());
      setReliabilityData(generateMockReliabilityData());
      setMarketTrends(generateMockMarketTrends());
    } finally {
      setLoading(false);
    }
  };

  const generateMockPredictions = (): Prediction[] => [
    {
      id: 1,
      supplierName: 'TechCorp Industries',
      successRate: 92,
      confidence: 0.89,
      riskFactors: ['Seasonal demand fluctuations'],
      recommendations: ['Increase inventory during peak seasons', 'Strengthen quality control'],
      lastUpdated: '2024-01-15'
    },
    {
      id: 2,
      supplierName: 'Global Manufacturing Ltd',
      successRate: 78,
      confidence: 0.76,
      riskFactors: ['Supply chain disruptions', 'Quality inconsistencies'],
      recommendations: ['Diversify suppliers', 'Implement stricter QC protocols'],
      lastUpdated: '2024-01-15'
    },
    {
      id: 3,
      supplierName: 'Precision Parts Co',
      successRate: 95,
      confidence: 0.94,
      riskFactors: ['High competition for capacity'],
      recommendations: ['Secure long-term contracts', 'Maintain premium pricing'],
      lastUpdated: '2024-01-15'
    }
  ];

  const generateMockReliabilityData = (): SupplierReliability[] => [
    {
      id: 1,
      name: 'TechCorp Industries',
      reliabilityScore: 87,
      trend: 'improving',
      riskLevel: 'low',
      keyMetrics: {
        onTimeDelivery: 94,
        qualityRating: 4.2,
        complianceScore: 92,
        financialHealth: 85
      }
    },
    {
      id: 2,
      name: 'Global Manufacturing Ltd',
      reliabilityScore: 72,
      trend: 'declining',
      riskLevel: 'medium',
      keyMetrics: {
        onTimeDelivery: 78,
        qualityRating: 3.8,
        complianceScore: 75,
        financialHealth: 68
      }
    },
    {
      id: 3,
      name: 'Precision Parts Co',
      reliabilityScore: 94,
      trend: 'stable',
      riskLevel: 'low',
      keyMetrics: {
        onTimeDelivery: 96,
        qualityRating: 4.6,
        complianceScore: 95,
        financialHealth: 92
      }
    }
  ];

  const generateMockMarketTrends = (): MarketTrend[] => [
    {
      category: 'Electronics',
      demandTrend: 'rising',
      priceVolatility: 0.15,
      supplierCompetition: 8.5,
      forecast: {
        nextMonth: 12,
        nextQuarter: 18,
        nextYear: 25
      }
    },
    {
      category: 'Automotive',
      demandTrend: 'stable',
      priceVolatility: 0.08,
      supplierCompetition: 7.2,
      forecast: {
        nextMonth: 5,
        nextQuarter: 8,
        nextYear: 12
      }
    },
    {
      category: 'Pharmaceuticals',
      demandTrend: 'rising',
      priceVolatility: 0.22,
      supplierCompetition: 9.1,
      forecast: {
        nextMonth: 15,
        nextQuarter: 22,
        nextYear: 35
      }
    }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'declining':
        return <TrendingUp className="w-4 h-4 text-red-500 transform rotate-180" />;
      default:
        return <Target className="w-4 h-4 text-blue-500" />;
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'high':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getDemandTrendColor = (trend: string) => {
    switch (trend) {
      case 'rising':
        return 'text-green-600';
      case 'falling':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Predictive Analytics</h1>
          <p className="text-gray-600">AI-powered insights for better decision making</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="month">Next Month</option>
            <option value="quarter">Next Quarter</option>
            <option value="year">Next Year</option>
          </select>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Success Rate Predictions */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Success Rate Predictions</h2>
          <span className="text-sm text-gray-500">Updated: {new Date().toLocaleDateString()}</span>
        </div>
        <div className="space-y-4">
          {predictions.map((prediction) => (
            <div key={prediction.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-medium text-gray-900">{prediction.supplierName}</h3>
                  <p className="text-sm text-gray-500">Confidence: {(prediction.confidence * 100).toFixed(0)}%</p>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${
                    prediction.successRate >= 90 ? 'text-green-600' : 
                    prediction.successRate >= 80 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {prediction.successRate}%
                  </div>
                  <div className="text-sm text-gray-500">Success Rate</div>
                </div>
              </div>
              
              {prediction.riskFactors.length > 0 && (
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Risk Factors:</h4>
                  <div className="flex flex-wrap gap-2">
                    {prediction.riskFactors.map((factor, index) => (
                      <span key={index} className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                        {factor}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {prediction.recommendations.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Recommendations:</h4>
                  <ul className="space-y-1">
                    {prediction.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Supplier Reliability Scoring */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Supplier Reliability Scoring</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reliability Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trend</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Key Metrics</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reliabilityData.map((supplier) => (
                <tr key={supplier.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{supplier.reliabilityScore}%</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getTrendIcon(supplier.trend)}
                      <span className="text-sm text-gray-900 capitalize">{supplier.trend}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRiskLevelColor(supplier.riskLevel)}`}>
                      {supplier.riskLevel}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div>Delivery: {supplier.keyMetrics.onTimeDelivery}%</div>
                      <div>Quality: {supplier.keyMetrics.qualityRating}/5</div>
                      <div>Compliance: {supplier.keyMetrics.complianceScore}%</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Market Trend Analysis */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Market Trend Analysis</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {marketTrends.map((trend) => (
            <div key={trend.category} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-medium text-gray-900">{trend.category}</h3>
                <span className={`text-sm font-medium ${getDemandTrendColor(trend.demandTrend)} capitalize`}>
                  {trend.demandTrend}
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Price Volatility:</span>
                  <span className="font-medium">{(trend.priceVolatility * 100).toFixed(1)}%</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Competition:</span>
                  <span className="font-medium">{trend.supplierCompetition}/10</span>
                </div>
                
                <div className="border-t pt-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Demand Forecast</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Next Month:</span>
                      <span className="font-medium">+{trend.forecast.nextMonth}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Next Quarter:</span>
                      <span className="font-medium">+{trend.forecast.nextQuarter}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Next Year:</span>
                      <span className="font-medium">+{trend.forecast.nextYear}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
