'use client';

import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';

interface FinancialHealthData {
  healthScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  creditRating: string;
  strengths: string[];
  concerns: string[];
  recommendation: string;
  trustBadge: 'verified' | 'caution' | 'unverified';
  creditLimit: number;
  paymentTerms: string;
  confidence: number;
  lastUpdated: string;
  reportId: string;
}

interface FinancialHealthWidgetProps {
  gstNumber?: string;
  companyData?: any;
  showDetails?: boolean;
  className?: string;
}

export default function FinancialHealthWidget({ 
  gstNumber, 
  companyData, 
  showDetails = false,
  className = ''
}: FinancialHealthWidgetProps) {
  const [healthData, setHealthData] = useState<FinancialHealthData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeHealth = async () => {
    if (!gstNumber) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/financial-health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          gstNumber, 
          companyData 
        })
      });

      const result = await response.json();

      if (result.success) {
        setHealthData(result.data);
      } else {
        setError(result.message || 'Analysis failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (gstNumber) {
      analyzeHealth();
    }
  }, [gstNumber]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getTrustBadgeIcon = (badge: string) => {
    switch (badge) {
      case 'verified': return <CheckCircle size={16} className="text-green-500" />;
      case 'caution': return <AlertTriangle size={16} className="text-yellow-500" />;
      default: return <Shield size={16} className="text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className={`bg-white p-4 rounded-lg shadow-md ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 p-4 rounded-lg ${className}`}>
        <div className="flex items-center">
          <AlertTriangle size={16} className="text-red-500 mr-2" />
          <span className="text-red-700 text-sm">{error}</span>
        </div>
      </div>
    );
  }

  if (!healthData) {
    return (
      <div className={`bg-gray-50 border border-gray-200 p-4 rounded-lg ${className}`}>
        <p className="text-gray-500 text-sm">Enter GST number to analyze financial health</p>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getTrustBadgeIcon(healthData.trustBadge)}
            <h3 className="font-semibold text-gray-900">AI Financial Health Score</h3>
          </div>
          <div className="text-xs text-gray-500">
            Report: {healthData.reportId}
          </div>
        </div>
      </div>

      {/* Score Display */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Health Score</p>
            <div className="flex items-center space-x-2">
              <span className={`text-2xl font-bold ${getScoreColor(healthData.healthScore)}`}>
                {healthData.healthScore}/100
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(healthData.healthScore)}`}>
                {healthData.healthScore >= 80 ? 'Excellent' : 
                 healthData.healthScore >= 60 ? 'Good' : 'Needs Attention'}
              </span>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-gray-600 mb-1">Risk Level</p>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                healthData.riskLevel === 'low' ? 'text-green-600 bg-green-100' :
                healthData.riskLevel === 'medium' ? 'text-yellow-600 bg-yellow-100' :
                'text-red-600 bg-red-100'
              }`}>
                {healthData.riskLevel.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Credit Rating */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-1">Credit Rating</p>
          <div className="flex items-center space-x-2">
            <span className="text-lg font-semibold text-blue-600">{healthData.creditRating}</span>
            <span className="text-sm text-gray-500">• ₹{healthData.creditLimit?.toLocaleString()} credit limit</span>
          </div>
        </div>

        {/* Payment Terms */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-1">Recommended Payment Terms</p>
          <p className="text-sm font-medium text-gray-900">{healthData.paymentTerms}</p>
        </div>

        {/* Confidence */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-1">Analysis Confidence</p>
          <div className="flex items-center space-x-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${healthData.confidence}%` }}
              ></div>
            </div>
            <span className="text-sm text-gray-600">{healthData.confidence}%</span>
          </div>
        </div>

        {/* Detailed Analysis */}
        {showDetails && (
          <div className="space-y-4">
            {/* Strengths */}
            {healthData.strengths.length > 0 && (
              <div>
                <p className="text-sm font-medium text-green-700 mb-2">✅ Strengths</p>
                <ul className="space-y-1">
                  {healthData.strengths.map((strength, index) => (
                    <li key={index} className="text-sm text-green-600">• {strength}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Concerns */}
            {healthData.concerns.length > 0 && (
              <div>
                <p className="text-sm font-medium text-red-700 mb-2">⚠️ Concerns</p>
                <ul className="space-y-1">
                  {healthData.concerns.map((concern, index) => (
                    <li key={index} className="text-sm text-red-600">• {concern}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendation */}
            <div>
              <p className="text-sm font-medium text-blue-700 mb-2">💡 AI Recommendation</p>
              <p className="text-sm text-gray-700">{healthData.recommendation}</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Last updated: {new Date(healthData.lastUpdated).toLocaleDateString()}</span>
            <span className="text-blue-600 font-medium">₹500 credit report</span>
          </div>
        </div>
      </div>
    </div>
  );
} 
