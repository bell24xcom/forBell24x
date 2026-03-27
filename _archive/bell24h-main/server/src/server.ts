import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import * as promClient from 'prom-client';
import { VoiceRfqController } from './controllers/voiceRfqController';
import { VoiceRfqService } from './services/voiceRfqService';

// Import routes
import categoryRoutes from './routes/category.routes.js';

// Initialize environment variables
dotenv.config();

// ES modules fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";
const NODE_ENV = process.env.NODE_ENV || 'development';

// Create Express app
const app = express();
const httpServer = createServer(app);

// Setup metrics
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

// Custom metrics
const activeConnections = new promClient.Gauge({
  name: 'websocket_active_connections',
  help: 'Number of active WebSocket connections',
  labelNames: ['node'] as const,
  registers: [register],
});

const messagesReceived = new promClient.Counter({
  name: 'websocket_messages_received_total',
  help: 'Total number of messages received',
  labelNames: ['type'] as const,
  registers: [register],
});

const messagesSent = new promClient.Counter({
  name: 'websocket_messages_sent_total',
  help: 'Total number of messages sent',
  labelNames: ['type'] as const,
  registers: [register],
});

const connectionErrors = new promClient.Counter({
  name: 'websocket_connection_errors_total',
  help: 'Total number of connection errors',
  labelNames: ['errorType'] as const,
  registers: [register],
});

// Track connection count
let connectionCount = 0;

// Enhanced CORS configuration
const corsOptions = {
  origin: CLIENT_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Apply CORS to Express
app.use(cors(corsOptions));
app.use(express.json());

// Add metrics endpoint
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    const metrics = await register.metrics();
    res.end(metrics);
  } catch (error) {
    console.error('Error generating metrics:', error);
    res.status(500).end('Error generating metrics');
  }
});

// Health check endpoint with metrics
app.get('/health', (req, res) => {
  const memoryUsage = process.memoryUsage();
  const status = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      external: memoryUsage.external ? `${Math.round(memoryUsage.external / 1024 / 1024)}MB` : 'N/A',
    },
    activeConnections: connectionCount,
    nodeEnv: NODE_ENV,
  };
  res.json(status);
});

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Bell24H API is running!' });
});

// Use Category Routes
app.use('/api/categories', categoryRoutes);

// RFQ endpoints
app.get('/api/rfq', (req, res) => {
  // Mock response for now - replace with actual RFQ service
  res.json([
    { 
      id: 'rfq-001', 
      title: 'Sample RFQ', 
      description: 'This is a sample RFQ for testing',
      category: 'Technology',
      budget: 50000,
      status: 'active'
    }
  ]);
});

app.post('/api/rfq', (req, res) => {
  try {
    const { title, description, requirements, category, budget } = req.body;
    
    // Validate required fields
    if (!title || !description || !category) {
      return res.status(400).json({ 
        error: 'Missing required fields: title, description, category' 
      });
    }

    // Mock response - replace with actual RFQ creation
    const newRFQ = {
      id: `rfq-${Date.now()}`,
      title,
      description,
      requirements: requirements || [],
      category,
      budget: budget || 0,
      status: 'draft',
      createdAt: new Date().toISOString()
    };

    res.status(201).json(newRFQ);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create RFQ' });
  }
});

const voiceRfqService = new VoiceRfqService();
const voiceRfqController = new VoiceRfqController(voiceRfqService);

app.post('/api/rfq/voice', (req, res) => voiceRfqController.processVoiceRfq(req, res));

app.get('/api/rfq/:id', (req, res) => {
  const { id } = req.params;
  
  // Mock response - replace with actual RFQ service
  const rfq = {
    id,
    title: 'Sample RFQ',
    description: 'This is a sample RFQ for testing',
    category: 'Technology',
    budget: 50000,
    status: 'active'
  };

  res.json(rfq);
});

// Wallet endpoints
app.get('/api/wallet/:userId/balance', (req, res) => {
  const { userId } = req.params;
  
  // Mock response - replace with actual wallet service
  res.json({
    userId,
    balance: 50000,
    currency: 'INR',
    lastUpdated: new Date().toISOString()
  });
});

app.post('/api/wallet/:userId/deposit', (req, res) => {
  try {
    const { userId } = req.params;
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    // Mock response - replace with actual wallet service
    res.json({
      userId,
      amount,
      type: 'deposit',
      status: 'success',
      newBalance: 50000 + amount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process deposit' });
  }
});

app.post('/api/wallet/:userId/withdraw', (req, res) => {
  try {
    const { userId } = req.params;
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    // Mock response - replace with actual wallet service
    res.json({
      userId,
      amount,
      type: 'withdraw',
      status: 'success',
      newBalance: 50000 - amount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process withdrawal' });
  }
});

// Escrow endpoints
app.post('/api/escrow/create', (req, res) => {
  try {
    const { buyerId, supplierId, amount, tradeId } = req.body;
    
    if (!buyerId || !supplierId || !amount || !tradeId) {
      return res.status(400).json({ 
        error: 'Missing required fields: buyerId, supplierId, amount, tradeId' 
      });
    }

    // Mock response - replace with actual escrow service
    const escrow = {
      escrowId: `escrow-${Date.now()}`,
      buyerId,
      supplierId,
      amount,
      tradeId,
      status: 'created',
      createdAt: new Date().toISOString()
    };

    res.status(201).json(escrow);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create escrow' });
  }
});

app.post('/api/escrow/:escrowId/release', (req, res) => {
  try {
    const { escrowId } = req.params;
    
    // Mock response - replace with actual escrow service
    res.json({
      escrowId,
      status: 'released',
      message: 'Escrow released to supplier',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to release escrow' });
  }
});

app.get('/api/escrow/:escrowId', (req, res) => {
  const { escrowId } = req.params;
  
  // Mock response - replace with actual escrow service
  res.json({
    escrowId,
    buyerId: 'buyer-001',
    supplierId: 'supplier-001',
    amount: 25000,
    tradeId: 'trade-001',
    status: 'created',
    createdAt: new Date().toISOString()
  });
});

// Create Socket.IO server with enhanced options
const io = new Server(httpServer, {
  cors: corsOptions,
  path: '/socket.io/',
  serveClient: false,
  connectTimeout: 10000,
  transports: ['websocket', 'polling'],
  pingTimeout: 30000,
  pingInterval: 25000,
  maxHttpBufferSize: 1e8,
  allowEIO3: true,
});

// Store active connections
const activeConnectionMap = new Map();

// Logger
const logger = {
  info: (message: string, meta: any = {}) => {
    console.log(`[${new Date().toISOString()}] INFO: ${message}`, JSON.stringify(meta));
  },
  error: (message: string, error: any = {}) => {
    console.error(`[${new Date().toISOString()}] ERROR: ${message}`, error);
  }
};

// Helper to get client IP
function getClientIp(socket: any): string {
  return (socket.handshake.headers['x-forwarded-for'] as string || '').split(',')[0] ||
    socket.handshake.address ||
    socket.conn.remoteAddress ||
    'unknown';
}

// WebSocket connection handler
io.on('connection', (socket) => {
  const clientIp = getClientIp(socket);
  const userAgent = socket.handshake.headers['user-agent'] || 'unknown';

  // Update connection metrics
  connectionCount++;
  activeConnections.inc({ node: process.env.NODE_APP_INSTANCE || '0' });

  const connectionInfo = {
    id: socket.id,
    connectedAt: new Date(),
    ip: clientIp,
    userAgent,
    lastPing: new Date()
  };

  // Store connection
  activeConnectionMap.set(socket.id, connectionInfo);

  logger.info(`New client connected: ${socket.id}`, {
    ip: clientIp,
    userAgent,
    totalConnections: activeConnectionMap.size
  });

  // Handle ping from client
  socket.on('ping', (data: any) => {
    messagesReceived.inc({ type: 'ping' });
    const conn = activeConnectionMap.get(socket.id);
    if (conn) {
      conn.lastPing = new Date();
    }
    socket.emit('pong', {
      timestamp: new Date().toISOString(),
      latency: Date.now() - (data.timestamp || Date.now())
    });
    messagesSent.inc({ type: 'pong' });
  });

  // Handle file changes
  socket.on('file-change', (data: any) => {
    messagesReceived.inc({ type: 'file-change' });
    // Broadcast to all other clients
    socket.broadcast.emit('code-update', {
      type: 'file-change',
      ...data,
      timestamp: new Date().toISOString(),
      source: socket.id
    });
    messagesSent.inc({ type: 'code-update' });
  });

  // Handle client disconnection
  socket.on('disconnect', (reason: string) => {
    // Update connection metrics
    connectionCount = Math.max(0, connectionCount - 1);
    activeConnections.dec({ node: process.env.NODE_APP_INSTANCE || '0' });

    activeConnectionMap.delete(socket.id);
    logger.info(`Client disconnected: ${socket.id}`, {
      reason,
      remainingConnections: activeConnectionMap.size
    });
  });

  // Error handling
  socket.on('error', (error: Error) => {
    connectionErrors.inc({ errorType: 'socket_error' });
    logger.error(`Socket error (${socket.id}):`, error);
  });
});

// Graceful shutdown handler
const shutdown = (signal: string) => {
  return () => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);

    // Notify all clients
    io.emit('server:shutdown', {
      message: 'Server is shutting down',
      timestamp: new Date().toISOString()
    });

    // Close all connections
    io.close(() => {
      logger.info('WebSocket server closed');
      httpServer.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    });

    // Force close after timeout
    setTimeout(() => {
      logger.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  };
};

// Handle process termination
process.on('SIGTERM', shutdown('SIGTERM'));
process.on('SIGINT', shutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start server function
function startServer() {
  httpServer.listen(PORT, '0.0.0.0', () => {
    const address = httpServer.address();
    const serverUrl = typeof address === 'string'
      ? address
      : `http://${address?.address}:${address?.port}`;

    console.log(`🚀 Server running at ${serverUrl}`, {
      environment: NODE_ENV,
      nodeVersion: process.version,
      platform: process.platform,
      pid: process.pid,
      port: PORT
    });
  });
}

// Start server
startServer();
