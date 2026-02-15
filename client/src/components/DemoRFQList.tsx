'use client';

import React from 'react';
import Link from 'next/link';
import { ALL_MOCK_RFQS, type MockRFQ } from '../data/mockProducts';

interface DemoRFQListProps {
  title?: string;
  categoryId?: string;
  limit?: number;
}

export default function DemoRFQList({
  title = 'Recent RFQs',
  categoryId,
  limit = 6,
}: DemoRFQListProps) {
  const filteredRFQs = React.useMemo(() => {
    let rfqs = ALL_MOCK_RFQS;

    if (categoryId) {
      const categoryName = categoryId.replace(/-/g, ' ').toLowerCase();
      rfqs = rfqs.filter(rfq => rfq.category.toLowerCase().includes(categoryName));
    }

    return rfqs
      .sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime())
      .slice(0, limit);
  }, [categoryId, limit]);

  const getRFQTypeIcon = (type: string) => {
    switch (type) {
      case 'voice':
        return <span>🎤</span>;
      case 'video':
        return <span>🎥</span>;
      default:
        return <MessageSquare className='w-4 h-4 text-gray-500' />;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'Urgent':
        return 'text-red-600 bg-red-100';
      case 'High':
        return 'text-orange-600 bg-orange-100';
      case 'Medium':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-green-600 bg-green-100';
    }
  };

  return (
    <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700'>
      {/* Header */}
      <div className='px-6 py-4 border-b border-gray-200 dark:border-gray-700'>
        <div className='flex items-center justify-between'>
          <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>{title}</h2>
          <div className='flex items-center gap-2'>
            <div className='flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-medium'>
              <AlertCircle className='w-3 h-3' />
              Demo Content
            </div>
          </div>
        </div>
      </div>

      {/* RFQ List */}
      <div className='divide-y divide-gray-200 dark:divide-gray-700'>
        {filteredRFQs.map(rfq => (
          <div
            key={rfq.id}
            className='p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors'
          >
            <div className='flex items-start justify-between'>
              <div className='flex-1'>
                <div className='flex items-center gap-3 mb-2'>
                  {getRFQTypeIcon(rfq.rfqType)}
                  <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                    {rfq.title}
                  </h3>
                  <div
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(
                      rfq.urgency
                    )}`}
                  >
                    {rfq.urgency}
                  </div>
                </div>

                <p className='text-gray-600 dark:text-gray-400 text-sm mb-3'>{rfq.description}</p>

                <div className='flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3'>
                  <div className='flex items-center gap-1'>
                    <span>👤</span>
                    <span>{rfq.quantity}</span>
                  </div>
                  <div className='flex items-center gap-1'>
                    <span>$</span>
                    <span>{rfq.budget}</span>
                  </div>
                  <div className='flex items-center gap-1'>
                    <span>🕐</span>
                    <span>{rfq.timeline}</span>
                  </div>
                  <div className='flex items-center gap-1'>
                    <span>📍</span>
                    <span>{rfq.location}</span>
                  </div>
                </div>

                <div className='flex items-center justify-between'>
                  <div className='text-sm'>
                    <span className='text-gray-500 dark:text-gray-400'>Posted by </span>
                    <span className='font-medium text-gray-900 dark:text-white'>
                      {rfq.postedBy}
                    </span>
                  </div>

                  <div className='flex items-center gap-3'>
                    <div className='flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400'>
                      <MessageSquare className='w-4 h-4' />
                      <span>{rfq.responses} responses</span>
                    </div>

                    <div className='px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-medium'>
                      {rfq.subcategory}
                    </div>
                  </div>
                </div>
              </div>

              <div className='ml-4'>
                <Link
                  href={`/rfq?demo=${rfq.id}`}
                  className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors'
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Demo Disclaimer */}
      <div className='px-6 py-3 bg-orange-50 dark:bg-orange-900/20 border-t border-orange-200'>
        <div className='flex items-start gap-2'>
          <AlertCircle className='w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0' />
          <div className='text-sm'>
            <p className='text-orange-800 font-medium'>Demo Content Notice</p>
            <p className='text-orange-700'>
              These RFQs are generated for demonstration purposes. Real RFQs will be available when
              the platform goes live.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
