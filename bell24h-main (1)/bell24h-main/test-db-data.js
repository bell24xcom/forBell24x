const { Pool } = require('pg');

async function testDatabaseData() {
  console.log("Testing database data...");
  
  // Create a connection pool
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });
  
  try {
    // Get a client from the pool
    const client = await pool.connect();
    
    // Query users
    const usersResult = await client.query('SELECT id, username, email, company_name, user_type FROM users');
    console.log("\nUSERS:");
    usersResult.rows.forEach(user => {
      console.log(`- ID: ${user.id}, Username: ${user.username}, Email: ${user.email}, Company: ${user.company_name}, Type: ${user.user_type}`);
    });
    
    // Query RFQs
    const rfqsResult = await client.query('SELECT id, reference_number, title, category, status FROM rfqs');
    console.log("\nRFQs:");
    rfqsResult.rows.forEach(rfq => {
      console.log(`- ID: ${rfq.id}, Ref: ${rfq.reference_number}, Title: ${rfq.title}, Category: ${rfq.category}, Status: ${rfq.status}`);
    });
    
    // Query suppliers
    const suppliersResult = await client.query('SELECT id, industry, risk_score FROM suppliers');
    console.log("\nSUPPLIERS:");
    suppliersResult.rows.forEach(supplier => {
      console.log(`- ID: ${supplier.id}, Industry: ${supplier.industry}, Risk Score: ${supplier.risk_score}`);
    });
    
    // Release the client back to the pool
    client.release();
  } catch (error) {
    console.error("Error querying the database:", error.message);
  } finally {
    // Close the pool
    await pool.end();
  }
}

testDatabaseData();