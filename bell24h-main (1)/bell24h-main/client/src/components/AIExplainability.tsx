'use client';

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
            </div>
          </div>
        </div>

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
        </div>
      </div>
    </div>
  );
}

