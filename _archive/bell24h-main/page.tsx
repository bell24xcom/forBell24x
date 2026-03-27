// Updated homepage with complete features - Direct implementation v2.0
export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header with Navigation */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white text-xl font-bold">🔔</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Bell24h</h1>
                <p className="text-sm text-gray-600">Enterprise B2B</p>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="hidden lg:flex items-center space-x-6">
              <a href="/" className="text-gray-700 hover:text-blue-600 font-medium">Home</a>
              <a href="/supplier/SUP001" className="text-gray-700 hover:text-blue-600 font-medium">Supplier Showcase</a>
              <a href="/fintech" className="text-gray-700 hover:text-blue-600 font-medium">Fintech Services</a>
              <a href="/wallet" className="text-gray-700 hover:text-blue-600 font-medium">Wallet & Escrow</a>

              {/* AI Features Dropdown */}
              <div className="relative group">
                <button className="text-gray-700 hover:text-blue-600 font-medium flex items-center">
                  AI Features
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-2">
                    <a href="/dashboard/ai-features" className="block px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700">AI Features Dashboard</a>
                    <a href="/dashboard/voice-rfq" className="block px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700">Voice RFQ</a>
                    <a href="/dashboard/ai-features?tab=explain" className="block px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700">AI Explainability</a>
                    <a href="/dashboard/ai-features?tab=risk" className="block px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700">Risk Scoring</a>
                    <a href="/dashboard/ai-features?tab=market" className="block px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700">Market Data</a>
                    <a href="/dashboard/video-rfq" className="block px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700">Video RFQ</a>
                  </div>
                </div>
              </div>
            </div>

            <a href="/login" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Login
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            India's Leading
            <span className="text-blue-600 block">AI-Powered B2B Market</span>
          </h1>

          {/* Cache busting element - should show blue theme */}
          <div className="text-sm text-blue-600 mb-4">✅ Updated Homepage v2.0 - Blue Theme Active</div>

          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Connect with verified Indian suppliers and buyers using advanced AI matching,
            secure escrow payments, and intelligent analytics for seamless B2B transactions.
          </p>

          {/* Feature Badges */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
              🇮🇳 Made in India
            </span>
            <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
              📋 GST Compliant
            </span>
            <span className="bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-medium">
              🏢 MSME Friendly
            </span>
            <span className="bg-cyan-100 text-cyan-800 px-4 py-2 rounded-full text-sm font-medium">
              💳 UPI Payments
            </span>
            <span className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium">
              🇮🇳 Hindi Support
            </span>
          </div>

          {/* Location */}
          <div className="flex items-center justify-center mb-8 text-gray-600">
            <span className="text-red-500 mr-2">📍</span>
            <span>Based in Mumbai, Maharashtra - Serving All India</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <a href="/login" className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors">
              Join as Supplier
            </a>
            <a href="/login" className="bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-green-700 transition-colors">
              Create RFQ
            </a>
            <a href="/login" className="bg-gray-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-gray-700 transition-colors">
              Browse Marketplace
            </a>
          </div>

          {/* AI Search Interface */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">AI-Powered Enterprise Search</h3>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="What are you looking for? (e.g., 'steel pipes', 'text')"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="md:w-48">
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option>All Categories</option>
                    <option>Steel & Metals</option>
                    <option>Textiles</option>
                    <option>Electronics</option>
                    <option>Machinery</option>
                    <option>Chemicals</option>
                  </select>
                </div>
                <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center">
                  <span className="mr-2">🤖</span>
                  AI Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}