'use client';

import React from 'react';
import { TrendingUp, TrendingDown, BarChart3, DollarSign } from 'lucide-react';

export default function StockMarketDashboard() {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Market Intelligence Dashboard</h3>
        <p className="text-gray-600">
          Real-time stock market and commodity data for informed B2B decisions
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <p className="text-sm font-medium text-gray-700">Market Trend</p>
          </div>
          <p className="text-2xl font-bold text-green-600">↑ Bullish</p>
          <p className="text-xs text-gray-500 mt-1">+5.2% this week</p>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <p className="text-sm font-medium text-gray-700">Volatility</p>
          </div>
          <p className="text-2xl font-bold text-blue-600">Medium</p>
          <p className="text-xs text-gray-500 mt-1">Stable conditions</p>
        </div>

        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-purple-600" />
            <p className="text-sm font-medium text-gray-700">Commodity Index</p>
          </div>
          <p className="text-2xl font-bold text-purple-600">₹1,245</p>
          <p className="text-xs text-gray-500 mt-1">+2.1% today</p>
        </div>

        <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-5 h-5 text-orange-600" />
            <p className="text-sm font-medium text-gray-700">Risk Level</p>
          </div>
          <p className="text-2xl font-bold text-orange-600">Low</p>
          <p className="text-xs text-gray-500 mt-1">Favorable conditions</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="p-3 bg-gray-50 rounded border">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Steel Prices</span>
            <span className="text-sm font-bold text-green-600">↑ ₹52,000/ton</span>
          </div>
        </div>
        <div className="p-3 bg-gray-50 rounded border">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Copper Futures</span>
            <span className="text-sm font-bold text-green-600">↑ ₹720/kg</span>
          </div>
        </div>
        <div className="p-3 bg-gray-50 rounded border">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Crude Oil</span>
            <span className="text-sm font-bold text-red-600">↓ ₹6,200/barrel</span>
          </div>
        </div>
      </div>
    </div>
  );
}

