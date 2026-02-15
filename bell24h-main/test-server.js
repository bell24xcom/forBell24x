// Simple test server to verify port binding and accessibility
const express = require('express');
const app = express();

// Basic route
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Test Server</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 30px; max-width: 800px; margin: 0 auto; }
          h1 { color: #4CAF50; }
          .success { background: #E8F5E9; padding: 20px; border-radius: 5px; }
        </style>
      </head>
      <body>
        <h1>Server is working correctly! 🎉</h1>
        <div class="success">
          <p>This confirms that your Express server can properly bind to port 3002 and serve content.</p>
          <p>Current time: ${new Date().toLocaleString()}</p>
        </div>
      </body>
    </html>
  `);
});

// Test API endpoint
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API is working correctly',
    timestamp: new Date().toISOString()
  });
});

// Start server on 0.0.0.0 (all network interfaces) and port 3002
const PORT = 3002;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Test server running on http://localhost:${PORT}`);
  console.log(`Try accessing:`);
  console.log(`- http://localhost:${PORT}`);
  console.log(`- http://localhost:${PORT}/api/test`);
});
