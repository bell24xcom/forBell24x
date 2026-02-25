'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Category = {
  id: number;
  name: string;
  slug: string;
};

export default function CreateRFQPage() {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    quantity: '',
    unit: '',
    minBudget: '',
    maxBudget: '',
    timeline: '',
    requirements: '',
    urgency: 'normal'
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  // Fetch categories from API on component mount
  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await fetch('/api/categories?level=1');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.categories) {
            setCategories(data.categories);
          }
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
        // Fallback to hardcoded categories if API fails
        setCategories([
          { id: 1, name: 'Textiles & Garments', slug: 'textiles-garments' },
          { id: 2, name: 'Pharmaceuticals', slug: 'pharmaceuticals' },
          { id: 3, name: 'Agricultural Products', slug: 'agricultural-products' },
          { id: 4, name: 'Automotive Parts', slug: 'automotive-parts' },
          { id: 5, name: 'IT Services', slug: 'it-services' },
        ]);
      }
    }
    loadCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/rfq/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/rfq');
        }, 2000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to create RFQ. Please try again.');
      }
    } catch (error) {
      setError('Failed to create RFQ. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">RFQ Created Successfully!</h2>
            <p className="text-slate-300 mb-2">Your request for quotation has been submitted.</p>
            <p className="text-sm text-slate-500">Redirecting to RFQ dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Create Request for Quotation
          </h1>
          <p className="text-lg text-slate-300">
            Describe what you need and get quotes from verified suppliers
          </p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 text-red-300 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-2">
                RFQ Title *
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="e.g., Need 1000 units of LED bulbs"
              />
            </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-slate-300 mb-2">
                  Product/Service Category *
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-2">
                  Product/Service Description *
                </label>
                <textarea 
                  id="description"
                  name="description"
                  rows={4}
                  required
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  placeholder="Describe the product or service you need in detail..."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-slate-300 mb-2">
                    Quantity *
                  </label>
                  <input 
                    id="quantity"
                    name="quantity"
                    type="number"
                    required
                    value={formData.quantity}
                    onChange={handleChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    placeholder="Enter quantity"
                    min="1"
                  />
                </div>
                
                <div>
                  <label htmlFor="unit" className="block text-sm font-medium text-slate-300 mb-2">
                    Unit *
                  </label>
                  <select
                    id="unit"
                    name="unit"
                    required
                    value={formData.unit}
                    onChange={handleChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  >
                    <option value="">Select Unit</option>
                    <option value="pieces">Pieces</option>
                    <option value="kg">Kilograms</option>
                    <option value="tons">Tons</option>
                    <option value="liters">Liters</option>
                    <option value="meters">Meters</option>
                    <option value="hours">Hours</option>
                    <option value="units">Units</option>
                    <option value="boxes">Boxes</option>
                    <option value="pairs">Pairs</option>
                    <option value="sets">Sets</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Budget Range (INR) *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input 
                      id="minBudget"
                      name="minBudget"
                      type="number"
                      required
                      value={formData.minBudget}
                      onChange={handleChange}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                      placeholder="Minimum"
                      min="0"
                    />
                    <label className="text-xs text-neutral-500 mt-1">Minimum Budget</label>
                  </div>
                  <div>
                    <input 
                      id="maxBudget"
                      name="maxBudget"
                      type="number"
                      required
                      value={formData.maxBudget}
                      onChange={handleChange}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                      placeholder="Maximum"
                      min="0"
                    />
                    <label className="text-xs text-neutral-500 mt-1">Maximum Budget</label>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="timeline" className="block text-sm font-medium text-slate-300 mb-2">
                    Delivery Timeline *
                  </label>
                  <select
                    id="timeline"
                    name="timeline"
                    required
                    value={formData.timeline}
                    onChange={handleChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  >
                    <option value="">Select Timeline</option>
                    <option value="1-week">Within 1 week</option>
                    <option value="2-weeks">Within 2 weeks</option>
                    <option value="1-month">Within 1 month</option>
                    <option value="2-months">Within 2 months</option>
                    <option value="3-months">Within 3 months</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="urgency" className="block text-sm font-medium text-slate-300 mb-2">
                    Urgency Level
                  </label>
                  <select
                    id="urgency"
                    name="urgency"
                    value={formData.urgency}
                    onChange={handleChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  >
                    <option value="low">Low - No rush</option>
                    <option value="normal">Normal - Standard timeline</option>
                    <option value="high">High - Urgent</option>
                    <option value="critical">Critical - ASAP</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label htmlFor="requirements" className="block text-sm font-medium text-slate-300 mb-2">
                  Additional Requirements
                </label>
                <textarea 
                  id="requirements"
                  name="requirements"
                  rows={3}
                  value={formData.requirements}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  placeholder="Any specific requirements, certifications, quality standards, or preferences..."
                />
              </div>
              
            <div className="space-y-3 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-6 py-4 rounded-lg transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Creating RFQ...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Submit RFQ
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white font-medium px-6 py-3 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
