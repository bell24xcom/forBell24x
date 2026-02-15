const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const path = require('path');

// Create Express app
const app = express();
// Use the port provided by Replit or default to 8080 (Replit's preferred port)
const port = process.env.PORT || 8080;

// Middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));
app.use('/assets', express.static(path.join(__dirname, 'attached_assets')));

// Homepage - redirect to landing page or serve directly
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/landing.html'));
});

// API test interface
app.get('/api-docs', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Auth page
app.get('/auth', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/auth.html'));
});

// Dashboard page
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/dashboard.html'));
});

// Create RFQ page
app.get('/create-rfq', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/create-rfq.html'));
});

// Serve static HTML test client for backward compatibility
app.get('/old', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/index.html'));
});

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Helper function to run queries
async function query(text, params) {
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

// User login (simple version)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find user by username
    const userResult = await query('SELECT * FROM users WHERE username = $1', [username]);
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    const user = userResult.rows[0];
    
    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({ user: userWithoutPassword });
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create RFQ 
app.post('/api/rfqs', async (req, res) => {
  try {
    const {
      userId, 
      title, 
      description, 
      quantity, 
      deadline, 
      category,
      specifications,
      rfqType
    } = req.body;
    
    // Generate reference number
    const referenceNumber = `RFQ-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    
    const result = await query(
      `INSERT INTO rfqs 
       (user_id, reference_number, title, description, quantity, deadline, category, specifications, rfq_type, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [userId, referenceNumber, title, description, quantity, deadline, category, specifications, rfqType, 'open']
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating RFQ:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all bids
app.get('/api/bids', async (req, res) => {
  try {
    const result = await query(`
      SELECT b.*, u.company_name as supplier_name, r.title as rfq_title
      FROM bids b
      JOIN suppliers s ON b.supplier_id = s.id
      JOIN users u ON s.user_id = u.id
      JOIN rfqs r ON b.rfq_id = r.id
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error getting bids:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get bids for a specific RFQ
app.get('/api/bids/rfq/:rfqId', async (req, res) => {
  try {
    const { rfqId } = req.params;
    const result = await query(`
      SELECT b.*, u.company_name as supplier_name
      FROM bids b
      JOIN suppliers s ON b.supplier_id = s.id
      JOIN users u ON s.user_id = u.id
      WHERE b.rfq_id = $1
    `, [rfqId]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error getting RFQ bids:', err);
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

// Get all messages
app.get('/api/messages', async (req, res) => {
  try {
    const result = await query(`
      SELECT m.*, 
             s.username as sender_username, 
             r.username as receiver_username
      FROM messages m
      JOIN users s ON m.sender_id = s.id
      JOIN users r ON m.receiver_id = r.id
      ORDER BY m.created_at DESC
      LIMIT 50
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error getting messages:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get messages between two users
app.get('/api/messages/conversation', async (req, res) => {
  try {
    const { senderId, receiverId } = req.query;
    const result = await query(`
      SELECT m.*, 
             s.username as sender_username, 
             r.username as receiver_username
      FROM messages m
      JOIN users s ON m.sender_id = s.id
      JOIN users r ON m.receiver_id = r.id
      WHERE (m.sender_id = $1 AND m.receiver_id = $2)
         OR (m.sender_id = $2 AND m.receiver_id = $1)
      ORDER BY m.created_at ASC
    `, [senderId, receiverId]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error getting conversation:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Send a message
app.post('/api/messages', async (req, res) => {
  try {
    const { senderId, receiverId, content, rfqId } = req.body;
    
    const result = await query(
      `INSERT INTO messages 
       (sender_id, receiver_id, content, rfq_id, is_read) 
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [senderId, receiverId, content, rfqId, false]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all contracts
app.get('/api/contracts', async (req, res) => {
  try {
    const result = await query(`
      SELECT c.*, 
             b.company_name as buyer_company, 
             s.company_name as supplier_company,
             r.title as rfq_title
      FROM contracts c
      JOIN users b ON c.buyer_id = b.id
      JOIN users s ON c.supplier_id = s.id
      JOIN rfqs r ON c.rfq_id = r.id
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error getting contracts:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get contract by id
app.get('/api/contracts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(`
      SELECT c.*, 
             b.company_name as buyer_company, 
             s.company_name as supplier_company,
             r.title as rfq_title
      FROM contracts c
      JOIN users b ON c.buyer_id = b.id
      JOIN users s ON c.supplier_id = s.id
      JOIN rfqs r ON c.rfq_id = r.id
      WHERE c.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contract not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error getting contract:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new contract
app.post('/api/contracts', async (req, res) => {
  try {
    const { rfqId, supplierId, buyerId, bidId, totalValue, milestones } = req.body;
    
    const result = await query(
      `INSERT INTO contracts 
       (rfq_id, supplier_id, buyer_id, bid_id, total_value, milestones, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [rfqId, supplierId, buyerId, bidId, totalValue, milestones, 'pending']
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating contract:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get wallet transactions for a user
app.get('/api/wallet/transactions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await query(`
      SELECT * FROM wallet_transactions
      WHERE user_id = $1
      ORDER BY created_at DESC
    `, [userId]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error getting wallet transactions:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a wallet transaction (deposit or withdrawal)
app.post('/api/wallet/transactions', async (req, res) => {
  try {
    const { userId, amount, type, description } = req.body;
    
    // Start a transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Insert transaction record
      const txResult = await client.query(
        `INSERT INTO wallet_transactions 
         (user_id, amount, type, description, status) 
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [userId, amount, type, description, 'completed']
      );
      
      // Update user's wallet balance
      const balanceModifier = type === 'deposit' ? amount : -amount;
      await client.query(
        `UPDATE users 
         SET wallet_balance = wallet_balance + $1
         WHERE id = $2`,
        [balanceModifier, userId]
      );
      
      // Get updated user
      const userResult = await client.query(
        'SELECT id, username, wallet_balance FROM users WHERE id = $1',
        [userId]
      );
      
      await client.query('COMMIT');
      
      res.status(201).json({
        transaction: txResult.rows[0],
        user: userResult.rows[0]
      });
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Error creating wallet transaction:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Catch-all route to handle any other requests
app.use((req, res) => {
  console.log(`404 for ${req.method} ${req.url}`);
  res.status(404).json({ error: 'Not found', message: `Route not found: ${req.method} ${req.url}` });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Server error', message: err.message });
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`Bell24H API server running on http://0.0.0.0:${port}`);
  console.log(`- Landing page: http://0.0.0.0:${port}/`);
  console.log(`- Direct HTML paths:`);
  console.log(`  * Landing: http://0.0.0.0:${port}/landing.html`);
  console.log(`  * API Docs: http://0.0.0.0:${port}/api-docs`);
  console.log(`  * Login: http://0.0.0.0:${port}/auth.html`);
  console.log(`  * Dashboard: http://0.0.0.0:${port}/dashboard.html`);
  console.log(`  * Create RFQ: http://0.0.0.0:${port}/create-rfq.html`);
  console.log(`- API endpoints:`);
  console.log(`  * Health: http://0.0.0.0:${port}/api/health`);
});