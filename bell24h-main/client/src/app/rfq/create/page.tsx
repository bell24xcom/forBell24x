'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

// Separate component that uses useSearchParams (must be wrapped in Suspense)
function RFQCreateForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rfqType = searchParams?.get('type') || 'text'; // text, voice, video

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    quantity: '',
    deadline: '',
    category: '',
    budget: '',
    location: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/rfq/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          type: rfqType,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Redirect to the created RFQ or RFQ list
        router.push(`/rfq/${data.rfqId || ''}`);
      } else {
        setError(data.message || 'Failed to create RFQ. Please try again.');
      }
    } catch (err) {
      console.error('Error creating RFQ:', err);
      setError('An error occurred while creating the RFQ. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a1128] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link
            href="/rfq"
            className="text-cyan-400 hover:text-cyan-300 mb-4 inline-block flex items-center gap-2"
          >
            ← Back to RFQs
          </Link>
          <h1 className="text-4xl font-bold mb-2">Create New RFQ</h1>
          <p className="text-gray-400">
            {rfqType === 'voice' && 'Create a voice-based RFQ'}
            {rfqType === 'video' && 'Create a video-based RFQ'}
            {rfqType === 'text' && 'Create a text-based RFQ'}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-gray-900/80 backdrop-blur border border-white/10 rounded-xl p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Product/Service Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white placeholder-gray-500"
              placeholder="e.g., 1000 units of CNC machined parts"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Description *
            </label>
            <textarea
              required
              rows={6}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white placeholder-gray-500"
              placeholder="Detailed requirements, specifications, quality standards..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Quantity *
              </label>
              <input
                type="text"
                required
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white placeholder-gray-500"
                placeholder="e.g., 1000 units"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Deadline *
              </label>
              <input
                type="date"
                required
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white placeholder-gray-500"
                placeholder="e.g., Manufacturing, Electronics"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Budget Range
              </label>
              <input
                type="text"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white placeholder-gray-500"
                placeholder="e.g., ₹50,000 - ₹1,00,000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white placeholder-gray-500"
              placeholder="e.g., Mumbai, Maharashtra"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-semibold disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </>
              ) : (
                'Submit RFQ'
              )}
            </button>
            <button
              type="button"
              onClick={() => router.push('/rfq')}
              className="px-8 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Main component with Suspense wrapper (required for useSearchParams)
export default function CreateRFQPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0a1128] flex items-center justify-center">
          <div className="text-cyan-400">Loading form...</div>
        </div>
      }
    >
      <RFQCreateForm />
    </Suspense>
  );
}

