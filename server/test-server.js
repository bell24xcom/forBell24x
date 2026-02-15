const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

// Basic middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Basic routes
app.get('/', (req, res) => {
  res.json({ 
    status: 'success', 
    message: 'Minimal Bell24H server is working!',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Health check passed',
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

app.get('/api/test', (req, res) => {
  res.json({ 
    status: 'success', 
    message: 'Test endpoint working',
    data: {
      test: true,
      timestamp: new Date().toISOString()
    }
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    status: 'error', 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    status: 'error', 
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Start server
app.listen(port, () => {
  console.log(`✅ Minimal Bell24H server running on port ${port}`);
  console.log(`🌐 Health check: http://localhost:${port}/api/health`);
  console.log(`🧪 Test endpoint: http://localhost:${port}/api/test`);
  console.log(`📊 Server started at: ${new Date().toISOString()}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
}); 