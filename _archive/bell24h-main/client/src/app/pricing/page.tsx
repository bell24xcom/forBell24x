import React from 'react';

export default function PricingPage() {
  return (
    <section className="py-24 bg-gradient-to-b from-black to-gray-900">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h1 className="text-6xl font-bold bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
          Lifetime FREE + Pay Only When You Earn
        </h1>
        <p className="text-2xl text-cyan-300 mt-6 mb-16">
          2 RFQs FREE every month · No subscription · Earn from Day 1
        </p>
        <div className="grid md:grid-cols-3 gap-10 max-w-5xl mx-auto">
          {/* LIFETIME FREE */}
          <div className="bg-gray-900 border-2 border-cyan-500 rounded-3xl p-10">
            <h3 className="text-4xl font-bold text-cyan-400">LIFETIME FREE</h3>
            <p className="text-7xl font-bold my-8">₹0 <span className="text-2xl">forever</span></p>
            <ul className="space-y-4 text-left mb-10">
              <li>✓ 2 RFQs every month FREE</li>
              <li>✓ Claim your company profile</li>
              <li>✓ Basic AI matching</li>
              <li>✓ Wallet + Escrow ready</li>
              <li>✓ 12 product showcase</li>
            </ul>
            <button className="w-full bg-cyan-500 text-black font-bold py-5 rounded-xl text-xl">
              Start Free Now
            </button>
          </div>
          {/* PAY PER USE */}
          <div className="bg-gradient-to-b from-purple-900 to-gray-900 border-4 border-purple-600 rounded-3xl p-10 transform scale-105 shadow-2xl">
            <div className="bg-purple-600 text-white px-6 py-2 rounded-full text-sm font-bold inline-block mb-4">
              92% SUPPLIERS UPGRADE
            </div>
            <h3 className="text-4xl font-bold text-purple-400">PAY ONLY WHEN YOU EARN</h3>
            <div className="space-y-6 my-8 text-left">
              <div className="bg-gray-800 p-6 rounded-2xl">
                <p className="text-3xl font-bold text-yellow-400">₹999 <span className="text-lg">one-time</span></p>
                <p>→ Verified Gold Badge + 5,000 BELL tokens + Top 3 for 30 days</p>
              </div>
              <div className="bg-gray-800 p-6 rounded-2xl">
                <p className="text-3xl font-bold text-green-400">₹499 <span className="text-lg">per extra RFQ</span></p>
                <p>→ Get supplier contact instantly (above 2 free)</p>
              </div>
              <div className="bg-gray-800 p-6 rounded-2xl">
                <p className="text-3xl font-bold text-cyan-400">₹1,999 <span className="text-lg">one-time</span></p>
                <p>→ Featured Supplier (top 3 in category × 30 days)</p>
              </div>
            </div>
            <button className="w-full bg-purple-600 text-white font-bold py-5 rounded-xl text-xl hover:bg-purple-500">
              See Live Earnings → Upgrade Now
            </button>
          </div>
          {/* WALLET TOPUP */}
          <div className="bg-gray-900 border-2 border-green-500 rounded-3xl p-10">
            <h3 className="text-4xl font-bold text-green-400">WALLET BOOST</h3>
            <p className="text-7xl font-bold my-8">₹999</p>
            <p className="text-3xl text-green-400 mb-8">→ Get ₹1,299 credit</p>
            <p className="text-lg mb-10">Use for paid leads · 100% spent on platform</p>
            <button className="w-full bg-green-500 text-black font-bold py-5 rounded-xl text-xl">
              Add ₹1,299 Credit
            </button>
          </div>
        </div>
        <div className="mt-20 bg-gray-900/50 rounded-3xl p-10">
          <p className="text-4xl font-bold text-cyan-400">
            Today: ₹2.89 Lakh earned · 8,695 suppliers · 184 paid leads
          </p>
          <p className="text-2xl text-gray-300 mt-4">
            Top supplier earned ₹1.8 Lakh this week · You are next
          </p>
        </div>
      </div>
    </section>
  );
}
