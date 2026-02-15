import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { RFQ, InsertRFQ } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

export function useRFQs() {
  const { toast } = useToast();

  // Get all RFQs
  const {
    data: rfqs = [],
    isLoading: isLoadingRFQs,
    error: rfqsError,
    refetch: refetchRFQs,
  } = useQuery<RFQ[]>({
    queryKey: ['/api/rfqs'],
  });

  // Create new RFQ
  const createRFQMutation = useMutation({
    mutationFn: async (data: InsertRFQ) => {
      const res = await apiRequest('POST', '/api/rfqs', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/rfqs'] });
      toast({
        title: 'RFQ Created',
        description: 'Your RFQ has been created successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to create RFQ',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Get single RFQ by ID
  const useGetRFQ = (id: number) => {
    return useQuery<RFQ>({
      queryKey: [`/api/rfqs/${id}`],
    });
  };

  // Update RFQ
  const updateRFQMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<RFQ> }) => {
      const res = await apiRequest('PUT', `/api/rfqs/${id}`, data);
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/rfqs'] });
      queryClient.invalidateQueries({ queryKey: [`/api/rfqs/${variables.id}`] });
      toast({
        title: 'RFQ Updated',
        description: 'The RFQ has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to update RFQ',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Submit voice RFQ
  const voiceRFQMutation = useMutation({
    mutationFn: async (audioBase64: string) => {
      const res = await apiRequest('POST', '/api/rfqs/voice', { audioBase64 });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/rfqs'] });
      toast({
        title: 'Voice RFQ Created',
        description: 'Your voice RFQ has been processed and created successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to process voice RFQ',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Analyze RFQ
  const analyzeRFQMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('POST', `/api/rfqs/${id}/analyze`, {});
      return res.json();
    },
    onSuccess: data => {
      toast({
        title: 'RFQ Analysis Complete',
        description: 'The RFQ has been analyzed successfully.',
      });
      return data;
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to analyze RFQ',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    rfqs,
    isLoadingRFQs,
    rfqsError,
    refetchRFQs,
    createRFQMutation,
    getRFQ: useGetRFQ,
    updateRFQMutation,
    voiceRFQMutation,
    analyzeRFQMutation,
  };
}
