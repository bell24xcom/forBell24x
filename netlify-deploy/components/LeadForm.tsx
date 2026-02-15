'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface LeadFormProps {
  category: string;
  onSuccess?: () => void;
}

export default function LeadForm({ category, onSuccess }: LeadFormProps) {
  const [formData, setFormData] = useState({
    category,
    product: '',
    quantity: '',
    budget: '',
    buyerName: '',
    buyerCompany: '',
    buyerEmail: '',
    buyerPhone: '',
    description: '',
    urgency: 'immediate',
    location: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/leads/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setMessage(result.message || 'RFQ submitted successfully! Suppliers will contact you soon.');
        // Reset form
        setFormData({
          ...formData,
          product: '',
          quantity: '',
          budget: '',
          description: ''
        });
        onSuccess?.();
      } else {
        setMessage(result.error || 'Failed to submit RFQ. Please try again.');
      }
    } catch (error) {
      setMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-white rounded-lg shadow-lg">
      <h3 className="text-xl font-bold text-gray-900">Submit Your Requirement</h3>
      
      {message && (
        <div className={`p-3 rounded ${
          message.includes('successfully') 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {message}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product/Service needed *
          </label>
          <input
            type="text"
            placeholder="e.g., Industrial sensors, Textile machinery"
            value={formData.product}
            onChange={(e) => setFormData({ ...formData, product: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantity
          </label>
          <input
            type="text"
            placeholder="e.g., 100 units, 500 kg"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Budget (₹)
          </label>
          <input
            type="number"
            placeholder="e.g., 50000"
            value={formData.budget}
            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Urgency
          </label>
          <select
            value={formData.urgency}
            onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="immediate">Immediate</option>
            <option value="30days">Within 30 days</option>
            <option value="60days">Within 60 days</option>
          </select>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Your Name *
        </label>
        <input
          type="text"
          placeholder="Enter your full name"
          value={formData.buyerName}
          onChange={(e) => setFormData({ ...formData, buyerName: e.target.value })}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Company Name
          </label>
          <input
            type="text"
            placeholder="Your company name"
            value={formData.buyerCompany}
            onChange={(e) => setFormData({ ...formData, buyerCompany: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <input
            type="text"
            placeholder="e.g., Mumbai, Delhi, Bangalore"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            placeholder="your.email@company.com"
            value={formData.buyerEmail}
            onChange={(e) => setFormData({ ...formData, buyerEmail: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number *
          </label>
          <input
            type="tel"
            placeholder="+91 98765 43210"
            value={formData.buyerPhone}
            onChange={(e) => setFormData({ ...formData, buyerPhone: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Additional Details
        </label>
        <textarea
          placeholder="Any specific requirements, specifications, or additional information..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      <button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
      >
        {isSubmitting ? 'Submitting...' : 'Submit RFQ'}
      </button>
      
      <p className="text-sm text-gray-600 text-center">
        By submitting this form, you agree to receive calls from verified suppliers.
      </p>
    </form>
  );
}
