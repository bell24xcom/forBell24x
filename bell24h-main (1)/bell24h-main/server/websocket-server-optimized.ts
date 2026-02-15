/**
 * Bell24H Optimized WebSocket Server (High Concurrency Version)
 * Features:
 * - Advanced connection pooling with sharding
 * - Efficient message batching and prioritization
 * - Auto-reconnection with exponential backoff
 * - Real-time performance monitoring
 * - Memory optimization for 1000+ concurrent connections
 */

import * as WebSocket from 'ws';
import * as http from 'http';
import { performance } from 'perf_hooks';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

// Import the enhanced connection pool
import WebSocketConnectionPool from './utils/ws-connection-pool';

// Configuration interface
interface ServerConfig {
  port: number;
  maxConnections: number;
  batchSize: number;
  batchIntervalMs: number;
  metricsIntervalMs: number;
  metricsFilePath: string;
  heartbeatIntervalMs: number;
}

// Default configuration
const DEFAULT_CONFIG: ServerConfig = {
  port: 8080,
  maxConnections: 1000,
  batchSize: 50,
  batchIntervalMs: 50,  // 50ms batching interval
  metricsIntervalMs: 5000,  // 5 seconds
  metricsFilePath: path.join(process.cwd(), 'metrics', 'websocket-metrics.json'),
  heartbeatIntervalMs: 30000 // 30 seconds
};

// Create HTTP server
const server = http.createServer((req, res) => {
  if (req.url === '/metrics') {
    // Return metrics endpoint
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      ...connectionPool.getMetrics(),
      uptime: (performance.now() - startTime) / 1000,
      timestamp: new Date().toISOString()
    }));
  } else if (req.url === '/health') {
    // Health check endpoint
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      connections: connectionPool.getMetrics().connectionCount,
      uptime: (performance.now() - startTime) / 1000
    }));
  } else {
    // Default response for other endpoints
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bell24H WebSocket Server (High Concurrency Edition)');
  }
});

// Initialize connection pool with advanced settings
const connectionPool = new WebSocketConnectionPool({
  shards: 5, // Split connections across 5 shards for better memory management
  maxConnectionsPerShard: 250, // 5 * 250 = 1250 max connections
  batchSize: DEFAULT_CONFIG.batchSize,
  batchIntervalMs: DEFAULT_CONFIG.batchIntervalMs,
  priorityLevels: 3, // Allow message prioritization (0=highest, 2=lowest)
  reconnect: true,
  reconnectIntervalMs: 1000,
  maxReconnectAttempts: 5,
  metricsIntervalMs: DEFAULT_CONFIG.metricsIntervalMs,
  gcIntervalMs: 60000, // Run garbage collection check every minute
  connectionTimeout: 300000 // 5 minutes inactive timeout
});

// Create WebSocket server
const wss = new WebSocket.Server({ 
  server,
  // Advanced WebSocket settings for high concurrency
  perMessageDeflate: {
    zlibDeflateOptions: {
      // See zlib defaults.
      level: 6,
      memLevel: 8,
      strategy: 0
    },
    zlibInflateOptions: {
      chunkSize: 10 * 1024
    },
    // Below options specified as default values.
    clientNoContextTakeover: true, // Recommended for better performance
    serverNoContextTakeover: true, // Recommended for better performance
    serverMaxWindowBits: 10,
    // Below options are defaults.
    concurrencyLimit: 10, // Limits zlib concurrency for perf.
    threshold: 1024 // Size below which messages should not be compressed
  },
  maxPayload: 1024 * 1024 // 1MB max message size
});

// Performance tracking
const startTime = performance.now();

// Handle new connections
wss.on('connection', (ws: WebSocket, req: http.IncomingMessage) => {
  // Extract client information
  const ip = req.socket.remoteAddress || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';
  
  // Add connection to pool with metadata
  const connectionId = connectionPool.addConnection(ws, `client_${Date.now()}`, {
    ip,
    userAgent,
    path: req.url || '/'
  });
  
  // Send welcome message with client ID
  const welcomeMessage = {
    type: 'welcome', 
    connectionId,
    timestamp: Date.now(),
    message: 'Connected to Bell24H WebSocket Server (High Concurrency)',
    features: ['batched_messages', 'priority_queue', 'auto_reconnect']
  };
  
  // Queue with high priority (0)
  connectionPool.queueMessage(connectionId, welcomeMessage, 0);
  
  console.log(`Client connected: ${connectionId} - From: ${ip}`);
  
  // The connection pool handles all message processing, errors, and disconnections
});

// Start server
server.listen(DEFAULT_CONFIG.port, () => {
  console.log(`🚀 Bell24H WebSocket Server (High Concurrency) running on port ${DEFAULT_CONFIG.port}`);
  console.log(`- Max Connections: ${DEFAULT_CONFIG.maxConnections}`);
  console.log(`- Connection Shards: 5`);
  console.log(`- Batch Size: ${DEFAULT_CONFIG.batchSize}`);
  console.log(`- Batch Interval: ${DEFAULT_CONFIG.batchIntervalMs}ms`);
  console.log(`- Metrics Path: ${DEFAULT_CONFIG.metricsFilePath}`);
  console.log(`- Metrics Endpoint: http://localhost:${DEFAULT_CONFIG.port}/metrics`);
  console.log(`- Health Endpoint: http://localhost:${DEFAULT_CONFIG.port}/health`);
});

// Set up connection pool event listeners
connectionPool.on('message', ({ connectionId, message }) => {
  // Handle specific message types here if needed
  // The connection pool already handles most operations
  
  if (message.type === 'broadcast') {
    // Example of handling broadcasts
    const { payload, target } = message;
    
    if (target === 'all') {
      // Broadcast to all
      connectionPool.broadcast(payload);
    } else if (target === 'admins') {
      // Broadcast only to connections with admin tag
      connectionPool.broadcast(payload, (metadata) => metadata.tags.role === 'admin');
    }
  }
});

// Log metrics periodically
connectionPool.on('metrics', (metrics) => {
  // Log metrics or save to file
  try {
    const metricsDir = path.dirname(DEFAULT_CONFIG.metricsFilePath);
    
    if (!fs.existsSync(metricsDir)) {
      fs.mkdirSync(metricsDir, { recursive: true });
    }
    
    fs.writeFileSync(
      DEFAULT_CONFIG.metricsFilePath, 
      JSON.stringify({
        ...metrics,
        timestamp: new Date().toISOString()
      }, null, 2)
    );
  } catch (error) {
    console.error(`Error saving metrics: ${error instanceof Error ? error.message : String(error)}`);
  }
});

// Set up heartbeat interval to detect dead connections
const heartbeatInterval = setInterval(() => {
  const metrics = connectionPool.getMetrics();
  
  // Broadcast a ping to all connections
  connectionPool.broadcast(
    { type: 'ping', timestamp: Date.now() },
    (metadata) => metadata.isActive, // Only send to active connections
    0 // Highest priority
  );
  
  console.log(`Heartbeat sent to ${metrics.connectionCount} connections`);
}, DEFAULT_CONFIG.heartbeatIntervalMs);

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  
  // Clear intervals
  clearInterval(heartbeatInterval);
  
  // Shutdown connection pool
  connectionPool.shutdown();
  
  // Close server
  server.close(() => {
    console.log('Server shut down successfully');
    process.exit(0);
  });
});

export default server;
