import { useState, useCallback } from 'react';
import { useSnackbar } from 'notistack';
import { usePayment } from '../contexts/PaymentContext';

interface UsePaymentProcessingProps {
  onSuccess?: (paymentIntent: any) => void;
  onError?: (error: Error) => void;
}

export const usePaymentProcessing = ({ onSuccess, onError }: UsePaymentProcessingProps = {}) => {
  const { enqueueSnackbar } = useSnackbar();
  const { processPayment: processPaymentContext, isProcessing: processing } = usePayment();

  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPaymentIntent, setCurrentPaymentIntent] = useState<any>(null);

  /**
   * Create a payment intent (simplified to work with available context)
   */
  const createPaymentIntent = useCallback(
    async (amount: number, currency: string = 'INR', metadata: Record<string, any> = {}) => {
      try {
        setIsProcessing(true);

        // Create a mock payment intent since the context doesn't have createPaymentIntent
        const paymentIntent = {
          id: `pi_${Date.now()}`,
          amount,
          currency,
          clientSecret: `pi_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
          metadata,
          status: 'requires_payment_method',
        };

        setCurrentPaymentIntent(paymentIntent);
        return paymentIntent;
      } catch (err) {
        console.error('Error creating payment intent:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to create payment';
        enqueueSnackbar(errorMessage, { variant: 'error' });
        onError?.(err as Error);
        return null;
      } finally {
        setIsProcessing(false);
      }
    },
    [enqueueSnackbar, onError]
  );

  /**
   * Confirm a payment with the provided payment method
   */
  const confirmPayment = useCallback(
    async (paymentMethodId: string, savePaymentMethod: boolean = false) => {
      if (!currentPaymentIntent) {
        const error = new Error('No payment intent found');
        enqueueSnackbar(error.message, { variant: 'error' });
        onError?.(error);
        return false;
      }

      try {
        setIsProcessing(true);

        // Use the available processPayment method from context
        const success = await processPaymentContext(
          currentPaymentIntent.amount,
          currentPaymentIntent.currency
        );

        if (success) {
          onSuccess?.(currentPaymentIntent);
        }

        return success;
      } catch (err) {
        console.error('Error confirming payment:', err);
        const errorMessage = err instanceof Error ? err.message : 'Payment failed';
        enqueueSnackbar(errorMessage, { variant: 'error' });
        onError?.(err as Error);
        return false;
      } finally {
        setIsProcessing(false);
      }
    },
    [processPaymentContext, currentPaymentIntent, enqueueSnackbar, onError, onSuccess]
  );

  /**
   * Process a payment with the provided payment method
   * This is a convenience method that creates and confirms a payment intent in one step
   */
  const processPayment = useCallback(
    async (
      amount: number,
      paymentMethodId: string,
      currency: string = 'usd',
      metadata: Record<string, any> = {},
      savePaymentMethod: boolean = false
    ) => {
      try {
        setIsProcessing(true);

        const paymentIntent = await createPaymentIntent(amount, currency, metadata);

        if (!paymentIntent) {
          throw new Error('Failed to create payment intent');
        }

        const success = await confirmPayment(paymentMethodId, savePaymentMethod);

        if (success) {
          onSuccess?.(paymentIntent);
        }

        return success;
      } catch (err) {
        console.error('Error processing payment:', err);
        const errorMessage = err instanceof Error ? err.message : 'Payment processing failed';
        enqueueSnackbar(errorMessage, { variant: 'error' });
        onError?.(err as Error);
        return false;
      } finally {
        setIsProcessing(false);
      }
    },
    [confirmPayment, createPaymentIntent, enqueueSnackbar, onError, onSuccess]
  );

  /**
   * Clear the current payment intent and any errors
   */
  const clearPayment = useCallback(() => {
    setCurrentPaymentIntent(null);
  }, []);

  return {
    // State
    isProcessing: isProcessing || processing,
    paymentIntent: currentPaymentIntent,

    // Actions
    createPaymentIntent,
    confirmPayment,
    processPayment,
    clearPayment,
  };
};
