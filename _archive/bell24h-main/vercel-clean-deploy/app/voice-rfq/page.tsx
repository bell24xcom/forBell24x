import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Voice RFQ - Bell24h',
  description: 'Create RFQs using voice commands and AI'
};

export default function VoiceRFQPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Voice RFQ
        </h1>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white p-8 rounded-lg shadow-md mb-8">
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">🎤</span>
              </div>
              <h2 className="text-2xl font-semibold mb-2">Create RFQ with Voice</h2>
              <p className="text-gray-600">
                Simply speak your requirements and our AI will create a detailed RFQ for you
              </p>
            </div>

            <div className="text-center mb-8">
              <button className="bg-red-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-red-700 transition-colors flex items-center mx-auto">
                <span className="mr-2">🎤</span>
                Start Recording
              </button>
              <p className="text-sm text-gray-600 mt-2">
                Click and hold to record, release to stop
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="font-semibold mb-4">Voice Commands Examples:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <strong>"I need 1000 cotton t-shirts"</strong>
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>"Looking for steel pipes for construction"</strong>
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>"Need pharmaceutical packaging materials"</strong>
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <strong>"Require automotive parts delivery in 2 weeks"</strong>
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>"Want to buy agricultural equipment"</strong>
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>"Need IT services for my company"</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">How It Works</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-1">
                    <span className="text-blue-600 font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Speak Your Requirements</h4>
                    <p className="text-sm text-gray-600">Describe what you need in natural language</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-1">
                    <span className="text-blue-600 font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium">AI Processing</h4>
                    <p className="text-sm text-gray-600">Our AI extracts key details and creates structured RFQ</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-1">
                    <span className="text-blue-600 font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Review & Edit</h4>
                    <p className="text-sm text-gray-600">Review the generated RFQ and make adjustments</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-1">
                    <span className="text-blue-600 font-bold text-sm">4</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Submit RFQ</h4>
                    <p className="text-sm text-gray-600">Send to relevant suppliers automatically</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Features</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  <span className="text-sm">Multi-language support (Hindi, English)</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  <span className="text-sm">Automatic category detection</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  <span className="text-sm">Quantity and specification extraction</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  <span className="text-sm">Timeline and budget estimation</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  <span className="text-sm">Smart supplier matching</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  <span className="text-sm">Voice-to-text accuracy 95%+</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Recent Voice RFQs</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium">Cotton T-shirts for retail</p>
                  <p className="text-sm text-gray-600">Created 2 hours ago via voice</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
                  <button className="text-blue-600 hover:text-blue-800 text-sm">View</button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium">Steel pipes for construction</p>
                  <p className="text-sm text-gray-600">Created yesterday via voice</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Quoted</span>
                  <button className="text-blue-600 hover:text-blue-800 text-sm">View</button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium">Pharmaceutical packaging</p>
                  <p className="text-sm text-gray-600">Created 3 days ago via voice</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">Completed</span>
                  <button className="text-blue-600 hover:text-blue-800 text-sm">View</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
