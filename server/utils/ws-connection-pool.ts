/**
 * Bell24H Advanced WebSocket Connection Pool
 * 
 * Features:
 * - Connection sharding for better memory management
 * - Efficient message batching and prioritization
 * - Auto-reconnection with exponential backoff
 * - Memory optimization for high concurrency (1000+ connections)
 * - Real-time performance monitoring
 */

import * as WebSocket from 'ws';
import { EventEmitter } from 'events';
import { performance } from 'perf_hooks';

// Types for the connection pool
export interface PoolOptions {
  // Number of shards to split connections across (for memory management)
  shards: number;
  
  // Maximum connections per shard
  maxConnectionsPerShard: number;
  
  // Batching configuration
  batchSize: number;
  batchIntervalMs: number;
  priorityLevels: number;
  
  // Reconnection configuration
  reconnect: boolean;
  reconnectIntervalMs: number;
  maxReconnectAttempts: number;
  
  // Performance monitoring
  metricsIntervalMs: number;
  
  // Memory management
  gcIntervalMs: number; // Garbage collection trigger interval
  connectionTimeout: number; // Timeout for inactive connections (ms)
}

// Default options
const DEFAULT_OPTIONS: PoolOptions = {
  shards: 5,
  maxConnectionsPerShard: 250, // 5 shards x 250 = 1250 max connections
  batchSize: 50,
  batchIntervalMs: 50,
  priorityLevels: 3,
  reconnect: true,
  reconnectIntervalMs: 1000,
  maxReconnectAttempts: 10,
  metricsIntervalMs: 5000,
  gcIntervalMs: 30000,
  connectionTimeout: 300000 // 5 minutes
};

// Connection metadata
export interface ConnectionMetadata {
  id: string;
  clientId: string;
  createdAt: number;
  lastActivity: number;
  messagesSent: number;
  messagesReceived: number;
  errors: number;
  reconnectAttempts: number;
  isActive: boolean;
  tags: Record<string, string>;
}

// Pending message with priority
export interface PendingMessage {
  message: any;
  priority: number; // 0 = highest, increasing = lower
  timestamp: number;
  attempts: number;
}

// Pool metrics
export interface PoolMetrics {
  connectionCount: number;
  shardDistribution: number[];
  messagesQueued: number;
  messagesSent: number;
  messagesReceived: number;
  errors: number;
  latencyMs: {
    avg: number;
    min: number;
    max: number;
    p95: number;
  };
  memoryUsageMB: number;
  startTime: number;
  uptime: number;
}

/**
 * WebSocket Connection Pool for high concurrency applications
 */
export class WebSocketConnectionPool extends EventEmitter {
  private options: PoolOptions;
  private shards: Map<WebSocket, ConnectionMetadata>[];
  private pendingMessages: Map<string, PendingMessage[]>;
  private metrics: PoolMetrics;
  private batchInterval: NodeJS.Timeout | null = null;
  private metricsInterval: NodeJS.Timeout | null = null;
  private gcInterval: NodeJS.Timeout | null = null;
  private latencySamples: number[] = [];
  
  constructor(options: Partial<PoolOptions> = {}) {
    super();
    this.options = { ...DEFAULT_OPTIONS, ...options };
    
    // Initialize shards
    this.shards = Array(this.options.shards).fill(null).map(() => new Map());
    
    // Initialize pending messages
    this.pendingMessages = new Map();
    
    // Initialize metrics
    this.metrics = {
      connectionCount: 0,
      shardDistribution: Array(this.options.shards).fill(0),
      messagesQueued: 0,
      messagesSent: 0,
      messagesReceived: 0,
      errors: 0,
      latencyMs: {
        avg: 0,
        min: Number.MAX_VALUE,
        max: 0,
        p95: 0
      },
      memoryUsageMB: 0,
      startTime: performance.now(),
      uptime: 0
    };
    
    // Start periodic tasks
    this.startBatchProcessing();
    this.startMetricsCollection();
    this.startMemoryManagement();
  }
  
  /**
   * Add a WebSocket connection to the pool
   */
  public addConnection(
    ws: WebSocket, 
    clientId: string, 
    tags: Record<string, string> = {}
  ): string {
    // Generate unique ID
    const id = `conn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Create metadata
    const metadata: ConnectionMetadata = {
      id,
      clientId,
      createdAt: Date.now(),
      lastActivity: Date.now(),
      messagesSent: 0,
      messagesReceived: 0,
      errors: 0,
      reconnectAttempts: 0,
      isActive: true,
      tags
    };
    
    // Find optimal shard (least loaded)
    const shardIndex = this.findOptimalShard();
    if (shardIndex === -1) {
      throw new Error('Connection pool is full');
    }
    
    // Add to shard
    this.shards[shardIndex].set(ws, metadata);
    
    // Initialize pending messages queue
    this.pendingMessages.set(id, []);
    
    // Update metrics
    this.metrics.connectionCount++;
    this.metrics.shardDistribution[shardIndex]++;
    
    // Set up event handlers
    this.setupEventHandlers(ws, metadata);
    
    // Emit event
    this.emit('connection', { id, clientId, shardIndex });
    
    return id;
  }
  
  /**
   * Queue a message to be sent to a connection
   */
  public queueMessage(
    connectionId: string, 
    message: any, 
    priority: number = 1
  ): boolean {
    // Find connection
    const pendingMessages = this.pendingMessages.get(connectionId);
    if (!pendingMessages) {
      return false;
    }
    
    // Add message to queue
    pendingMessages.push({
      message,
      priority: Math.min(Math.max(0, priority), this.options.priorityLevels - 1),
      timestamp: Date.now(),
      attempts: 0
    });
    
    // Update metrics
    this.metrics.messagesQueued++;
    
    return true;
  }
  
  /**
   * Broadcast a message to all connections or a filtered subset
   */
  public broadcast(
    message: any, 
    filter?: (metadata: ConnectionMetadata) => boolean,
    priority: number = 1
  ): number {
    let count = 0;
    
    // For each shard
    for (const shard of this.shards) {
      // For each connection in shard
      for (const [ws, metadata] of shard.entries()) {
        // Apply filter if provided
        if (filter && !filter(metadata)) {
          continue;
        }
        
        // Queue message
        this.queueMessage(metadata.id, message, priority);
        count++;
      }
    }
    
    return count;
  }
  
  /**
   * Get connection metadata by ID
   */
  public getConnection(connectionId: string): ConnectionMetadata | null {
    // Search through all shards
    for (const shard of this.shards) {
      for (const metadata of shard.values()) {
        if (metadata.id === connectionId) {
          return { ...metadata }; // Return a copy
        }
      }
    }
    
    return null;
  }
  
  /**
   * Close a specific connection
   */
  public closeConnection(connectionId: string, code?: number, reason?: string): boolean {
    // Find connection
    for (let i = 0; i < this.shards.length; i++) {
      const shard = this.shards[i];
      
      for (const [ws, metadata] of shard.entries()) {
        if (metadata.id === connectionId) {
          // Close connection
          try {
            ws.close(code, reason);
          } catch (error) {
            this.metrics.errors++;
          }
          
          // Remove from shard
          shard.delete(ws);
          
          // Remove pending messages
          this.pendingMessages.delete(connectionId);
          
          // Update metrics
          this.metrics.connectionCount--;
          this.metrics.shardDistribution[i]--;
          
          // Emit event
          this.emit('close', { id: connectionId, code, reason });
          
          return true;
        }
      }
    }
    
    return false;
  }
  
  /**
   * Get current metrics
   */
  public getMetrics(): PoolMetrics {
    // Calculate uptime
    this.metrics.uptime = (performance.now() - this.metrics.startTime) / 1000;
    
    // Get current memory usage
    const memoryUsage = process.memoryUsage();
    this.metrics.memoryUsageMB = Math.round(memoryUsage.heapUsed / 1048576 * 100) / 100;
    
    return { ...this.metrics };
  }
  
  /**
   * Close all connections and clean up
   */
  public shutdown(): void {
    // Stop intervals
    if (this.batchInterval) {
      clearInterval(this.batchInterval);
      this.batchInterval = null;
    }
    
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = null;
    }
    
    if (this.gcInterval) {
      clearInterval(this.gcInterval);
      this.gcInterval = null;
    }
    
    // Close all connections
    for (const shard of this.shards) {
      for (const [ws, metadata] of shard.entries()) {
        try {
          ws.close(1001, 'Server shutting down');
        } catch (error) {
          // Ignore errors during shutdown
        }
      }
      
      // Clear shard
      shard.clear();
    }
    
    // Clear pending messages
    this.pendingMessages.clear();
    
    // Reset metrics
    this.metrics.connectionCount = 0;
    this.metrics.shardDistribution = Array(this.options.shards).fill(0);
    
    // Emit event
    this.emit('shutdown');
  }
  
  /**
   * Find the optimal shard for a new connection
   */
  private findOptimalShard(): number {
    // Find least loaded shard
    let minLoad = Number.MAX_VALUE;
    let optimalShard = -1;
    
    for (let i = 0; i < this.shards.length; i++) {
      const load = this.shards[i].size;
      
      if (load < minLoad && load < this.options.maxConnectionsPerShard) {
        minLoad = load;
        optimalShard = i;
      }
    }
    
    return optimalShard;
  }
  
  /**
   * Set up event handlers for a connection
   */
  private setupEventHandlers(ws: WebSocket, metadata: ConnectionMetadata): void {
    // Message handler
    ws.on('message', (data: WebSocket.Data) => {
      const startTime = performance.now();
      
      try {
        // Parse message if it's a string
        let message: any;
        
        if (typeof data === 'string') {
          message = JSON.parse(data);
        } else if (data instanceof Buffer) {
          message = JSON.parse(data.toString());
        } else {
          message = data;
        }
        
        // Update connection metadata
        metadata.lastActivity = Date.now();
        metadata.messagesReceived++;
        
        // Update pool metrics
        this.metrics.messagesReceived++;
        
        // Emit message event
        this.emit('message', { connectionId: metadata.id, message });
        
        // Special handling for ping messages (immediate response)
        if (message.type === 'ping') {
          const pongMessage = {
            type: 'pong',
            timestamp: Date.now(),
            pingTimestamp: message.timestamp
          };
          
          ws.send(JSON.stringify(pongMessage));
          metadata.messagesSent++;
          this.metrics.messagesSent++;
          
          // Calculate latency if timestamp is provided
          if (message.timestamp) {
            const latency = Date.now() - message.timestamp;
            this.updateLatencyMetrics(latency);
          }
        }
      } catch (error) {
        // Update error metrics
        metadata.errors++;
        this.metrics.errors++;
        
        // Emit error event
        this.emit('error', { 
          connectionId: metadata.id, 
          error: error instanceof Error ? error.message : String(error)
        });
      }
      
      // Calculate processing time
      const processingTime = performance.now() - startTime;
      this.updateLatencyMetrics(processingTime);
    });
    
    // Close handler
    ws.on('close', () => {
      // Find this connection's shard
      let shardIndex = -1;
      let foundInShard = false;
      
      for (let i = 0; i < this.shards.length; i++) {
        if (this.shards[i].has(ws)) {
          shardIndex = i;
          foundInShard = true;
          break;
        }
      }
      
      if (foundInShard && shardIndex !== -1) {
        // Remove from shard
        this.shards[shardIndex].delete(ws);
        
        // Update metrics
        this.metrics.connectionCount--;
        this.metrics.shardDistribution[shardIndex]--;
        
        // Attempt reconnection if enabled
        if (this.options.reconnect && metadata.reconnectAttempts < this.options.maxReconnectAttempts) {
          // Mark as inactive
          metadata.isActive = false;
          
          // Schedule reconnection attempt with exponential backoff
          const backoff = Math.min(
            this.options.reconnectIntervalMs * Math.pow(2, metadata.reconnectAttempts),
            30000 // Max 30 seconds
          );
          
          setTimeout(() => {
            this.emit('reconnect_attempt', { 
              connectionId: metadata.id, 
              attempt: metadata.reconnectAttempts + 1 
            });
          }, backoff);
          
          metadata.reconnectAttempts++;
        } else {
          // No reconnection, clean up
          this.pendingMessages.delete(metadata.id);
          
          // Emit event
          this.emit('close', { 
            connectionId: metadata.id, 
            reconnectAttempts: metadata.reconnectAttempts 
          });
        }
      }
    });
    
    // Error handler
    ws.on('error', (error) => {
      // Update metrics
      metadata.errors++;
      this.metrics.errors++;
      
      // Emit event
      this.emit('error', { 
        connectionId: metadata.id, 
        error: error.message 
      });
    });
  }
  
  /**
   * Process message batches
   */
  private startBatchProcessing(): void {
    this.batchInterval = setInterval(() => {
      // Process each connection's pending messages
      for (const [connectionId, messages] of this.pendingMessages.entries()) {
        if (messages.length === 0) continue;
        
        // Find the connection
        let ws: WebSocket | null = null;
        let metadata: ConnectionMetadata | null = null;
        
        // Search through all shards
        shardLoop: for (const shard of this.shards) {
          for (const [socket, meta] of shard.entries()) {
            if (meta.id === connectionId) {
              ws = socket;
              metadata = meta;
              break shardLoop;
            }
          }
        }
        
        // Skip if connection not found or not open
        if (!ws || !metadata || ws.readyState !== WebSocket.OPEN) {
          continue;
        }
        
        // Sort messages by priority (lower number = higher priority)
        messages.sort((a, b) => {
          // First by priority
          const priorityDiff = a.priority - b.priority;
          if (priorityDiff !== 0) return priorityDiff;
          
          // Then by timestamp (older first)
          return a.timestamp - b.timestamp;
        });
        
        // Take batch
        const batch = messages.splice(0, this.options.batchSize);
        
        // Send batch
        try {
          // Prepare batch message
          const batchMessage = {
            type: 'batch',
            messages: batch.map(item => item.message),
            timestamp: Date.now(),
            count: batch.length
          };
          
          // Send as JSON
          ws.send(JSON.stringify(batchMessage));
          
          // Update metrics
          metadata.messagesSent += batch.length;
          this.metrics.messagesSent += batch.length;
          metadata.lastActivity = Date.now();
        } catch (error) {
          // Update error metrics
          metadata.errors++;
          this.metrics.errors++;
          
          // Emit error event
          this.emit('error', { 
            connectionId: metadata.id, 
            error: error instanceof Error ? error.message : String(error),
            context: 'batch_send'
          });
          
          // Put failed messages back in queue with increased attempt count
          for (const item of batch) {
            if (item.attempts < 3) { // Retry up to 3 times
              item.attempts++;
              messages.push(item);
            }
          }
        }
      }
    }, this.options.batchIntervalMs);
  }
  
  /**
   * Collect metrics about the connection pool
   */
  private startMetricsCollection(): void {
    this.metricsInterval = setInterval(() => {
      // Update latency metrics
      if (this.latencySamples.length > 0) {
        // Sort samples for percentile calculation
        this.latencySamples.sort((a, b) => a - b);
        
        // Calculate p95
        const p95Index = Math.floor(this.latencySamples.length * 0.95);
        this.metrics.latencyMs.p95 = this.latencySamples[p95Index] || 0;
        
        // Clear samples to avoid excessive memory usage
        this.latencySamples = [];
      }
      
      // Emit metrics event
      this.emit('metrics', this.getMetrics());
    }, this.options.metricsIntervalMs);
  }
  
  /**
   * Periodic memory management and garbage collection
   */
  private startMemoryManagement(): void {
    this.gcInterval = setInterval(() => {
      const now = Date.now();
      let inactiveConnections = 0;
      
      // Check for inactive connections
      for (let i = 0; i < this.shards.length; i++) {
        const shard = this.shards[i];
        
        for (const [ws, metadata] of shard.entries()) {
          // Check if connection is inactive
          if (now - metadata.lastActivity > this.options.connectionTimeout) {
            // Close connection
            try {
              ws.close(1000, 'Connection timeout');
            } catch (error) {
              // Ignore errors
            }
            
            // Remove from shard
            shard.delete(ws);
            
            // Remove pending messages
            this.pendingMessages.delete(metadata.id);
            
            // Update metrics
            this.metrics.connectionCount--;
            this.metrics.shardDistribution[i]--;
            
            inactiveConnections++;
          }
        }
      }
      
      // Log if connections were cleaned up
      if (inactiveConnections > 0) {
        this.emit('cleanup', { 
          inactiveConnections,
          threshold: this.options.connectionTimeout
        });
      }
      
      // Suggest garbage collection if memory usage is high
      const memoryUsage = process.memoryUsage();
      const heapUsedMB = memoryUsage.heapUsed / 1048576;
      
      if (heapUsedMB > 500) { // If using more than 500MB
        // Force garbage collection if available
        if (global.gc) {
          global.gc();
          this.emit('gc', { before: heapUsedMB });
        }
      }
    }, this.options.gcIntervalMs);
  }
  
  /**
   * Update latency metrics
   */
  private updateLatencyMetrics(latencyMs: number): void {
    // Add to samples for percentile calculation
    this.latencySamples.push(latencyMs);
    
    // Keep sample size reasonable
    if (this.latencySamples.length > 10000) {
      this.latencySamples = this.latencySamples.slice(5000);
    }
    
    // Update min/max
    this.metrics.latencyMs.min = Math.min(this.metrics.latencyMs.min, latencyMs);
    this.metrics.latencyMs.max = Math.max(this.metrics.latencyMs.max, latencyMs);
    
    // Update running average
    const { avg } = this.metrics.latencyMs;
    this.metrics.latencyMs.avg = avg * 0.95 + latencyMs * 0.05; // Exponential moving average
  }
}

export default WebSocketConnectionPool;
