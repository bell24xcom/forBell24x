import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Message, InsertMessage } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

export function useMessages() {
  const { toast } = useToast();

  // Get messages (optionally filtered by user ID, RFQ ID, or bid ID)
<<<<<<< HEAD
  const getMessages = (otherUserId?: number, rfqId?: number, bidId?: number) => {
=======
  const useGetMessages = (otherUserId?: number, rfqId?: number, bidId?: number) => {
>>>>>>> b7b4b9c6cd126094e89116e18b3dbb247f1e8e4d
    let queryString = '';
    if (otherUserId) queryString += `user_id=${otherUserId}&`;
    if (rfqId) queryString += `rfq_id=${rfqId}&`;
    if (bidId) queryString += `bid_id=${bidId}&`;

    const endpoint = `/api/messages${queryString ? `?${queryString.slice(0, -1)}` : ''}`;

    return useQuery<Message[]>({
      queryKey: [endpoint],
    });
  };

  // Send a new message
  const sendMessageMutation = useMutation({
    mutationFn: async (data: InsertMessage) => {
      const res = await apiRequest('POST', '/api/messages', data);
      return res.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate queries based on the message parameters
      let queryKeys = ['/api/messages'];

      if (variables.receiverId) {
        queryKeys.push(`/api/messages?user_id=${variables.receiverId}`);
      }

      queryKeys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: [key] });
      });

      toast({
        title: 'Message Sent',
        description: 'Your message has been sent successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to send message',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Mark message as read
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('PUT', `/api/messages/${id}/read`, {});
      return res.json();
    },
    onSuccess: updatedMessage => {
      // Invalidate queries based on the message parameters
      let queryKeys = ['/api/messages'];

      if (updatedMessage.senderId) {
        queryKeys.push(`/api/messages?user_id=${updatedMessage.senderId}`);
      }

      if (updatedMessage.receiverId) {
        queryKeys.push(`/api/messages?user_id=${updatedMessage.receiverId}`);
      }

      queryKeys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: [key] });
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to mark message as read',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
<<<<<<< HEAD
    getMessages,
=======
    getMessages: useGetMessages,
>>>>>>> b7b4b9c6cd126094e89116e18b3dbb247f1e8e4d
    sendMessageMutation,
    markAsReadMutation,
  };
}
