'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

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
      <div className="page-container flex items-center justify-center">
        <div className="max-w-md w-full text-center">
          <div className="card">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">RFQ Created Successfully!</h2>
            <p className="feature-description">Your request for quotation has been submitted.</p>
            <p className="text-sm text-neutral-500">Redirecting to RFQ dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Navigation */}
      <nav className="bg-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">B</div>
                <div>
                  <div className="font-bold text-xl">Bell24h</div>
                  <div className="text-xs text-neutral-600">Verified B2B Platform</div>
                </div>
              </Link>
              <div className="hidden md:flex items-center gap-6">
                <Link href="/dashboard" className="nav-link">Dashboard</Link>
                <Link href="/rfq" className="nav-link">My RFQs</Link>
                <Link href="/rfq/create" className="text-blue-600 font-semibold">Create RFQ</Link>
                <Link href="/suppliers" className="nav-link">Suppliers</Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="page-content">
        <div className="max-w-4xl mx-auto">
          <div className="page-header text-center">
            <h1 className="page-title">
              Create Request for Quotation
            </h1>
            <p className="page-subtitle">
              Describe what you need and get quotes from verified suppliers
            </p>
          </div>
          
          <div className="card">
            {error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="title" className="form-label">
                  RFQ Title *
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="e.g., Need 1000 units of LED bulbs"
                />
              </div>

              <div>
                <label htmlFor="category" className="form-label">
                  Product/Service Category *
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="">Select Category</option>
                  <option value="textiles-garments">Textiles & Garments</option>
                  <option value="pharmaceuticals">Pharmaceuticals</option>
                  <option value="agricultural-products">Agricultural Products</option>
                  <option value="automotive-parts">Automotive Parts</option>
                  <option value="it-services">IT Services</option>
                  <option value="gems-jewelry">Gems & Jewelry</option>
                  <option value="handicrafts">Handicrafts</option>
                  <option value="machinery-equipment">Machinery & Equipment</option>
                  <option value="chemicals">Chemicals</option>
                  <option value="food-processing">Food Processing</option>
                  <option value="electronics">Electronics</option>
                  <option value="construction">Construction Materials</option>
                  <option value="packaging">Packaging</option>
                  <option value="logistics">Logistics & Transportation</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="description" className="form-label">
                  Product/Service Description *
                </label>
                <textarea 
                  id="description"
                  name="description"
                  rows={4}
                  required
                  value={formData.description}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Describe the product or service you need in detail..."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="quantity" className="form-label">
                    Quantity *
                  </label>
                  <input 
                    id="quantity"
                    name="quantity"
                    type="number"
                    required
                    value={formData.quantity}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter quantity"
                    min="1"
                  />
                </div>
                
                <div>
                  <label htmlFor="unit" className="form-label">
                    Unit *
                  </label>
                  <select
                    id="unit"
                    name="unit"
                    required
                    value={formData.unit}
                    onChange={handleChange}
                    className="form-input"
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
                <label className="form-label">
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
                      className="form-input"
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
                      className="form-input"
                      placeholder="Maximum"
                      min="0"
                    />
                    <label className="text-xs text-neutral-500 mt-1">Maximum Budget</label>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="timeline" className="form-label">
                    Delivery Timeline *
                  </label>
                  <select
                    id="timeline"
                    name="timeline"
                    required
                    value={formData.timeline}
                    onChange={handleChange}
                    className="form-input"
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
                  <label htmlFor="urgency" className="form-label">
                    Urgency Level
                  </label>
                  <select
                    id="urgency"
                    name="urgency"
                    value={formData.urgency}
                    onChange={handleChange}
                    className="form-input"
                  >
                    <option value="low">Low - No rush</option>
                    <option value="normal">Normal - Standard timeline</option>
                    <option value="high">High - Urgent</option>
                    <option value="critical">Critical - ASAP</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label htmlFor="requirements" className="form-label">
                  Additional Requirements
                </label>
                <textarea 
                  id="requirements"
                  name="requirements"
                  rows={3}
                  value={formData.requirements}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Any specific requirements, certifications, quality standards, or preferences..."
                />
              </div>
              
              <div className="flex gap-4 pt-4">
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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
                  className="btn-outline"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
