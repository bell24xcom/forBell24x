'use client';

<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Activity, Globe, BarChart3, Target, AlertTriangle } from 'lucide-react';

interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  peRatio: number;
  dividendYield: number;
  timestamp: string;
}

interface MarketTrends {
  nifty50: StockData;
  sensex: StockData;
  sectorPerformance: {
    [sector: string]: {
      change: number;
      topGainers: string[];
      topLosers: string[];
    };
  };
  commodityPrices: {
    gold: number;
    silver: number;
    crudeOil: number;
    copper: number;
  };
  currencyRates: {
    usd: number;
    eur: number;
    gbp: number;
    jpy: number;
  };
}

interface MarketInsights {
  marketSentiment: string;
  topPerformingSector: string;
  worstPerformingSector: string;
  commodityTrend: string;
  currencyTrend: string;
  recommendations: string[];
  riskFactors: string[];
}

interface StockMarketDashboardProps {
  onClose?: () => void;
}

export default function StockMarketDashboard({ onClose }: StockMarketDashboardProps) {
  const [marketData, setMarketData] = useState<MarketTrends | null>(null);
  const [insights, setInsights] = useState<MarketInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('');

  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const fetchMarketData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/market/stock-data');
      const result = await response.json();

      if (result.success) {
        setMarketData(result.data.marketTrends);
        setInsights(result.data.insights);
      } else {
        setError(result.error || 'Failed to fetch market data');
      }
    } catch (error) {
      setError('Failed to fetch market data');
      console.error('Market data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getChangeIcon = (change: number) => {
    return change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading market data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <Activity className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!marketData || !insights) return null;

  // Prepare chart data
  const sectorData = Object.entries(marketData.sectorPerformance).map(([sector, data]) => ({
    sector,
    change: data.change,
    gainers: data.topGainers.length,
    losers: data.topLosers.length,
  }));

  const commodityData = Object.entries(marketData.commodityPrices).map(([commodity, price]) => ({
    commodity: commodity.charAt(0).toUpperCase() + commodity.slice(1),
    price,
  }));

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            📈 Market Intelligence Dashboard
          </h2>
          <p className="text-gray-600">
            Real-time market data for informed B2B decisions
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

      {/* Market Indices */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">NIFTY 50</h3>
            <div className={`flex items-center space-x-1 ${getChangeColor(marketData.nifty50.changePercent)}`}>
              {getChangeIcon(marketData.nifty50.changePercent)}
              <span className="text-sm">{marketData.nifty50.changePercent.toFixed(2)}%</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {marketData.nifty50.price.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">
            Change: {marketData.nifty50.change.toFixed(2)} ({marketData.nifty50.changePercent.toFixed(2)}%)
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">SENSEX</h3>
            <div className={`flex items-center space-x-1 ${getChangeColor(marketData.sensex.changePercent)}`}>
              {getChangeIcon(marketData.sensex.changePercent)}
              <span className="text-sm">{marketData.sensex.changePercent.toFixed(2)}%</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {marketData.sensex.price.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">
            Change: {marketData.sensex.change.toFixed(2)} ({marketData.sensex.changePercent.toFixed(2)}%)
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sector Performance */}
        <div className="bg-white border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            🏭 Sector Performance
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sectorData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="sector" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value}%`, 'Change']} />
              <Bar dataKey="change" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Commodity Prices */}
        <div className="bg-white border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            💰 Commodity Prices
          </h3>
          <div className="space-y-3">
            {commodityData.map((item) => (
              <div key={item.commodity} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-gray-900">{item.commodity}</span>
                </div>
                <span className="font-semibold text-gray-900">
                  ₹{item.price.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Currency Rates */}
      <div className="bg-white border rounded-lg p-4 mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          🌐 Currency Exchange Rates
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(marketData.currencyRates).map(([currency, rate]) => (
            <div key={currency} className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">{currency.toUpperCase()}</div>
              <div className="text-lg font-semibold text-gray-900">₹{rate.toFixed(2)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Market Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-white border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-blue-600" />
            Market Insights
          </h3>
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-700">Market Sentiment:</span>
              <span className={`ml-2 px-2 py-1 rounded text-sm font-medium ${
                insights.marketSentiment === 'BULLISH' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {insights.marketSentiment}
              </span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">Top Sector:</span>
              <span className="ml-2 text-sm text-gray-900">{insights.topPerformingSector}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">Weak Sector:</span>
              <span className="ml-2 text-sm text-gray-900">{insights.worstPerformingSector}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">Commodity Trend:</span>
              <span className="ml-2 text-sm text-gray-900">{insights.commodityTrend}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">Currency Trend:</span>
              <span className="ml-2 text-sm text-gray-900">{insights.currencyTrend}</span>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
            B2B Recommendations
          </h3>
          <div className="space-y-2">
            {insights.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start space-x-2">
                <div className="flex-shrink-0 w-4 h-4 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-semibold mt-0.5">
                  ✓
                </div>
                <p className="text-sm text-gray-700">{recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Risk Factors */}
      {insights.riskFactors.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-yellow-600" />
            Risk Factors
          </h3>
          <div className="space-y-2">
            {insights.riskFactors.map((risk, index) => (
              <div key={index} className="flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-yellow-700">{risk}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Last Updated */}
      <div className="text-center text-sm text-gray-500 mt-6">
        Last updated: {new Date().toLocaleString()}
      </div>
    </div>
  );
} 
=======
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

>>>>>>> b7b4b9c6cd126094e89116e18b3dbb247f1e8e4d
