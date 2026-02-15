import { Server } from 'http';
import { Server as SocketServer } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { verifyToken } from '../lib/auth';
import { logger } from '../lib/logger';
import { cache } from '../lib/cache';

const prisma = new PrismaClient();

// WebSocket server configuration
interface WebSocketConfig {
  cors?: {
    origin: string | string[];
    methods: string[];
    credentials: boolean;
  };
  pingTimeout?: number;
  pingInterval?: number;
}

// Default WebSocket configuration
const defaultConfig: WebSocketConfig = {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
};

// Create WebSocket server
export const createWebSocketServer = (httpServer: Server, config: Partial<WebSocketConfig> = {}) => {
  const finalConfig = { ...defaultConfig, ...config };
  const io = new SocketServer(httpServer, finalConfig);

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET) as { id: string };
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.data.user = user;
      next();
    } catch (error) {
      next(new Error('Invalid authentication token'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Join user's room
    socket.join(`user:${socket.data.user.id}`);

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error(`Socket error: ${error.message}`);
    });

    // Handle custom events
    socket.on('message', async (data) => {
      try {
        // Broadcast message to all connected clients
        io.emit('message', {
          userId: socket.data.user.id,
          message: data.message,
          timestamp: new Date(),
        });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // Handle private messages
    socket.on('private-message', async (data) => {
      try {
        const { recipientId, message } = data;

        // Send message to specific user
        io.to(`user:${recipientId}`).emit('private-message', {
          senderId: socket.data.user.id,
          message,
          timestamp: new Date(),
        });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // Handle typing events
    socket.on('typing', (data) => {
      const { recipientId } = data;
      socket.to(`user:${recipientId}`).emit('typing', {
        userId: socket.data.user.id,
      });
    });

    // Handle read receipts
    socket.on('read', (data) => {
      const { messageId } = data;
      socket.broadcast.emit('read', {
        userId: socket.data.user.id,
        messageId,
        timestamp: new Date(),
      });
    });
  });

  return io;
};

// WebSocket event handlers
export const createWebSocketHandlers = (io: SocketServer) => {
  // Broadcast message to all clients
  const broadcast = (event: string, data: any) => {
    io.emit(event, data);
  };

  // Send message to specific user
  const sendToUser = (userId: string, event: string, data: any) => {
    io.to(`user:${userId}`).emit(event, data);
  };

  // Send message to multiple users
  const sendToUsers = (userIds: string[], event: string, data: any) => {
    userIds.forEach(userId => {
      io.to(`user:${userId}`).emit(event, data);
    });
  };

  // Send message to all users except sender
  const broadcastExcept = (senderId: string, event: string, data: any) => {
    io.except(`user:${senderId}`).emit(event, data);
  };

  // Join room
  const joinRoom = (socket: any, room: string) => {
    socket.join(room);
  };

  // Leave room
  const leaveRoom = (socket: any, room: string) => {
    socket.leave(room);
  };

  // Send message to room
  const sendToRoom = (room: string, event: string, data: any) => {
    io.to(room).emit(event, data);
  };

  return {
    broadcast,
    sendToUser,
    sendToUsers,
    broadcastExcept,
    joinRoom,
    leaveRoom,
    sendToRoom,
  };
};

// WebSocket error handler
export const handleWebSocketError = (error: Error) => {
  console.error('WebSocket error:', error);
};

// WebSocket connection handler
export const handleWebSocketConnection = (socket: any) => {
  console.log(`Client connected: ${socket.id}`);
};

// WebSocket disconnection handler
export const handleWebSocketDisconnection = (socket: any) => {
  console.log(`Client disconnected: ${socket.id}`);
};

interface WebSocketClient extends WebSocket {
  isAlive: boolean;
  userId?: string;
  role?: string;
}

interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: number;
}

// WebSocket server instance
let wss: WebSocketServer;

// Initialize WebSocket server
export const initializeWebSocket = (server: Server) => {
  wss = new WebSocketServer({ server });

  wss.on('connection', async (ws: WebSocketClient, req) => {
    try {
      // Authenticate connection
      const token = req.url?.split('token=')[1];
      if (!token) {
        ws.close(1008, 'Authentication required');
        return;
      }

      const decoded = await verifyToken(token);
      ws.userId = decoded.userId;
      ws.role = decoded.role;
      ws.isAlive = true;

      // Send welcome message
      sendMessage(ws, {
        type: 'welcome',
        payload: { userId: ws.userId, role: ws.role },
        timestamp: Date.now(),
      });

      // Handle incoming messages
      ws.on('message', async (data: string) => {
        try {
          const message: WebSocketMessage = JSON.parse(data);
          await handleMessage(ws, message);
        } catch (error) {
          logger.error('WebSocket message error:', error);
          sendError(ws, 'Invalid message format');
        }
      });

      // Handle client disconnect
      ws.on('close', () => {
        logger.info('Client disconnected:', { userId: ws.userId });
      });

      // Handle errors
      ws.on('error', (error) => {
        logger.error('WebSocket error:', error);
        ws.close();
      });

    } catch (error) {
      logger.error('WebSocket connection error:', error);
      ws.close(1008, 'Authentication failed');
    }
  });

  // Heartbeat to keep connections alive
  const interval = setInterval(() => {
    wss.clients.forEach((ws: WebSocketClient) => {
      if (!ws.isAlive) {
        return ws.terminate();
      }

      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(interval);
  });
};

// Send message to client
export const sendMessage = (ws: WebSocket, message: WebSocketMessage) => {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }
};

// Send error to client
export const sendError = (ws: WebSocket, message: string) => {
  sendMessage(ws, {
    type: 'error',
    payload: { message },
    timestamp: Date.now(),
  });
};

// Broadcast message to all clients
export const broadcast = (message: WebSocketMessage) => {
  wss.clients.forEach((client: WebSocketClient) => {
    if (client.readyState === WebSocket.OPEN) {
      sendMessage(client, message);
    }
  });
};

// Broadcast to specific users
export const broadcastToUsers = (userIds: string[], message: WebSocketMessage) => {
  wss.clients.forEach((client: WebSocketClient) => {
    if (client.readyState === WebSocket.OPEN && userIds.includes(client.userId!)) {
      sendMessage(client, message);
    }
  });
};

// Broadcast to specific roles
export const broadcastToRoles = (roles: string[], message: WebSocketMessage) => {
  wss.clients.forEach((client: WebSocketClient) => {
    if (client.readyState === WebSocket.OPEN && roles.includes(client.role!)) {
      sendMessage(client, message);
    }
  });
};

// Handle incoming messages
const handleMessage = async (ws: WebSocketClient, message: WebSocketMessage) => {
  switch (message.type) {
    case 'ping':
      sendMessage(ws, {
        type: 'pong',
        payload: { timestamp: Date.now() },
        timestamp: Date.now(),
      });
      break;

    case 'subscribe':
      await handleSubscribe(ws, message.payload);
      break;

    case 'unsubscribe':
      await handleUnsubscribe(ws, message.payload);
      break;

    default:
      sendError(ws, 'Unknown message type');
  }
};

// Handle subscription
const handleSubscribe = async (ws: WebSocketClient, payload: { channel: string }) => {
  const { channel } = payload;
  const key = `ws:sub:${channel}`;
  
  try {
    const subscribers = await cache.get(key);
    const userIds = subscribers ? JSON.parse(subscribers) : [];
    
    if (!userIds.includes(ws.userId)) {
      userIds.push(ws.userId);
      await cache.set(key, JSON.stringify(userIds));
    }

    sendMessage(ws, {
      type: 'subscribed',
      payload: { channel },
      timestamp: Date.now(),
    });
  } catch (error) {
    logger.error('Subscription error:', error);
    sendError(ws, 'Failed to subscribe');
  }
};

// Handle unsubscription
const handleUnsubscribe = async (ws: WebSocketClient, payload: { channel: string }) => {
  const { channel } = payload;
  const key = `ws:sub:${channel}`;
  
  try {
    const subscribers = await cache.get(key);
    if (subscribers) {
      const userIds = JSON.parse(subscribers);
      const index = userIds.indexOf(ws.userId);
      
      if (index > -1) {
        userIds.splice(index, 1);
        await cache.set(key, JSON.stringify(userIds));
      }
    }

    sendMessage(ws, {
      type: 'unsubscribed',
      payload: { channel },
      timestamp: Date.now(),
    });
  } catch (error) {
    logger.error('Unsubscription error:', error);
    sendError(ws, 'Failed to unsubscribe');
  }
}; 