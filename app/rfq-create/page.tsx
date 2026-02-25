'use client';

import { useState } from 'react';

export default function RFQCreatePage() {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    quantity: '',
    budget: '',
    deadline: '',
    description: '',
    specifications: '',
    location: '',
    urgency: 'normal'
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const categories = [
    { value: '', label: 'Select Category' },
    { value: 'steel', label: 'Steel & Metals' },
    { value: 'textiles', label: 'Textiles' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'machinery', label: 'Machinery' },
    { value: 'chemicals', label: 'Chemicals' }
  ];

  const urgencyLevels = [
    { value: 'low', label: 'Low (7+ days)' },
    { value: 'normal', label: 'Normal (3-7 days)' },
    { value: 'high', label: 'High (1-3 days)' },
    { value: 'urgent', label: 'Urgent (24 hours)' }
  ];

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.quantity.trim()) newErrors.quantity = 'Quantity is required';
    if (!formData.budget || formData.budget <= 0) newErrors.budget = 'Valid budget is required';
    if (!formData.deadline) newErrors.deadline = 'Deadline is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/rfq/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        setSuccess(true);
        setFormData({
          title: '',
          category: '',
          quantity: '',
          budget: '',
          deadline: '',
          description: '',
          specifications: '',
          location: '',
          urgency: 'normal'
        });
        setErrors({});
      } else {
        const errorData = await response.json();
        setErrors({ submit: errorData.message || 'Failed to create RFQ' });
      }
    } catch (error) {
      console.error('Error creating RFQ:', error);
      setErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center py-12 px-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 text-center max-w-md">
          <div className="text-green-400 text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-white mb-4">RFQ Created Successfully!</h2>
          <p className="text-slate-300 mb-6">
            Your RFQ has been submitted and suppliers will be notified.
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-all"
          >
            Create Another RFQ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">Create RFQ</h1>
          <p className="text-lg text-slate-300">
            Submit your requirements and get quotes from verified suppliers
          </p>
        </div>

        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <form onSubmit={handleSubmit} className="bg-slate-800/50 border border-slate-700/50 rounded-lg shadow-md p-8">
                {errors.submit && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600">{errors.submit}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-2">
                      RFQ Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className={'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ' + (errors.title ? 'border-red-300' : 'border-gray-300')}
                      placeholder="Enter RFQ title"
                    />
                    {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                  </div>

                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-slate-300 mb-2">
                      Category *
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className={'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ' + (errors.category ? 'border-red-300' : 'border-gray-300')}
                    >
                      {categories.map(category => (
                        <option key={category.value} value={category.value}>{category.label}</option>
                      ))}
                    </select>
                    {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
                  </div>

                  <div>
                    <label htmlFor="quantity" className="block text-sm font-medium text-slate-300 mb-2">
                      Quantity *
                    </label>
                    <input
                      type="text"
                      id="quantity"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      className={'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ' + (errors.quantity ? 'border-red-300' : 'border-gray-300')}
                      placeholder="e.g., 100 pieces, 50 kg, 10 units"
                    />
                    {errors.quantity && <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>}
                  </div>

                  <div>
                    <label htmlFor="budget" className="block text-sm font-medium text-slate-300 mb-2">
                      Budget (₹) *
                    </label>
                    <input
                      type="number"
                      id="budget"
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      min="0"
                      className={'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ' + (errors.budget ? 'border-red-300' : 'border-gray-300')}
                      placeholder="Enter budget amount"
                    />
                    {errors.budget && <p className="mt-1 text-sm text-red-600">{errors.budget}</p>}
                  </div>

                  <div>
                    <label htmlFor="deadline" className="block text-sm font-medium text-slate-300 mb-2">
                      Deadline *
                    </label>
                    <input
                      type="date"
                      id="deadline"
                      name="deadline"
                      value={formData.deadline}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      className={'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ' + (errors.deadline ? 'border-red-300' : 'border-gray-300')}
                    />
                    {errors.deadline && <p className="mt-1 text-sm text-red-600">{errors.deadline}</p>}
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {urgencyLevels.map(level => (
                        <option key={level.value} value={level.value}>{level.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="location" className="block text-sm font-medium text-slate-300 mb-2">
                      Delivery Location *
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className={'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ' + (errors.location ? 'border-red-300' : 'border-gray-300')}
                      placeholder="e.g., Mumbai, Maharashtra"
                    />
                    {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
                  </div>
                </div>

                <div className="mt-6">
                  <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className={'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ' + (errors.description ? 'border-red-300' : 'border-gray-300')}
                    placeholder="Describe your requirements in detail"
                  />
                  {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                </div>

                <div className="mt-6">
                  <label htmlFor="specifications" className="block text-sm font-medium text-slate-300 mb-2">
                    Technical Specifications
                  </label>
                  <textarea
                    id="specifications"
                    name="specifications"
                    value={formData.specifications}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add technical specifications, dimensions, materials, etc."
                  />
                </div>

                <div className="mt-8">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creating RFQ...' : 'Submit RFQ'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}