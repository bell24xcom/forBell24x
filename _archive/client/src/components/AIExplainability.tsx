'use client';

<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Info, TrendingUp, TrendingDown, Shield, Clock, Star, Award, AlertTriangle } from 'lucide-react';

interface ExplainabilityData {
  matchScore: number;
  primaryReasons: string[];
  categoryMatch: string;
  locationAdvantage: string;
  experienceRelevance: string;
  certificationMatch: string;
  riskFactors: string[];
  confidenceLevel: 'high' | 'medium' | 'low';
  alternativeSuppliers: string[];
  recommendation: string;
  featureImportance: {
    categoryMatch: number;
    locationProximity: number;
    experienceLevel: number;
    certificationMatch: number;
    responseTime: number;
  };
}

interface AIExplainabilityProps {
  rfqId: string;
  supplierId: string;
  matchScore: number;
  onClose: () => void;
}

export default function AIExplainability({ rfqId, supplierId, matchScore, onClose }: AIExplainabilityProps) {
  const [data, setData] = useState<ExplainabilityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchExplainability();
  }, [rfqId, supplierId, matchScore]);

  const fetchExplainability = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ai/explain-match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rfqId,
          supplierId,
          matchScore,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setData(result.data.explanation);
      } else {
        setError(result.error || 'Failed to generate explanation');
      }
    } catch (error) {
      setError('Failed to fetch explanation data');
      console.error('Explainability error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskColor = (risk: string) => {
    if (risk.includes('low') || risk.includes('excellent')) return 'text-green-600';
    if (risk.includes('medium') || risk.includes('good')) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Generating AI explanation...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={onClose}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Prepare chart data
  const featureData = Object.entries(data.featureImportance).map(([key, value]) => ({
    feature: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
    importance: value * 100,
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              🤖 AI Match Explanation
            </h2>
            <p className="text-gray-600">
              Understanding why this supplier was matched to your RFQ
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Match Score */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Match Score: {data.matchScore}%
              </h3>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(data.confidenceLevel)}`}>
                <Info className="w-4 h-4 mr-1" />
                {data.confidenceLevel.toUpperCase()} Confidence
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">{data.matchScore}%</div>
              <div className="text-sm text-gray-500">Match Quality</div>
=======
import React from 'react';
import { Brain, BarChart3, TrendingUp, Shield } from 'lucide-react';

export default function AIExplainability() {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Brain className="w-6 h-6 text-purple-600" />
          <h3 className="text-2xl font-bold text-gray-900">AI Explainability</h3>
        </div>
        <p className="text-gray-600">
          Transparent AI decision-making with SHAP values and LIME explanations
        </p>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            <h4 className="font-semibold text-gray-900">SHAP Analysis</h4>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            SHapley Additive exPlanations show how each feature contributes to the AI's decision.
          </p>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">Price Match</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">+0.35</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">Delivery Time</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">+0.28</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">Quality Score</span>
              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">+0.22</span>
>>>>>>> b7b4b9c6cd126094e89116e18b3dbb247f1e8e4d
            </div>
          </div>
        </div>

<<<<<<< HEAD
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Feature Importance Chart */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📊 Feature Importance
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={featureData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="feature" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}%`, 'Importance']} />
                <Bar dataKey="importance" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Primary Reasons */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🎯 Primary Matching Reasons
            </h3>
            <div className="space-y-3">
              {data.primaryReasons.map((reason, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </div>
                  <p className="text-gray-700">{reason}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="bg-white border rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
              Strengths
            </h3>
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-gray-900">Category Match</h4>
                <p className="text-gray-600 text-sm">{data.categoryMatch}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Location Advantage</h4>
                <p className="text-gray-600 text-sm">{data.locationAdvantage}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Experience Relevance</h4>
                <p className="text-gray-600 text-sm">{data.experienceRelevance}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Certification Match</h4>
                <p className="text-gray-600 text-sm">{data.certificationMatch}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-yellow-600" />
              Risk Factors
            </h3>
            <div className="space-y-3">
              {data.riskFactors.map((risk, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-600 text-sm">{risk}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Alternative Suppliers */}
        {data.alternativeSuppliers.length > 0 && (
          <div className="bg-white border rounded-lg p-4 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🔄 Alternative Suppliers
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {data.alternativeSuppliers.map((supplier, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-lg">
                  <div className="font-medium text-gray-900">{supplier}</div>
                  <div className="text-sm text-gray-500">Alternative #{index + 1}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Recommendation */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            💡 AI Recommendation
          </h3>
          <p className="text-blue-800">{data.recommendation}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            Close
          </button>
          <button
            onClick={() => window.print()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Export Report
          </button>
=======
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-gray-900">LIME Explanations</h4>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Local Interpretable Model-agnostic Explanations provide simple, understandable insights.
          </p>
          <div className="bg-white rounded p-3 text-sm text-gray-700">
            This supplier matches because: <strong>competitive pricing</strong>, <strong>fast delivery</strong>, and <strong>high quality rating</strong>.
          </div>
        </div>

        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-green-600" />
            <h4 className="font-semibold text-gray-900">Trust Score</h4>
          </div>
          <p className="text-sm text-gray-600">
            Overall AI confidence: <span className="font-bold text-green-600">92%</span>
          </p>
>>>>>>> b7b4b9c6cd126094e89116e18b3dbb247f1e8e4d
        </div>
      </div>
    </div>
  );
<<<<<<< HEAD
} 
=======
}

>>>>>>> b7b4b9c6cd126094e89116e18b3dbb247f1e8e4d
