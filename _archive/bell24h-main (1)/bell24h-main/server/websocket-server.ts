/**
 * Bell24H Optimized WebSocket Server
 * Features:
 * - Connection pooling
 * - Batched message handling
 * - Auto-reconnection
 * - Performance metrics
 */

import * as WebSocket from 'ws';
import * as http from 'http';
import { performance } from 'perf_hooks';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

// Configuration
interface ServerConfig {
  port: number;
  maxConnections: number;
  batchSize: number;
  batchIntervalMs: number;
  metricsIntervalMs: number;
  metricsFilePath: string;
}

// Connection pool management
interface ConnectionPool {
  activeConnections: Map<string, WebSocket>;
  pendingMessages: Map<string, any[]>;
  metrics: ServerMetrics;
}

// Metrics tracking
interface ServerMetrics {
  connectionsTotal: number;
  connectionsActive: number;
  messagesSent: number;
  messagesReceived: number;
  batchesSent: number;
  errors: number;
  latencyMs: {
    avg: number;
    min: number;
    max: number;
    samples: number[];
  };
  startTime: number;
}

// Default configuration
const DEFAULT_CONFIG: ServerConfig = {
  port: 8080,
  maxConnections: 1000,
  batchSize: 50,
  batchIntervalMs: 50,  // 50ms batching interval
  metricsIntervalMs: 5000,  // 5 seconds
  metricsFilePath: path.join(process.cwd(), 'metrics', 'websocket-metrics.json')
};

// Initialize connection pool
const pool: ConnectionPool = {
  activeConnections: new Map(),
  pendingMessages: new Map(),
  metrics: {
    connectionsTotal: 0,
    connectionsActive: 0,
    messagesSent: 0,
    messagesReceived: 0,
    batchesSent: 0,
    errors: 0,
    latencyMs: {
      avg: 0,
      min: Number.MAX_VALUE,
      max: 0,
      samples: []
    },
    startTime: performance.now()
  }
};

// Ensure metrics directory exists
const ensureMetricsDirectory = async (): Promise<void> => {
  const dir = path.dirname(DEFAULT_CONFIG.metricsFilePath);
  try {
    await promisify(fs.mkdir)(dir, { recursive: true });
  } catch (error) {
    console.error(`Error creating metrics directory: ${error instanceof Error ? error.message : String(error)}`);
  }
};

// Save metrics to disk
const saveMetrics = async (): Promise<void> => {
  try {
    await ensureMetricsDirectory();
    await promisify(fs.writeFile)(
      DEFAULT_CONFIG.metricsFilePath,
      JSON.stringify({
        ...pool.metrics,
        uptime: (performance.now() - pool.metrics.startTime) / 1000,
        timestamp: new Date().toISOString()
      }, null, 2)
    );
  } catch (error) {
    console.error(`Error saving metrics: ${error instanceof Error ? error.message : String(error)}`);
  }
};

// Update latency metrics
const updateLatencyMetrics = (latencyMs: number): void => {
  const { latencyMs: metrics } = pool.metrics;
  
  // Add to samples (keep last 1000 samples)
  metrics.samples.push(latencyMs);
  if (metrics.samples.length > 1000) {
    metrics.samples.shift();
  }
  
  // Update min/max
  metrics.min = Math.min(metrics.min, latencyMs);
  metrics.max = Math.max(metrics.max, latencyMs);
  
  // Update average
  metrics.avg = metrics.samples.reduce((sum, val) => sum + val, 0) / metrics.samples.length;
};

// Process message batches
const processBatches = (): void => {
  // For each connection with pending messages
  for (const [clientId, messages] of pool.pendingMessages.entries()) {
    if (messages.length === 0) continue;
    
    const connection = pool.activeConnections.get(clientId);
    if (!connection || connection.readyState !== WebSocket.OPEN) {
      // Connection no longer active
      pool.pendingMessages.delete(clientId);
      continue;
    }
    
    // Send messages in batches
    const batches = [];
    for (let i = 0; i < messages.length; i += DEFAULT_CONFIG.batchSize) {
      batches.push(messages.slice(i, i + DEFAULT_CONFIG.batchSize));
    }
    
    // Send each batch
    for (const batch of batches) {
      try {
        const batchJson = JSON.stringify({ 
          type: 'batch', 
          messages: batch,
          timestamp: Date.now() 
        });
        connection.send(batchJson);
        pool.metrics.messagesSent += batch.length;
        pool.metrics.batchesSent++;
      } catch (error) {
        pool.metrics.errors++;
        console.error(`Error sending batch to ${clientId}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    // Clear the pending messages
    pool.pendingMessages.set(clientId, []);
  }
};

// Create HTTP server
const server = http.createServer((req, res) => {
  if (req.url === '/metrics') {
    // Return metrics endpoint
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      ...pool.metrics,
      uptime: (performance.now() - pool.metrics.startTime) / 1000,
      timestamp: new Date().toISOString()
    }));
  } else {
    // Default response for other endpoints
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bell24H WebSocket Server');
  }
});

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Handle new connections
wss.on('connection', (ws: WebSocket, req: http.IncomingMessage) => {
  // Generate unique client ID
  const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Update metrics
  pool.metrics.connectionsTotal++;
  pool.metrics.connectionsActive++;
  
  // Add to connection pool
  pool.activeConnections.set(clientId, ws);
  pool.pendingMessages.set(clientId, []);
  
  // Send welcome message with client ID
  ws.send(JSON.stringify({ 
    type: 'welcome', 
    clientId,
    timestamp: Date.now(),
    message: 'Connected to Bell24H WebSocket Server'
  }));
  
  console.log(`Client connected: ${clientId} - Current active: ${pool.metrics.connectionsActive}`);
  
  // Notification service import
import { sendWhatsAppMessage } from './services/notificationService';

// Handle incoming messages
  ws.on('message', (message: WebSocket.Data) => {
    const startTime = performance.now();
    
    try {
      // Parse message
      const parsedMessage = typeof message === 'string' 
        ? JSON.parse(message)
        : message instanceof Buffer 
          ? JSON.parse(message.toString())
          : message;
      
      // Handle ping messages with immediate pong response
      if (parsedMessage.type === 'ping') {
        ws.send(JSON.stringify({ 
          type: 'pong', 
          timestamp: Date.now(),
          pingTimestamp: parsedMessage.timestamp
        }));
        
        // Calculate latency
        if (parsedMessage.timestamp) {
          const latency = Date.now() - parsedMessage.timestamp;
          updateLatencyMetrics(latency);
        }
      } 
      // Handle RFQ response notification
      else if (parsedMessage.type === 'rfq-response') {
        // WhatsApp notification (replace with actual user number)
        sendWhatsAppMessage('+1234567890', parsedMessage.message);
        // In-app notification emission
        ws.send(JSON.stringify({ type: 'notification', notificationType: 'rfq-response', message: parsedMessage.message }));
      }
      // Add to processing queue for other messages
      else {
        const messages = pool.pendingMessages.get(clientId) || [];
        messages.push(parsedMessage);
        pool.pendingMessages.set(clientId, messages);
      }
      
      pool.metrics.messagesReceived++;
    } catch (error) {
      pool.metrics.errors++;
      console.error(`Error processing message: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    // Measure processing time
    const processingTime = performance.now() - startTime;
    updateLatencyMetrics(processingTime);
  });
  
  // Handle connection close
  ws.on('close', () => {
    pool.activeConnections.delete(clientId);
    pool.pendingMessages.delete(clientId);
    pool.metrics.connectionsActive--;
    console.log(`Client disconnected: ${clientId} - Current active: ${pool.metrics.connectionsActive}`);
  });
  
  // Handle errors
  ws.on('error', (error) => {
    pool.metrics.errors++;
    console.error(`Error with client ${clientId}: ${error.message}`);
  });
});

// Start batch processing interval
setInterval(processBatches, DEFAULT_CONFIG.batchIntervalMs);

// Start metrics recording interval
setInterval(async () => {
  await saveMetrics();
}, DEFAULT_CONFIG.metricsIntervalMs);

// Start server
server.listen(DEFAULT_CONFIG.port, () => {
  console.log(`Bell24H WebSocket Server running on port ${DEFAULT_CONFIG.port}`);
  console.log(`- Max Connections: ${DEFAULT_CONFIG.maxConnections}`);
  console.log(`- Batch Size: ${DEFAULT_CONFIG.batchSize}`);
  console.log(`- Batch Interval: ${DEFAULT_CONFIG.batchIntervalMs}ms`);
  console.log(`- Metrics Path: ${DEFAULT_CONFIG.metricsFilePath}`);
  console.log(`- Metrics Endpoint: http://localhost:${DEFAULT_CONFIG.port}/metrics`);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  
  // Save final metrics
  await saveMetrics();
  
  // Close all connections
  for (const ws of pool.activeConnections.values()) {
    ws.close();
  }
  
  // Close server
  server.close(() => {
    console.log('Server shut down successfully');
    process.exit(0);
  });
});
