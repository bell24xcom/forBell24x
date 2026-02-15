import { io, Socket } from 'socket.io-client';

// Configuration
const SERVER_URL = 'http://localhost:3001';
const NUM_CLIENTS = 5;
const MESSAGE_INTERVAL = 2000; // 2 seconds

// Track clients
const clients: Socket[] = [];
let messageCount = 0;

// Create multiple clients
for (let i = 0; i < NUM_CLIENTS; i++) {
  const client = io(SERVER_URL, {
    path: '/socket.io/',
    transports: ['websocket'],
    query: {
      clientId: `test-client-${i + 1}`
    }
  });

  client.on('connect', () => {
    console.log(`Client ${i + 1} connected:`, client.id);
    
    // Send periodic pings
    setInterval(() => {
      const timestamp = Date.now();
      client.emit('ping', { timestamp });
    }, MESSAGE_INTERVAL);
  });

  client.on('pong', (data: any) => {
    const latency = Date.now() - data.timestamp;
    console.log(`Client ${i + 1} received pong, latency: ${latency}ms`);
    messageCount++;
  });

  client.on('code-update', (data: any) => {
    console.log(`Client ${i + 1} received code update:`, data);
  });

  client.on('server:shutdown', (data: any) => {
    console.log(`Client ${i + 1} received shutdown notice:`, data.message);
  });

  client.on('disconnect', (reason: string) => {
    console.log(`Client ${i + 1} disconnected:`, reason);
  });

  client.on('error', (error: Error) => {
    console.error(`Client ${i + 1} error:`, error);
  });

  clients.push(client);
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down test clients...');
  clients.forEach(client => client.disconnect());
  process.exit(0);
});

// Log stats periodically
setInterval(() => {
  console.log(`\n--- Stats ---`);
  console.log(`Active clients: ${clients.filter(c => c.connected).length}/${clients.length}`);
  console.log(`Total messages received: ${messageCount}`);
}, 10000);

console.log(`Started ${NUM_CLIENTS} WebSocket clients. Press Ctrl+C to stop.`);
