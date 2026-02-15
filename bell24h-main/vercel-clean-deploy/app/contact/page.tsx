"use client";
import React from 'react';
import { Mail, Phone, MapPin, CheckCircle, Clock, MessageSquare } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-3xl font-bold">🔔</span>
            </div>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            Contact Bell24h
          </h1>
          <p className="text-xl text-blue-600 font-semibold mb-2">
            India's First AI-Powered B2B Marketplace
          </p>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get in touch with our team for business inquiries, technical support, or partnership opportunities.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Contact Methods Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Us</h3>
              <p className="text-blue-600 font-medium">digitex.studio@gmail.com</p>
              <p className="text-sm text-gray-500 mt-2">24/7 Support</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg text-center hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Phone className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Call Us</h3>
              <p className="text-green-600 font-medium">+91 [Your Number]</p>
              <p className="text-sm text-gray-500 mt-2">Mon-Fri 9AM-6PM</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg text-center hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Visit Us</h3>
              <p className="text-purple-600 font-medium">Mumbai, Maharashtra</p>
              <p className="text-sm text-gray-500 mt-2">India</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg text-center hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">GST Verified</h3>
              <p className="text-orange-600 font-medium">27AAAPP9753F2ZF</p>
              <p className="text-sm text-gray-500 mt-2">Registered Business</p>
            </div>
          </div>

          {/* Services Section */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Our Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="text-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Supplier Verification</h3>
                <p className="text-sm text-gray-600 mb-3">Comprehensive verification reports</p>
                <p className="text-lg font-bold text-blue-600">₹2,000</p>
              </div>

              <div className="text-center p-4 border border-gray-200 rounded-lg hover:border-green-300 transition-colors">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <MessageSquare className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">RFQ Writing</h3>
                <p className="text-sm text-gray-600 mb-3">Professional RFQ creation</p>
                <p className="text-lg font-bold text-green-600">₹500</p>
              </div>

              <div className="text-center p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Featured Suppliers</h3>
                <p className="text-sm text-gray-600 mb-3">Premium platform visibility</p>
                <p className="text-lg font-bold text-purple-600">₹1,000/mo</p>
              </div>
            </div>
          </div>

          {/* Business Hours & Response Times */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Business Hours</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monday - Friday</span>
                  <span className="font-medium">9:00 AM - 6:00 PM IST</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Saturday</span>
                  <span className="font-medium">10:00 AM - 4:00 PM IST</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sunday</span>
                  <span className="font-medium">Closed</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Response Times</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Email Inquiries</span>
                  <span className="font-medium text-green-600">Within 2 hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone Calls</span>
                  <span className="font-medium text-green-600">Immediate</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">LinkedIn Messages</span>
                  <span className="font-medium text-green-600">Within 1 hour</span>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center mt-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Get Started?</h3>
            <p className="text-lg text-gray-600 mb-8">Contact us today to discuss your B2B needs</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:digitex.studio@gmail.com"
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Mail className="h-5 w-5 mr-2" />
                Send Email
              </a>
              <a
                href="https://linkedin.com/in/vishal-pendharkar-28387b19/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <MessageSquare className="h-5 w-5 mr-2" />
                Connect on LinkedIn
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}