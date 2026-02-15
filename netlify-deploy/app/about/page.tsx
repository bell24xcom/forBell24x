"use client";
import React from 'react';
import { CheckCircle, Mail, Phone, MapPin, Building, Users, Target, Shield, Zap } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-3xl font-bold">🔔</span>
            </div>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            About Bell24h
          </h1>
          <p className="text-xl text-blue-600 font-semibold mb-2">
            India's First AI-Powered B2B Marketplace
          </p>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Empowering businesses with technology-driven solutions for seamless B2B transactions, 
            supplier verification, and intelligent commerce.
          </p>
        </div>

        {/* Company Information */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-gray-600 mb-6">
                Bell24h is India's premier B2B marketplace, connecting businesses across the country
                to facilitate seamless trade and commerce. We believe in empowering businesses with
                technology-driven solutions that make procurement and supply chain management efficient,
                transparent, and profitable.
              </p>
              <div className="flex items-center p-4 bg-blue-50 rounded-lg">
                <Building className="h-6 w-6 text-blue-600 mr-3" />
                <div>
                  <h3 className="font-semibold text-gray-900">Company</h3>
                  <p className="text-blue-600">Digitex Studio</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">What We Do</h2>
              <p className="text-gray-600 mb-6">
                We provide a comprehensive platform where buyers and suppliers can discover each other,
                negotiate deals, and complete transactions with confidence. Our AI-powered matching system
                ensures that businesses find the right partners for their specific needs.
              </p>
              <div className="flex items-center p-4 bg-green-50 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                <div>
                  <h3 className="font-semibold text-gray-900">GST Verified</h3>
                  <p className="text-green-600">27AAAPP9753F2ZF</p>
                </div>
              </div>
            </div>
          </div>

          {/* Key Features */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="text-center p-6 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Smart Matching</h3>
                <p className="text-gray-600">
                  AI-powered supplier matching based on your requirements, quality standards, and preferences
                </p>
              </div>

              <div className="text-center p-6 border border-gray-200 rounded-lg hover:border-green-300 transition-colors">
                <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Secure Transactions</h3>
                <p className="text-gray-600">
                  Protected transactions with our integrated escrow system ensuring safe B2B payments
                </p>
              </div>

              <div className="text-center p-6 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors">
                <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">AI-Powered Analytics</h3>
                <p className="text-gray-600">
                  Real-time business intelligence with predictive analytics for market trends and supplier performance
                </p>
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Our Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start p-4 bg-yellow-50 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Supplier Verification Reports</h3>
                  <p className="text-gray-600 mb-2">Comprehensive verification including GST/PAN authentication, business history check, and risk assessment</p>
                  <p className="text-lg font-bold text-blue-600">₹2,000 per report</p>
                </div>
              </div>

              <div className="flex items-start p-4 bg-blue-50 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">RFQ Writing Services</h3>
                  <p className="text-gray-600 mb-2">Professional RFQ writing to attract better suppliers and get competitive quotes</p>
                  <p className="text-lg font-bold text-blue-600">₹500 per RFQ</p>
                </div>
              </div>

              <div className="flex items-start p-4 bg-green-50 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Featured Supplier Listing</h3>
                  <p className="text-gray-600 mb-2">Premium visibility on our platform to reach more potential buyers</p>
                  <p className="text-lg font-bold text-blue-600">₹1,000 per month</p>
                </div>
              </div>

              <div className="flex items-start p-4 bg-purple-50 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">AI-Powered Matching</h3>
                  <p className="text-gray-600 mb-2">Advanced AI algorithms to match buyers with the perfect suppliers</p>
                  <p className="text-lg font-bold text-blue-600">Free with registration</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Get In Touch</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
                <p className="text-blue-600">digitex.studio@gmail.com</p>
              </div>

              <div className="text-center p-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Phone</h3>
                <p className="text-green-600">+91 [Your Number]</p>
              </div>

              <div className="text-center p-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Location</h3>
                <p className="text-purple-600">Mumbai, Maharashtra</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}