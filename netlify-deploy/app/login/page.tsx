"use client";
import { CheckCircle, Mail, MapPin, Phone } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-2xl font-bold">🔔</span>
          </div>
        </div>
        <h1 className="mt-6 text-center text-4xl font-extrabold text-gray-900">
          BELL24H
        </h1>
        <p className="mt-2 text-center text-xl text-blue-600 font-semibold">
          India's First AI-Powered B2B Marketplace
        </p>
        <p className="mt-4 text-center text-lg text-gray-600">
          Welcome Back! Contact us for access to your AI-powered dashboard
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-6 shadow-lg sm:rounded-lg">

          {/* Contact Information */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Get In Touch</h2>
            <p className="text-gray-600 mb-6">
              We're currently accepting service orders and business inquiries.
              Contact us directly for immediate assistance.
            </p>
          </div>

          {/* Contact Methods */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="flex items-center p-4 bg-blue-50 rounded-lg">
              <Mail className="h-6 w-6 text-blue-600 mr-3" />
              <div>
                <h3 className="font-semibold text-gray-900">Email</h3>
                <p className="text-blue-600">digitex.studio@gmail.com</p>
              </div>
            </div>

            <div className="flex items-center p-4 bg-green-50 rounded-lg">
              <Phone className="h-6 w-6 text-green-600 mr-3" />
              <div>
                <h3 className="font-semibold text-gray-900">Phone</h3>
                <p className="text-green-600">+91 [Your Number]</p>
              </div>
            </div>

            <div className="flex items-center p-4 bg-purple-50 rounded-lg">
              <MapPin className="h-6 w-6 text-purple-600 mr-3" />
              <div>
                <h3 className="font-semibold text-gray-900">Location</h3>
                <p className="text-purple-600">Mumbai, Maharashtra</p>
              </div>
            </div>

            <div className="flex items-center p-4 bg-orange-50 rounded-lg">
              <CheckCircle className="h-6 w-6 text-orange-600 mr-3" />
              <div>
                <h3 className="font-semibold text-gray-900">GST Number</h3>
                <p className="text-orange-600">27AAAPP9753F2ZF</p>
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="bg-yellow-50 p-6 rounded-lg mb-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-4">Our Services</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span className="text-yellow-700">Supplier Verification Reports (₹2,000)</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span className="text-yellow-700">GST/PAN Authentication</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span className="text-yellow-700">Business History Check</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span className="text-yellow-700">Risk Assessment Score</span>
              </div>
            </div>
          </div>

          {/* LinkedIn Outreach */}
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">LinkedIn Outreach</h3>
            <p className="text-blue-700 mb-4">
              Connect with us on LinkedIn for business inquiries and supplier verification services.
            </p>
            <div className="bg-white p-4 rounded border-l-4 border-blue-500">
              <p className="text-sm text-gray-700 italic">
                "Hi [Name], I run Digitex Studio (GST: 27AAAPP9753F2ZF).
                We help businesses verify suppliers before large orders.
                Our verification report includes GST/PAN authentication, business history check,
                and risk assessment score for ₹2,000 per report.
                Many businesses lose lakhs to fake suppliers. Our report helps avoid that.
                Interested? Let's connect."
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:digitex.studio@gmail.com"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Mail className="h-5 w-5 mr-2" />
              Send Email
            </a>
            <a
              href="https://linkedin.com/in/vishal-pendharkar-28387b19/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Connect on LinkedIn
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}