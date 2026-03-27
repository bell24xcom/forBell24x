'use client';

import React from 'react';
import Link from 'next/link';
import { ALL_MOCK_RFQS, type MockRFQ } from '../data/mockProducts';

interface DemoRFQSectionProps {
  title?: string;
  categoryId?: string;
  limit?: number;
  showCategoryFilter?: boolean;
}

export default function DemoRFQSection({
  title = 'Recent RFQs',
  categoryId,
  limit = 6,
  showCategoryFilter = false,
}: DemoRFQSectionProps) {
  // Filter RFQs based on category if provided
  const filteredRFQs = React.useMemo(() => {
    let rfqs = ALL_MOCK_RFQS;

    if (categoryId) {
      const categoryName = categoryId.replace(/-/g, ' ').toLowerCase();
      rfqs = rfqs.filter(
        rfq =>
          rfq.category.toLowerCase().includes(categoryName) ||
          rfq.subcategory.toLowerCase().includes(categoryName)
      );
    }

    // Sort by posted date (most recent first) and limit results
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

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  if (filteredRFQs.length === 0) {
    return (
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center'>
        <div className='text-gray-400 dark:text-gray-500 mb-4'>
          <MessageSquare className='w-12 h-12 mx-auto mb-3' />
          <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
            No RFQs Available
          </h3>
          <p className='text-sm'>Be the first to post an RFQ in this category.</p>
        </div>
        <Link
          href='/rfq'
          className='inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors'
        >
          Post Your RFQ
        </Link>
      </div>
    );
  }

  return (
    <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700'>
      {/* Header */}
      <div className='px-6 py-4 border-b border-gray-200 dark:border-gray-700'>
        <div className='flex items-center justify-between'>
          <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>{title}</h2>
          <div className='flex items-center gap-2'>
            {/* Demo Indicator */}
            <div className='flex items-center gap-1 px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full text-xs font-medium'>
              <AlertCircle className='w-3 h-3' />
              Demo Content
            </div>
            <Link
              href='/rfq'
              className='text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium'
            >
              View All RFQs
            </Link>
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
              <div className='flex-1 min-w-0'>
                {/* RFQ Header */}
                <div className='flex items-center gap-3 mb-2'>
                  {getRFQTypeIcon(rfq.rfqType)}
                  <h3 className='text-lg font-semibold text-gray-900 dark:text-white line-clamp-1'>
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

                {/* RFQ Description */}
                <p className='text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-3'>
                  {rfq.description}
                </p>

                {/* RFQ Details */}
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

                {/* Posted By */}
                <div className='flex items-center justify-between'>
                  <div className='text-sm'>
                    <span className='text-gray-500 dark:text-gray-400'>Posted by </span>
                    <span className='font-medium text-gray-900 dark:text-white'>
                      {rfq.postedBy}
                    </span>
                    <span className='text-gray-500 dark:text-gray-400 ml-2'>
                      • {formatTimeAgo(rfq.postedDate)}
                    </span>
                  </div>

                  <div className='flex items-center gap-3'>
                    {/* Responses */}
                    <div className='flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400'>
                      <MessageSquare className='w-4 h-4' />
                      <span>{rfq.responses} responses</span>
                    </div>

                    {/* Category Badge */}
                    <div className='px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-medium'>
                      {rfq.subcategory}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className='ml-4'>
                <Link
                  href={`/rfq/${rfq.id}`}
                  className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors'
                >
                  View Details
                </Link>
              </div>
            </div>

            {/* Voice/Video Indicator */}
            {rfq.rfqType !== 'standard' && (
              <div className='mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg'>
                <div className='flex items-center gap-2 text-sm'>
                  {rfq.rfqType === 'voice' ? (
                    <>
                      <span>🎤</span>
                      <span className='text-gray-600 dark:text-gray-400'>
                        Voice RFQ with AI transcription available
                      </span>
                    </>
                  ) : (
                    <>
                      <span>🎥</span>
                      <span className='text-gray-600 dark:text-gray-400'>
                        Video RFQ with AI analysis available
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className='px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700'>
        <div className='flex items-center justify-between'>
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            Showing {filteredRFQs.length} of {ALL_MOCK_RFQS.length} total RFQs
          </p>
          <div className='flex items-center gap-4'>
            <Link
              href='/rfq/post'
              className='text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium'
            >
              Post New RFQ
            </Link>
            <Link
              href='/rfq'
              className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors'
            >
              Browse All RFQs
            </Link>
          </div>
        </div>
      </div>

      {/* Demo Disclaimer */}
      <div className='px-6 py-3 bg-orange-50 dark:bg-orange-900/20 border-t border-orange-200 dark:border-orange-800'>
        <div className='flex items-start gap-2'>
          <AlertCircle className='w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0' />
          <div className='text-sm'>
            <p className='text-orange-800 dark:text-orange-200 font-medium'>Demo Content Notice</p>
            <p className='text-orange-700 dark:text-orange-300'>
              These RFQs are generated for demonstration purposes to showcase platform capabilities.
              Real RFQs will be clearly marked when the platform goes live.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
