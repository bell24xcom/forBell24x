'use client';

import React, { createContext, useContext, ReactNode, useState, useCallback } from 'react';

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'wallet' | 'crypto';
  name: string;
  isDefault: boolean;
}

interface PaymentContextType {
  paymentMethods: PaymentMethod[];
  selectedMethod: PaymentMethod | null;
  isProcessing: boolean;
  addPaymentMethod: (method: Omit<PaymentMethod, 'id'>) => void;
  removePaymentMethod: (id: string) => void;
  selectPaymentMethod: (id: string) => void;
  processPayment: (amount: number, currency: string) => Promise<boolean>;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export function PaymentProvider({ children }: { children: ReactNode }) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const addPaymentMethod = useCallback((method: Omit<PaymentMethod, 'id'>) => {
    const newMethod: PaymentMethod = {
      ...method,
      id: Date.now().toString(),
    };

    setPaymentMethods(prev => {
      const updated = [...prev, newMethod];
      if (newMethod.isDefault) {
        return updated.map(m => ({ ...m, isDefault: m.id === newMethod.id }));
      }
      return updated;
    });
  }, []);

  const removePaymentMethod = useCallback((id: string) => {
    setPaymentMethods(prev => prev.filter(method => method.id !== id));
    setSelectedMethod(prev => (prev?.id === id ? null : prev));
  }, []);

  const selectPaymentMethod = useCallback(
    (id: string) => {
      const method = paymentMethods.find(m => m.id === id);
      if (method) {
        setSelectedMethod(method);
      }
    },
    [paymentMethods]
  );

  const processPayment = useCallback(
    async (amount: number, currency: string): Promise<boolean> => {
      if (!selectedMethod) {
        console.error('No payment method selected');
        return false;
      }

      setIsProcessing(true);
      try {
        // Mock payment processing - in production this would call your payment API
        await new Promise(resolve => setTimeout(resolve, 2000));

        console.log(`Payment processed: ${amount} ${currency} via ${selectedMethod.name}`);
        return true;
      } catch (error) {
        console.error('Payment failed:', error);
        return false;
      } finally {
        setIsProcessing(false);
      }
    },
    [selectedMethod]
  );

  return (
    <PaymentContext.Provider
      value={{
        paymentMethods,
        selectedMethod,
        isProcessing,
        addPaymentMethod,
        removePaymentMethod,
        selectPaymentMethod,
        processPayment,
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
}

export function usePayment() {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
}
