import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Features - Bell24h',
  description: 'AI-powered B2B marketplace features'
};

export default function AIFeaturesPage() {
  return (
    <div className="page-container">
      <div className="page-content">
        {/* Header Section */}
        <div className="page-header">
          <h1 className="page-title">AI-Powered Features</h1>
          <p className="page-subtitle">
            Leverage artificial intelligence to optimize your B2B operations and make data-driven decisions
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button className="btn-primary">
            Check Quality →
          </button>
          <button className="btn-outline">
            Generate Report
          </button>
          <button className="btn-ghost">
            Export Data
          </button>
        </div>

        {/* Main Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="feature-card">
            <div className="feature-icon">
              🤖
            </div>
            <h3 className="feature-title">Smart Matching</h3>
            <p className="feature-description">
              AI-powered supplier matching based on your requirements, quality standards, and preferences
            </p>
            <button className="btn-outline w-full">
              Try Smart Matching →
            </button>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              📊
            </div>
            <h3 className="feature-title">Market Analytics</h3>
            <p className="feature-description">
              Get insights on market trends, pricing, and demand patterns for your industry
            </p>
            <button className="btn-outline w-full">
              View Analytics →
            </button>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              💬
            </div>
            <h3 className="feature-title">AI Chat Assistant</h3>
            <p className="feature-description">
              Get instant help with finding suppliers, creating RFQs, and marketplace navigation
            </p>
            <button className="btn-outline w-full">
              Start Chat →
            </button>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              🎯
            </div>
            <h3 className="feature-title">Price Prediction</h3>
            <p className="feature-description">
              AI predicts optimal pricing for your products based on market conditions
            </p>
            <button className="btn-outline w-full">
              Get Price Insights →
            </button>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              🔍
            </div>
            <h3 className="feature-title">Quality Assessment</h3>
            <p className="feature-description">
              AI analyzes supplier profiles and reviews to assess quality and reliability
            </p>
            <button className="btn-outline w-full">
              Check Quality →
            </button>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              📈
            </div>
            <h3 className="feature-title">Demand Forecasting</h3>
            <p className="feature-description">
              Predict future demand for your products using AI and historical data
            </p>
            <button className="btn-outline w-full">
              View Forecast →
            </button>
          </div>
        </div>

        {/* AI Features Dashboard */}
        <div className="card">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">AI Features Dashboard</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Recent AI Insights</h3>
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4 py-3">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-neutral-900">Market Trend</span>
                    <span className="badge-success">positive</span>
                  </div>
                  <p className="text-neutral-600 text-sm">Textile demand increased by 15% this month</p>
                </div>
                <div className="border-l-4 border-yellow-500 pl-4 py-3">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-neutral-900">Price Alert</span>
                    <span className="badge-warning">warning</span>
                  </div>
                  <p className="text-neutral-600 text-sm">Steel prices expected to rise 8% next quarter</p>
                </div>
                <div className="border-l-4 border-purple-500 pl-4 py-3">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-neutral-900">Opportunity</span>
                    <span className="badge-info">info</span>
                  </div>
                  <p className="text-neutral-600 text-sm">3 new suppliers match your criteria</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">AI Recommendations</h3>
              <div className="space-y-4">
                <div className="border-l-4 border-red-500 pl-4 py-3">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-neutral-900">Suggested Action</span>
                    <span className="badge-error">high</span>
                  </div>
                  <p className="text-neutral-600 text-sm">Update your RFQ for better response rates</p>
                </div>
                <div className="border-l-4 border-yellow-500 pl-4 py-3">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-neutral-900">New Feature</span>
                    <span className="badge-warning">medium</span>
                  </div>
                  <p className="text-neutral-600 text-sm">Try voice RFQ for faster communication</p>
                </div>
                <div className="border-l-4 border-blue-500 pl-4 py-3">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-neutral-900">Optimization</span>
                    <span className="badge-info">low</span>
                  </div>
                  <p className="text-neutral-600 text-sm">Consider expanding to 2 new categories</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
