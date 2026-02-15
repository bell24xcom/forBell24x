import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Bid, InsertBid } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

export function useBids() {
  const { toast } = useToast();

  // Get all bids (optionally filtered by RFQ ID or supplier ID)
  const useGetBids = (rfqId?: number, supplierId?: number) => {
    let queryString = '';
    if (rfqId) queryString += `rfq_id=${rfqId}&`;
    if (supplierId) queryString += `supplier_id=${supplierId}&`;

    const endpoint = `/api/bids${queryString ? `?${queryString.slice(0, -1)}` : ''}`;

    return useQuery<Bid[]>({
      queryKey: [endpoint],
    });
  };

  // Get single bid by ID
  const useGetBid = (id: number) => {
    return useQuery<Bid>({
      queryKey: [`/api/bids/${id}`],
    });
  };

  // Create new bid
  const createBidMutation = useMutation({
    mutationFn: async (data: InsertBid) => {
      const res = await apiRequest('POST', '/api/bids', data);
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/bids'] });
      queryClient.invalidateQueries({ queryKey: [`/api/rfqs/${variables.rfqId}`] });
      toast({
        title: 'Bid Submitted',
        description: 'Your bid has been submitted successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to submit bid',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update bid
  const updateBidMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Bid> }) => {
      const res = await apiRequest('PUT', `/api/bids/${id}`, data);
      return res.json();
    },
    onSuccess: updatedBid => {
      queryClient.invalidateQueries({ queryKey: ['/api/bids'] });
      queryClient.invalidateQueries({ queryKey: [`/api/bids/${updatedBid.id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/rfqs/${updatedBid.rfq_id}`] });
      toast({
        title: 'Bid Updated',
        description: 'The bid has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to update bid',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update bid status
  const updateBidStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest('PUT', `/api/bids/${id}/status`, { status });
      return res.json();
    },
    onSuccess: updatedBid => {
      queryClient.invalidateQueries({ queryKey: ['/api/bids'] });
      queryClient.invalidateQueries({ queryKey: [`/api/bids/${updatedBid.id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/rfqs/${updatedBid.rfq_id}`] });

      let message = '';
      switch (updatedBid.status) {
        case 'accepted':
          message = 'The bid has been accepted.';
          break;
        case 'rejected':
          message = 'The bid has been rejected.';
          break;
        case 'withdrawn':
          message = 'The bid has been withdrawn.';
          break;
        case 'under_review':
          message = 'The bid is now under review.';
          break;
        default:
          message = 'The bid status has been updated.';
      }

      toast({
        title: 'Bid Status Updated',
        description: message,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to update bid status',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    getBids: useGetBids,
    getBid: useGetBid,
    createBidMutation,
    updateBidMutation,
    updateBidStatusMutation,
  };
}
