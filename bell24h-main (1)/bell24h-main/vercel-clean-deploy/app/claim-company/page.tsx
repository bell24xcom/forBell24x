"use client";
import React, { useState } from 'react';
import { CheckCircle, Building, Mail, Phone, MapPin, Shield, Globe, Zap, ArrowRight, Star } from 'lucide-react';

export default function ClaimCompanyPage() {
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    industry: '',
    gstNumber: '',
    address: '',
    website: '',
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Company claim form submitted:', formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A1B] to-[#1A1A2E] text-white">
      {/* Header */}
      <header className='sticky top-0 z-50 bg-gray-900/80 backdrop-blur px-6 py-4 flex justify-between items-center'>
        <div className='flex items-center space-x-2'>
          <div className='w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center'>
            <span className='text-white text-lg font-bold'>🔔</span>
          </div>
          <h1 className='text-2xl font-bold'>Bell<span className='text-amber-400'>24h</span></h1>
        </div>
        <nav className='hidden md:flex items-center space-x-4'>
          <a href='/' className='text-white hover:text-amber-400 transition-colors'>Home</a>
          <a href='/pricing' className='bg-amber-500 text-black px-4 py-1 rounded'>Pricing</a>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-amber-400">Claim Your Company Free</span><br />
            on Bell24h
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Join thousands of verified suppliers already using Bell24h to connect with global buyers. 
            Get your company profile verified and start receiving qualified leads today.
          </p>
          
          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 border border-green-500/30">
              <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <div className="text-sm font-semibold text-green-400">Free Verification</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 border border-blue-500/30">
              <Shield className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <div className="text-sm font-semibold text-blue-400">Trust Badge</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 border border-purple-500/30">
              <Globe className="h-8 w-8 text-purple-400 mx-auto mb-2" />
              <div className="text-sm font-semibold text-purple-400">Global Reach</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 border border-amber-500/30">
              <Zap className="h-8 w-8 text-amber-400 mx-auto mb-2" />
              <div className="text-sm font-semibold text-amber-400">AI Matching</div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form Section */}
            <div className="bg-white/10 backdrop-blur rounded-2xl p-8 border border-blue-500/30">
              <h2 className="text-2xl font-bold mb-6 text-center">Company Information</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white/20 border border-gray-300/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter company name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Contact Person *
                    </label>
                    <input
                      type="text"
                      name="contactName"
                      value={formData.contactName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white/20 border border-gray-300/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Your full name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white/20 border border-gray-300/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="company@email.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white/20 border border-gray-300/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Industry Category *
                  </label>
                  <select
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/20 border border-gray-300/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="" className="bg-gray-800 text-white">Select Industry</option>
                    <option value="manufacturing" className="bg-gray-800 text-white">Manufacturing</option>
                    <option value="textiles" className="bg-gray-800 text-white">Textiles & Apparel</option>
                    <option value="electronics" className="bg-gray-800 text-white">Electronics</option>
                    <option value="automotive" className="bg-gray-800 text-white">Automotive</option>
                    <option value="pharmaceuticals" className="bg-gray-800 text-white">Pharmaceuticals</option>
                    <option value="food" className="bg-gray-800 text-white">Food & Beverages</option>
                    <option value="construction" className="bg-gray-800 text-white">Construction</option>
                    <option value="other" className="bg-gray-800 text-white">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    GST Number *
                  </label>
                  <input
                    type="text"
                    name="gstNumber"
                    value={formData.gstNumber}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/20 border border-gray-300/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="27AAAPP9753F2ZF"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Business Address *
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    rows={3}
                    className="w-full px-4 py-3 bg-white/20 border border-gray-300/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter complete business address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Company Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 bg-white/20 border border-gray-300/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe your products/services, capabilities, and what makes your company unique"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                >
                  <Star className="h-5 w-5 mr-2" />
                  Claim My Company Free
                  <ArrowRight className="h-5 w-5 ml-2" />
                </button>
              </form>
            </div>

            {/* Benefits Section */}
            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-green-500/30">
                <h3 className="text-xl font-bold mb-4 text-green-400">What You Get Free</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-400 mr-3 mt-0.5" />
                    <span className="text-gray-300">Complete company profile verification</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-400 mr-3 mt-0.5" />
                    <span className="text-gray-300">Trust badge on your profile</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-400 mr-3 mt-0.5" />
                    <span className="text-gray-300">AI-powered buyer matching</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-400 mr-3 mt-0.5" />
                    <span className="text-gray-300">Access to verified RFQ leads</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-400 mr-3 mt-0.5" />
                    <span className="text-gray-300">Export opportunity alerts</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-blue-500/30">
                <h3 className="text-xl font-bold mb-4 text-blue-400">Why Choose Bell24h?</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Shield className="h-6 w-6 text-blue-400 mr-3" />
                    <div>
                      <div className="font-semibold text-white">Verified Network</div>
                      <div className="text-sm text-gray-400">Every supplier is thoroughly verified</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Globe className="h-6 w-6 text-purple-400 mr-3" />
                    <div>
                      <div className="font-semibold text-white">Global Reach</div>
                      <div className="text-sm text-gray-400">Connect with international buyers</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Zap className="h-6 w-6 text-amber-400 mr-3" />
                    <div>
                      <div className="font-semibold text-white">AI-Powered</div>
                      <div className="text-sm text-gray-400">Smart matching and risk assessment</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-amber-500/30">
                <h3 className="text-xl font-bold mb-4 text-amber-400">Success Stories</h3>
                <div className="space-y-3">
                  <div className="text-sm text-gray-300">
                    "Bell24h helped us connect with 5 verified buyers in just 2 weeks. The verification process gave us instant credibility."
                  </div>
                  <div className="text-sm text-gray-400">- Rajesh Kumar, ABC Manufacturing</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
