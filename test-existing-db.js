#!/usr/bin/env node

// Test existing database structure
const { PrismaClient } = require('@prisma/client');

console.log('🔍 Testing existing database structure...\n');

async function testExistingDatabase() {
  // Use a simple connection without Prisma models
  const { Pool } = require('pg');
  
  // Get database URL from environment
  const databaseUrl = process.env.DATABASE_URL || 'postgresql://username:password@ep-xxxxx.us-east-1.aws.neon.tech/neondb?sslmode=require';
  
  if (databaseUrl.includes('username:password') || databaseUrl.includes('ep-xxxxx')) {
    console.log('❌ Please update .env.local with your actual Neon database credentials');
    console.log('   Current DATABASE_URL:', databaseUrl);
    return;
  }
  
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    console.log('1️⃣ Connecting to existing database...');
    const client = await pool.connect();
    console.log('✅ Database connection successful');
    
    // Get all tables
    console.log('\n2️⃣ Getting all tables...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    const tables = tablesResult.rows.map(row => row.table_name);
    console.log('✅ Available tables:', tables.join(', '));
    
    // Check if we have users table
    if (tables.includes('users')) {
      console.log('\n3️⃣ Checking users table structure...');
      const usersStructure = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'users'
        ORDER BY ordinal_position
      `);
      
      console.log('✅ Users table columns:');
      usersStructure.rows.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
      });
      
      // Check user count
      const userCount = await client.query('SELECT COUNT(*) FROM users');
      console.log(`✅ Users count: ${userCount.rows[0].count}`);
    }
    
    // Check if we have rfqs table
    if (tables.includes('rfqs')) {
      console.log('\n4️⃣ Checking RFQs table...');
      const rfqCount = await client.query('SELECT COUNT(*) FROM rfqs');
      console.log(`✅ RFQs count: ${rfqCount.rows[0].count}`);
    } else {
      console.log('⚠️ No RFQs table found');
    }
    
    // Check if we have quotes table
    if (tables.includes('quotes')) {
      console.log('\n5️⃣ Checking Quotes table...');
      const quoteCount = await client.query('SELECT COUNT(*) FROM quotes');
      console.log(`✅ Quotes count: ${quoteCount.rows[0].count}`);
    } else {
      console.log('⚠️ No Quotes table found');
    }
    
    console.log('\n🎉 Database structure analysis complete!');
    console.log('\n📋 Recommendations:');
    
    if (tables.includes('users')) {
      console.log('✅ Users table exists - can be used for suppliers');
    } else {
      console.log('❌ Users table missing - need to create');
    }
    
    if (tables.includes('rfqs')) {
      console.log('✅ RFQs table exists - can be used for RFQ system');
    } else {
      console.log('❌ RFQs table missing - need to create');
    }
    
    if (tables.includes('quotes')) {
      console.log('✅ Quotes table exists - can be used for quote system');
    } else {
      console.log('❌ Quotes table missing - need to create');
    }
    
    client.release();
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    
    if (error.code === 'ENOTFOUND') {
      console.log('💡 DNS Error: Cannot resolve database host');
      console.log('   - Check your Neon database URL');
      console.log('   - Verify the hostname is correct');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('💡 Connection Error: Database server refused connection');
      console.log('   - Check if database is running');
      console.log('   - Verify port number');
    } else if (error.code === '28P01') {
      console.log('💡 Authentication Error: Invalid credentials');
      console.log('   - Check username and password');
      console.log('   - Verify database name');
    }
  } finally {
    await pool.end();
  }
}

// Run the test
testExistingDatabase().catch(console.error);
