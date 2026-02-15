'use client';

import React, { useState } from 'react';
import { TrendingUp, BarChart3, PieChart, Activity, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export default function PredictiveAnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  const predictions = {
    marketTrends: [
      { category: 'Steel & Metal', currentPrice: 45000, predictedPrice: 46500, change: 3.3, confidence: 87 },
      { category: 'Automotive', currentPrice: 32000, predictedPrice: 31000, change: -3.1, confidence: 92 },
      { category: 'Chemicals', currentPrice: 28000, predictedPrice: 29200, change: 4.3, confidence: 85 },
      { category: 'Electronics', currentPrice: 15000, predictedPrice: 15800, change: 5.3, confidence: 89 },
    ],
    demandForecast: [
      { month: 'Feb', predicted: 45, actual: 42, confidence: 88 },
      { month: 'Mar', predicted: 52, actual: null, confidence: 85 },
      { month: 'Apr', predicted: 48, actual: null, confidence: 82 },
      { month: 'May', predicted: 61, actual: null, confidence: 90 },
    ],
    riskAlerts: [
      { type: 'high', message: 'Steel prices expected to rise 5% in next 30 days', impact: 'High', action: 'Consider advance purchase' },
      { type: 'medium', message: 'Automotive demand declining in Q2', impact: 'Medium', action: 'Diversify supplier base' },
      { type: 'low', message: 'Chemical supply chain stable', impact: 'Low', action: 'Continue current strategy' },
    ]
  };

  const PredictionCard = ({ title, value, change, confidence, icon: Icon, color = 'blue' }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Icon className={`w-8 h-8 text-${color}-600 mr-3`} />
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <span className={`px-2 py-1 text-xs rounded-full ${
          confidence >= 90 ? 'bg-green-100 text-green-800' :
          confidence >= 80 ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {confidence}% confidence
        </span>
      </div>
      <div className="text-center">
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        <p className={`text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {change >= 0 ? '+' : ''}{change}%
        </p>
      </div>
    </div>
  );

  const RiskAlert = ({ alert }) => {
    const alertConfig = {
      high: { color: 'bg-red-100 text-red-800', icon: AlertTriangle },
      medium: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      low: { color: 'bg-green-100 text-green-800', icon: CheckCircle }
    };
    
    const config = alertConfig[alert.type];
    const Icon = config.icon;
    
    return (
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-start">
          <Icon className={`w-5 h-5 mt-0.5 mr-3 ${
            alert.type === 'high' ? 'text-red-600' :
            alert.type === 'medium' ? 'text-yellow-600' :
            'text-green-600'
          }`} />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 mb-1">{alert.message}</p>
            <div className="flex items-center space-x-4 text-xs text-gray-600">
              <span>Impact: {alert.impact}</span>
              <span>•</span>
              <span>Action: {alert.action}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Predictive Analytics</h1>
          <p className="text-gray-600">AI-powered insights and market predictions</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Refresh Predictions
          </button>
        </div>
      </div>

      {/* Market Price Predictions */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Market Price Predictions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {predictions.marketTrends.map((trend, index) => (
            <PredictionCard
              key={index}
              title={trend.category}
              value={`₹${trend.predictedPrice.toLocaleString()}`}
              change={trend.change}
              confidence={trend.confidence}
              icon={TrendingUp}
              color={trend.change >= 0 ? 'green' : 'red'}
            />
          ))}
        </div>
      </div>

      {/* Demand Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Demand Forecast</h3>
          <div className="space-y-4">
            {predictions.demandForecast.map((forecast, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{forecast.month}</p>
                  <p className="text-xs text-gray-500">Predicted: {forecast.predicted} RFQs</p>
                </div>
                <div className="text-right">
                  {forecast.actual ? (
                    <p className="text-sm text-gray-600">Actual: {forecast.actual}</p>
                  ) : (
                    <p className="text-sm text-blue-600">Prediction</p>
                  )}
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    forecast.confidence >= 90 ? 'bg-green-100 text-green-800' :
                    forecast.confidence >= 80 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {forecast.confidence}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Insights</h3>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Market Analysis</h4>
              <p className="text-sm text-blue-800">
                Steel and Electronics sectors showing strong growth potential. 
                Consider increasing RFQ activity in these categories.
              </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-yellow-900 mb-2">Risk Assessment</h4>
              <p className="text-sm text-yellow-800">
                Automotive sector showing signs of decline. 
                Diversify supplier base to mitigate risks.
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-green-900 mb-2">Opportunities</h4>
              <p className="text-sm text-green-800">
                Chemical sector stable with good pricing. 
                Ideal time for bulk purchases.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Alerts */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Risk Alerts & Recommendations</h2>
        <div className="space-y-3">
          {predictions.riskAlerts.map((alert, index) => (
            <RiskAlert key={index} alert={alert} />
          ))}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
          <Activity className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Prediction Accuracy</h3>
          <p className="text-3xl font-bold text-blue-600">87.3%</p>
          <p className="text-sm text-gray-600">Last 30 days</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
          <BarChart3 className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Cost Savings</h3>
          <p className="text-3xl font-bold text-green-600">₹2.4L</p>
          <p className="text-sm text-gray-600">From predictions</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
          <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Success Rate</h3>
          <p className="text-3xl font-bold text-purple-600">94.2%</p>
          <p className="text-sm text-gray-600">RFQ matches</p>
        </div>
      </div>
    </div>
  );
}