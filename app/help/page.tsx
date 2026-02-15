export default function HelpPage() {
  return (
    <div className="page-container">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-neutral-900 mb-8 text-center">Help Center</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* FAQ Section */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-neutral-900 mb-6">Frequently Asked Questions</h2>
              
              <div className="space-y-6">
                <div className="border-b border-neutral-200 pb-4">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">How do I post an RFQ?</h3>
                  <p className="text-neutral-600">Simply click on "Post RFQ" in the navigation, fill in your requirements, and our AI will match you with verified suppliers within 24 hours.</p>
                </div>
                
                <div className="border-b border-neutral-200 pb-4">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">How does the escrow system work?</h3>
                  <p className="text-neutral-600">Your payment is held securely in ICICI Bank escrow until you receive and approve your goods. This ensures 100% protection for both buyers and suppliers.</p>
                </div>
                
                <div className="border-b border-neutral-200 pb-4">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">What payment methods do you accept?</h3>
                  <p className="text-neutral-600">We accept all major payment methods including credit/debit cards, UPI, net banking, and digital wallets through our secure Razorpay integration.</p>
                </div>
                
                <div className="border-b border-neutral-200 pb-4">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">How do I verify suppliers?</h3>
                  <p className="text-neutral-600">All suppliers on Bell24h are pre-verified with GST, PAN, and other compliance documents. Our AI trust scoring system provides additional verification.</p>
                </div>
                
                <div className="border-b border-neutral-200 pb-4">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">Can I use voice or video for RFQ?</h3>
                  <p className="text-neutral-600">Yes! You can submit RFQs using voice, video, or text. Our AI understands all formats and converts them into structured requirements.</p>
                </div>
                
                <div className="border-b border-neutral-200 pb-4">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">What if I'm not satisfied with the quotes?</h3>
                  <p className="text-neutral-600">You can request modifications or reject quotes. Your escrow payment is only released when you're completely satisfied with the delivered goods.</p>
                </div>
              </div>
            </div>

            {/* Contact & Support */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h3 className="text-xl font-bold text-neutral-900 mb-6">Contact Support</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-indigo-600">📞</span>
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-900">Phone Support</p>
                      <p className="text-neutral-600">+91-9004962871</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-emerald-600">✉️</span>
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-900">Email Support</p>
                      <p className="text-neutral-600">support@bell24h.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-purple-600">💬</span>
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-900">Live Chat</p>
                      <p className="text-neutral-600">Available 24/7</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-neutral-50">
                <h3 className="text-xl font-bold text-neutral-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors">
                    Post New RFQ
                  </button>
                  <button className="w-full bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors">
                    Browse Suppliers
                  </button>
                  <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
                    Check Wallet
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h3 className="text-xl font-bold text-neutral-900 mb-4">Business Hours</h3>
                <div className="space-y-2 text-neutral-600">
                  <p><span className="font-semibold">Monday - Friday:</span> 9:00 AM - 6:00 PM</p>
                  <p><span className="font-semibold">Saturday:</span> 10:00 AM - 4:00 PM</p>
                  <p><span className="font-semibold">Sunday:</span> Closed</p>
                  <p className="text-sm text-neutral-500 mt-2">Emergency support available 24/7</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}