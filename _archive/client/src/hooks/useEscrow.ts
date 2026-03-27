import { useState, useCallback } from 'react';
import { toast } from 'sonner';

type EscrowHold = {
  id: string;
  walletId: string;
  amount: number;
  currency: string;
  status: string;
  gateway: string;
  buyerId: string;
  sellerId: string;
  orderId?: string;
  metadata?: any;
  releaseDate?: Date | null;
  referenceId: string;
  createdAt: Date;
  updatedAt: Date;
  transactions?: any[];
};

type UseEscrowReturn = {
  loading: boolean;
  error: string | null;
  toggleEscrow: (walletId: string, isEnabled: boolean) => Promise<boolean>;
  updateEscrowThreshold: (walletId: string, threshold: number) => Promise<boolean>;
  createEscrowHold: (data: {
    walletId: string;
    amount: number;
    currency: string;
    orderId?: string;
    metadata?: any;
  }) => Promise<EscrowHold | null>;
  releaseEscrow: (escrowHoldId: string, metadata?: any) => Promise<boolean>;
  refundEscrow: (escrowHoldId: string, metadata?: any) => Promise<boolean>;
};

export function useEscrow(): UseEscrowReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const makeRequest = useCallback(async (endpoint: string, data: any = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/escrow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...data, action: endpoint }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Something went wrong');
      }

      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleEscrow = useCallback(
    async (walletId: string, isEnabled: boolean) => {
      const result = await makeRequest('toggle', { metadata: { isEnabled } });
      if (result) {
        toast.success(`Escrow ${isEnabled ? 'enabled' : 'disabled'} successfully`);
        return true;
      }
      return false;
    },
    [makeRequest]
  );

  const updateEscrowThreshold = useCallback(
    async (walletId: string, threshold: number) => {
      const result = await makeRequest('update-threshold', {
        metadata: { threshold },
      });

      if (result) {
        toast.success('Escrow threshold updated successfully');
        return true;
      }
      return false;
    },
    [makeRequest]
  );

  const createEscrowHold = useCallback(
    async (data: {
      walletId: string;
      amount: number;
      currency: string;
      orderId?: string;
      metadata?: any;
    }) => {
      const result = await makeRequest('create', {
        amount: data.amount,
        currency: data.currency,
        orderId: data.orderId,
        metadata: data.metadata,
      });

      if (result) {
        toast.success('Escrow hold created successfully');
        return result as EscrowHold;
      }
      return null;
    },
    [makeRequest]
  );

  const releaseEscrow = useCallback(
    async (escrowHoldId: string, metadata: any = {}) => {
      const result = await makeRequest('release', {
        escrowHoldId,
        metadata,
      });

      if (result) {
        toast.success('Funds released from escrow');
        return true;
      }
      return false;
    },
    [makeRequest]
  );

  const refundEscrow = useCallback(
    async (escrowHoldId: string, metadata: any = {}) => {
      const result = await makeRequest('refund', {
        escrowHoldId,
        metadata,
      });

      if (result) {
        toast.success('Escrow refunded successfully');
        return true;
      }
      return false;
    },
    [makeRequest]
  );

  return {
    loading,
    error,
    toggleEscrow,
    updateEscrowThreshold,
    createEscrowHold,
    releaseEscrow,
    refundEscrow,
  };
}

export default useEscrow;
