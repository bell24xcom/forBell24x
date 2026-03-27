import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Features - Bell24h',
  description: 'AI-powered B2B marketplace features'
};

export default function AIFeaturesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          AI-Powered Features
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-2xl">🤖</span>
              </div>
              <h2 className="text-xl font-semibold">Smart Matching</h2>
            </div>
            <p className="text-gray-600 mb-4">
              AI-powered supplier matching based on your requirements, quality standards, and preferences
            </p>
            <button className="text-blue-600 hover:text-blue-800 font-medium">
              Try Smart Matching →
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-2xl">📊</span>
              </div>
              <h2 className="text-xl font-semibold">Market Analytics</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Get insights on market trends, pricing, and demand patterns for your industry
            </p>
            <button className="text-blue-600 hover:text-blue-800 font-medium">
              View Analytics →
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-2xl">💬</span>
              </div>
              <h2 className="text-xl font-semibold">AI Chat Assistant</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Get instant help with finding suppliers, creating RFQs, and marketplace navigation
            </p>
            <button className="text-blue-600 hover:text-blue-800 font-medium">
              Start Chat →
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h2 className="text-xl font-semibold">Price Prediction</h2>
            </div>
            <p className="text-gray-600 mb-4">
              AI predicts optimal pricing for your products based on market conditions
            </p>
            <button className="text-blue-600 hover:text-blue-800 font-medium">
              Get Price Insights →
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-2xl">🔍</span>
              </div>
              <h2 className="text-xl font-semibold">Quality Assessment</h2>
            </div>
            <p className="text-gray-600 mb-4">
              AI analyzes supplier profiles and reviews to assess quality and reliability
            </p>
            <button className="text-blue-600 hover:text-blue-800 font-medium">
              Check Quality →
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-2xl">📈</span>
              </div>
              <h2 className="text-xl font-semibold">Demand Forecasting</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Predict future demand for your products using AI and historical data
            </p>
            <button className="text-blue-600 hover:text-blue-800 font-medium">
              View Forecast →
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">AI Features Dashboard</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Recent AI Insights</h3>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Market Trend:</strong> Textile demand increased by 15% this month
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Price Alert:</strong> Steel prices expected to rise 8% next quarter
                  </p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Opportunity:</strong> 3 new suppliers match your criteria
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">AI Recommendations</h3>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-800">
                    <strong>Suggested Action:</strong> Update your RFQ for better response rates
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-800">
                    <strong>New Feature:</strong> Try voice RFQ for faster communication
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-800">
                    <strong>Optimization:</strong> Consider expanding to 2 new categories
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
