import { CheckCircle, Shield, Zap, Users, TrendingUp, ArrowRight, Play } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-emerald-600 bg-clip-text text-transparent">
                Bell24h
              </div>
              <span className="ml-3 text-sm text-gray-600 font-medium">Verified B2B Platform</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/categories" className="text-gray-700 hover:text-indigo-600">Categories</Link>
              <Link href="/suppliers" className="text-gray-700 hover:text-indigo-600">Suppliers</Link>
              <Link href="/rfq" className="text-gray-700 hover:text-indigo-600">RFQ</Link>
              <Link href="/about" className="text-gray-700 hover:text-indigo-600">About</Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/login" className="text-gray-700 hover:text-indigo-600">Login</Link>
              <Link href="/auth/register" className="bg-gradient-to-r from-indigo-600 to-emerald-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-indigo-600 to-emerald-600 bg-clip-text text-transparent">
              Post RFQ. Get 3 Verified Quotes in 24 Hours
            </span>
          </h1>
          <p className="text-2xl text-gray-700 mb-8 max-w-4xl mx-auto">
            200 live data signals—GST, credit, logistics, ESG—to match you with pre-qualified suppliers
          </p>
          
          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-6 mb-12">
            <div className="flex items-center bg-green-50 rounded-full px-4 py-2">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-green-800 font-medium">Escrow-Secured</span>
            </div>
            <div className="flex items-center bg-blue-50 rounded-full px-4 py-2">
              <Shield className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-blue-800 font-medium">GST Verified</span>
            </div>
            <div className="flex items-center bg-purple-50 rounded-full px-4 py-2">
              <Zap className="w-5 h-5 text-purple-600 mr-2" />
              <span className="text-purple-800 font-medium">AI Trust-Score</span>
            </div>
          </div>

          {/* Social Proof Strip */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-12 max-w-5xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">4,321</div>
                <div className="text-sm text-gray-600">RFQs processed yesterday</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">98%</div>
                <div className="text-sm text-gray-600">escrow success rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">12,400</div>
                <div className="text-sm text-gray-600">verified suppliers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">50+</div>
                <div className="text-sm text-gray-600">product categories</div>
              </div>
            </div>
          </div>

          {/* Main CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/rfq/new" className="bg-gradient-to-r from-indigo-600 to-emerald-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:shadow-xl transition-all flex items-center justify-center">
              <Zap className="w-5 h-5 mr-2" />
              Start My RFQ Now
            </Link>
            <button className="border-2 border-indigo-600 text-indigo-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-50 transition-all flex items-center justify-center">
              <Play className="w-5 h-5 mr-2" />
              Watch 2-Min Demo
            </button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Get verified quotes in 3 simple steps</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-gradient-to-r from-indigo-600 to-emerald-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Post Your RFQ</h3>
              <p className="text-gray-600">Describe your requirements using voice, video, or text. Our AI understands your needs.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-gradient-to-r from-indigo-600 to-emerald-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">AI Matching</h3>
              <p className="text-gray-600">We analyze 200+ data points to match you with pre-qualified, verified suppliers.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-gradient-to-r from-indigo-600 to-emerald-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Get Quotes</h3>
              <p className="text-gray-600">Receive 3 verified quotes within 24 hours with escrow protection.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-20 bg-gradient-to-br from-indigo-50 to-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Popular Categories</h2>
            <p className="text-xl text-gray-600">Find suppliers across major industries</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[
              { name: 'Steel & Metals', suppliers: '8,247', icon: '🔩' },
              { name: 'Textiles', suppliers: '12,439', icon: '🧵' },
              { name: 'Electronics', suppliers: '15,629', icon: '📱' },
              { name: 'Chemicals', suppliers: '6,845', icon: '🧪' },
              { name: 'Machinery', suppliers: '9,927', icon: '⚙️' },
              { name: 'Agriculture', suppliers: '11,247', icon: '🌾' },
              { name: 'Construction', suppliers: '7,197', icon: '🏗️' },
              { name: 'Healthcare', suppliers: '5,843', icon: '🏥' }
            ].map((category, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer">
                <div className="text-3xl mb-3">{category.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.name}</h3>
                <p className="text-gray-600">{category.suppliers} verified suppliers</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent mb-4">
                Bell24h
              </div>
              <p className="text-gray-400">India's Fastest B2B Match-Making Engine for MSMEs</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/categories" className="hover:text-white">Categories</Link></li>
                <li><Link href="/suppliers" className="hover:text-white">Suppliers</Link></li>
                <li><Link href="/rfq" className="hover:text-white">RFQ</Link></li>
                <li><Link href="/dashboard" className="hover:text-white">Dashboard</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-white">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Trust & Security</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                  Escrow Protection
                </li>
                <li className="flex items-center">
                  <Shield className="w-4 h-4 text-blue-400 mr-2" />
                  GST Verified
                </li>
                <li className="flex items-center">
                  <Zap className="w-4 h-4 text-purple-400 mr-2" />
                  AI Trust-Score
                </li>
                <li className="flex items-center">
                  🇮🇳 <span className="ml-2">Made in India</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Bell24h (www.bell24h.com). All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}