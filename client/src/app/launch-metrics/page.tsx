'use client';

import { useState, useEffect } from 'react';

// Custom Progress Component to replace ProgressPrimitive
const Progress = ({ value, className = '' }: { value: number; className?: string }) => (
  <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
    <div
      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
      style={{ width: `${value}%` }}
    />
  </div>
);

interface LaunchMetrics {
  totalRegistrations: number;
  rfqsCreated: number;
  aiMatches: number;
  testimonials: number;
  activeUsers: number;
  conversionRate: number;
}

export default function LaunchMetricsPage() {
  const [metrics, setMetrics] = useState<LaunchMetrics>({
    totalRegistrations: 0,
    rfqsCreated: 0,
    aiMatches: 0,
    testimonials: 0,
    activeUsers: 0,
    conversionRate: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/analytics/launch-metrics');
        if (response.ok) {
          const data = await response.json();
          setMetrics(data);
        }
      } catch (error) {
        console.error('Error fetching metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const targets = {
    registrations: 25,
    rfqs: 10,
    matches: 5,
    testimonials: 3,
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getStatusColor = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-yellow-500';
    if (percentage >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading launch metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">
            🚀 Bell24h 2.0 Launch Metrics
          </h1>
          <p className="text-gray-600 text-lg">
            Real-time tracking of our 48-hour launch campaign
          </p>
          <div className="mt-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              LIVE: https://bell24h-v1-aoswa10sp-vishaals-projects-892b178d.vercel.app
            </span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* User Registrations */}
          <div className="bg-white rounded-xl shadow-lg border-2 border-blue-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">👥 Registrations</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(metrics.totalRegistrations, targets.registrations)} text-white`}>
                {metrics.totalRegistrations}/{targets.registrations}
              </span>
            </div>
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
                  style={{ width: `${getProgressPercentage(metrics.totalRegistrations, targets.registrations)}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">
                Target: {targets.registrations} users in 48 hours
              </p>
            </div>
          </div>

          {/* RFQs Created */}
          <div className="bg-white rounded-xl shadow-lg border-2 border-green-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">📋 RFQs Created</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(metrics.rfqsCreated, targets.rfqs)} text-white`}>
                {metrics.rfqsCreated}/{targets.rfqs}
              </span>
            </div>
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-green-600 h-3 rounded-full transition-all duration-300" 
                  style={{ width: `${getProgressPercentage(metrics.rfqsCreated, targets.rfqs)}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">
                Target: {targets.rfqs} RFQs in 48 hours
              </p>
            </div>
          </div>

          {/* AI Matches */}
          <div className="bg-white rounded-xl shadow-lg border-2 border-purple-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">🤖 AI Matches</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(metrics.aiMatches, targets.matches)} text-white`}>
                {metrics.aiMatches}/{targets.matches}
              </span>
            </div>
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-purple-600 h-3 rounded-full transition-all duration-300" 
                  style={{ width: `${getProgressPercentage(metrics.aiMatches, targets.matches)}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">
                Target: {targets.matches} successful matches
              </p>
            </div>
          </div>

          {/* Testimonials */}
          <div className="bg-white rounded-xl shadow-lg border-2 border-orange-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">⭐ Testimonials</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(metrics.testimonials, targets.testimonials)} text-white`}>
                {metrics.testimonials}/{targets.testimonials}
              </span>
            </div>
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-orange-600 h-3 rounded-full transition-all duration-300" 
                  style={{ width: `${getProgressPercentage(metrics.testimonials, targets.testimonials)}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">
                Target: {targets.testimonials} user testimonials
              </p>
            </div>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg border-2 border-indigo-200 p-6">
            <h3 className="text-xl font-semibold mb-4">📊 Engagement Metrics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Active Users</span>
                <span className="font-semibold text-lg">{metrics.activeUsers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Conversion Rate</span>
                <span className="font-semibold text-lg">{metrics.conversionRate}%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border-2 border-teal-200 p-6">
            <h3 className="text-xl font-semibold mb-4">🎯 Launch Status</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Overall Progress</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {Math.round((metrics.totalRegistrations + metrics.rfqsCreated + metrics.aiMatches) / (targets.registrations + targets.rfqs + targets.matches) * 100)}%
                </span>
              </div>
              <div className="text-sm text-gray-600">
                {metrics.totalRegistrations >= targets.registrations && 
                 metrics.rfqsCreated >= targets.rfqs && 
                 metrics.aiMatches >= targets.matches ? 
                 "🎉 All targets achieved!" : 
                 "🚀 Launch in progress..."}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">🚀 Quick Launch Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="https://bell24h-v1-aoswa10sp-vishaals-projects-892b178d.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-center font-medium transition-colors"
            >
              🌐 Visit Live Site
            </a>
            <a
              href="/auth/login"
              className="block p-4 bg-green-600 hover:bg-green-700 text-white rounded-lg text-center font-medium transition-colors"
            >
              🔐 Test Login
            </a>
            <a
              href="/rfq/create"
              className="block p-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-center font-medium transition-colors"
            >
              📝 Create RFQ
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 
