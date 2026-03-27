/**
 * Type-safe WebSocket Hook for Bell24H.com
 *
 * Features:
 * - Type-safe message handling
 * - Auto-reconnection with exponential backoff
 * - Batch message processing
 * - Connection state management
 * - Performance metrics tracking
 */

import { useState, useEffect, useRef, useCallback } from 'react';

// Connection states
export enum ConnectionStatus {
  CONNECTING = 'connecting',
  OPEN = 'open',
  CLOSING = 'closing',
  CLOSED = 'closed',
  ERROR = 'error',
}

// Message types
export interface WebSocketMessage {
  type: string;
  timestamp: number;
  [key: string]: any;
}

// Batch message container
export interface BatchMessage extends WebSocketMessage {
  type: 'batch';
  messages: WebSocketMessage[];
}

// Welcome message from server
export interface WelcomeMessage extends WebSocketMessage {
  type: 'welcome';
  clientId: string;
  message: string;
}

// Ping/Pong for latency measurement
export interface PingMessage extends WebSocketMessage {
  type: 'ping';
  clientId?: string;
}

export interface PongMessage extends WebSocketMessage {
  type: 'pong';
  pingTimestamp: number;
}

// Error message
export interface ErrorMessage extends WebSocketMessage {
  type: 'error';
  code: number;
  message: string;
}

// RFQ-specific message types
export interface RFQUpdateMessage extends WebSocketMessage {
  type: 'rfq_update';
  rfqId: string;
  status: 'new' | 'updated' | 'matched' | 'accepted' | 'rejected';
  data: {
    title: string;
    description: string;
    budget: number;
    deadline: string;
    suppliersMatched?: number;
    supplierResponses?: number;
  };
}

export interface SupplierMatchMessage extends WebSocketMessage {
  type: 'supplier_match';
  rfqId: string;
  suppliers: Array<{
    id: string;
    name: string;
    matchScore: number;
    specialties: string[];
  }>;
}

// Hook configuration
export interface UseWebSocketOptions {
  url: string;
  reconnectAttempts?: number;
  reconnectInterval?: number;
  reconnectBackoffMultiplier?: number;
  automaticOpen?: boolean;
  batchProcessing?: boolean;
  onMessage?: (message: WebSocketMessage) => void;
  onBatchMessage?: (messages: WebSocketMessage[]) => void;
  onOpen?: (event: Event) => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
  protocols?: string | string[];
}

// Metrics tracking
interface WebSocketMetrics {
  messagesSent: number;
  messagesReceived: number;
  reconnects: number;
  errors: number;
  lastLatency: number;
  averageLatency: number;
  maxLatency: number;
  connectTime: number | null;
}

// Default option values
const defaultOptions: Partial<UseWebSocketOptions> = {
  reconnectAttempts: 5,
  reconnectInterval: 1000,
  reconnectBackoffMultiplier: 1.5,
  automaticOpen: true,
  batchProcessing: true,
  protocols: [],
};

/**
 * Hook for type-safe WebSocket connection management
 */
export function useWebSocket(options: UseWebSocketOptions) {
  // Combine user options with defaults
  const config = { ...defaultOptions, ...options };

  // State management
  const [status, setStatus] = useState<ConnectionStatus>(ConnectionStatus.CLOSED);
  const [metrics, setMetrics] = useState<WebSocketMetrics>({
    messagesSent: 0,
    messagesReceived: 0,
    reconnects: 0,
    errors: 0,
    lastLatency: 0,
    averageLatency: 0,
    maxLatency: 0,
    connectTime: null,
  });

  // Refs to maintain consistent values across renders and in callbacks
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const latencySamplesRef = useRef<number[]>([]);
  const clientIdRef = useRef<string | null>(null);
  const metricsRef = useRef<WebSocketMetrics>(metrics);

  // Update metrics ref when state changes
  useEffect(() => {
    metricsRef.current = metrics;
  }, [metrics]);

  // Connect to WebSocket
  const connect = useCallback(() => {
    // Clean up any existing connection
    if (wsRef.current) {
      wsRef.current.close();
    }

    try {
      // Create new WebSocket connection
      setStatus(ConnectionStatus.CONNECTING);
      wsRef.current = new WebSocket(config.url, config.protocols);

      // Track connection start time
      const connectStartTime = Date.now();

      // Set up event handlers
      wsRef.current.onopen = event => {
        // Reset reconnect attempts
        reconnectAttemptsRef.current = 0;

        // Update status and metrics
        setStatus(ConnectionStatus.OPEN);
        setMetrics(prev => ({
          ...prev,
          connectTime: Date.now() - connectStartTime,
        }));

        // Call user callback
        if (config.onOpen) {
          config.onOpen(event);
        }

        // Send initial ping for latency measurement
        sendPing();
      };

      wsRef.current.onclose = event => {
        setStatus(ConnectionStatus.CLOSED);

        // Call user callback
        if (config.onClose) {
          config.onClose(event);
        }

        // Attempt to reconnect if not closed cleanly
        if (event.code !== 1000 && event.code !== 1001) {
          attemptReconnect();
        }
      };

      wsRef.current.onerror = event => {
        setStatus(ConnectionStatus.ERROR);
        setMetrics(prev => ({
          ...prev,
          errors: prev.errors + 1,
        }));

        // Call user callback
        if (config.onError) {
          config.onError(event);
        }
      };

      wsRef.current.onmessage = event => {
        try {
          // Parse message
          const message = JSON.parse(event.data) as WebSocketMessage;

          // Update metrics
          setMetrics(prev => ({
            ...prev,
            messagesReceived: prev.messagesReceived + 1,
          }));

          // Handle different message types
          switch (message.type) {
            case 'welcome':
              const welcomeMsg = message as WelcomeMessage;
              clientIdRef.current = welcomeMsg.clientId;
              break;

            case 'pong':
              const pongMsg = message as PongMessage;
              if (pongMsg.pingTimestamp) {
                const latency = Date.now() - pongMsg.pingTimestamp;
                updateLatencyMetrics(latency);
              }
              break;

            case 'batch':
              const batchMsg = message as BatchMessage;

              // Process batch messages
              if (config.batchProcessing && config.onBatchMessage) {
                config.onBatchMessage(batchMsg.messages);
              } else if (config.onMessage) {
                // Process each message individually
                batchMsg.messages.forEach(msg => {
                  config.onMessage?.(msg);
                });
              }
              break;

            default:
              // Handle regular messages
              if (config.onMessage) {
                config.onMessage(message);
              }
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
          setMetrics(prev => ({
            ...prev,
            errors: prev.errors + 1,
          }));
        }
      };
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      setStatus(ConnectionStatus.ERROR);
      setMetrics(prev => ({
        ...prev,
        errors: prev.errors + 1,
      }));

      // Attempt to reconnect
      attemptReconnect();
    }
  }, [
    config.url,
    config.protocols,
    config.onOpen,
    config.onClose,
    config.onError,
    config.onMessage,
    config.onBatchMessage,
    config.batchProcessing,
  ]);

  // Attempt to reconnect with exponential backoff
  const attemptReconnect = useCallback(() => {
    if (reconnectAttemptsRef.current >= (config.reconnectAttempts || 0)) {
      console.log('Max reconnect attempts reached');
      return;
    }

    // Clear any existing reconnect timer
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
    }

    // Calculate backoff time
    const backoffTime =
      config.reconnectInterval! *
      Math.pow(config.reconnectBackoffMultiplier!, reconnectAttemptsRef.current);

    // Increment reconnect attempts
    reconnectAttemptsRef.current++;

    // Update metrics
    setMetrics(prev => ({
      ...prev,
      reconnects: prev.reconnects + 1,
    }));

    // Schedule reconnect
    reconnectTimerRef.current = setTimeout(() => {
      console.log(`Reconnecting (attempt ${reconnectAttemptsRef.current})...`);
      connect();
    }, backoffTime);
  }, [
    connect,
    config.reconnectAttempts,
    config.reconnectInterval,
    config.reconnectBackoffMultiplier,
  ]);

  // Send a message
  const sendMessage = useCallback((message: WebSocketMessage): boolean => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));

      // Update metrics
      setMetrics(prev => ({
        ...prev,
        messagesSent: prev.messagesSent + 1,
      }));

      return true;
    }
    return false;
  }, []);

  // Send a ping message
  const sendPing = useCallback((): boolean => {
    const pingMessage: PingMessage = {
      type: 'ping',
      timestamp: Date.now(),
      clientId: clientIdRef.current || undefined,
    };

    return sendMessage(pingMessage);
  }, [sendMessage]);

  // Update latency metrics
  const updateLatencyMetrics = useCallback((latency: number) => {
    // Add to samples (keep last 50 samples)
    latencySamplesRef.current.push(latency);
    if (latencySamplesRef.current.length > 50) {
      latencySamplesRef.current.shift();
    }

    // Calculate average
    const sum = latencySamplesRef.current.reduce((a, b) => a + b, 0);
    const avg = sum / latencySamplesRef.current.length;

    // Update metrics
    setMetrics(prev => ({
      ...prev,
      lastLatency: latency,
      averageLatency: avg,
      maxLatency: Math.max(prev.maxLatency, latency),
    }));
  }, []);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    // Clear reconnect timer
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    // Close WebSocket connection
    if (wsRef.current) {
      setStatus(ConnectionStatus.CLOSING);
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (config.automaticOpen) {
      connect();
    }

    // Clean up on unmount
    return () => {
      disconnect();
    };
  }, [connect, disconnect, config.automaticOpen]);

  // Set up periodic ping for latency measurement
  useEffect(() => {
    if (status !== ConnectionStatus.OPEN) return;

    const pingInterval = setInterval(() => {
      sendPing();
    }, 30000); // Send ping every 30 seconds

    return () => {
      clearInterval(pingInterval);
    };
  }, [status, sendPing]);

  // Return hook API
  return {
    status,
    metrics,
    clientId: clientIdRef.current,
    sendMessage,
    sendPing,
    connect,
    disconnect,
  };
}

export default useWebSocket;
