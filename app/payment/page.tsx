'use client';
import { useState, useEffect } from 'react';
import { CheckCircle, Shield, CreditCard, Lock, AlertCircle } from 'lucide-react';

export default function PaymentPage() {
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    currency: 'INR',
    description: '',
    orderId: '',
    customerName: '',
    customerEmail: '',
    customerPhone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      // Create order on your backend
      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      });

      const order = await response.json();

      if (!order.success) {
        throw new Error(order.error || 'Failed to create order');
      }

      // Configure Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.data.amount,
        currency: order.data.currency,
        name: 'Bell24h',
        description: order.data.description,
        order_id: order.data.id,
        handler: function (response: any) {
          // Payment successful
          console.log('Payment successful:', response);
          alert('Payment successful! Payment ID: ' + response.razorpay_payment_id);
        },
        prefill: {
          name: paymentData.customerName,
          email: paymentData.customerEmail,
          contact: paymentData.customerPhone
        },
        theme: {
          color: '#4F46E5'
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="page-title">
              Secure Payment with Razorpay
            </h1>
            <p className="page-subtitle">
              Powered by Razorpay - India's most trusted payment gateway
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Payment Form */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-neutral-900 mb-6">Payment Details</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="form-label">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={paymentData.amount}
                    onChange={(e) => setPaymentData({...paymentData, amount: Number(e.target.value)})}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter amount"
                  />
                </div>

                <div>
                  <label className="form-label">
                    Description
                  </label>
                  <input
                    type="text"
                    value={paymentData.description}
                    onChange={(e) => setPaymentData({...paymentData, description: e.target.value})}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Payment description"
                  />
                </div>

                <div>
                  <label className="form-label">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={paymentData.customerName}
                    onChange={(e) => setPaymentData({...paymentData, customerName: e.target.value})}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label className="form-label">
                    Email
                  </label>
                  <input
                    type="email"
                    value={paymentData.customerEmail}
                    onChange={(e) => setPaymentData({...paymentData, customerEmail: e.target.value})}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label className="form-label">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={paymentData.customerPhone}
                    onChange={(e) => setPaymentData({...paymentData, customerPhone: e.target.value})}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter your phone number"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                    <span className="text-red-800">{error}</span>
                  </div>
                )}

                <button
                  onClick={handlePayment}
                  disabled={loading || !paymentData.amount || !paymentData.customerName}
                  className="w-full bg-neutral-50"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5 mr-2" />
                      Pay with Razorpay
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Security Features */}
            <div className="space-y-6">
              {/* Security Badges */}
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h3 className="text-2xl font-bold text-neutral-900 mb-6">Security Features</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Shield className="w-6 h-6 text-green-600 mr-3" />
                    <span className="text-neutral-700">PCI DSS Compliant</span>
                  </div>
                  <div className="flex items-center">
                    <Lock className="w-6 h-6 text-green-600 mr-3" />
                    <span className="text-neutral-700">256-bit SSL Encryption</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                    <span className="text-neutral-700">RBI Approved</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                    <span className="text-neutral-700">Fraud Detection</span>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h3 className="text-2xl font-bold text-neutral-900 mb-6">Accepted Payment Methods</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 border border-neutral-200 rounded-lg">
                    <div className="text-2xl mb-2">💳</div>
                    <span className="text-sm text-neutral-600">Credit Cards</span>
                  </div>
                  <div className="text-center p-4 border border-neutral-200 rounded-lg">
                    <div className="text-2xl mb-2">🏦</div>
                    <span className="text-sm text-neutral-600">Debit Cards</span>
                  </div>
                  <div className="text-center p-4 border border-neutral-200 rounded-lg">
                    <div className="text-2xl mb-2">📱</div>
                    <span className="text-sm text-neutral-600">UPI</span>
                  </div>
                  <div className="text-center p-4 border border-neutral-200 rounded-lg">
                    <div className="text-2xl mb-2">🏧</div>
                    <span className="text-sm text-neutral-600">Net Banking</span>
                  </div>
                  <div className="text-center p-4 border border-neutral-200 rounded-lg">
                    <div className="text-2xl mb-2">💰</div>
                    <span className="text-sm text-neutral-600">Wallets</span>
                  </div>
                  <div className="text-center p-4 border border-neutral-200 rounded-lg">
                    <div className="text-2xl mb-2">🏪</div>
                    <span className="text-sm text-neutral-600">EMI</span>
                  </div>
                </div>
              </div>

              {/* Compliance Info */}
              <div className="bg-neutral-50">
                <h3 className="text-xl font-bold text-neutral-900 mb-4">Compliance & Security</h3>
                <ul className="text-sm text-neutral-600 space-y-2">
                  <li>• PCI DSS Level 1 Certified</li>
                  <li>• RBI Licensed Payment Aggregator</li>
                  <li>• ISO 27001 Certified</li>
                  <li>• SOC 2 Type II Compliant</li>
                  <li>• 99.9% Uptime SLA</li>
                  <li>• Real-time Fraud Detection</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
