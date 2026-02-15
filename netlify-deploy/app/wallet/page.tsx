import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Digital Wallet - Bell24h',
  description: 'Secure digital wallet for B2B transactions'
};

export default function WalletPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Digital Wallet
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h2 className="text-xl font-semibold mb-4">Wallet Balance</h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-gray-900">₹1,25,000</p>
                  <p className="text-gray-600">Available Balance</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-green-600">+₹15,000</p>
                  <p className="text-gray-600">This Month</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Add Money
                  </button>
                  <button className="w-full p-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    Send Money
                  </button>
                  <button className="w-full p-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    Request Money
                  </button>
                  <button className="w-full p-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    Pay Bills
                  </button>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Payment to ABC Textiles</p>
                      <p className="text-sm text-gray-600">Today, 2:30 PM</p>
                    </div>
                    <p className="text-red-600 font-semibold">-₹25,000</p>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Received from XYZ Corp</p>
                      <p className="text-sm text-gray-600">Yesterday, 4:15 PM</p>
                    </div>
                    <p className="text-green-600 font-semibold">+₹50,000</p>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Wallet Top-up</p>
                      <p className="text-sm text-gray-600">2 days ago</p>
                    </div>
                    <p className="text-green-600 font-semibold">+₹1,00,000</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Payment Methods</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-blue-600 text-sm">💳</span>
                    </div>
                    <span className="font-medium">Credit Card</span>
                  </div>
                  <span className="text-sm text-gray-600">**** 1234</span>
                </div>

                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-green-600 text-sm">🏦</span>
                    </div>
                    <span className="font-medium">Bank Account</span>
                  </div>
                  <span className="text-sm text-gray-600">**** 5678</span>
                </div>

                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-purple-600 text-sm">📱</span>
                    </div>
                    <span className="font-medium">UPI</span>
                  </div>
                  <span className="text-sm text-gray-600">user@paytm</span>
                </div>
              </div>

              <button className="w-full mt-4 p-3 border border-dashed border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
                + Add Payment Method
              </button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Security</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Two-Factor Authentication</span>
                  <span className="text-sm text-green-600">Enabled</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Biometric Login</span>
                  <span className="text-sm text-green-600">Enabled</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Transaction PIN</span>
                  <span className="text-sm text-green-600">Set</span>
                </div>
              </div>

              <button className="w-full mt-4 p-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Security Settings
              </button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Wallet Limits</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Daily Limit</span>
                    <span>₹5,00,000</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '25%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Monthly Limit</span>
                    <span>₹50,00,000</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '10%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
