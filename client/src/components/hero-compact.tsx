'use client';
import { ArrowRight, Building, Users, TrendingUp, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function HeroCompact() {
  const [liveStats, setLiveStats] = useState({
    companiesPosted: 1247,
    quotesReceived: 5689,
    successfulDeals: 892,
    activeRFQs: 234
  });

  // Real-time stats animation
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveStats(prev => ({
        companiesPosted: prev.companiesPosted + Math.floor(Math.random() * 3),
        quotesReceived: prev.quotesReceived + Math.floor(Math.random() * 5),
        successfulDeals: prev.successfulDeals + Math.floor(Math.random() * 2),
        activeRFQs: prev.activeRFQs + Math.floor(Math.random() * 4)
      }));
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative bg-gradient-to-br from-[#0a1128] via-[#0d1425] to-[#0a1128] py-16 overflow-hidden" style={{ minHeight: '350px' }}>
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>

      {/* Floating AI Badge */}
      <div className="absolute top-8 right-8 z-10">
        <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2 shadow-lg border border-cyan-400/30">
          <Sparkles className="h-4 w-4" />
          <span>AI-Powered Matching</span>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Compact Headline */}
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
            Get Quotes from{' '}
            <span className="text-cyan-400">10,000+ Verified</span>
            <br className="hidden sm:block" />
            Indian Suppliers in Minutes
          </h1>

          {/* Value Prop */}
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            <strong>Post → Get Quotes → Choose → Secure Payment</strong>
          </p>

          {/* 3-Button CTA Layout */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              href="/rfq/create"
              className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-600 flex items-center justify-center transition-all transform hover:scale-105 shadow-lg"
            >
              <Building className="h-5 w-5 mr-2" />
              Post Your Requirement
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>

            <Link
              href="/suppliers"
              className="border-2 border-cyan-400 text-cyan-400 px-6 py-3 rounded-lg font-semibold hover:bg-cyan-400/10 flex items-center justify-center transition-all"
            >
              <Users className="h-5 w-5 mr-2" />
              Browse Suppliers
            </Link>

            <Link
              href="/dashboard"
              className="bg-gray-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 flex items-center justify-center transition-all"
            >
              <TrendingUp className="h-5 w-5 mr-2" />
              View Dashboard
            </Link>
          </div>

          {/* Trust Signals - Compact */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400 mb-8">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Escrow Protected
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              GST Verified
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              24h Delivery
            </div>
          </div>

          {/* Live Stats - Compact Grid */}
          <div className="bg-[#1a2332]/50 backdrop-blur-sm rounded-xl p-6 border border-cyan-500/20">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400 mb-1">
                  {liveStats.companiesPosted.toLocaleString()}+
                </div>
                <div className="text-gray-400 text-xs">Posted Today</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-400 mb-1">
                  {liveStats.quotesReceived.toLocaleString()}+
                </div>
                <div className="text-gray-400 text-xs">Quotes Today</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400 mb-1">
                  {liveStats.successfulDeals.toLocaleString()}+
                </div>
                <div className="text-gray-400 text-xs">Deals Closed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400 mb-1">
                  {liveStats.activeRFQs.toLocaleString()}+
                </div>
                <div className="text-gray-400 text-xs">Active RFQs</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}