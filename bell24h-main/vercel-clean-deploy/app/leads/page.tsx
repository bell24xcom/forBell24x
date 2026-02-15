'use client';

import { useState } from 'react';
import LeadForm from '@/components/LeadForm';
import CreditPurchase from '@/components/CreditPurchase';

const categories = [
  'Electronics',
  'Manufacturing',
  'Textiles',
  'Chemicals',
  'Automotive',
  'Construction',
  'Food & Beverage',
  'Healthcare',
  'Agriculture',
  'Other'
];

export default function LeadsPage() {
  const [selectedCategory, setSelectedCategory] = useState('Electronics');
  const [activeTab, setActiveTab] = useState('submit');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Submit Your Requirements
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get connected with verified suppliers instantly. Submit your RFQ and receive quotes from qualified suppliers within 24 hours.
          </p>
        </div>

        {/* Category Selection */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            Select Your Industry
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  selectedCategory === category
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setActiveTab('submit')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'submit'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Submit RFQ
            </button>
            <button
              onClick={() => setActiveTab('purchase')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'purchase'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Purchase Credits
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-2xl mx-auto">
          {activeTab === 'submit' ? (
            <LeadForm 
              category={selectedCategory} 
              onSuccess={() => {
                // Optionally switch to purchase tab after successful submission
                // setActiveTab('purchase');
              }}
            />
          ) : (
            <CreditPurchase 
              userId="demo-user-123" // In real app, get from auth context
              onSuccess={() => {
                setActiveTab('submit');
              }}
            />
          )}
        </div>

        {/* Features Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Fast Response</h3>
            <p className="text-gray-600">Get quotes from verified suppliers within 24 hours</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Verified Suppliers</h3>
            <p className="text-gray-600">All suppliers are verified and quality-checked</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure Platform</h3>
            <p className="text-gray-600">Your data is protected with enterprise-grade security</p>
          </div>
        </div>

        {/* Pricing Info */}
        <div className="mt-16 bg-blue-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">1</div>
              <h3 className="font-semibold text-gray-900 mb-2">Submit RFQ</h3>
              <p className="text-sm text-gray-600">Fill out your requirement details</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">2</div>
              <h3 className="font-semibold text-gray-900 mb-2">Suppliers Respond</h3>
              <p className="text-sm text-gray-600">Verified suppliers submit quotes</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">3</div>
              <h3 className="font-semibold text-gray-900 mb-2">Compare & Choose</h3>
              <p className="text-sm text-gray-600">Review quotes and select the best option</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">4</div>
              <h3 className="font-semibold text-gray-900 mb-2">Complete Deal</h3>
              <p className="text-sm text-gray-600">Finalize your purchase securely</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
