const { Pool } = require('pg');

async function testDatabaseConnection() {
  console.log("Testing database connection...");
  
  // Create a connection pool
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });
  
  try {
    // Test the connection
    const client = await pool.connect();
    console.log("Successfully connected to the database!");
    
    // Query a sample from the database
    const result = await client.query('SELECT NOW() as time');
    console.log("Current database time:", result.rows[0].time);
    
    // List tables in our database
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log("\nTables in database:");
    tables.rows.forEach(table => {
      console.log(`- ${table.table_name}`);
    });
    
    // Release the client back to the pool
    client.release();
  } catch (error) {
    console.error("Error connecting to the database:", error.message);
  } finally {
    // Close the pool
    await pool.end();
  }
}

testDatabaseConnection();