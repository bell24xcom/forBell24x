import { useState, useEffect, useRef } from 'react';
import {
  sendNotification,
  storeNotification,
  NotificationType,
} from '../utils/notificationService';

// This is a placeholder for a real WebSocket implementation
// In a real app, you would use a library like socket.io-client
interface MockSocket {
  on: (event: string, callback: (data: any) => void) => void;
  emit: (event: string, data: any) => void;
  disconnect: () => void;
  connected: boolean;
}

export const useSocket = () => {
  const [connected, setConnected] = useState<boolean>(false);
  const socketRef = useRef<MockSocket | null>(null);

  useEffect(() => {
    // In a real implementation, you would connect to your WebSocket server
    // const socket = io('your-websocket-server-url');

    // For demo purposes, we'll create a mock socket
    const mockSocket: MockSocket = {
      on: (event, callback) => {
        // Store the callback in a global event map
        if (!window.socketEventMap) {
          window.socketEventMap = {};
        }
        window.socketEventMap[event] = callback;
      },
      emit: (event, data) => {
        // Simulate emitting an event
        console.log(`Emitting ${event}:`, data);

        // For demo purposes, simulate receiving a notification after emitting
        if (event === 'rfq-response' || event === 'bid-status' || event === 'trend-update') {
          setTimeout(() => {
            if (window.socketEventMap && window.socketEventMap['notification']) {
              window.socketEventMap['notification']({
                type: event,
                message: data.message || `New ${event} notification`,
                timestamp: new Date(),
              });
            }
          }, 1000);
        }
      },
      disconnect: () => {
        console.log('Mock socket disconnected');
        setConnected(false);
      },
      connected: true,
    };

    socketRef.current = mockSocket;
    setConnected(true);

    // Set up event listeners
    mockSocket.on('connect', () => {
      console.log('Connected to WebSocket server');
      setConnected(true);
    });

    mockSocket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      setConnected(false);
    });

    mockSocket.on('notification', data => {
      console.log('Received notification:', data);

      // Determine notification type
      let notificationType: NotificationType;
      switch (data.type) {
        case 'rfq-response':
          notificationType = NotificationType.RFQ_RESPONSE;
          break;
        case 'bid-status':
          notificationType = NotificationType.BID_STATUS;
          break;
        case 'payment':
          notificationType = NotificationType.PAYMENT;
          break;
        default:
          notificationType = NotificationType.SYSTEM;
      }

      // Create and display notification
      sendNotification({
        type: notificationType,
        message: data.message || 'New notification',
        title: 'WebSocket Notification',
      });
    });

    // Demo: Send some test notifications after a delay
    setTimeout(() => {
      if (window.socketEventMap && window.socketEventMap['notification']) {
        window.socketEventMap['notification']({
          type: 'rfq-response',
          message: 'Supplier XYZ responded to your RFQ for industrial pumps',
          timestamp: new Date(),
        });
      }
    }, 5000);

    setTimeout(() => {
      if (window.socketEventMap && window.socketEventMap['notification']) {
        window.socketEventMap['notification']({
          type: 'bid-status',
          message: 'Your bid for Project ABC has been accepted',
          timestamp: new Date(),
        });
      }
    }, 10000);

    // Clean up on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Return the socket and connection status
  return {
    socket: socketRef.current,
    connected,
  };
};

// Add this to the Window interface
declare global {
  interface Window {
    socketEventMap?: Record<string, (data: any) => void>;
  }
}
