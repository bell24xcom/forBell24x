const { Pool } = require('pg');

// Database connection configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// SQL schema for comprehensive supplier product showcase system
const createTables = async () => {
  try {
    console.log('Creating database tables...');

    // Categories table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        category_id VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        icon VARCHAR(10),
        color VARCHAR(20),
        total_suppliers INTEGER DEFAULT 0,
        total_products INTEGER DEFAULT 0,
        avg_rating DECIMAL(3,2) DEFAULT 0.00,
        is_active BOOLEAN DEFAULT true,
        featured BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Categories table created successfully!');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
};

module.exports = { createTables };