export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
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
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Connect with verified Indian suppliers and buyers using advanced AI matching, 
            secure escrow payments, and intelligent analytics for seamless B2B transactions.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
        </div>
      </main>
    </div>
  );
}