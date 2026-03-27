'use client';

<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Shield, AlertTriangle, CheckCircle, Clock, Award, TrendingUp, TrendingDown, Info } from 'lucide-react';

interface RiskFactors {
  financialHealth: number;
  deliveryHistory: number;
  certifications: number;
  marketReputation: number;
  responseTime: number;
  clientSatisfaction: number;
  legalCompliance: number;
  technicalCapability: number;
}

interface RiskScore {
  overallScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  factors: RiskFactors;
  breakdown: {
    [key: string]: {
      score: number;
      weight: number;
      impact: string;
    };
  };
  recommendations: string[];
  lastUpdated: string;
}

interface SupplierRiskScoreProps {
  supplierId: string;
  onClose?: () => void;
}

export default function SupplierRiskScore({ supplierId, onClose }: SupplierRiskScoreProps) {
  const [riskData, setRiskData] = useState<RiskScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRiskScore();
  }, [supplierId]);

  const fetchRiskScore = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/supplier/risk-score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          supplierId,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setRiskData(result.data);
      } else {
        setError(result.error || 'Failed to calculate risk score');
      }
    } catch (error) {
      setError('Failed to fetch risk score data');
      console.error('Risk score error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'LOW': return 'text-green-600 bg-green-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      case 'HIGH': return 'text-orange-600 bg-orange-100';
      case 'CRITICAL': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    if (score >= 0.4) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 0.8) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (score >= 0.6) return <Clock className="w-5 h-5 text-yellow-600" />;
    if (score >= 0.4) return <AlertTriangle className="w-5 h-5 text-orange-600" />;
    return <AlertTriangle className="w-5 h-5 text-red-600" />;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Calculating risk score...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!riskData) return null;

  // Prepare chart data
  const radarData = Object.entries(riskData.factors).map(([key, value]) => ({
    factor: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
    score: value * 100,
  }));

  const barData = Object.entries(riskData.breakdown).map(([key, data]) => ({
    factor: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
    score: data.score * 100,
    weight: data.weight * 100,
  }));

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            🛡️ Supplier Risk Assessment
          </h2>
          <p className="text-gray-600">
            Comprehensive risk analysis and recommendations
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      {/* Overall Risk Score */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Overall Risk Score: {Math.round(riskData.overallScore * 100)}%
            </h3>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRiskLevelColor(riskData.riskLevel)}`}>
              <Shield className="w-4 h-4 mr-1" />
              {riskData.riskLevel} RISK
            </div>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${getScoreColor(riskData.overallScore)}`}>
              {Math.round(riskData.overallScore * 100)}%
            </div>
            <div className="text-sm text-gray-500">Risk Score</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Radar Chart */}
        <div className="bg-white border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            📊 Risk Factor Analysis
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="factor" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar
                name="Risk Score"
                dataKey="score"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.3}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Factor Breakdown */}
        <div className="bg-white border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            📋 Risk Factor Breakdown
          </h3>
          <div className="space-y-4">
            {Object.entries(riskData.breakdown).map(([factor, data]) => (
              <div key={factor} className="border-b pb-3 last:border-b-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getScoreIcon(data.score)}
                    <span className="font-medium text-gray-900">
                      {factor.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </span>
                  </div>
                  <div className={`font-semibold ${getScoreColor(data.score)}`}>
                    {Math.round(data.score * 100)}%
                  </div>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Weight: {Math.round(data.weight * 100)}%</span>
                  <span>{data.impact}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white border rounded-lg p-4 mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Info className="w-5 h-5 mr-2 text-blue-600" />
          Risk Management Recommendations
        </h3>
        <div className="space-y-3">
          {riskData.recommendations.map((recommendation, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                {index + 1}
              </div>
              <p className="text-gray-700">{recommendation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Level Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="font-semibold text-green-800">Low Risk</span>
          </div>
          <p className="text-green-700 text-sm">Safe to proceed with standard terms</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="w-5 h-5 text-yellow-600" />
            <span className="font-semibold text-yellow-800">Medium Risk</span>
          </div>
          <p className="text-yellow-700 text-sm">Proceed with caution and monitoring</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <span className="font-semibold text-orange-800">High Risk</span>
          </div>
          <p className="text-orange-700 text-sm">Requires additional safeguards</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="font-semibold text-red-800">Critical Risk</span>
          </div>
          <p className="text-red-700 text-sm">Avoid or implement strict controls</p>
        </div>
      </div>

      {/* Last Updated */}
      <div className="text-center text-sm text-gray-500 mt-6">
        Last updated: {new Date(riskData.lastUpdated).toLocaleString()}
      </div>
    </div>
  );
} 
=======
import React from 'react';
import { Shield, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

export default function SupplierRiskScore() {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-6 h-6 text-green-600" />
          <h3 className="text-2xl font-bold text-gray-900">Supplier Risk Assessment</h3>
        </div>
        <p className="text-gray-600">
          ML-powered supplier risk analysis based on financial stability, delivery performance, and compliance history
        </p>
      </div>

      <div className="mb-6">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Overall Risk Score</p>
              <p className="text-4xl font-bold">Low Risk</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">85/100</p>
              <p className="text-sm opacity-90">Excellent</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-gray-900">Financial Stability</span>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              Low Risk
            </span>
          </div>
          <p className="text-sm text-gray-600">
            Strong financial indicators, positive cash flow, and stable credit rating.
          </p>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '92%' }}></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Score: 92/100</p>
          </div>
        </div>

        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <span className="font-semibold text-gray-900">Delivery Performance</span>
            </div>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
              Medium Risk
            </span>
          </div>
          <p className="text-sm text-gray-600">
            Generally reliable with occasional delays. On-time delivery rate: 87%.
          </p>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '75%' }}></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Score: 75/100</p>
          </div>
        </div>

        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-gray-900">Compliance History</span>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              Low Risk
            </span>
          </div>
          <p className="text-sm text-gray-600">
            Clean compliance record, all certifications valid, no regulatory issues.
          </p>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '88%' }}></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Score: 88/100</p>
          </div>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-gray-900">Business Continuity</span>
            </div>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              Low Risk
            </span>
          </div>
          <p className="text-sm text-gray-600">
            Established business with 12+ years of operation and strong market presence.
          </p>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Score: 85/100</p>
          </div>
        </div>
      </div>
    </div>
  );
}

>>>>>>> b7b4b9c6cd126094e89116e18b3dbb247f1e8e4d
