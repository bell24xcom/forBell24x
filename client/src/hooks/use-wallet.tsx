import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Transaction, InsertTransaction } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

export function useWallet() {
  const { toast } = useToast();

  // Get wallet balance
  const {
    data: walletData,
    isLoading: isLoadingWallet,
    error: walletError,
    refetch: refetchWallet,
  } = useQuery<{ balance: string }>({
    queryKey: ['/api/wallet'],
  });

  // Get all transactions
  const {
    data: transactions = [],
    isLoading: isLoadingTransactions,
    error: transactionsError,
    refetch: refetchTransactions,
  } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions'],
  });

  // Create new transaction (deposit, withdrawal, payment)
  const createTransactionMutation = useMutation({
    mutationFn: async (data: Omit<InsertTransaction, 'reference_number'>) => {
      const res = await apiRequest('POST', '/api/transactions', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });

      let message = '';
      switch (createTransactionMutation.variables?.type) {
        case 'deposit':
          message = 'Funds have been added to your wallet.';
          break;
        case 'withdrawal':
          message = 'Withdrawal processed successfully.';
          break;
        case 'payment':
          message = 'Payment has been processed successfully.';
          break;
        case 'escrow':
          message = 'Funds have been placed in escrow.';
          break;
        default:
          message = 'Transaction completed successfully.';
      }

      toast({
        title: 'Transaction Successful',
        description: message,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Transaction Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    walletBalance: walletData?.balance || '0',
    isLoadingWallet,
    walletError,
    refetchWallet,
    transactions,
    isLoadingTransactions,
    transactionsError,
    refetchTransactions,
    createTransactionMutation,
  };
}
