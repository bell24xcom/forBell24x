const { Pool } = require('pg');
const fs = require('fs');

// Neon Database Connection
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_0Duqdxs3RoyA@ep-super-wind-a1c1ni4n-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false }
});

async function runDatabaseSetup() {
  try {
    console.log('🚀 Starting Bell24H Database Setup with 400+ Categories...');
    console.log('========================================================');
    
    // Test connection
    console.log('1. Testing database connection...');
    const testResult = await pool.query('SELECT NOW() as current_time');
    console.log('✅ Connected successfully at:', testResult.rows[0].current_time);
    
    // Read and execute SQL file
    console.log('\n2. Reading SQL setup file...');
    const sqlContent = fs.readFileSync('complete-database-setup-400-categories.sql', 'utf8');
    
    // Split SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📋 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    console.log('\n3. Executing database setup...');
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          await pool.query(statement);
          successCount++;
          
          // Log progress for major operations
          if (statement.includes('CREATE TABLE')) {
            const tableName = statement.match(/CREATE TABLE.*?(\w+)/)?.[1];
            console.log(`   ✅ Created table: ${tableName}`);
          } else if (statement.includes('INSERT INTO categories')) {
            console.log(`   ✅ Inserted categories data`);
          } else if (statement.includes('INSERT INTO sources')) {
            console.log(`   ✅ Inserted sources data`);
          } else if (statement.includes('INSERT INTO suppliers')) {
            console.log(`   ✅ Inserted suppliers data`);
          } else if (statement.includes('INSERT INTO supplier_products')) {
            console.log(`   ✅ Inserted products data`);
          } else if (statement.includes('INSERT INTO rfq_requests')) {
            console.log(`   ✅ Inserted RFQ data`);
          } else if (statement.includes('CREATE INDEX')) {
            console.log(`   ✅ Created performance indexes`);
          }
          
        } catch (error) {
          errorCount++;
          console.log(`   ⚠️  Warning: ${error.message.substring(0, 100)}...`);
        }
      }
    }
    
    console.log(`\n📊 Execution Summary:`);
    console.log(`   ✅ Successful statements: ${successCount}`);
    console.log(`   ⚠️  Warnings/Errors: ${errorCount}`);
    
    // Verify final data
    console.log('\n4. Verifying database setup...');
    const verificationQueries = [
      'SELECT COUNT(*) as count FROM categories',
      'SELECT COUNT(*) as count FROM sources', 
      'SELECT COUNT(*) as count FROM suppliers',
      'SELECT COUNT(*) as count FROM supplier_products',
      'SELECT COUNT(*) as count FROM rfq_requests'
    ];
    
    console.log('\n📋 Final Database Summary:');
    console.log('==========================');
    
    for (const query of verificationQueries) {
      try {
        const result = await pool.query(query);
        const tableName = query.match(/FROM (\w+)/)?.[1];
        console.log(`${tableName}: ${result.rows[0].count} records`);
      } catch (error) {
        console.log(`Error checking ${query}: ${error.message}`);
      }
    }
    
    // Check categories breakdown
    console.log('\n📊 Categories Breakdown:');
    const categoriesResult = await pool.query(`
      SELECT 
        CASE WHEN parent_id IS NULL THEN 'Main Categories' ELSE 'Subcategories' END as type,
        COUNT(*) as count
      FROM categories 
      GROUP BY CASE WHEN parent_id IS NULL THEN 'Main Categories' ELSE 'Subcategories' END
    `);
    
    categoriesResult.rows.forEach(row => {
      console.log(`${row.type}: ${row.count}`);
    });
    
    console.log('\n🎉 Database setup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Import N8N workflows with database connections');
    console.log('2. Configure API keys in N8N');
    console.log('3. Test RFQ automation workflow');
    console.log('4. Set up supplier claim pages');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await pool.end();
  }
}

runDatabaseSetup();
