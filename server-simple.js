/**
 * Simple Express server to test Bell24H platform
 * This is a temporary solution to bypass vite.config.ts issues
 */

const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Setup database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Test database connection
async function testDbConnection() {
  try {
    const client = await pool.connect();
    console.log('Successfully connected to PostgreSQL database');
    await client.query('SELECT NOW()');
    client.release();
    return true;
  } catch (err) {
    console.error('Database connection error:', err.message);
    return false;
  }
}

// Basic API routes for testing
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/api/db-status', async (req, res) => {
  const isConnected = await testDbConnection();
  res.json({ 
    connected: isConnected,
    database: process.env.PGDATABASE || 'unknown'
  });
});

// Static file serving - can be enabled when we have a built client
// app.use(express.static(path.join(__dirname, 'dist/public')));

// Catch all route for SPA (when we have a built client)
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'dist/public/index.html'));
// });

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api/health`);
  
  // Test database connection on startup
  testDbConnection();
});
