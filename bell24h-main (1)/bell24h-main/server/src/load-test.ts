import { io, Socket } from 'socket.io-client';
import { WebSocket } from 'ws';
import * as os from 'os';

// Configuration
const SERVER_URL = 'http://localhost:3001';
const NUM_CLIENTS = 50; // Number of WebSocket clients to simulate
const MESSAGE_INTERVAL = 2000; // Send a message every 2 seconds
const TEST_DURATION = 300000; // 5 minutes

// Track metrics
interface ClientMetrics {
  id: string;
  connected: boolean;
  messagesSent: number;
  messagesReceived: number;
  totalLatency: number;
  errors: number;
}

const clients: ClientMetrics[] = [];
let globalMessagesSent = 0;
let globalMessagesReceived = 0;
let globalErrors = 0;
let startTime: number;

// Create WebSocket clients
function createClient(id: number): void {
  const client = io(SERVER_URL, {
    path: '/socket.io/',
    transports: ['websocket'],
    query: { clientId: `load-test-${id}` },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    randomizationFactor: 0.5,
    timeout: 20000,
  });

  const metrics: ClientMetrics = {
    id: `client-${id}`,
    connected: false,
    messagesSent: 0,
    messagesReceived: 0,
    totalLatency: 0,
    errors: 0,
  };

  client.on('connect', () => {
    metrics.connected = true;
    console.log(`Client ${id} connected`);
  });

  client.on('disconnect', (reason) => {
    metrics.connected = false;
    console.log(`Client ${id} disconnected:`, reason);
  });

  client.on('connect_error', (error) => {
    metrics.errors++;
    globalErrors++;
    console.error(`Client ${id} connection error:`, error.message);
  });

  client.on('pong', (data: { timestamp: number }) => {
    const latency = Date.now() - data.timestamp;
    metrics.messagesReceived++;
    metrics.totalLatency += latency;
    globalMessagesReceived++;
  });

  // Send periodic messages
  const interval = setInterval(() => {
    if (metrics.connected) {
      const timestamp = Date.now();
      client.emit('ping', { timestamp });
      metrics.messagesSent++;
      globalMessagesSent++;
    }
  }, MESSAGE_INTERVAL);

  // Clean up on exit
  process.on('SIGINT', () => {
    clearInterval(interval);
    client.disconnect();
  });

  clients.push(metrics);
}

// Print statistics
function printStats(): void {
  const now = Date.now();
  const elapsed = (now - startTime) / 1000; // in seconds
  
  const connected = clients.filter(c => c.connected).length;
  const avgLatency = clients.reduce((sum, c) => sum + c.totalLatency, 0) / 
                     Math.max(1, clients.reduce((sum, c) => sum + c.messagesReceived, 0));
  
  console.clear();
  console.log('=== WebSocket Load Test ===');
  console.log(`Test Duration: ${Math.floor(elapsed)}s`);
  console.log(`Active Connections: ${connected}/${NUM_CLIENTS}`);
  console.log(`Messages Sent: ${globalMessagesSent}`);
  console.log(`Messages Received: ${globalMessagesReceived}`);
  console.log(`Errors: ${globalErrors}`);
  console.log(`Avg Latency: ${avgLatency.toFixed(2)}ms`);
  
  // Memory usage
  const used = process.memoryUsage();
  console.log('\nMemory Usage:');
  for (const [key, value] of Object.entries(used)) {
    console.log(`${key}: ${Math.round(value / 1024 / 1024 * 100) / 100} MB`);
  }
  
  // System load
  const load = os.loadavg();
  console.log(`\nSystem Load (1, 5, 15 min): ${load.map(l => l.toFixed(2)).join(', ')}`);
  
  // Check if test duration has been reached
  if (elapsed >= TEST_DURATION / 1000) {
    console.log('\nTest duration reached. Exiting...');
    process.exit(0);
  }
}

// Start the test
async function startTest(): Promise<void> {
  console.log('Starting WebSocket load test...');
  console.log(`Connecting ${NUM_CLIENTS} clients to ${SERVER_URL}`);
  console.log(`Test will run for ${TEST_DURATION / 1000} seconds`);
  console.log('Press Ctrl+C to stop the test\n');
  
  startTime = Date.now();
  
  // Create clients with a small delay between each
  for (let i = 0; i < NUM_CLIENTS; i++) {
    createClient(i);
    if (i % 10 === 0) {
      // Add a small delay every 10 clients to avoid connection storms
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  // Print stats every second
  setInterval(printStats, 1000);
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\nShutting down clients...');
    process.exit(0);
  });
}

// Start the test
startTest().catch(console.error);
