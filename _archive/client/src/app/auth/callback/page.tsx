// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic'

export default function AuthCallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20 text-center max-w-md mx-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Bell24h</h1>
          <div className="w-16 h-1 bg-orange-500 mx-auto rounded-full"></div>
        </div>

        <div className="text-green-400 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h2 className="text-xl font-semibold text-white mb-2">Authentication Successful!</h2>
        <p className="text-white/70 mb-6">Welcome to Bell24h! Your account has been verified and you can now access all premium features.</p>
        
        <div className="space-y-3">
          <a
            href="/dashboard"
            className="block w-full px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Go to Dashboard
          </a>
          <a
            href="/"
            className="block w-full px-6 py-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
          >
            Back to Home
          </a>
        </div>

        {/* Enhanced Features Preview */}
        <div className="mt-6 p-4 bg-white/5 rounded-lg">
          <h3 className="text-sm font-semibold text-white mb-2">Your Access Includes:</h3>
          <div className="text-xs text-white/70 space-y-1">
            <div>✅ Razorpay Payment Integration</div>
            <div>✅ Advanced Analytics Dashboard</div>
            <div>✅ Premium Supplier Matching</div>
            <div>✅ Multi-Currency Support</div>
          </div>
        </div>
      </div>
    </div>
  )
} 
