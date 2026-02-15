export default function NewHomepage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50">
      {/* Navigation - Brand Compliant */}
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                  B
                </div>
                <div>
                  <div className="font-bold text-2xl bg-gradient-to-r from-indigo-600 to-emerald-600 bg-clip-text text-transparent">
                    Bell24h
                  </div>
                  <div className="text-sm text-neutral-600 font-medium">Verified B2B Platform</div>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-8">
                <a href="/suppliers" className="text-neutral-700 hover:text-primary-600 font-medium transition-colors">Suppliers</a>
                <a href="/rfq/create" className="text-neutral-700 hover:text-primary-600 font-medium transition-colors">Post RFQ</a>
                <a href="/wallet" className="text-neutral-700 hover:text-primary-600 font-medium transition-colors">Wallet</a>
                <a href="/about" className="text-neutral-700 hover:text-primary-600 font-medium transition-colors">About</a>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <a href="/auth/login" className="text-neutral-700 hover:text-primary-600 font-medium transition-colors">Login</a>
              <button className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-700 hover:to-emerald-700 text-white rounded-lg font-semibold text-lg shadow-lg transition-all duration-300 transform hover:scale-105">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Brand Compliant */}
      <main className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-7xl md:text-8xl font-bold mb-8 leading-tight">
          <span className="bg-gradient-to-r from-indigo-600 to-emerald-600 bg-clip-text text-transparent">
            Post RFQ. Get 3 Verified Quotes in 24 Hours
          </span>
        </h1>
        
        <p className="text-2xl md:text-3xl text-neutral-700 mb-8 max-w-5xl mx-auto font-medium">
          200 live data signals—GST, credit, logistics, ESG—to match you with 3 pre-qualified suppliers. 
          <span className="text-indigo-600 font-semibold"> Escrow-secured payments</span> until goods arrive.
        </p>

        {/* Trust Layer - Brand Mandated */}
        <div className="flex justify-center gap-6 mb-12 flex-wrap">
          <span className="px-6 py-3 bg-green-100 text-green-800 rounded-full text-xl font-bold flex items-center gap-3 shadow-md">
            ✅ Escrow-Secured (ICICI Bank Partner)
          </span>
          <span className="px-6 py-3 bg-blue-100 text-blue-800 rounded-full text-xl font-bold flex items-center gap-3 shadow-md">
            ✅ GST & PAN Verified
          </span>
          <span className="px-6 py-3 bg-purple-100 text-purple-800 rounded-full text-xl font-bold flex items-center gap-3 shadow-md">
            ✅ AI Trust-Score
          </span>
        </div>

        {/* Social Proof Strip - Brand Required Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 max-w-4xl mx-auto">
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <div className="text-3xl font-bold text-indigo-600">4,321</div>
            <div className="text-neutral-600 font-medium">RFQs processed yesterday</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <div className="text-3xl font-bold text-emerald-600">98%</div>
            <div className="text-neutral-600 font-medium">Escrow success rate</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <div className="text-3xl font-bold text-purple-600">12,400</div>
            <div className="text-neutral-600 font-medium">Verified suppliers</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <div className="text-3xl font-bold text-blue-600">50+</div>
            <div className="text-neutral-600 font-medium">Product categories</div>
          </div>
        </div>

        {/* Main CTA Section - Brand Mandated */}
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-2xl mb-20">
          <h2 className="text-3xl font-bold text-neutral-900 mb-6">Start Your RFQ Journey</h2>
          <div className="flex flex-col lg:flex-row gap-4">
            <input 
              type="text" 
              placeholder="What are you looking for? (e.g., Steel Pipes, Cotton Fabric, Electronics)" 
              className="flex-1 px-6 py-4 text-xl outline-none border-2 border-neutral-300 rounded-xl focus:ring-4 focus:ring-indigo-200 focus:border-primary-500 transition-all"
            />
            <button className="bg-gradient-to-r from-indigo-600 to-emerald-600 text-white px-10 py-4 rounded-xl text-xl font-bold hover:from-indigo-700 hover:to-emerald-700 transition-all duration-300 shadow-lg transform hover:scale-105">
              🚀 Start My RFQ Now
            </button>
          </div>
          <div className="flex justify-center mt-6">
            <button className="bg-white text-indigo-600 border-2 border-indigo-600 px-10 py-4 rounded-xl text-xl font-bold hover:bg-indigo-50 transition-all duration-300 shadow-lg">
              ▶️ Watch 2-Min Demo
            </button>
          </div>
        </div>

        {/* How It Works Section - Brand Required */}
        <section className="py-16 bg-white rounded-2xl shadow-xl mb-20">
          <h2 className="text-5xl font-bold mb-16 text-neutral-900">How Bell24h Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 px-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-full flex items-center justify-center text-4xl font-bold mb-6 shadow-lg">
                1
              </div>
              <h3 className="text-3xl font-bold mb-4 text-neutral-800">Post Your RFQ</h3>
              <p className="text-xl text-neutral-600 leading-relaxed">
                Submit by voice, video, or text. Our AI understands your requirements and matches with verified suppliers.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-full flex items-center justify-center text-4xl font-bold mb-6 shadow-lg">
                2
              </div>
              <h3 className="text-3xl font-bold mb-4 text-neutral-800">Get 3 Verified Quotes</h3>
              <p className="text-xl text-neutral-600 leading-relaxed">
                Receive AI-scored, GST-verified supplier quotes within 24 hours. 200+ data points analyzed.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full flex items-center justify-center text-4xl font-bold mb-6 shadow-lg">
                3
              </div>
              <h3 className="text-3xl font-bold mb-4 text-neutral-800">Secure Escrow Payment</h3>
              <p className="text-xl text-neutral-600 leading-relaxed">
                Payment held in ICICI escrow until goods arrive. Full protection guaranteed.
              </p>
            </div>
          </div>
        </section>

        {/* Popular Categories - Brand Required */}
        <section className="py-16">
          <h2 className="text-5xl font-bold mb-16 text-neutral-900">Popular Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white p-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="text-6xl mb-6">🏗️</div>
              <h3 className="text-3xl font-bold text-indigo-700 mb-4">Steel & Metals</h3>
              <p className="text-lg text-neutral-600 mb-6 leading-relaxed">
                Find verified suppliers for TMT bars, structural steel, aluminum, and specialty metals.
              </p>
              <button className="text-indigo-600 font-bold text-lg hover:underline hover:text-indigo-800 transition-colors">
                Explore Steel →
              </button>
            </div>
            
            <div className="bg-white p-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="text-6xl mb-6">🧵</div>
              <h3 className="text-3xl font-bold text-emerald-700 mb-4">Textiles & Garments</h3>
              <p className="text-lg text-neutral-600 mb-6 leading-relaxed">
                Connect with manufacturers for cotton, silk, synthetic fabrics, and ready-made garments.
              </p>
              <button className="text-emerald-600 font-bold text-lg hover:underline hover:text-emerald-800 transition-colors">
                Explore Textiles →
              </button>
            </div>
            
            <div className="bg-white p-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="text-6xl mb-6">📱</div>
              <h3 className="text-3xl font-bold text-purple-700 mb-4">Electronics & IT</h3>
              <p className="text-lg text-neutral-600 mb-6 leading-relaxed">
                Source semiconductors, mobile components, LED displays, and IT hardware.
              </p>
              <button className="text-purple-600 font-bold text-lg hover:underline hover:text-purple-800 transition-colors">
                Explore Electronics →
              </button>
            </div>
          </div>
        </section>

        {/* AI Features Highlight */}
        <section className="py-16 bg-gradient-to-r from-indigo-100 to-emerald-100 rounded-2xl mb-20">
          <h2 className="text-5xl font-bold mb-8 text-neutral-900">AI-Powered B2B Engine</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-bold text-neutral-800 mb-2">AI Matching</h3>
              <p className="text-neutral-600">200+ data points analysis</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🎤</div>
              <h3 className="text-xl font-bold text-neutral-800 mb-2">Voice RFQ</h3>
              <p className="text-neutral-600">Speak your requirements</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-neutral-800 mb-2">Trust Scoring</h3>
              <p className="text-neutral-600">AI-generated risk assessment</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">💳</div>
              <h3 className="text-xl font-bold text-neutral-800 mb-2">Smart Escrow</h3>
              <p className="text-neutral-600">Automated payment protection</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer - Brand Compliant */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-2xl">
                  B
                </div>
                <div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">
                    Bell24h
                  </div>
                  <div className="text-gray-400">India's Fastest B2B Match-Making Engine for MSMEs</div>
                </div>
              </div>
              <p className="text-gray-300 text-lg mb-4">
                Trusted by 12,400+ verified suppliers across India. Escrow-secured transactions worth ₹100+ crores processed.
              </p>
              <div className="flex items-center gap-2 text-yellow-400">
                <span className="text-2xl">🇮🇳</span>
                <span className="font-semibold">Made in India</span>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-xl mb-4 text-white">Quick Links</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="/suppliers" className="hover:text-white transition-colors">Find Suppliers</a></li>
                <li><a href="/rfq/create" className="hover:text-white transition-colors">Post RFQ</a></li>
                <li><a href="/wallet" className="hover:text-white transition-colors">Wallet</a></li>
                <li><a href="/escrow" className="hover:text-white transition-colors">Escrow</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-xl mb-4 text-white">Support</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="/help" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="/contact" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="/terms" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="/privacy" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 pt-8 text-center">
            <p className="text-gray-400">© 2024 Bell24h.com. All rights reserved. | Escrow Partner: ICICI Bank | GST: 123456789</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
