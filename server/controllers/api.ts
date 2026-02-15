import express from 'express';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Request, Response, NextFunction } from 'express';

// Convert ESM __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();
// Use the port provided or default to 5000 (from .env)
const port = process.env.PORT || 5000;

// Middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '..', '..', 'public')));
app.use('/assets', express.static(path.join(__dirname, '..', '..', 'attached_assets')));

// Homepage - redirect to landing page or serve directly
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'public/landing.html'));
});

// API test interface
app.get('/api-docs', (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'public/index.html'));
});

// Auth page
app.get('/auth', (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'public/auth.html'));
});

// Dashboard page
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'public/dashboard.html'));
});

// Create RFQ page
app.get('/create-rfq', (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'public/create-rfq.html'));
});

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined
});

// Helper function to run queries
async function query(text: string, params?: any[]) {
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'UP', message: 'Bell24H API server is running' });
});

// Get all users (limited fields for security)
app.get('/api/users', async (req, res) => {
  try {
    const result = await query('SELECT id, username, email, company_name, user_type, wallet_balance FROM users');
    res.json(result.rows);
  } catch (err) {
    console.error('Error getting users:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all RFQs
app.get('/api/rfqs', async (req, res) => {
  try {
    const result = await query('SELECT * FROM rfqs');
    res.json(result.rows);
  } catch (err) {
    console.error('Error getting RFQs:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get RFQs by userId
app.get('/api/rfqs/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await query('SELECT * FROM rfqs WHERE user_id = $1', [userId]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error getting user RFQs:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all suppliers
app.get('/api/suppliers', async (req, res) => {
  try {
    const result = await query(`
      SELECT s.*, u.company_name, u.email 
      FROM suppliers s
      JOIN users u ON s.user_id = u.id
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error getting suppliers:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new bid
app.post('/api/bids', async (req, res) => {
  try {
    const { rfqId, supplierId, price, deliveryDays, message, attachments } = req.body;
    
    const result = await query(
      `INSERT INTO bids 
       (rfq_id, supplier_id, price, delivery_days, message, attachments, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [rfqId, supplierId, price, deliveryDays, message, attachments, 'pending']
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating bid:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Catch-all route to handle any other requests
app.use((req, res) => {
  console.log(`404 for ${req.method} ${req.url}`);
  res.status(404).json({ error: 'Not found', message: `Route not found: ${req.method} ${req.url}` });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Server error', message: err.message });
});

export default app;
