<<<<<<< HEAD
import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Building2, 
  Target, 
  Users, 
  Globe, 
  Shield, 
  Award,
  TrendingUp,
  Heart
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us - Bell24h | India\'s Fastest B2B Match-Making Engine',
  description: 'Learn about Bell24h - India\'s leading B2B marketplace connecting MSMEs with verified suppliers using AI matching, escrow payments, and intelligent analytics.',
  keywords: 'about bell24h, B2B marketplace, MSME, suppliers, India, AI matching',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-blue-600 to-emerald-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-6">
            About Bell24h
          </h1>
          <p className="text-xl text-indigo-100 max-w-3xl mx-auto">
            India's Fastest B2B Match-Making Engine for MSMEs. 
            Connecting verified suppliers with buyers using AI-powered matching and secure escrow payments.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <Card className="border-0 shadow-lg">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                  <Target className="h-8 w-8 text-indigo-600" />
                </div>
                <CardTitle className="text-2xl text-indigo-600">Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-lg leading-relaxed">
                  To democratize B2B commerce in India by providing MSMEs with instant access to verified suppliers, 
                  secure payment systems, and AI-powered matching that reduces procurement cycles by 97%.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                  <Globe className="h-8 w-8 text-emerald-600" />
                </div>
                <CardTitle className="text-2xl text-emerald-600">Our Vision</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-lg leading-relaxed">
                  To become India's most trusted B2B operating system, empowering 1 million+ MSMEs 
                  with intelligent procurement solutions and creating ₹100 Crore in economic value by 2026.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Company Stats */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Our Impact in Numbers
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-600 mb-2">534,281</div>
              <div className="text-gray-600">Verified Suppliers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-600 mb-2">12,500+</div>
              <div className="text-gray-600">RFQs Processed Daily</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">97%</div>
              <div className="text-gray-600">Procurement Cycle Reduction</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-600 mb-2">₹1.51Cr</div>
              <div className="text-gray-600">Annual Revenue Projection</div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Our Core Values
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl text-blue-600">Trust First</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-center">
                  Every supplier is verified through our 15-point verification system. 
                  Escrow-secured payments ensure complete transaction safety.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-xl text-green-600">Innovation Driven</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-center">
                  AI-powered matching, voice/video RFQ processing, and intelligent analytics 
                  revolutionize traditional B2B procurement.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-xl text-purple-600">MSME Focused</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-center">
                  Built specifically for Indian MSMEs with localized features, 
                  multi-language support, and URD compliance.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Built by Entrepreneurs, for Entrepreneurs
          </h2>
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-lg text-gray-700 mb-8">
              Bell24h was founded by a team of experienced entrepreneurs who understand the challenges 
              faced by MSMEs in India. Our platform is designed to solve real problems with practical solutions.
            </p>
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-8 text-center">
                  <div className="mx-auto w-20 h-20 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full flex items-center justify-center mb-4">
                    <Building2 className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Enterprise Experience</h3>
                  <p className="text-gray-600">
                    Our team has built and scaled multiple B2B platforms, 
                    bringing deep industry expertise to Bell24h.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg">
                <CardContent className="p-8 text-center">
                  <div className="mx-auto w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
                    <Award className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Award-Winning Technology</h3>
                  <p className="text-gray-600">
                    Recognized for innovation in B2B commerce and AI-powered matching systems 
                    by leading industry bodies.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-emerald-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Transform Your B2B Procurement?
          </h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Join thousands of MSMEs who have already discovered the power of intelligent B2B matching.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/auth/landing" 
              className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Get Started Free
            </a>
            <a 
              href="/contact" 
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-indigo-600 transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
=======
import React from 'react';

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-white">
      <h1 className="text-5xl font-black mb-8 text-cyan-400">About BELL</h1>
      <p className="mb-4 text-xl font-semibold">
        BELL is India's first AI-powered B2B procurement platform. Our mission: connect Indian businesses with verified suppliers using voice, video, and AI in 12+ languages.
      </p>
      <ul className="my-6 space-y-2">
        <li>🔔 Over 10,000+ verified suppliers & buyers</li>
        <li>🌎 Pan-India coverage; local + export businesses</li>
        <li>📈 AI-matching, voice/video/text RFQs, 24H quoting</li>
        <li>🇮🇳 Made in India, for India</li>
      </ul>
      <div className="mt-8 bg-gray-900/50 p-4 rounded-lg">
        <p className="font-mono">Contact: <a href="mailto:support@bell24h.com" className="text-cyan-400 underline">support@bell24h.com</a></p>
      </div>
>>>>>>> b7b4b9c6cd126094e89116e18b3dbb247f1e8e4d
    </div>
  );
}
