"use client";

import { useState } from 'react';
import { Mic, Video, FileText, Send, CheckCircle, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function HeroRFQDemo() {
  const [activeTab, setActiveTab] = useState<'voice' | 'video' | 'text'>('voice');
  return (
    <section className="relative bg-[#0a1128] py-24 md:py-32 border-b border-white/10">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500/20 border border-cyan-400/30 rounded-full text-cyan-300 text-sm font-bold mb-6 tracking-wider">
            <TrendingUp className="w-4 h-4" />
            India's First Multi-Modal B2B Platform
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-white mb-6 leading-tight">
            Ready to Transform
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-white to-cyan-400 bg-clip-text text-transparent">Your Procurement?</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Join thousands of businesses using <span className="text-cyan-400 font-bold">BELL</span> for faster, smarter B2B transactions
          </p>
          <div className="flex flex-wrap justify-center gap-12 mb-16">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-cyan-400 mb-2">10,000+</div>
              <div className="text-gray-400">Active Suppliers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-cyan-400 mb-2">50+</div>
              <div className="text-gray-400">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-cyan-400 mb-2">&lt;60s</div>
              <div className="text-gray-400">Avg Response</div>
            </div>
          </div>
        </div>
        <div className="bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8 max-w-4xl mx-auto">
          <div className="flex flex-wrap gap-4 mb-8 justify-center">
            <button onClick={() => setActiveTab('voice')} className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold transition-all ${activeTab === 'voice' ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg scale-105 border-2 border-cyan-400' : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'}`}>
              <Mic className="w-5 h-5" />
              Voice RFQ
            </button>
            <button onClick={() => setActiveTab('video')} className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold transition-all ${activeTab === 'video' ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg scale-105 border-2 border-cyan-400' : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'}`}>
              <Video className="w-5 h-5" />
              Video RFQ
            </button>
            <button onClick={() => setActiveTab('text')} className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold transition-all ${activeTab === 'text' ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg scale-105 border-2 border-cyan-400' : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'}`}>
              <FileText className="w-5 h-5" />
              Text RFQ
            </button>
          </div>
          <div className="min-h-[400px]">
            {activeTab === 'voice' && (
              <div>
                <div className="bg-gray-800/50 rounded-xl p-8 border-2 border-cyan-500/30">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                      <Mic className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-2xl text-white">Record Your RFQ</h3>
                      <p className="text-gray-400">Speak naturally, we'll handle the rest</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="bg-gray-900/80 rounded-xl p-8 border border-white/10">
                      <div className="flex items-center justify-center mb-6">
                        <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-xl">
                          <Mic className="w-12 h-12 text-white" />
                        </div>
                      </div>
                      <p className="text-center text-gray-300 text-lg mb-4">"I need 500 kg of steel rods for construction in Mumbai. Quality should be Grade 60. Delivery needed by next week."</p>
                      <div className="flex items-center justify-center gap-2 text-gray-400">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        <span>00:12 • Recording...</span>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="flex items-start gap-3"><CheckCircle className="w-6 h-6 text-cyan-400" /><div><div className="font-bold text-white mb-1">Auto-transcribed</div><div className="text-sm text-gray-400">AI converts to text</div></div></div>
                      <div className="flex items-start gap-3"><CheckCircle className="w-6 h-6 text-cyan-400" /><div><div className="font-bold text-white mb-1">12+ Languages</div><div className="text-sm text-gray-400">Hindi, Tamil, Telugu & more</div></div></div>
                      <div className="flex items-start gap-3"><CheckCircle className="w-6 h-6 text-cyan-400" /><div><div className="font-bold text-white mb-1">Instant Post</div><div className="text-sm text-gray-400">Live in 30 seconds</div></div></div>
                    </div>
                    <Link href="/rfq/voice" className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-4 rounded-xl font-bold hover:from-cyan-600 hover:to-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg">
                      Try Voice RFQ Free
                      <Send className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'video' && (
              <div>
                <div className="bg-gray-800/50 rounded-xl p-8 border-2 border-cyan-500/30">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                      <Video className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-2xl text-white">Show, Don't Just Tell</h3>
                      <p className="text-gray-400">Record a video of your requirements</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="bg-gray-900/80 rounded-xl p-8 border border-white/10">
                      <div className="aspect-video bg-gray-800 rounded-xl flex items-center justify-center mb-4 border-2 border-dashed border-cyan-500/30">
                        <div className="text-center">
                          <Video className="w-20 h-20 text-cyan-400 mx-auto mb-4" />
                          <p className="text-white font-semibold text-lg">Record or Upload Video</p>
                          <p className="text-gray-400 mt-2">Show product specs, defects, or samples</p>
                        </div>
                      </div>
                    </div>
                    <Link href="/rfq/video" className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-4 rounded-xl font-bold hover:from-cyan-600 hover:to-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg">
                      Try Video RFQ Free
                      <Send className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'text' && (
              <div>
                <div className="bg-gray-800/50 rounded-xl p-8 border-2 border-cyan-500/30">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                      <FileText className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-2xl text-white">Classic Text RFQ</h3>
                      <p className="text-gray-400">Traditional form with smart assistance</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="bg-gray-900/80 rounded-xl p-8 border border-white/10 space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-white mb-2">Product/Service</label>
                        <input type="text" placeholder="e.g., Industrial Steel Rods" className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg focus:border-cyan-500 focus:outline-none text-white placeholder-gray-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-white mb-2">Quantity</label>
                        <input type="text" placeholder="e.g., 500 kg" className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg focus:border-cyan-500 focus:outline-none text-white placeholder-gray-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-white mb-2">Requirements</label>
                        <textarea placeholder="Describe your specific requirements..." rows={3} className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg focus:border-cyan-500 focus:outline-none text-white placeholder-gray-500" />
                      </div>
                    </div>
                    <Link href="/rfq/create" className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-4 rounded-xl font-bold hover:from-cyan-600 hover:to-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg">
                      Try Text RFQ Free
                      <Send className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="mt-16 text-center">
          <p className="text-gray-400 mb-6 text-lg">Trusted by leading businesses across India</p>
          <div className="flex flex-wrap justify-center gap-12 items-center">
            <div className="text-white font-bold text-xl opacity-60 hover:opacity-100 transition-opacity">Tata Group</div>
            <div className="text-white font-bold text-xl opacity-60 hover:opacity-100 transition-opacity">Reliance</div>
            <div className="text-white font-bold text-xl opacity-60 hover:opacity-100 transition-opacity">L&T</div>
            <div className="text-white font-bold text-xl opacity-60 hover:opacity-100 transition-opacity">Mahindra</div>
            <div className="text-white font-bold text-xl opacity-60 hover:opacity-100 transition-opacity">Adani</div>
          </div>
        </div>
      </div>
    </section>
  );
}
