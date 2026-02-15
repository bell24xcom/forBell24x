import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Contract, InsertContract } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

export function useContracts() {
  const { toast } = useToast();

  // Get all contracts for the current user
  const {
    data: contracts = [],
    isLoading: isLoadingContracts,
    error: contractsError,
    refetch: refetchContracts,
  } = useQuery<Contract[]>({
    queryKey: ['/api/contracts'],
  });

  // Get single contract by ID
  const useGetContract = (id: number) => {
    return useQuery<Contract>({
      queryKey: [`/api/contracts/${id}`],
    });
  };

  // Create new contract
  const createContractMutation = useMutation({
    mutationFn: async (data: InsertContract) => {
      const res = await apiRequest('POST', '/api/contracts', data);
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/contracts'] });
      toast({
        title: 'Contract Created',
        description: 'The contract has been created successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to create contract',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update contract status
  const updateContractStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest('PUT', `/api/contracts/${id}/status`, { status });
      return res.json();
    },
    onSuccess: updatedContract => {
      queryClient.invalidateQueries({ queryKey: ['/api/contracts'] });
      queryClient.invalidateQueries({ queryKey: [`/api/contracts/${updatedContract.id}`] });

      let message = '';
      switch (updatedContract.status) {
        case 'pending_approval':
          message = 'The contract is now pending approval.';
          break;
        case 'active':
          message = 'The contract has been activated.';
          break;
        case 'completed':
          message = 'The contract has been marked as completed.';
          break;
        case 'terminated':
          message = 'The contract has been terminated.';
          break;
        default:
          message = 'The contract status has been updated.';
      }

      toast({
        title: 'Contract Status Updated',
        description: message,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to update contract status',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    contracts,
    isLoadingContracts,
    contractsError,
    refetchContracts,
    getContract: useGetContract,
    createContractMutation,
    updateContractStatusMutation,
  };
}
