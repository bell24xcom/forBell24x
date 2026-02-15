'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function RFQComparePage() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuotes, setSelectedQuotes] = useState([]);

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    setLoading(true);
    try {
      // Mock data for quotes
      const mockQuotes = [
        {
          id: '1',
          supplier: 'SteelCo India',
          price: 250000,
          deliveryTime: '7 days',
          rating: 4.8,
          verified: true,
          specifications: 'Grade A steel pipes, 6 inch diameter',
          terms: 'FOB Mumbai, 30% advance',
          contact: '+91-9876543210'
        },
        {
          id: '2',
          supplier: 'Metal Works Ltd',
          price: 275000,
          deliveryTime: '10 days',
          rating: 4.5,
          verified: true,
          specifications: 'Grade A steel pipes, 6 inch diameter',
          terms: 'CIF Delhi, 50% advance',
          contact: '+91-9876543211'
        },
        {
          id: '3',
          supplier: 'Steel Solutions',
          price: 240000,
          deliveryTime: '5 days',
          rating: 4.9,
          verified: true,
          specifications: 'Grade A steel pipes, 6 inch diameter',
          terms: 'EXW Pune, 100% advance',
          contact: '+91-9876543212'
        }
      ];
      
      setQuotes(mockQuotes);
    } catch (error) {
      console.error('Error fetching quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleQuoteSelection = (quoteId) => {
    setSelectedQuotes(prev => 
      prev.includes(quoteId) 
        ? prev.filter(id => id !== quoteId)
        : [...prev, quoteId]
    );
  };

  const selectedQuotesData = quotes.filter(quote => selectedQuotes.includes(quote.id));

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Compare RFQ Quotes</h1>
            <p className="text-lg text-gray-600 mb-8">
              Compare quotes from different suppliers to make the best decision
            </p>
          </div>
        </section>

        {/* Quotes List */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {quotes.map((quote) => (
                  <div key={quote.id} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                          <input
                            type="checkbox"
                            checked={selectedQuotes.includes(quote.id)}
                            onChange={() => toggleQuoteSelection(quote.id)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <h3 className="text-xl font-semibold text-gray-900">{quote.supplier}</h3>
                          {quote.verified && (
                            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                              Verified
                            </span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Price</p>
                            <p className="text-2xl font-bold text-blue-600">₹{quote.price.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Delivery Time</p>
                            <p className="text-lg font-semibold text-gray-900">{quote.deliveryTime}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Rating</p>
                            <div className="flex items-center">
                              <span className="text-yellow-400">★</span>
                              <span className="text-lg font-semibold text-gray-900 ml-1">{quote.rating}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Specifications</p>
                            <p className="text-gray-900">{quote.specifications}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Terms</p>
                            <p className="text-gray-900">{quote.terms}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="ml-6">
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                          Contact Supplier
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Comparison Section */}
        {selectedQuotesData.length > 0 && (
          <section className="py-12 bg-white">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Quote Comparison</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-2 text-left">Supplier</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Price</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Delivery Time</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Rating</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Terms</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedQuotesData.map((quote) => (
                      <tr key={quote.id}>
                        <td className="border border-gray-300 px-4 py-2">
                          <div>
                            <p className="font-semibold">{quote.supplier}</p>
                            {quote.verified && (
                              <span className="text-xs text-green-600">Verified</span>
                            )}
                          </div>
                        </td>
                        <td className="border border-gray-300 px-4 py-2 font-semibold text-blue-600">
                          ₹{quote.price.toLocaleString()}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">{quote.deliveryTime}</td>
                        <td className="border border-gray-300 px-4 py-2">
                          <div className="flex items-center">
                            <span className="text-yellow-400">★</span>
                            <span className="ml-1">{quote.rating}</span>
                          </div>
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-sm">{quote.terms}</td>
                        <td className="border border-gray-300 px-4 py-2">
                          <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors">
                            Select
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </div>
      <Footer />
    </>
  );
}