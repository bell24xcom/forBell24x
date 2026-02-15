'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState('mission');

  const tabs = [
    { id: 'mission', label: 'Our Mission', icon: '🎯' },
    { id: 'vision', label: 'Our Vision', icon: '👁️' },
    { id: 'values', label: 'Our Values', icon: '💎' },
    { id: 'team', label: 'Our Team', icon: '👥' }
  ];

  const teamMembers = [
    {
      name: 'Sarah Johnson',
      role: 'CEO & Founder',
      image: '/api/placeholder/300/300',
      bio: '15+ years in B2B technology and supply chain management.'
    },
    {
      name: 'Michael Chen',
      role: 'CTO',
      image: '/api/placeholder/300/300',
      bio: 'Expert in AI/ML and enterprise software architecture.'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Head of Operations',
      image: '/api/placeholder/300/300',
      bio: 'Specialist in process optimization and customer success.'
    },
    {
      name: 'David Kim',
      role: 'Head of Product',
      image: '/api/placeholder/300/300',
      bio: 'Product strategist with deep B2B marketplace experience.'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Active Suppliers' },
    { number: '50,000+', label: 'Products Listed' },
    { number: '1M+', label: 'RFQs Processed' },
    { number: '99.9%', label: 'Uptime' }
  ];

  return (
    <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl font-bold mb-6">About Bell24h</h1>
              <p className="text-xl mb-8">
                Revolutionizing B2B commerce through AI-powered matching, 
                voice/video RFQ, and automated workflow management.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <span className="bg-white/20 px-4 py-2 rounded-full">AI-Powered</span>
                <span className="bg-white/20 px-4 py-2 rounded-full">Voice/Video RFQ</span>
                <span className="bg-white/20 px-4 py-2 rounded-full">Automated Workflows</span>
                <span className="bg-white/20 px-4 py-2 rounded-full">Global Marketplace</span>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">{stat.number}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tabbed Content */}
        <section className="py-16">
          <div className="container mx-auto px-4">
      <div className="max-w-4xl mx-auto">
              {/* Tab Navigation */}
              <div className="flex flex-wrap justify-center mb-12">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-3 m-2 rounded-lg font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="bg-white rounded-lg shadow-lg p-8">
                {activeTab === 'mission' && (
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
                    <p className="text-lg text-gray-700 mb-6">
                      To transform B2B commerce by creating the world's most intelligent 
                      marketplace that connects buyers and suppliers through AI-powered 
                      matching, seamless communication, and automated workflows.
                    </p>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-blue-50 p-6 rounded-lg">
                        <h3 className="text-xl font-semibold text-blue-900 mb-3">What We Do</h3>
                        <ul className="space-y-2 text-blue-800">
                          <li>• AI-powered supplier matching</li>
                          <li>• Voice and video RFQ capabilities</li>
                          <li>• Automated workflow management</li>
                          <li>• Real-time communication tools</li>
                        </ul>
                      </div>
                      <div className="bg-purple-50 p-6 rounded-lg">
                        <h3 className="text-xl font-semibold text-purple-900 mb-3">How We Do It</h3>
                        <ul className="space-y-2 text-purple-800">
                          <li>• Machine learning algorithms</li>
                          <li>• Advanced search and filtering</li>
                          <li>• Integrated communication platform</li>
                          <li>• Comprehensive analytics</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'vision' && (
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Vision</h2>
                    <p className="text-lg text-gray-700 mb-6">
                      To become the global standard for B2B commerce, where every business 
                      transaction is intelligent, efficient, and transparent.
                    </p>
                    <div className="space-y-6">
                      <div className="flex items-start">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                          <span className="text-2xl">🌍</span>
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">Global Reach</h3>
                          <p className="text-gray-700">Connecting businesses across continents with localized support and multi-language capabilities.</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                          <span className="text-2xl">🤖</span>
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">AI-First Approach</h3>
                          <p className="text-gray-700">Leveraging artificial intelligence to make every interaction smarter and more efficient.</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                          <span className="text-2xl">⚡</span>
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">Instant Results</h3>
                          <p className="text-gray-700">Delivering real-time matching, instant communication, and immediate transaction processing.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'values' && (
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Values</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div className="flex items-start">
                          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                            <span className="text-2xl">🎯</span>
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Excellence</h3>
                            <p className="text-gray-700">We strive for the highest quality in everything we do, from our technology to our customer service.</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                            <span className="text-2xl">🤝</span>
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Integrity</h3>
                            <p className="text-gray-700">We conduct business with honesty, transparency, and ethical practices in all our interactions.</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-6">
                        <div className="flex items-start">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                            <span className="text-2xl">🚀</span>
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Innovation</h3>
                            <p className="text-gray-700">We continuously push boundaries and embrace new technologies to solve complex business challenges.</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                            <span className="text-2xl">👥</span>
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Collaboration</h3>
                            <p className="text-gray-700">We believe in the power of teamwork and building strong relationships with our customers and partners.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'team' && (
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Team</h2>
                    <p className="text-lg text-gray-700 mb-8">
                      Meet the passionate individuals behind Bell24h's success. 
                      Our diverse team brings together expertise in technology, 
                      business, and innovation.
                    </p>
                    <div className="grid md:grid-cols-2 gap-8">
                      {teamMembers.map((member, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-6">
                          <div className="flex items-center mb-4">
                            <img
                              src={member.image}
                              alt={member.name}
                              className="w-16 h-16 rounded-full object-cover mr-4"
                            />
                            <div>
                              <h3 className="text-xl font-semibold text-gray-900">{member.name}</h3>
                              <p className="text-blue-600 font-medium">{member.role}</p>
                            </div>
                          </div>
                          <p className="text-gray-700">{member.bio}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-blue-600 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">Ready to Transform Your B2B Commerce?</h2>
              <p className="text-xl mb-8">
                Join thousands of businesses already using Bell24h to streamline 
                their procurement and supply chain processes.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a href="/register" className="btn btn-primary">
                  Get Started Today
                </a>
                <a href="/contact" className="btn btn-outline-white">
                  Contact Sales
                </a>
        </div>
      </div>
    </div>
        </section>
    </div>
  );
}