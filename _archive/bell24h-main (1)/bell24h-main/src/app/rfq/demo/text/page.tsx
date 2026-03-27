'use client';

import { useState } from 'react';
import { FileText, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { getMockRFQsByType } from '@/data/mockRFQs';

export default function TextRFQDemoPage() {
  const textRFQs = getMockRFQsByType('text');

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-gray-900">Text RFQ Demos</h1>
              <p className="text-gray-600 mt-2">
                {textRFQs.length} text RFQ examples with detailed specifications
              </p>
            </div>
          </div>
        </div>

        {/* Demo Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {textRFQs.map((rfq) => (
            <div
              key={rfq.id}
              className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-100 hover:border-green-500 transition"
            >
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-green-600" />
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                  Text RFQ
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3">{rfq.title}</h3>
              <p className="text-gray-600 mb-4">{rfq.description}</p>

              {/* Details */}
              <div className="space-y-2 mb-4 text-sm border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Category:</span>
                  <span className="font-semibold">{rfq.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Location:</span>
                  <span className="font-semibold">{rfq.location}</span>
                </div>
                {rfq.quantity && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Quantity:</span>
                    <span className="font-semibold">{rfq.quantity}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Quotes:</span>
                  <span className="font-semibold text-green-600">{rfq.quotesCount} received</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Link
                  href={`/rfq/${rfq.id}`}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition text-center text-sm"
                >
                  View Details
                </Link>
                <Link
                  href="/rfq/create?type=text"
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition text-sm"
                >
                  Try Text RFQ
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Link
            href="/rfq/create?type=text"
            className="inline-flex items-center gap-2 px-8 py-4 bg-green-600 text-white rounded-xl font-bold shadow-xl hover:bg-green-700 transition"
          >
            <FileText className="w-5 h-5" />
            Create Your Own Text RFQ
          </Link>
        </div>
      </div>
    </main>
  );
}

