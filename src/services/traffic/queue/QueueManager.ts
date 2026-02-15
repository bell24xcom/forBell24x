import { EventEmitter } from 'events';
import { QueueConfig, QueueItem } from '../types';

export class QueueManager extends EventEmitter {
  private config: QueueConfig;
  private queues: Map<string, QueueItem[]>;
  private processingQueues: Set<string>;
  private queueStats: Map<string, {
    totalItems: number;
    processedItems: number;
    failedItems: number;
    averageWaitTime: number;
    maxWaitTime: number;
  }>;

  constructor(config: QueueConfig) {
    super();
    this.config = config;
    this.queues = new Map();
    this.processingQueues = new Set();
    this.queueStats = new Map();
  }

  public async addToQueue(queueName: string, item: QueueItem, priority: number = 0): Promise<void> {
    // Initialize queue if it doesn't exist
    if (!this.queues.has(queueName)) {
      this.queues.set(queueName, []);
      this.initializeQueueStats(queueName);
    }

    const queue = this.queues.get(queueName)!;
    
    // Check queue length limit
    if (queue.length >= this.config.maxQueueLength) {
      this.emit('queue:overflow', { queueName, item });
      throw new Error(`Queue ${queueName} has reached maximum length`);
    }

    // Add item to queue with priority
    const queueItem: QueueItem = {
      ...item,
      priority,
      queueTime: new Date(),
      retryCount: 0
    };

    // Insert item based on priority
    const insertIndex = queue.findIndex(qi => qi.priority < priority);
    if (insertIndex === -1) {
      queue.push(queueItem);
    } else {
      queue.splice(insertIndex, 0, queueItem);
    }

    // Update queue stats
    this.updateQueueStats(queueName, 'add');

    // Emit event
    this.emit('item:queued', { queueName, item: queueItem });

    // Start processing if not already processing
    if (!this.processingQueues.has(queueName)) {
      this.processQueue(queueName);
    }
  }

  public async getNextFromQueue(queueName: string): Promise<QueueItem | null> {
    const queue = this.queues.get(queueName);
    if (!queue || queue.length === 0) {
      return null;
    }

    const item = queue.shift()!;
    
    // Update queue stats
    this.updateQueueStats(queueName, 'process');

    // Emit event
    this.emit('item:dequeued', { queueName, item });

    return item;
  }

  public async removeFromQueue(queueName: string, itemId: string): Promise<boolean> {
    const queue = this.queues.get(queueName);
    if (!queue) {
      return false;
    }

    const index = queue.findIndex(item => item.id === itemId);
    if (index === -1) {
      return false;
    }

    const [removedItem] = queue.splice(index, 1);
    
    // Update queue stats
    this.updateQueueStats(queueName, 'remove');

    // Emit event
    this.emit('item:removed', { queueName, item: removedItem });

    return true;
  }

  public async requeueItem(queueName: string, item: QueueItem): Promise<void> {
    // Check retry attempts
    if (item.retryCount >= this.config.retryAttempts) {
      this.emit('item:maxRetries', { queueName, item });
      throw new Error(`Maximum retry attempts reached for item ${item.id}`);
    }

    // Increment retry count and add delay
    const requeuedItem: QueueItem = {
      ...item,
      retryCount: item.retryCount + 1,
      queueTime: new Date(),
      priority: Math.max(0, item.priority - 1) // Lower priority on retry
    };

    // Add back to queue
    await this.addToQueue(queueName, requeuedItem);
  }

  public getQueueLength(queueName: string): number {
    return this.queues.get(queueName)?.length || 0;
  }

  public getQueueStats(queueName: string) {
    return this.queueStats.get(queueName);
  }

  public getAllQueueStats() {
    return Object.fromEntries(this.queueStats);
  }

  public clearQueue(queueName: string): void {
    const queue = this.queues.get(queueName);
    if (queue) {
      queue.length = 0;
      this.initializeQueueStats(queueName);
      this.emit('queue:cleared', { queueName });
    }
  }

  private async processQueue(queueName: string): Promise<void> {
    if (this.processingQueues.has(queueName)) {
      return;
    }

    this.processingQueues.add(queueName);

    try {
      while (true) {
        const item = await this.getNextFromQueue(queueName);
        if (!item) {
          break;
        }

        try {
          // Emit event for processing
          this.emit('item:processing', { queueName, item });

          // Process the item
          await this.processItem(queueName, item);

          // Update stats for successful processing
          this.updateQueueStats(queueName, 'success');
        } catch (error) {
          // Handle processing failure
          if (item.retryCount < this.config.retryAttempts) {
            await this.requeueItem(queueName, item);
          } else {
            this.updateQueueStats(queueName, 'failure');
            this.emit('item:failed', { queueName, item, error });
          }
        }
      }
    } finally {
      this.processingQueues.delete(queueName);
    }
  }

  private async processItem(queueName: string, item: QueueItem): Promise<void> {
    // Implement actual item processing logic here
    // This is a placeholder implementation
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  private initializeQueueStats(queueName: string): void {
    this.queueStats.set(queueName, {
      totalItems: 0,
      processedItems: 0,
      failedItems: 0,
      averageWaitTime: 0,
      maxWaitTime: 0
    });
  }

  private updateQueueStats(queueName: string, action: 'add' | 'process' | 'remove' | 'success' | 'failure'): void {
    const stats = this.queueStats.get(queueName);
    if (!stats) return;

    switch (action) {
      case 'add':
        stats.totalItems++;
        break;
      case 'process':
        stats.processedItems++;
        break;
      case 'remove':
        stats.totalItems--;
        break;
      case 'success':
        // Update wait time statistics
        const waitTime = Date.now() - stats.totalItems;
        stats.averageWaitTime = (stats.averageWaitTime * (stats.processedItems - 1) + waitTime) / stats.processedItems;
        stats.maxWaitTime = Math.max(stats.maxWaitTime, waitTime);
        break;
      case 'failure':
        stats.failedItems++;
        break;
    }

    this.queueStats.set(queueName, stats);
  }
} 