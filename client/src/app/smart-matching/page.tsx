'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { AIMatchingEngine, RFQRequirement, MatchResult } from '@/lib/ai-matching';
import { mockSuppliers } from '@/data/mock-suppliers';
import { SmartMatchResults } from '@/components/ui/SmartMatchResults';

export default function SmartMatchingPage() {
  const { data: session, status } = () => ({ data: { user: { id: "user", email: "user@company.com", name: "Business User" } }, status: "authenticated" });
  const router = useRouter();
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [matchingEngine] = useState(() => new AIMatchingEngine(mockSuppliers));

  const [requirement, setRequirement] = useState<Partial<RFQRequirement>>({
    title: '',
    description: '',
    category: 'electronics',
    quantity: '',
    targetPrice: '',
    deadline: '',
    location: '',
    urgency: 'medium',
  });

  // Removed unauthenticated check since mock auth always returns 'authenticated'

  const handleSearch = async () => {
    if (!requirement.title || !requirement.category) {
      alert('Please fill in the title and category');
      return;
    }

    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const fullRequirement: RFQRequirement = {
        id: Date.now().toString(),
        title: requirement.title || '',
        description: requirement.description || '',
        category: requirement.category || 'electronics',
        quantity: requirement.quantity || '',
        targetPrice: requirement.targetPrice || '',
        deadline: requirement.deadline || '',
        location: requirement.location || '',
        urgency: requirement.urgency || 'medium',
      };

      const results = await matchingEngine.findMatches(fullRequirement);
      setMatches(results);
    } catch (error) {
      console.error('Matching error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Removed status loading check since mock auth always returns 'authenticated'

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 to-blue-50'>
      <div className='bg-white shadow-sm border-b'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>AI Smart Matching</h1>
              <p className='text-gray-600 mt-1'>Find perfect suppliers using advanced AI</p>
            </div>
            <div className='flex items-center gap-2 text-sm'>
              <Sparkles className='h-5 w-5 text-yellow-500' />
              <span className='text-gray-600'>98.5% Accuracy</span>
            </div>
          </div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='grid lg:grid-cols-3 gap-8'>
          <div className='lg:col-span-1'>
            <div className='bg-white rounded-xl shadow-sm border p-6 sticky top-6'>
              <div className='flex items-center gap-2 mb-6'>
                <span>🔍</span>
                <h2 className='text-xl font-semibold text-gray-900'>Search Requirements</h2>
              </div>

              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                    Product/Service Title *
                  </label>
                  <input
                    type='text'
                    value={requirement.title || ''}
                    onChange={e => setRequirement(prev => ({ ...prev, title: e.target.value }))}
                    placeholder='e.g., Circuit Boards for Industrial Controllers'
                    className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                    Category *
                  </label>
                  <select
                    value={requirement.category || 'electronics'}
                    onChange={e => setRequirement(prev => ({ ...prev, category: e.target.value }))}
                    className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                  >
                    <option
                      value='electronics'
                      className='bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                    >
                      Electronics
                    </option>
                    <option
                      value='machinery'
                      className='bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                    >
                      Machinery
                    </option>
                    <option
                      value='chemicals'
                      className='bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                    >
                      Chemicals
                    </option>
                    <option
                      value='automotive'
                      className='bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                    >
                      Automotive
                    </option>
                    <option
                      value='construction'
                      className='bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                    >
                      Construction
                    </option>
                    <option
                      value='textiles'
                      className='bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                    >
                      Textiles
                    </option>
                  </select>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                    Quantity
                  </label>
                  <input
                    type='text'
                    value={requirement.quantity || ''}
                    onChange={e => setRequirement(prev => ({ ...prev, quantity: e.target.value }))}
                    placeholder='e.g., 500 units'
                    className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Target Price
                  </label>
                  <input
                    type='text'
                    value={requirement.targetPrice || ''}
                    onChange={e =>
                      setRequirement(prev => ({ ...prev, targetPrice: e.target.value }))
                    }
                    placeholder='e.g., ₹2,50,000'
                    className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                    Location
                  </label>
                  <input
                    type='text'
                    value={requirement.location || ''}
                    onChange={e => setRequirement(prev => ({ ...prev, location: e.target.value }))}
                    placeholder='e.g., Mumbai'
                    className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400'
                  />
                </div>

                <div className='space-y-3 pt-4'>
                  <button
                    onClick={handleSearch}
                    disabled={isLoading}
                    className='w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2'
                  >
                    {isLoading ? (
                      <>
                        <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                        Finding Matches...
                      </>
                    ) : (
                      <>
                        <Sparkles className='h-4 w-4' />
                        Find Smart Matches
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => router.push('/voice-rfq')}
                    className='w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 flex items-center justify-center gap-2'
                  >
                    <span>🎤</span>
                    Use Voice RFQ
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className='lg:col-span-2'>
            {matches.length > 0 || isLoading ? (
              <SmartMatchResults
                matches={matches}
                isLoading={isLoading}
                searchQuery={requirement.title || ''}
              />
            ) : (
              <div className='bg-white rounded-xl shadow-sm border p-8'>
                <div className='text-center'>
                  <div className='bg-blue-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center'>
                    <Sparkles className='h-12 w-12 text-blue-600' />
                  </div>
                  <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                    AI-Powered Smart Matching
                  </h2>
                  <p className='text-gray-600 mb-8 max-w-2xl mx-auto'>
                    Enter your requirements to find perfect suppliers using advanced AI algorithms.
                  </p>

                  <div className='grid md:grid-cols-2 gap-6 mt-8'>
                    <div className='text-left'>
                      <div className='flex items-center gap-3 mb-3'>
                        <div className='bg-green-100 p-2 rounded-lg'>
                          <span>⚡</span>
                        </div>
                        <h3 className='font-semibold text-gray-900'>98.5% Accuracy</h3>
                      </div>
                      <p className='text-gray-600 text-sm'>
                        Advanced AI ensures highly accurate supplier matching.
                      </p>
                    </div>

                    <div className='text-left'>
                      <div className='flex items-center gap-3 mb-3'>
                        <div className='bg-blue-100 p-2 rounded-lg'>
                          <span>🔍</span>
                        </div>
                        <h3 className='font-semibold text-gray-900'>Smart Filtering</h3>
                      </div>
                      <p className='text-gray-600 text-sm'>
                        Intelligent filtering for optimal supplier matches.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
