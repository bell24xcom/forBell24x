const { Pool } = require('pg');

// Set the DATABASE_URL environment variable
process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_0Duqdxs3RoyA@ep-super-wind-a1c1ni4n-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function getDatabaseInfo() {
  try {
    console.log('🔍 Connecting to Neon Database...');
    console.log('Connection string:', process.env.DATABASE_URL.substring(0, 50) + '...');
    
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Connected successfully!');
    
    // Get all tables
    const tablesResult = await pool.query(`
      SELECT table_name, table_type 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('\n📋 DATABASE TABLES:');
    console.log('==================');
    if (tablesResult.rows.length === 0) {
      console.log('No tables found in the database.');
    } else {
      tablesResult.rows.forEach(table => {
        console.log(`- ${table.table_name} (${table.table_type})`);
      });
    }
    
    // Get table schemas and data
    for (const table of tablesResult.rows) {
      console.log(`\n🔧 TABLE: ${table.table_name}`);
      console.log('='.repeat(50));
      
      const columnsResult = await pool.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = '${table.table_name}' 
        AND table_schema = 'public'
        ORDER BY ordinal_position;
      `);
      
      console.log('Columns:');
      columnsResult.rows.forEach(col => {
        console.log(`  ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
      });
      
      // Get row count
      try {
        const countResult = await pool.query(`SELECT COUNT(*) as count FROM ${table.table_name};`);
        console.log(`📊 Row count: ${countResult.rows[0].count}`);
        
        // Get sample data (first 3 rows)
        if (parseInt(countResult.rows[0].count) > 0) {
          const sampleResult = await pool.query(`SELECT * FROM ${table.table_name} LIMIT 3;`);
          console.log(`📝 Sample data:`);
          sampleResult.rows.forEach((row, i) => {
            console.log(`  Row ${i+1}:`, JSON.stringify(row, null, 2));
          });
        }
      } catch (countError) {
        console.log(`❌ Error getting data from ${table.table_name}:`, countError.message);
      }
    }
    
    // Get indexes
    console.log('\n🔍 DATABASE INDEXES:');
    console.log('===================');
    const indexesResult = await pool.query(`
      SELECT indexname, tablename, indexdef
      FROM pg_indexes 
      WHERE schemaname = 'public'
      ORDER BY tablename, indexname;
    `);
    
    if (indexesResult.rows.length === 0) {
      console.log('No indexes found.');
    } else {
      indexesResult.rows.forEach(index => {
        console.log(`- ${index.indexname} on ${index.tablename}`);
      });
    }
    
    // Get constraints
    console.log('\n🔗 DATABASE CONSTRAINTS:');
    console.log('========================');
    const constraintsResult = await pool.query(`
      SELECT tc.constraint_name, tc.table_name, tc.constraint_type, kcu.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_schema = 'public'
      ORDER BY tc.table_name, tc.constraint_type;
    `);
    
    if (constraintsResult.rows.length === 0) {
      console.log('No constraints found.');
    } else {
      constraintsResult.rows.forEach(constraint => {
        console.log(`- ${constraint.constraint_name} (${constraint.constraint_type}) on ${constraint.table_name}.${constraint.column_name}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.error('Full error:', error);
  } finally {
    await pool.end();
  }
}

getDatabaseInfo();
