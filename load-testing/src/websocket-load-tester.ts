import { 
  TestConfig, 
  TestResults, 
  TestError, 
  WebSocketMetrics,
  TestStep 
} from './types';

export class WebSocketLoadTester {
  private connections: Map<string, WebSocket> = new Map();
  private metrics: WebSocketMetrics;
  private errors: TestError[] = [];
  private messageQueue: Map<string, any[]> = new Map();
  private connectionPool: WebSocket[] = [];
  private maxConnections: number = 1000;
  private reconnectAttempts: Map<string, number> = new Map();
  private maxReconnectAttempts: number = 3;

  constructor() {
    this.initializeMetrics();
  }

  private initializeMetrics(): void {
    this.metrics = {
      connections: 0,
      messagesSent: 0,
      messagesReceived: 0,
      connectionErrors: 0,
      avgMessageLatency: 0
    };
  }

  public async runWebSocketTest(config: TestConfig): Promise<{
    metrics: WebSocketMetrics;
    errors: TestError[];
    summary: string;
  }> {
    console.log('🔌 Starting WebSocket load test...');
    console.log(`📊 Target: ${config.maxUsers} WebSocket connections`);

    try {
      // Create connection pool
      await this.createConnectionPool(config.maxUsers);
      
      // Execute WebSocket scenarios
      await this.executeWebSocketScenarios(config);
      
      // Collect final metrics
      const finalMetrics = this.collectMetrics();
      const summary = this.generateSummary();

      console.log('✅ WebSocket load test completed');
      return {
        metrics: finalMetrics,
        errors: this.errors,
        summary
      };

    } catch (error) {
      console.error('❌ WebSocket load test failed:', error);
      throw new Error(`WebSocket test execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      // Cleanup connections
      this.cleanupConnections();
    }
  }

  private async createConnectionPool(targetConnections: number): Promise<void> {
    const batchSize = Math.min(50, targetConnections);
    const batches = Math.ceil(targetConnections / batchSize);

    console.log(`🔗 Creating ${targetConnections} WebSocket connections in ${batches} batches...`);

    for (let batch = 0; batch < batches; batch++) {
      const currentBatchSize = Math.min(batchSize, targetConnections - batch * batchSize);
      
      const promises = Array.from({ length: currentBatchSize }, (_, index) => {
        const connectionId = `ws_${batch}_${index}`;
        return this.createConnection(connectionId);
      });

      await Promise.allSettled(promises);
      
      // Add delay between batches to prevent overwhelming
      if (batch < batches - 1) {
        await this.delay(100);
      }
    }

    console.log(`✅ Created ${this.connections.size} WebSocket connections`);
  }

  private async createConnection(connectionId: string): Promise<void> {
    try {
      // Simulate WebSocket connection (in real implementation, this would connect to actual WebSocket server)
      const mockWebSocket = this.createMockWebSocket(connectionId);
      
      this.connections.set(connectionId, mockWebSocket);
      this.metrics.connections++;
      this.messageQueue.set(connectionId, []);

      // Simulate connection establishment
      await this.delay(Math.random() * 100);
      
      // Trigger onopen event
      if (mockWebSocket.onopen) {
        mockWebSocket.onopen(new Event('open'));
      }

    } catch (error) {
      this.recordError('websocket', `Failed to create connection ${connectionId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      this.metrics.connectionErrors++;
    }
  }

  private createMockWebSocket(connectionId: string): WebSocket {
    const mockWebSocket = {
      readyState: 1, // OPEN
      url: `ws://localhost:3000/ws/${connectionId}`,
      protocol: 'websocket',
      extensions: '',
      bufferedAmount: 0,
      onopen: null as ((event: Event) => void) | null,
      onclose: null as ((event: CloseEvent) => void) | null,
      onmessage: null as ((event: MessageEvent) => void) | null,
      onerror: null as ((event: Event) => void) | null,
      
      send: (data: string | ArrayBufferLike | Blob | ArrayBufferView) => {
        this.metrics.messagesSent++;
        console.log(`📤 [${connectionId}] Sent: ${typeof data === 'string' ? data : 'binary data'}`);
        
        // Simulate message processing delay
        setTimeout(() => {
          if (mockWebSocket.onmessage) {
            const response = this.generateMockResponse(data);
            mockWebSocket.onmessage(new MessageEvent('message', { data: response }));
            this.metrics.messagesReceived++;
          }
        }, Math.random() * 50 + 10);
      },
      
      close: (code?: number, reason?: string) => {
        mockWebSocket.readyState = 3; // CLOSED
        if (mockWebSocket.onclose) {
          mockWebSocket.onclose(new CloseEvent('close', { code: code || 1000, reason: reason || 'Normal closure' }));
        }
        this.connections.delete(connectionId);
        this.metrics.connections--;
      }
    } as WebSocket;

    return mockWebSocket;
  }

  private generateMockResponse(data: string | ArrayBufferLike | Blob | ArrayBufferView): string {
    const input = typeof data === 'string' ? data : 'binary_data';
    
    // Generate appropriate response based on input
    if (input.includes('ping')) {
      return JSON.stringify({ type: 'pong', timestamp: Date.now() });
    } else if (input.includes('echo')) {
      return JSON.stringify({ type: 'echo', data: input, timestamp: Date.now() });
    } else if (input.includes('subscribe')) {
      return JSON.stringify({ type: 'subscribed', channel: 'test-channel', timestamp: Date.now() });
    } else {
      return JSON.stringify({ type: 'ack', message: 'Message received', timestamp: Date.now() });
    }
  }

  private async executeWebSocketScenarios(config: TestConfig): Promise<void> {
    const websocketScenarios = config.scenarios.filter(scenario => 
      scenario.flow.some(step => step.type === 'websocket')
    );

    if (websocketScenarios.length === 0) {
      console.log('⚠️ No WebSocket scenarios found, sending default messages...');
      await this.sendDefaultMessages();
      return;
    }

    for (const scenario of websocketScenarios) {
      console.log(`📋 Executing WebSocket scenario: ${scenario.name}`);
      await this.executeWebSocketScenario(scenario);
    }
  }

  private async executeWebSocketScenario(scenario: any): Promise<void> {
    const websocketSteps = scenario.flow.filter((step: TestStep) => step.type === 'websocket');
    
    for (const step of websocketSteps) {
      await this.executeWebSocketStep(step);
      
      // Add think time between steps
      if (step.think) {
        await this.delay(step.think);
      }
    }
  }

  private async executeWebSocketStep(step: TestStep): Promise<void> {
    if (!step.websocket) return;

    const startTime = Date.now();

    try {
      switch (step.websocket.action) {
        case 'send':
          await this.sendMessageToAll(step.websocket.message);
          break;
        case 'connect':
          // Connections already created in pool
          break;
        case 'close':
          await this.closeAllConnections();
          break;
        default:
          console.warn(`⚠️ Unknown WebSocket action: ${step.websocket.action}`);
      }

      // Wait for response if specified
      if (step.websocket.waitFor) {
        await this.waitForMessage(step.websocket.waitFor);
      }

      const responseTime = Date.now() - startTime;
      this.updateMessageLatency(responseTime);

    } catch (error) {
      this.recordError('websocket', `WebSocket step failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async sendMessageToAll(message: any): Promise<void> {
    const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
    const promises: Promise<void>[] = [];

    for (const [connectionId, ws] of this.connections) {
      if (ws.readyState === 1) { // OPEN
        promises.push(
          new Promise<void>((resolve) => {
            try {
              ws.send(messageStr);
              resolve();
            } catch (error) {
              this.recordError('websocket', `Failed to send message to ${connectionId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
              resolve();
            }
          })
        );
      }
    }

    await Promise.allSettled(promises);
    console.log(`📤 Sent message to ${promises.length} connections`);
  }

  private async closeAllConnections(): Promise<void> {
    const promises: Promise<void>[] = [];

    for (const [connectionId, ws] of this.connections) {
      promises.push(
        new Promise<void>((resolve) => {
          try {
            ws.close(1000, 'Test completed');
            resolve();
          } catch (error) {
            this.recordError('websocket', `Failed to close connection ${connectionId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            resolve();
          }
        })
      );
    }

    await Promise.allSettled(promises);
    console.log(`🔌 Closed ${promises.length} connections`);
  }

  private async waitForMessage(expectedType: string): Promise<void> {
    const timeout = 5000; // 5 second timeout
    const startTime = Date.now();

    return new Promise((resolve, reject) => {
      const checkMessages = () => {
        // Check if we received the expected message type
        const receivedMessages = Array.from(this.messageQueue.values()).flat();
        const hasExpectedMessage = receivedMessages.some(msg => 
          typeof msg === 'string' && msg.includes(expectedType)
        );

        if (hasExpectedMessage) {
          resolve();
        } else if (Date.now() - startTime > timeout) {
          reject(new Error(`Timeout waiting for message type: ${expectedType}`));
        } else {
          setTimeout(checkMessages, 100);
        }
      };

      checkMessages();
    });
  }

  private async sendDefaultMessages(): Promise<void> {
    const defaultMessages = [
      { type: 'ping', data: 'ping' },
      { type: 'echo', data: 'Hello WebSocket!' },
      { type: 'subscribe', data: { channel: 'test-channel' } },
      { type: 'broadcast', data: { message: 'Test broadcast' } }
    ];

    for (const message of defaultMessages) {
      await this.sendMessageToAll(message);
      await this.delay(1000); // Wait 1 second between messages
    }
  }

  private updateMessageLatency(latency: number): void {
    const totalMessages = this.metrics.messagesSent + this.metrics.messagesReceived;
    if (totalMessages > 0) {
      this.metrics.avgMessageLatency = 
        (this.metrics.avgMessageLatency * (totalMessages - 1) + latency) / totalMessages;
    }
  }

  private recordError(type: string, message: string): void {
    this.errors.push({
      timestamp: new Date(),
      type: type as any,
      message,
      context: { connections: this.metrics.connections }
    });
  }

  private collectMetrics(): WebSocketMetrics {
    // Calculate final metrics
    const activeConnections = Array.from(this.connections.values())
      .filter(ws => ws.readyState === 1).length;

    return {
      ...this.metrics,
      connections: activeConnections
    };
  }

  private generateSummary(): string {
    const successRate = this.metrics.messagesSent > 0 
      ? ((this.metrics.messagesSent - this.errors.length) / this.metrics.messagesSent) * 100 
      : 0;

    const summary = [
      `WebSocket Load Test Summary:`,
      `- Active Connections: ${this.metrics.connections}`,
      `- Messages Sent: ${this.metrics.messagesSent}`,
      `- Messages Received: ${this.metrics.messagesReceived}`,
      `- Connection Errors: ${this.metrics.connectionErrors}`,
      `- Average Message Latency: ${this.metrics.avgMessageLatency.toFixed(2)}ms`,
      `- Success Rate: ${successRate.toFixed(2)}%`,
      `- Total Errors: ${this.errors.length}`
    ].join('\n');

    return summary;
  }

  private cleanupConnections(): void {
    console.log('🧹 Cleaning up WebSocket connections...');
    
    for (const [connectionId, ws] of this.connections) {
      try {
        if (ws.readyState === 1) {
          ws.close(1000, 'Test cleanup');
        }
      } catch (error) {
        console.warn(`Failed to close connection ${connectionId}:`, error);
      }
    }

    this.connections.clear();
    this.messageQueue.clear();
    this.reconnectAttempts.clear();
    
    console.log('✅ WebSocket connections cleaned up');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public getConnectionCount(): number {
    return this.connections.size;
  }

  public getActiveConnections(): number {
    return Array.from(this.connections.values())
      .filter(ws => ws.readyState === 1).length;
  }

  public getMetrics(): WebSocketMetrics {
    return { ...this.metrics };
  }

  public getErrors(): TestError[] {
    return [...this.errors];
  }

  public exportResults(format: 'json' | 'csv' = 'json'): string {
    const results = {
      timestamp: new Date().toISOString(),
      metrics: this.collectMetrics(),
      errors: this.errors,
      summary: this.generateSummary()
    };

    if (format === 'json') {
      return JSON.stringify(results, null, 2);
    } else {
      // Simplified CSV export
      const csv = [
        'Metric,Value',
        `Active Connections,${this.metrics.connections}`,
        `Messages Sent,${this.metrics.messagesSent}`,
        `Messages Received,${this.metrics.messagesReceived}`,
        `Connection Errors,${this.metrics.connectionErrors}`,
        `Avg Message Latency,${this.metrics.avgMessageLatency.toFixed(2)}ms`,
        `Total Errors,${this.errors.length}`
      ].join('\n');
      return csv;
    }
  }
} 