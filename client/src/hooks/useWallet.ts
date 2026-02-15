'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/apiClient';

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  status: string;
  transactions: Transaction[];
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  walletId: string;
  amount: number;
  type: string;
  status: string;
  referenceId?: string;
  description?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  };
}

export const useWallet = (userId?: string | null) => {
  const queryClient = useQueryClient();

  // Get wallet
  const {
    data: wallet,
    isLoading: isLoadingWallet,
    error: walletError,
    refetch: refetchWallet,
  } = useQuery<Wallet | null>({
    queryKey: ['wallet', userId],
    queryFn: async () => {
      if (!userId) return null;
      try {
        return await api.get('/api/wallet');
      } catch (error) {
        console.error('Failed to fetch wallet:', error);
        return null;
      }
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  // Get transactions
  const {
    data: transactionsData,
    isLoading: isLoadingTransactions,
    error: transactionsError,
  } = useQuery<PaginatedResponse<Transaction>>({
    queryKey: ['wallet', 'transactions'],
    queryFn: () => api.get('/api/wallet/transactions'),
    enabled: !!userId,
  });

  // Deposit money
  const deposit = useMutation({
    mutationFn: (data: { amount: number; paymentMethodId: string }) =>
      api.post('/api/wallet/deposit', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['wallet', 'transactions'] });
    },
  });

  // Withdraw money
  const withdraw = useMutation({
    mutationFn: (data: { amount: number; bankAccountId: string }) =>
      api.post('/api/wallet/withdraw', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['wallet', 'transactions'] });
    },
  });

  // Load more transactions
  const loadMoreTransactions = (page: number) => {
    return api.get(`/api/wallet/transactions?page=${page}`);
  };

  return {
    // Wallet data
    wallet,
    isLoading: isLoadingWallet,
    walletError,
    refetchWallet,

    // Transactions
    transactions: transactionsData?.data || [],
    transactionsPagination: transactionsData?.pagination,
    isLoadingTransactions,
    transactionsError,
    loadMoreTransactions,

    // Actions
    deposit,
    withdraw,

    // Helpers
    formatBalance: (value?: number) => {
      const amount = value ?? wallet?.balance ?? 0;
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: wallet?.currency || 'INR',
      }).format(amount);
    },

    formatDate: (dateString: string) => {
      return new Date(dateString).toLocaleString();
    },
  };
};
