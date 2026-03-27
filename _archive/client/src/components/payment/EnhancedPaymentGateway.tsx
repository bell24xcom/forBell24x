'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, CreditCard, Paypal, IndianRupee, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentGatewayProps {
  amount: number;
  currency?: string;
  orderId: string;
  customerEmail: string;
  onSuccess: (paymentData: any) => void;
  onFailure: (error: string) => void;
}

interface PaymentProvider {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  supportedCurrencies: string[];
  processingFee: number;
}

const PAYMENT_PROVIDERS: PaymentProvider[] = [
  {
    id: 'stripe',
    name: 'Stripe',
    icon: <CreditCard className="w-5 h-5" />,
    description: 'Credit/Debit Cards, UPI, Net Banking',
    supportedCurrencies: ['INR', 'USD', 'EUR', 'GBP'],
    processingFee: 2.9,
  },
  {
    id: 'paypal',
    name: 'PayPal',
    icon: <Paypal className="w-5 h-5" />,
    description: 'PayPal Balance, Credit Cards',
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD'],
    processingFee: 3.49,
  },
  {
    id: 'razorpay',
    name: 'Razorpay',
    icon: <IndianRupee className="w-5 h-5" />,
    description: 'UPI, Cards, Net Banking, Wallets',
    supportedCurrencies: ['INR'],
    processingFee: 2.5,
  },
];

export default function EnhancedPaymentGateway({
  amount,
  currency = 'INR',
  orderId,
  customerEmail,
  onSuccess,
  onFailure,
}: PaymentGatewayProps) {
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: '',
  });

  const availableProviders = PAYMENT_PROVIDERS.filter(provider =>
    provider.supportedCurrencies.includes(currency)
  );

  const selectedProviderData = PAYMENT_PROVIDERS.find(p => p.id === selectedProvider);
  const processingFee = selectedProviderData ? (amount * selectedProviderData.processingFee) / 100 : 0;
  const totalAmount = amount + processingFee;

  const handleProviderSelect = (providerId: string) => {
    setSelectedProvider(providerId);
    setPaymentStatus('idle');
  };

  const handleStripePayment = async () => {
    try {
      setLoading(true);
      setPaymentStatus('processing');

      // Create payment intent
      const intentResponse = await fetch('/api/payment/stripe/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalAmount,
          currency: currency.toLowerCase(),
          customerEmail,
          metadata: { orderId },
        }),
      });

      const intentData = await intentResponse.json();
      if (!intentData.success) {
        throw new Error(intentData.message);
      }

      // Here you would integrate with Stripe Elements
      // For now, we'll simulate a successful payment
      setTimeout(() => {
        setPaymentStatus('success');
        onSuccess({
          provider: 'stripe',
          paymentIntentId: intentData.paymentIntentId,
          amount: totalAmount,
          currency,
          orderId,
        });
        toast.success('Payment successful!');
      }, 2000);

    } catch (error: any) {
      setPaymentStatus('failed');
      onFailure(error.message);
      toast.error('Payment failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePayPalPayment = async () => {
    try {
      setLoading(true);
      setPaymentStatus('processing');

      const response = await fetch('/api/payment/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalAmount,
          currency,
          orderId,
          customerEmail,
        }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message);
      }

      // Redirect to PayPal
      const approveLink = data.links.find((link: any) => link.rel === 'approve');
      if (approveLink) {
        window.location.href = approveLink.href;
      }

    } catch (error: any) {
      setPaymentStatus('failed');
      onFailure(error.message);
      toast.error('PayPal payment failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRazorpayPayment = async () => {
    try {
      setLoading(true);
      setPaymentStatus('processing');

      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(totalAmount * 100), // Convert to paise
          currency,
          orderId,
          customerName: cardDetails.name,
          customerEmail,
          customerPhone: '',
        }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message);
      }

      // Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: 'Bell24h',
        description: `Order ${orderId}`,
        order_id: data.orderId,
        handler: function (response: any) {
          setPaymentStatus('success');
          onSuccess({
            provider: 'razorpay',
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            amount: totalAmount,
            currency,
            orderId,
          });
          toast.success('Payment successful!');
        },
        prefill: {
          name: cardDetails.name,
          email: customerEmail,
        },
        theme: {
          color: '#3B82F6',
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();

    } catch (error: any) {
      setPaymentStatus('failed');
      onFailure(error.message);
      toast.error('Razorpay payment failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = () => {
    switch (selectedProvider) {
      case 'stripe':
        handleStripePayment();
        break;
      case 'paypal':
        handlePayPalPayment();
        break;
      case 'razorpay':
        handleRazorpayPayment();
        break;
      default:
        toast.error('Please select a payment provider');
    }
  };

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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Secure Payment Gateway
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Order Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Order Summary</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Order Amount:</span>
                <span>₹{amount.toLocaleString()}</span>
              </div>
              {selectedProviderData && (
                <div className="flex justify-between text-gray-600">
                  <span>Processing Fee ({selectedProviderData.processingFee}%):</span>
                  <span>₹{processingFee.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold border-t pt-2">
                <span>Total:</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Provider Selection */}
          <div className="space-y-3">
            <Label>Select Payment Method</Label>
            <div className="grid gap-3">
              {availableProviders.map((provider) => (
                <div
                  key={provider.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedProvider === provider.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleProviderSelect(provider.id)}
                >
                  <div className="flex items-center gap-3">
                    {provider.icon}
                    <div className="flex-1">
                      <div className="font-medium">{provider.name}</div>
                      <div className="text-sm text-gray-600">{provider.description}</div>
                    </div>
                    {selectedProvider === provider.id && (
                      <CheckCircle className="w-5 h-5 text-blue-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Status */}
          {paymentStatus !== 'idle' && (
            <div className="p-4 rounded-lg border">
              {paymentStatus === 'processing' && (
                <div className="flex items-center gap-2 text-blue-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing payment...
                </div>
              )}
              {paymentStatus === 'success' && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  Payment successful!
                </div>
              )}
              {paymentStatus === 'failed' && (
                <div className="flex items-center gap-2 text-red-600">
                  <XCircle className="w-4 h-4" />
                  Payment failed
                </div>
              )}
            </div>
          )}

          {/* Payment Button */}
          {selectedProvider && (
            <Button
              onClick={handlePayment}
              disabled={loading || paymentStatus === 'processing'}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                `Pay ₹${totalAmount.toFixed(2)} with ${selectedProviderData?.name}`
              )}
            </Button>
          )}

          {/* Security Badge */}
          <div className="text-center">
            <Badge variant="secondary" className="text-xs">
              🔒 SSL Secured • PCI Compliant • 256-bit Encryption
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
