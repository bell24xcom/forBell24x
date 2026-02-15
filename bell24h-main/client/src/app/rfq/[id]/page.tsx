'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { IndianRupee, MessageCircle, Building } from 'lucide-react';
import {
  demoRFQs,
  demoSuppliers,
  demoQuotes,
  getQuotesForRFQ,
  getSuppliersByCategory,
  DemoRFQ,
  DemoSupplier,
  DemoQuote,
} from '@/data/demoData';

export default function RFQDetailPage() {
  const params = useParams();
  const rfqId = params?.id as string;

  const [rfq, setRfq] = useState<DemoRFQ | null>(null);
  const [quotes, setQuotes] = useState<DemoQuote[]>([]);
  const [relatedSuppliers, setRelatedSuppliers] = useState<DemoSupplier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const foundRFQ = demoRFQs.find(r => r.id === rfqId);
    if (foundRFQ) {
      setRfq(foundRFQ);
      setQuotes(getQuotesForRFQ(rfqId));
      setRelatedSuppliers(getSuppliersByCategory(foundRFQ.category));
    }
    setLoading(false);
  }, [rfqId]);

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${(amount / 1000).toFixed(0)}K`;
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center'>
        <div className='text-white text-xl'>Loading RFQ details...</div>
      </div>
    );
  }

  if (!rfq) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center'>
        <div className='text-center text-white'>
          <h1 className='text-2xl font-bold mb-4'>RFQ Not Found</h1>
          <p className='mb-6'>The requested RFQ could not be found.</p>
          <Link href='/categories'>
            <button className='bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors'>
              Browse All RFQs
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900'>
      {/* Header */}
      <div className='bg-gray-900 border-b border-gray-700'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
          <div className='flex items-center justify-between'>
            <Link
              href='/categories'
              className='flex items-center text-blue-400 hover:text-blue-300 transition-colors'
            >
              <span>←</span>
              Back to Categories
            </Link>
            <div className='text-sm text-gray-400'>RFQ ID: {rfq.id}</div>
          </div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Main Content */}
          <div className='lg:col-span-2'>
            {/* RFQ Header */}
            <div className='bg-white rounded-xl p-8 shadow-lg mb-8'>
              <div className='flex justify-between items-start mb-6'>
                <div>
                  <div className='flex items-center space-x-4 mb-4'>
                    <div className='bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium'>
                      {rfq.category}
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getUrgencyColor(
                        rfq.urgency
                      )}`}
                    >
                      {rfq.urgency} Priority
                    </div>
                  </div>
                  <h1 className='text-3xl font-bold text-gray-900 mb-4'>{rfq.title}</h1>
                  <p className='text-gray-600 text-lg leading-relaxed mb-6'>{rfq.description}</p>
                </div>
              </div>

              {/* Key Details */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
                <div className='space-y-4'>
                  <div className='flex items-center'>
                    <IndianRupee className='w-5 h-5 text-green-600 mr-3' />
                    <div>
                      <div className='text-sm text-gray-500'>Budget Range</div>
                      <div className='font-semibold text-gray-900'>
                        {formatCurrency(rfq.budget.min)} - {formatCurrency(rfq.budget.max)}
                      </div>
                    </div>
                  </div>
                  <div className='flex items-center'>
                    <span>📍</span>
                    <div>
                      <div className='text-sm text-gray-500'>Location</div>
                      <div className='font-semibold text-gray-900'>{rfq.location}</div>
                    </div>
                  </div>
                  <div className='flex items-center'>
                    <span>🕐</span>
                    <div>
                      <div className='text-sm text-gray-500'>Deadline</div>
                      <div className='font-semibold text-gray-900'>
                        {new Date(rfq.deadline).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
                <div className='space-y-4'>
                  <div className='flex items-center'>
                    <span>👤</span>
                    <div>
                      <div className='text-sm text-gray-500'>Quantity</div>
                      <div className='font-semibold text-gray-900'>
                        {rfq.quantity.toLocaleString()} {rfq.unit}
                      </div>
                    </div>
                  </div>
                  <div className='flex items-center'>
                    <MessageCircle className='w-5 h-5 text-blue-600 mr-3' />
                    <div>
                      <div className='text-sm text-gray-500'>Responses</div>
                      <div className='font-semibold text-gray-900'>
                        {rfq.responseCount} quotes received
                      </div>
                    </div>
                  </div>
                  <div className='flex items-center'>
                    <span>📅</span>
                    <div>
                      <div className='text-sm text-gray-500'>Posted Date</div>
                      <div className='font-semibold text-gray-900'>
                        {new Date(rfq.postedDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Posted By */}
              <div className='border-t pt-6'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>Posted By</h3>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center'>
                    <div className='w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4'>
                      <Building className='w-6 h-6 text-blue-600' />
                    </div>
                    <div>
                      <div className='font-semibold text-gray-900'>{rfq.postedBy.company}</div>
                      <div className='text-gray-600'>{rfq.postedBy.name}</div>
                      <div className='flex items-center mt-1'>
                        <span>⭐</span>
                        <span className='text-sm text-gray-600'>{rfq.postedBy.rating} rating</span>
                        {rfq.postedBy.verified && (
                          <div className='flex items-center ml-3'>
                            <span>✅</span>
                            <span className='text-sm text-green-600'>Verified</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className='flex space-x-3'>
                    <button className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors'>
                      Contact
                    </button>
                    <button className='border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors'>
                      View Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Specifications */}
            <div className='bg-white rounded-xl p-8 shadow-lg mb-8'>
              <h2 className='text-2xl font-bold text-gray-900 mb-6'>Specifications</h2>
              <div className='space-y-3'>
                {rfq.specifications.map((spec, index) => (
                  <div key={index} className='flex items-start'>
                    <div className='w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0'></div>
                    <span className='text-gray-700'>{spec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className='bg-white rounded-xl p-8 shadow-lg mb-8'>
              <h2 className='text-2xl font-bold text-gray-900 mb-6'>Tags</h2>
              <div className='flex flex-wrap gap-2'>
                {rfq.tags.map((tag, index) => (
                  <span
                    key={index}
                    className='bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm'
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className='space-y-6'>
            {/* Action Buttons */}
            <div className='bg-white rounded-xl p-6 shadow-lg'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>Actions</h3>
              <div className='space-y-3'>
                <button className='w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold'>
                  Submit Quote
                </button>
                <button className='w-full border border-blue-600 text-blue-600 py-3 rounded-lg hover:bg-blue-50 transition-colors font-semibold'>
                  Save RFQ
                </button>
                <button className='w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors'>
                  Share RFQ
                </button>
              </div>
            </div>

            {/* Quotes Received */}
            {quotes.length > 0 && (
              <div className='bg-white rounded-xl p-6 shadow-lg'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>Quotes Received</h3>
                <div className='space-y-4'>
                  {quotes.map(quote => {
                    const supplier = demoSuppliers.find(s => s.id === quote.supplierId);
                    return (
                      <div key={quote.id} className='border border-gray-200 rounded-lg p-4'>
                        <div className='flex justify-between items-start mb-2'>
                          <div className='font-semibold text-gray-900'>{supplier?.company}</div>
                          <div className='text-lg font-bold text-green-600'>
                            {formatCurrency(quote.price)}
                          </div>
                        </div>
                        <div className='text-sm text-gray-600 mb-2'>
                          Delivery: {quote.deliveryTime} • Validity: {quote.validityPeriod}
                        </div>
                        <div className='flex items-center justify-between'>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              quote.status === 'Accepted'
                                ? 'bg-green-100 text-green-800'
                                : quote.status === 'Pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {quote.status}
                          </span>
                          <button className='text-blue-600 text-sm hover:text-blue-700'>
                            View Details
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Related Suppliers */}
            {relatedSuppliers.length > 0 && (
              <div className='bg-white rounded-xl p-6 shadow-lg'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>Related Suppliers</h3>
                <div className='space-y-4'>
                  {relatedSuppliers.slice(0, 3).map(supplier => (
                    <div key={supplier.id} className='border border-gray-200 rounded-lg p-4'>
                      <div className='flex items-center mb-2'>
                        <div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3'>
                          <Building className='w-5 h-5 text-blue-600' />
                        </div>
                        <div>
                          <div className='font-semibold text-gray-900'>{supplier.company}</div>
                          <div className='text-sm text-gray-600'>{supplier.location}</div>
                        </div>
                      </div>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center'>
                          <span>⭐</span>
                          <span className='text-sm text-gray-600'>{supplier.rating}</span>
                        </div>
                        <Link href={`/supplier/${supplier.id}`}>
                          <button className='text-blue-600 text-sm hover:text-blue-700'>
                            View Profile
                          </button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
