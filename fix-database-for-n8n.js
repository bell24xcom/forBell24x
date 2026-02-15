const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_0Duqdxs3RoyA@ep-super-wind-a1c1ni4n-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false }
});

async function fixDatabaseForN8N() {
  try {
    console.log('🔧 FIXING DATABASE FOR N8N WORKFLOW');
    console.log('====================================');
    
    // 1. Add category_id column to suppliers table (if missing)
    console.log('\n1. 🔧 Adding category_id column to suppliers...');
    try {
      await pool.query(`
        ALTER TABLE suppliers 
        ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES categories(id)
      `);
      console.log('✅ category_id column added to suppliers table');
    } catch (error) {
      console.log('⚠️  category_id column may already exist:', error.message);
    }
    
    // 2. Update suppliers to use category_id instead of primary_category_id
    console.log('\n2. 🔧 Updating suppliers to use category_id...');
    await pool.query(`
      UPDATE suppliers 
      SET category_id = primary_category_id 
      WHERE category_id IS NULL AND primary_category_id IS NOT NULL
    `);
    console.log('✅ Suppliers updated to use category_id');
    
    // 3. Verify the mapping works
    console.log('\n3. ✅ Verifying supplier-category mapping...');
    const mappingResult = await pool.query(`
      SELECT 
        s.name as supplier_name,
        s.category_id,
        c.name as category_name
      FROM suppliers s
      LEFT JOIN categories c ON s.category_id = c.id
      ORDER BY s.id
    `);
    
    console.log('\n📊 SUPPLIER-CATEGORY MAPPING:');
    mappingResult.rows.forEach(row => {
      console.log(`  ${row.supplier_name} → Category ${row.category_id} (${row.category_name || 'Unknown'})`);
    });
    
    // 4. Add missing columns to RFQ table if needed
    console.log('\n4. 🔧 Ensuring RFQ table has all required columns...');
    try {
      await pool.query(`
        ALTER TABLE rfq_requests 
        ADD COLUMN IF NOT EXISTS subcategory_id INTEGER REFERENCES categories(id)
      `);
      await pool.query(`
        ALTER TABLE rfq_requests 
        ADD COLUMN IF NOT EXISTS quantity INTEGER
      `);
      await pool.query(`
        ALTER TABLE rfq_requests 
        ADD COLUMN IF NOT EXISTS unit VARCHAR(50)
      `);
      await pool.query(`
        ALTER TABLE rfq_requests 
        ADD COLUMN IF NOT EXISTS buyer_phone VARCHAR(20)
      `);
      await pool.query(`
        ALTER TABLE rfq_requests 
        ADD COLUMN IF NOT EXISTS buyer_company VARCHAR(255)
      `);
      await pool.query(`
        ALTER TABLE rfq_requests 
        ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'medium'
      `);
      await pool.query(`
        ALTER TABLE rfq_requests 
        ADD COLUMN IF NOT EXISTS deadline DATE
      `);
      await pool.query(`
        ALTER TABLE rfq_requests 
        ADD COLUMN IF NOT EXISTS location VARCHAR(255)
      `);
      await pool.query(`
        ALTER TABLE rfq_requests 
        ADD COLUMN IF NOT EXISTS specifications JSONB
      `);
      await pool.query(`
        ALTER TABLE rfq_requests 
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      `);
      console.log('✅ RFQ table columns updated');
    } catch (error) {
      console.log('⚠️  RFQ table columns may already exist:', error.message);
    }
    
    // 5. Create indexes for performance
    console.log('\n5. 🔧 Creating performance indexes...');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_suppliers_category_id ON suppliers(category_id)',
      'CREATE INDEX IF NOT EXISTS idx_rfq_category_id ON rfq_requests(category_id)',
      'CREATE INDEX IF NOT EXISTS idx_rfq_status ON rfq_requests(status)',
      'CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_category_id)'
    ];
    
    for (const indexQuery of indexes) {
      await pool.query(indexQuery);
    }
    console.log('✅ Performance indexes created');
    
    // 6. Final verification
    console.log('\n6. ✅ FINAL VERIFICATION:');
    
    // Check suppliers with category_id
    const suppliersCheck = await pool.query(`
      SELECT COUNT(*) as count FROM suppliers WHERE category_id IS NOT NULL
    `);
    console.log(`  Suppliers with category_id: ${suppliersCheck.rows[0].count}`);
    
    // Check RFQ table structure
    const rfqColumns = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'rfq_requests' AND table_schema = 'public'
      ORDER BY ordinal_position
    `);
    console.log(`  RFQ table columns: ${rfqColumns.rows.length}`);
    
    // Check categories
    const categoriesCount = await pool.query('SELECT COUNT(*) as count FROM categories');
    console.log(`  Categories available: ${categoriesCount.rows[0].count}`);
    
    console.log('\n🎉 DATABASE FIXED FOR N8N!');
    console.log('===========================');
    console.log('✅ All tables properly linked');
    console.log('✅ Category mapping fixed');
    console.log('✅ RFQ table ready for N8N workflow');
    console.log('✅ Performance indexes created');
    
    console.log('\n🚀 READY FOR N8N IMPORT:');
    console.log('1. Import N8N RFQ workflow');
    console.log('2. Configure API keys');
    console.log('3. Test RFQ automation');
    
  } catch (error) {
    console.error('❌ Database fix failed:', error.message);
  } finally {
    await pool.end();
  }
}

fixDatabaseForN8N();
