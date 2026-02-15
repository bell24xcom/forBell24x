import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Help Center - Bell24h',
  description: 'Get help and support for Bell24h B2B marketplace'
};

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Help Center
        </h1>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2">
              <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-xl font-semibold mb-4">Search Help</h2>
                <div className="flex gap-4">
                  <input
                    type="text"
                    placeholder="Search for help articles, guides, or FAQs"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Search
                  </button>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Popular Help Topics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <a href="#" className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <h3 className="font-medium">Getting Started</h3>
                      <p className="text-sm text-gray-600">Learn how to set up your account and start using Bell24h</p>
                    </a>

                    <a href="#" className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <h3 className="font-medium">Creating RFQs</h3>
                      <p className="text-sm text-gray-600">Step-by-step guide to creating effective RFQs</p>
                    </a>

                    <a href="#" className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <h3 className="font-medium">Payment Methods</h3>
                      <p className="text-sm text-gray-600">Understanding payment options and processing</p>
                    </a>

                    <a href="#" className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <h3 className="font-medium">Supplier Verification</h3>
                      <p className="text-sm text-gray-600">How we verify suppliers and ensure quality</p>
                    </a>
                  </div>

                  <div className="space-y-3">
                    <a href="#" className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <h3 className="font-medium">Account Settings</h3>
                      <p className="text-sm text-gray-600">Manage your profile and account preferences</p>
                    </a>

                    <a href="#" className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <h3 className="font-medium">Troubleshooting</h3>
                      <p className="text-sm text-gray-600">Common issues and their solutions</p>
                    </a>

                    <a href="#" className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <h3 className="font-medium">Security & Privacy</h3>
                      <p className="text-sm text-gray-600">How we protect your data and transactions</p>
                    </a>

                    <a href="#" className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <h3 className="font-medium">Mobile App</h3>
                      <p className="text-sm text-gray-600">Using Bell24h on mobile devices</p>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Quick Support</h3>
                <div className="space-y-3">
                  <button className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Live Chat
                  </button>
                  <button className="w-full p-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    Schedule Call
                  </button>
                  <button className="w-full p-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    Email Support
                  </button>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="font-medium">Phone Support</p>
                    <p className="text-sm text-gray-600">+91 11 1234 5678</p>
                    <p className="text-xs text-gray-500">Mon-Fri 9AM-6PM</p>
                  </div>

                  <div>
                    <p className="font-medium">Email Support</p>
                    <p className="text-sm text-gray-600">support@bell24h.com</p>
                    <p className="text-xs text-gray-500">24/7 response</p>
                  </div>

                  <div>
                    <p className="font-medium">Emergency</p>
                    <p className="text-sm text-gray-600">+91 98765 43210</p>
                    <p className="text-xs text-gray-500">Critical issues only</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Video Tutorials</h3>
                <div className="space-y-3">
                  <a href="#" className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center mr-3">
                        <span className="text-red-600">▶</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">Getting Started</p>
                        <p className="text-xs text-gray-600">5 min video</p>
                      </div>
                    </div>
                  </a>

                  <a href="#" className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center mr-3">
                        <span className="text-red-600">▶</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">Creating RFQs</p>
                        <p className="text-xs text-gray-600">8 min video</p>
                      </div>
                    </div>
                  </a>

                  <a href="#" className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center mr-3">
                        <span className="text-red-600">▶</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">Payment Process</p>
                        <p className="text-xs text-gray-600">6 min video</p>
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">How do I create my first RFQ?</h3>
                <p className="text-gray-600">
                  To create an RFQ, go to the "Create RFQ" page, select your product category,
                  describe your requirements, specify quantity and timeline, then submit.
                  Our AI will help match you with relevant suppliers.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">What payment methods are accepted?</h3>
                <p className="text-gray-600">
                  We accept UPI, NEFT, RTGS, credit/debit cards, and digital wallets.
                  We also offer escrow services for secure transactions between buyers and suppliers.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">How do I verify a supplier?</h3>
                <p className="text-gray-600">
                  All suppliers on our platform are verified through document checks, business registration verification,
                  and customer reviews. Look for the verification badge on supplier profiles.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Is there a mobile app available?</h3>
                <p className="text-gray-600">
                  Yes, our mobile app is available for both iOS and Android. You can download it from the App Store or Google Play Store.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">What if I have a dispute with a supplier?</h3>
                <p className="text-gray-600">
                  We have a dispute resolution process in place. Contact our support team, and we'll help mediate
                  the issue and work towards a fair resolution for all parties.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">How do I update my company profile?</h3>
                <p className="text-gray-600">
                  Go to your account settings, select "Company Profile," and update the information.
                  Changes may take 24-48 hours to be reflected on the platform.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
