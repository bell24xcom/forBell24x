'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

// Loading component
function CompareQuotesLoading() {
  return (
    <div className="page-container flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-neutral-600">Loading quotes...</p>
      </div>
    </div>
  );
}

// Main content component that uses useSearchParams
function CompareQuotesContent() {
  const searchParams = useSearchParams();
  const [quotes, setQuotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedQuotes, setSelectedQuotes] = useState([]);

  useEffect(() => {
    // Simulate loading quotes
    const loadQuotes = async () => {
      setIsLoading(true);
      // Mock data for demonstration
      const mockQuotes = [
        {
          id: 1,
          supplier: 'ABC Electronics Ltd.',
          price: 125000,
          deliveryTime: '7 days',
          rating: 4.8,
          features: ['Premium Quality', '1 Year Warranty', 'Free Shipping'],
          description: 'High-quality LED bulbs with energy efficiency certification'
        },
        {
          id: 2,
          supplier: 'XYZ Lighting Solutions',
          price: 118000,
          deliveryTime: '5 days',
          rating: 4.6,
          features: ['Bulk Discount', 'Fast Delivery', 'Quality Assured'],
          description: 'Cost-effective LED solution with bulk pricing benefits'
        },
        {
          id: 3,
          supplier: 'GreenTech Industries',
          price: 132000,
          deliveryTime: '10 days',
          rating: 4.9,
          features: ['Eco-Friendly', 'Long Lifespan', 'Premium Support'],
          description: 'Environmentally friendly LED bulbs with extended warranty'
        }
      ];
      
      setTimeout(() => {
        setQuotes(mockQuotes);
        setIsLoading(false);
      }, 1000);
    };

    loadQuotes();
  }, []);

  const handleQuoteSelect = (quoteId) => {
    setSelectedQuotes(prev => 
      prev.includes(quoteId) 
        ? prev.filter(id => id !== quoteId)
        : [...prev, quoteId]
    );
  };

  const handleContactSupplier = (supplier) => {
    // In a real app, this would open a contact form or messaging system
    alert(`Contacting ${supplier}...`);
  };

  const handlePlaceOrder = () => {
    if (selectedQuotes.length === 0) {
      alert('Please select at least one quote');
      return;
    }
    alert(`Placing order with ${selectedQuotes.length} selected quote(s)`);
  };

  if (isLoading) {
    return <CompareQuotesLoading />;
  }

  return (
    <div className="page-container py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">Compare Quotes</h1>
          <p className="mt-2 text-neutral-600">
            Review and compare quotes from verified suppliers
          </p>
        </div>

        {/* Action Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-neutral-600">
                {quotes.length} quotes received
              </span>
              <span className="text-sm text-neutral-600">
                {selectedQuotes.length} selected
              </span>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <button
                onClick={() => setSelectedQuotes(quotes.map(q => q.id))}
                className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100"
              >
                Select All
              </button>
              <button
                onClick={() => setSelectedQuotes([])}
                className="px-4 py-2 text-sm font-medium text-neutral-600 bg-neutral-50 rounded-md hover:bg-neutral-100"
              >
                Clear Selection
              </button>
              <button
                onClick={handlePlaceOrder}
                disabled={selectedQuotes.length === 0}
                className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Place Order ({selectedQuotes.length})
              </button>
            </div>
          </div>
        </div>

        {/* Quotes Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {quotes.map((quote) => (
            <div
              key={quote.id}
              className={`bg-white rounded-lg shadow-sm border-2 transition-all duration-200 ${
                selectedQuotes.includes(quote.id)
                  ? 'border-indigo-500 ring-2 ring-indigo-200'
                  : 'border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <div className="p-6">
                {/* Quote Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900">
                      {quote.supplier}
                    </h3>
                    <div className="flex items-center mt-1">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(quote.rating)
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="ml-2 text-sm text-neutral-600">
                        {quote.rating}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleQuoteSelect(quote.id)}
                    className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                      selectedQuotes.includes(quote.id)
                        ? 'bg-indigo-600 border-indigo-600'
                        : 'border-neutral-300'
                    }`}
                  >
                    {selectedQuotes.includes(quote.id) && (
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Price */}
                <div className="mb-4">
                  <div className="text-3xl font-bold text-neutral-900">
                    ₹{quote.price.toLocaleString()}
                  </div>
                  <div className="text-sm text-neutral-600">
                    Delivery: {quote.deliveryTime}
                  </div>
                </div>

                {/* Description */}
                <p className="text-neutral-600 text-sm mb-4">
                  {quote.description}
                </p>

                {/* Features */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-neutral-900 mb-2">Key Features:</h4>
                  <ul className="space-y-1">
                    {quote.features.map((feature, index) => (
                      <li key={index} className="text-sm text-neutral-600 flex items-center">
                        <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Actions */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleContactSupplier(quote.supplier)}
                    className="flex-1 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100"
                  >
                    Contact Supplier
                  </button>
                  <button
                    onClick={() => handleQuoteSelect(quote.id)}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-primary-700"
                  >
                    {selectedQuotes.includes(quote.id) ? 'Selected' : 'Select Quote'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Back to RFQ */}
        <div className="mt-8 text-center">
          <Link
            href="/rfq"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-neutral-600 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to RFQ Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

// Main page component with Suspense boundary
export default function CompareQuotesPage() {
  return (
    <Suspense fallback={<CompareQuotesLoading />}>
      <CompareQuotesContent />
    </Suspense>
  );
}