const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function testDatabaseConnection() {
  try {
    // Connect to the database
    const client = await pool.connect();
    console.log('Connected to PostgreSQL database!');
    
    // Create a test table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS test_table (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Test table created successfully!');
    
    // Insert a test record
    const insertResult = await client.query(
      'INSERT INTO test_table (name) VALUES ($1) RETURNING *',
      ['Test record ' + new Date().toISOString()]
    );
    console.log('Test record inserted:', insertResult.rows[0]);
    
    // Query all records
    const queryResult = await client.query('SELECT * FROM test_table ORDER BY created_at DESC LIMIT 5');
    console.log('Recent records:');
    queryResult.rows.forEach(row => {
      console.log(`- ID: ${row.id}, Name: ${row.name}, Created at: ${row.created_at}`);
    });
    
    // Release the client
    client.release();
    console.log('Database connection test completed successfully!');
  } catch (error) {
    console.error('Error testing database connection:', error);
  } finally {
    // End the pool
    await pool.end();
  }
}

// Run the test
testDatabaseConnection();