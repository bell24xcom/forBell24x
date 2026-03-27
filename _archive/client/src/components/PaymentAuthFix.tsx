'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function PaymentAuthFix() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Redirect to login with payment redirect
      router.push('/auth/login?redirect=/dashboard/payments');
      return;
    }

    if (isAuthenticated && user) {
      loadPaymentMethods();
    }
  }, [isAuthenticated, user, loading, router]);

  const loadPaymentMethods = async () => {
    try {
      setPaymentLoading(true);
      
      // Fetch payment methods from API
      const response = await fetch('/api/payments/methods', {
        headers: {
          'Authorization': `Bearer ${user?.id}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPaymentMethods(data.paymentMethods || []);
      } else {
        throw new Error('Failed to load payment methods');
      }
    } catch (error) {
      console.error('Error loading payment methods:', error);
    } finally {
      setPaymentLoading(false);
    }
  };

  const addPaymentMethod = async (paymentData: any) => {
    try {
      const response = await fetch('/api/payments/methods', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.id}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentData)
      });

      if (response.ok) {
        loadPaymentMethods(); // Reload payment methods
      } else {
        throw new Error('Failed to add payment method');
      }
    } catch (error) {
      console.error('Error adding payment method:', error);
    }
  };

  if (loading || paymentLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-4">Please log in to access payment settings.</p>
          <button
            onClick={() => router.push('/auth/login?redirect=/dashboard/payments')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-container">
      <h1 className="text-2xl font-bold mb-6">Payment Methods</h1>
      
      <div className="payment-methods">
        {paymentMethods.length > 0 ? (
          <div className="methods-list">
            {paymentMethods.map((method: any, index: number) => (
              <div key={index} className="payment-method-item">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{method.type}</h3>
                    <p className="text-sm text-gray-600">**** **** **** {method.last4}</p>
                  </div>
                  <button
                    onClick={() => {/* Handle remove payment method */}}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No payment methods added yet</p>
        )}
        
        <button
          onClick={() => {/* Handle add payment method */}}
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Add Payment Method
        </button>
      </div>
    </div>
  );
}
