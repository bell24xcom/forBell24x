'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function ReportIssuePage() {
  const [formData, setFormData] = useState({
    description: '',
    email: '',
    category: 'Bug'
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // In a real app, this would submit to a backend API
    setSubmitted(true);
    setTimeout(() => {
      setFormData({ description: '', email: '', category: 'Bug' });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      <div className="max-w-2xl mx-auto px-4 py-16 sm:py-24">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl sm:text-6xl font-bold mb-6">
            🐛 Report an Issue
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed">
            Help us improve by reporting bugs, payment issues, or supplier problems.
            We appreciate your feedback!
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 sm:p-12 mb-8">
          {submitted ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">✅</div>
              <h2 className="text-2xl font-semibold text-white mb-2">Thank You!</h2>
              <p className="text-slate-300 mb-4">
                Your issue report has been received. Our support team will review it shortly.
              </p>
              <p className="text-slate-400">You'll receive updates at the email provided.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-semibold text-white mb-2">
                  Issue Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-700 text-white border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="Bug">Bug</option>
                  <option value="Payment">Payment Issue</option>
                  <option value="Supplier">Supplier Problem</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-white mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="your@email.com"
                  className="w-full bg-slate-700 text-white border border-slate-600 rounded-lg px-4 py-3 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-white mb-2">
                  Issue Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  placeholder="Please describe the issue you experienced..."
                  rows={6}
                  className="w-full bg-slate-700 text-white border border-slate-600 rounded-lg px-4 py-3 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                />
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
                >
                  Submit Report
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Contact Info */}
        <div className="text-center text-slate-300 mb-8">
          <p className="mb-2">Urgent issue? Contact support directly:</p>
          <a href="mailto:bell24h.helpline@gmail.com" className="text-blue-400 hover:text-blue-300 font-semibold">
            bell24h.helpline@gmail.com
          </a>
        </div>

        {/* Back Link */}
        <div className="text-center">
          <Link href="/" className="text-slate-400 hover:text-slate-200 font-medium">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
