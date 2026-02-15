'use client';
import React, { useState } from 'react';

const FutureReadySection: React.FC = () => {
  const [activeTab, setActiveTab] = useState('uli');

  return (
    <section className='py-20 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden'>
      {/* Background Pattern */}
      <div className='absolute inset-0 opacity-10'>
        <div className='absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20'></div>
        <div className='absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]'></div>
      </div>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative'>
        {/* Header */}
        <div className='text-center mb-16'>
          <div className='flex items-center justify-center mb-6'>
            <div className='p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mr-4'>
              <Rocket className='text-white' size={32} />
            </div>
            <h2 className='text-4xl lg:text-5xl font-bold text-white'>Future Ready</h2>
          </div>
          <p className='text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed'>
            Bell24H is preparing to integrate with India's next-generation{' '}
            <strong>Digital Public Infrastructure</strong>, positioning our platform at the
            forefront of the financial revolution.
          </p>
        </div>

        {/* Main Feature - ULI Integration */}
        <div className='bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 mb-12 shadow-2xl'>
          <div className='grid lg:grid-cols-2 gap-12 items-center'>
            <div>
              <div className='flex items-center mb-6'>
                <div className='p-3 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mr-4'>
                  <span>⚡</span>
                </div>
                <div>
                  <h3 className='text-2xl font-bold text-white mb-2'>
                    Unified Lending Interface (ULI) Integration
                  </h3>
                  <p className='text-green-300 font-medium'>
                    Coming Q2 2025 • RBI Innovation Initiative
                  </p>
                </div>
              </div>

              <div className='space-y-4 mb-8'>
                <p className='text-blue-100 text-lg leading-relaxed'>
                  Bell24H will be among the <strong>first B2B marketplaces</strong> to integrate
                  with RBI's revolutionary Unified Lending Interface, enabling{' '}
                  <strong>instant, paperless lending</strong> for our business community.
                </p>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <div className='flex items-center text-green-300'>
                    <span>✅</span>
                    <span>10-minute loan approvals</span>
                  </div>
                  <div className='flex items-center text-green-300'>
                    <span>✅</span>
                    <span>Zero paperwork required</span>
                  </div>
                  <div className='flex items-center text-green-300'>
                    <span>✅</span>
                    <span>Automated credit assessment</span>
                  </div>
                  <div className='flex items-center text-green-300'>
                    <span>✅</span>
                    <span>MSME-focused lending</span>
                  </div>
                </div>
              </div>

              <div className='bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-lg p-4 border border-orange-400/30'>
                <div className='flex items-start'>
                  <Target className='text-orange-300 mr-3 mt-1 flex-shrink-0' size={20} />
                  <div>
                    <h4 className='text-orange-300 font-semibold mb-2'>Revolutionary Impact</h4>
                    <p className='text-orange-100 text-sm'>
                      Just like UPI transformed payments, ULI will revolutionize lending. Bell24H
                      users will access instant working capital based on their transaction history,
                      GST data, and digital footprint.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className='space-y-6'>
              {/* ULI Process Flow */}
              <div className='bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl p-6 border border-blue-400/30'>
                <h4 className='text-xl font-semibold text-white mb-4 flex items-center'>
                  <span>🕐</span>
                  Instant Lending Process
                </h4>
                <div className='space-y-4'>
                  <div className='flex items-center'>
                    <div className='w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-4'>
                      1
                    </div>
                    <div>
                      <p className='text-white font-medium'>Submit Loan Request</p>
                      <p className='text-blue-200 text-sm'>One-click application on Bell24H</p>
                    </div>
                  </div>
                  <div className='flex items-center'>
                    <div className='w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-4'>
                      2
                    </div>
                    <div>
                      <p className='text-white font-medium'>Automated Verification</p>
                      <p className='text-blue-200 text-sm'>ULI fetches GST, bank, land records</p>
                    </div>
                  </div>
                  <div className='flex items-center'>
                    <div className='w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-4'>
                      3
                    </div>
                    <div>
                      <p className='text-white font-medium'>Instant Approval</p>
                      <p className='text-blue-200 text-sm'>AI-powered credit decision in minutes</p>
                    </div>
                  </div>
                  <div className='flex items-center'>
                    <div className='w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-4'>
                      4
                    </div>
                    <div>
                      <p className='text-white font-medium'>Funds Disbursed</p>
                      <p className='text-blue-200 text-sm'>Direct transfer to business account</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Sources */}
              <div className='bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-xl p-6 border border-green-400/30'>
                <h4 className='text-xl font-semibold text-white mb-4 flex items-center'>
                  <Database className='mr-3 text-green-300' size={24} />
                  Integrated Data Sources
                </h4>
                <div className='grid grid-cols-2 gap-3'>
                  <div className='text-green-200 text-sm'>✓ Aadhaar e-KYC</div>
                  <div className='text-green-200 text-sm'>✓ GST Returns</div>
                  <div className='text-green-200 text-sm'>✓ Bank Statements</div>
                  <div className='text-green-200 text-sm'>✓ Land Records</div>
                  <div className='text-green-200 text-sm'>✓ Digital Signatures</div>
                  <div className='text-green-200 text-sm'>✓ Credit History</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional DPI Features */}
        <div className='grid md:grid-cols-3 gap-8 mb-12'>
          {/* ONDC Integration */}
          <div className='bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-300 group'>
            <div className='flex items-center mb-4'>
              <div className='p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mr-4 group-hover:scale-110 transition-transform'>
                <span>🌍</span>
              </div>
              <div>
                <h3 className='text-xl font-bold text-white'>ONDC Network</h3>
                <p className='text-purple-300 text-sm'>Open Commerce Protocol</p>
              </div>
            </div>
            <p className='text-blue-100 mb-4'>
              Integration with India's Open Network for Digital Commerce for seamless, interoperable
              B2B transactions across the entire ecosystem.
            </p>
            <div className='text-purple-300 text-sm'>
              📊 Expected: Q3 2025 • Enhanced marketplace discoverability
            </div>
          </div>

          {/* Digital Rupee */}
          <div className='bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-300 group'>
            <div className='flex items-center mb-4'>
              <div className='p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full mr-4 group-hover:scale-110 transition-transform'>
                <span>💳</span>
              </div>
              <div>
                <h3 className='text-xl font-bold text-white'>Digital Rupee</h3>
                <p className='text-yellow-300 text-sm'>CBDC Integration</p>
              </div>
            </div>
            <p className='text-blue-100 mb-4'>
              First B2B marketplace to support RBI's Central Bank Digital Currency for instant,
              settlement-free business transactions.
            </p>
            <div className='text-yellow-300 text-sm'>
              💰 Expected: Q4 2025 • Zero transaction fees
            </div>
          </div>

          {/* Account Aggregator */}
          <div className='bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-300 group'>
            <div className='flex items-center mb-4'>
              <div className='p-3 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full mr-4 group-hover:scale-110 transition-transform'>
                <span>🛡️</span>
              </div>
              <div>
                <h3 className='text-xl font-bold text-white'>Account Aggregator</h3>
                <p className='text-teal-300 text-sm'>Consent-Based Data</p>
              </div>
            </div>
            <p className='text-blue-100 mb-4'>
              Secure, consent-based access to financial data for enhanced credit scoring and
              personalized business insights.
            </p>
            <div className='text-teal-300 text-sm'>
              🔒 Expected: Q1 2025 • Enhanced privacy & control
            </div>
          </div>
        </div>

        {/* The New Trinity */}
        <div className='bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl border border-indigo-400/30 p-8 mb-12'>
          <div className='text-center mb-8'>
            <h3 className='text-3xl font-bold text-white mb-4'>The New Trinity: JAM-UPI-ULI</h3>
            <p className='text-indigo-200 text-lg'>
              Bell24H leverages India's complete digital infrastructure stack for unprecedented
              business capabilities
            </p>
          </div>

          <div className='grid md:grid-cols-3 gap-8'>
            <div className='text-center'>
              <div className='w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4'>
                <span>👤</span>
              </div>
              <h4 className='text-xl font-bold text-white mb-2'>JAM Stack</h4>
              <p className='text-blue-200 text-sm'>
                Jan Dhan + Aadhaar + Mobile for universal financial inclusion
              </p>
            </div>

            <div className='text-center'>
              <div className='w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4'>
                <Smartphone className='text-white' size={28} />
              </div>
              <h4 className='text-xl font-bold text-white mb-2'>UPI Payments</h4>
              <p className='text-blue-200 text-sm'>
                Instant, 24/7 digital payments transforming business transactions
              </p>
            </div>

            <div className='text-center'>
              <div className='w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4'>
                <span>💳</span>
              </div>
              <h4 className='text-xl font-bold text-white mb-2'>ULI Lending</h4>
              <p className='text-blue-200 text-sm'>
                Frictionless credit access revolutionizing business finance
              </p>
            </div>
          </div>
        </div>

        {/* Competitive Advantage */}
        <div className='bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl border border-orange-400/30 p-8'>
          <div className='grid lg:grid-cols-2 gap-8 items-center'>
            <div>
              <h3 className='text-2xl font-bold text-white mb-4 flex items-center'>
                <span>📈</span>
                First-Mover Advantage
              </h3>
              <p className='text-orange-100 text-lg mb-6'>
                While competitors focus on basic B2B transactions, Bell24H is building the future of
                integrated digital commerce with cutting-edge financial infrastructure.
              </p>
              <div className='space-y-3'>
                <div className='flex items-center text-orange-200'>
                  <Sparkles className='mr-3 text-orange-300' size={20} />
                  <span>Only B2B platform with full DPI integration roadmap</span>
                </div>
                <div className='flex items-center text-orange-200'>
                  <Sparkles className='mr-3 text-orange-300' size={20} />
                  <span>First to market with ULI-powered instant lending</span>
                </div>
                <div className='flex items-center text-orange-200'>
                  <Sparkles className='mr-3 text-orange-300' size={20} />
                  <span>Pioneer in Digital Rupee B2B transactions</span>
                </div>
              </div>
            </div>

            <div className='text-center lg:text-right'>
              <div className='inline-block bg-white/10 backdrop-blur rounded-xl p-6 border border-white/20'>
                <div className='text-4xl font-bold text-white mb-2'>₹500+ Cr</div>
                <div className='text-orange-300 font-medium mb-4'>Total Addressable Market</div>
                <div className='space-y-2 text-sm text-orange-200'>
                  <div>🚀 MSME Lending: ₹200+ Cr</div>
                  <div>💳 Digital Payments: ₹150+ Cr</div>
                  <div>🌐 Commerce Network: ₹100+ Cr</div>
                  <div>📊 Data Services: ₹50+ Cr</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className='text-center mt-12'>
          <p className='text-blue-200 text-lg mb-6'>
            Join Bell24H today and be ready for India's digital transformation
          </p>
          <button className='inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1'>
            Get Early Access
            <span>→</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default FutureReadySection;
