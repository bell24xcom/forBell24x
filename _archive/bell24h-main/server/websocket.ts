import { Server } from 'socket.io';
import { createServer } from 'http';
import express from 'express';
import chokidar from 'chokidar';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

console.log('🚀 Starting WebSocket server...');
console.log('Environment:', process.env.NODE_ENV);
console.log('Watching directory:', path.resolve(process.env.WATCH_DIR || './src'));

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Debug middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Simple health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Watch for file changes in development
if (process.env.NODE_ENV === 'development') {
  const watcher = chokidar.watch(process.env.WATCH_DIR || './src', {
    ignored: new RegExp(
      (process.env.IGNORED_PATTERNS || '')
        .split(',')
        .map(s => `(^|[/\\])\\.${s.trim()}([/\\]|$)`)
        .join('|') || 'node_modules|\\.git'
    ),
    persistent: true,
    ignoreInitial: true,
    ignorePermissionErrors: true,
    awaitWriteFinish: {
      stabilityThreshold: 100,
      pollInterval: 50
    }
  });

  watcher
    .on('ready', () => console.log('✅ File watcher is ready'))
    .on('add', path => {
      console.log(`📄 File ${path} has been added`);
      io.emit('code-update', { 
        type: 'file-added',
        path,
        timestamp: new Date().toISOString()
      });
    })
    .on('change', path => {
      console.log(`✏️  File ${path} has been changed`);
      io.emit('code-update', { 
        type: 'file-changed',
        path,
        timestamp: new Date().toISOString()
      });
    })
    .on('unlink', path => {
      console.log(`🗑️  File ${path} has been removed`);
      io.emit('code-update', { 
        type: 'file-removed',
        path,
        timestamp: new Date().toISOString()
      });
    })
    .on('error', error => {
      console.error('❌ Watcher error:', error);
    });
}

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);
  
  // Send initial connection info
  socket.emit('connection-info', {
    id: socket.id,
    timestamp: new Date().toISOString(),
    clients: io.engine.clientsCount
  });

  // Handle client disconnection
  socket.on('disconnect', (reason) => {
    console.log(`❌ Client disconnected: ${socket.id} (${reason})`);
  });

  // Handle errors
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  // Debug echo
  socket.on('ping', (data) => {
    console.log('Received ping:', data);
    socket.emit('pong', { ...data, serverTime: new Date().toISOString() });
  });
});

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
});

// Start the server
const PORT = parseInt(process.env.WS_PORT || '3001', 10);
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 WebSocket server running on port ${PORT}`);
  console.log(`🌍 CORS allowed origin: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down WebSocket server...');
  io.close(() => {
    console.log('👋 WebSocket server closed');
    process.exit(0);
  });
});
