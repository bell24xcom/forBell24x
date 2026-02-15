'use client';

import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  rfqId?: string;
  message: string;
  type: 'text' | 'image' | 'file' | 'system';
  timestamp: Date;
  read: boolean;
}

interface ChatRoom {
  id: string;
  participants: string[];
  rfqId?: string;
  lastMessage?: ChatMessage;
  unreadCount: number;
}

interface UseChatReturn {
  // Connection state
  isConnected: boolean;
  socket: Socket | null;
  
  // Chat state
  messages: ChatMessage[];
  currentRoom: ChatRoom | null;
  unreadCount: number;
  isTyping: boolean;
  otherUserTyping: boolean;
  
  // Actions
  connect: (token: string) => void;
  disconnect: () => void;
  joinRoom: (rfqId: string, otherUserId: string) => void;
  leaveRoom: (rfqId: string) => void;
  sendMessage: (receiverId: string, message: string, rfqId?: string, type?: 'text' | 'image' | 'file') => void;
  markAsRead: (messageId: string) => void;
  loadChatHistory: (rfqId: string, otherUserId: string, page?: number) => void;
  startTyping: (rfqId: string, receiverId: string) => void;
  stopTyping: (rfqId: string, receiverId: string) => void;
  
  // Events
  onNewMessage: (callback: (message: ChatMessage) => void) => void;
  onTypingStart: (callback: (data: { senderId: string; rfqId: string }) => void) => void;
  onTypingStop: (callback: (data: { senderId: string; rfqId: string }) => void) => void;
  onRFQUpdate: (callback: (data: { rfqId: string; update: any }) => void) => void;
  onNewQuote: (callback: (data: { rfqId: string; quote: any }) => void) => void;
}

export function useChat(): UseChatReturn {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const eventListenersRef = useRef<Map<string, Function>>(new Map());

  // Connect to WebSocket
  const connect = (token: string) => {
    if (socket) {
      socket.disconnect();
    }

    const newSocket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001', {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Connected to chat server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from chat server');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setIsConnected(false);
    });

    // Message events
    newSocket.on('new_message', (message: ChatMessage) => {
      setMessages(prev => [...prev, message]);
      setUnreadCount(prev => prev + 1);
      
      // Trigger new message callback
      const callback = eventListenersRef.current.get('new_message');
      if (callback) callback(message);
    });

    newSocket.on('message_sent', (data: { id: string; message: string; timestamp: Date; status: string }) => {
      setMessages(prev => prev.map(msg => 
        msg.id === data.id ? { ...msg, timestamp: data.timestamp } : msg
      ));
    });

    newSocket.on('message_read', (data: { messageId: string }) => {
      setMessages(prev => prev.map(msg => 
        msg.id === data.messageId ? { ...msg, read: true } : msg
      ));
    });

    // Room events
    newSocket.on('room_joined', (data: { roomId: string; chatRoomId: string }) => {
      console.log('Joined room:', data.roomId);
    });

    // Chat history
    newSocket.on('chat_history', (data: { messages: ChatMessage[]; page: number; hasMore: boolean }) => {
      if (data.page === 1) {
        setMessages(data.messages);
      } else {
        setMessages(prev => [...data.messages, ...prev]);
      }
    });

    // Unread count
    newSocket.on('unread_count', (data: { count: number }) => {
      setUnreadCount(data.count);
    });

    // Typing events
    newSocket.on('typing_start', (data: { senderId: string; rfqId: string }) => {
      setOtherUserTyping(true);
      const callback = eventListenersRef.current.get('typing_start');
      if (callback) callback(data);
    });

    newSocket.on('typing_stop', (data: { senderId: string; rfqId: string }) => {
      setOtherUserTyping(false);
      const callback = eventListenersRef.current.get('typing_stop');
      if (callback) callback(data);
    });

    // RFQ events
    newSocket.on('rfq_update', (data: { rfqId: string; update: any }) => {
      const callback = eventListenersRef.current.get('rfq_update');
      if (callback) callback(data);
    });

    newSocket.on('new_quote', (data: { rfqId: string; quote: any }) => {
      const callback = eventListenersRef.current.get('new_quote');
      if (callback) callback(data);
    });

    // Error handling
    newSocket.on('error', (error: { message: string }) => {
      console.error('Chat error:', error.message);
    });

    setSocket(newSocket);
  };

  // Disconnect from WebSocket
  const disconnect = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
  };

  // Join a chat room
  const joinRoom = (rfqId: string, otherUserId: string) => {
    if (socket) {
      socket.emit('join_room', { rfqId, otherUserId });
    }
  };

  // Leave a chat room
  const leaveRoom = (rfqId: string) => {
    if (socket) {
      socket.emit('leave_room', { rfqId });
    }
  };

  // Send a message
  const sendMessage = (receiverId: string, message: string, rfqId?: string, type: 'text' | 'image' | 'file' = 'text') => {
    if (socket && message.trim()) {
      socket.emit('send_message', {
        receiverId,
        rfqId,
        message: message.trim(),
        type
      });
    }
  };

  // Mark message as read
  const markAsRead = (messageId: string) => {
    if (socket) {
      socket.emit('mark_read', { messageId });
    }
  };

  // Load chat history
  const loadChatHistory = (rfqId: string, otherUserId: string, page: number = 1) => {
    if (socket) {
      socket.emit('get_chat_history', { rfqId, otherUserId, page });
    }
  };

  // Start typing indicator
  const startTyping = (rfqId: string, receiverId: string) => {
    if (socket) {
      setIsTyping(true);
      socket.emit('typing_start', { rfqId, receiverId });
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Auto-stop typing after 3 seconds
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(rfqId, receiverId);
      }, 3000);
    }
  };

  // Stop typing indicator
  const stopTyping = (rfqId: string, receiverId: string) => {
    if (socket) {
      setIsTyping(false);
      socket.emit('typing_stop', { rfqId, receiverId });
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    }
  };

  // Event listeners
  const onNewMessage = (callback: (message: ChatMessage) => void) => {
    eventListenersRef.current.set('new_message', callback);
  };

  const onTypingStart = (callback: (data: { senderId: string; rfqId: string }) => void) => {
    eventListenersRef.current.set('typing_start', callback);
  };

  const onTypingStop = (callback: (data: { senderId: string; rfqId: string }) => void) => {
    eventListenersRef.current.set('typing_stop', callback);
  };

  const onRFQUpdate = (callback: (data: { rfqId: string; update: any }) => void) => {
    eventListenersRef.current.set('rfq_update', callback);
  };

  const onNewQuote = (callback: (data: { rfqId: string; quote: any }) => void) => {
    eventListenersRef.current.set('new_quote', callback);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  return {
    // Connection state
    isConnected,
    socket,
    
    // Chat state
    messages,
    currentRoom,
    unreadCount,
    isTyping,
    otherUserTyping,
    
    // Actions
    connect,
    disconnect,
    joinRoom,
    leaveRoom,
    sendMessage,
    markAsRead,
    loadChatHistory,
    startTyping,
    stopTyping,
    
    // Events
    onNewMessage,
    onTypingStart,
    onTypingStop,
    onRFQUpdate,
    onNewQuote
  };
}
