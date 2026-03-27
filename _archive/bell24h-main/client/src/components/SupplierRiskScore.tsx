'use client';

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

