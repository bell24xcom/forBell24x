import http from 'http';

const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.end(JSON.stringify({
    message: 'Basic HTTP server works!',
    timestamp: new Date().toISOString(),
    url: req.url,
    method: req.method
  }));
});

server.listen(8000, () => {
  console.log('✅ Basic HTTP server running on port 8000');
  console.log('🌐 Test URL: http://localhost:8000/');
  console.log('📊 Server started at:', new Date().toISOString());
});

server.on('error', (err) => {
  console.error('❌ Server error:', err);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
}); 