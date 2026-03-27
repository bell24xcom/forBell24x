const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_0Duqdxs3RoyA@ep-super-wind-a1c1ni4n-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false }
});

async function completeDatabaseVerification() {
  try {
    console.log('🔍 COMPLETE DATABASE VERIFICATION FOR N8N');
    console.log('==========================================');
    
    // 1. Check all tables
    console.log('\n1. 📋 CHECKING ALL TABLES:');
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log(`Found ${tablesResult.rows.length} tables:`);
    tablesResult.rows.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });
    
    // 2. Check row counts as specified
    console.log('\n2. 📊 CHECKING ROW COUNTS:');
    const countsResult = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM public.categories) as categories,
        (SELECT COUNT(*) FROM public.sources) as sources,
        (SELECT COUNT(*) FROM public.suppliers) as suppliers,
        (SELECT COUNT(*) FROM public.supplier_products) as products,
        (SELECT COUNT(*) FROM public.scraping_batches) as batches,
        (SELECT COUNT(*) FROM public.scraping_logs) as logs
    `);
    
    const counts = countsResult.rows[0];
    console.log(`  Categories: ${counts.categories}`);
    console.log(`  Sources: ${counts.sources}`);
    console.log(`  Suppliers: ${counts.suppliers}`);
    console.log(`  Products: ${counts.products}`);
    console.log(`  Scraping Batches: ${counts.batches}`);
    console.log(`  Scraping Logs: ${counts.logs}`);
    
    // 3. Check RFQ table specifically
    console.log('\n3. 🎯 CHECKING RFQ REQUESTS TABLE:');
    const rfqExists = tablesResult.rows.some(row => row.table_name === 'rfq_requests');
    
    if (rfqExists) {
      const rfqCount = await pool.query('SELECT COUNT(*) as count FROM public.rfq_requests');
      console.log(`  ✅ RFQ Requests table exists with ${rfqCount.rows[0].count} records`);
      
      // Check RFQ table structure
      const rfqColumns = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'rfq_requests' AND table_schema = 'public'
        ORDER BY ordinal_position
      `);
      
      console.log('  📋 RFQ Table Structure:');
      rfqColumns.rows.forEach(col => {
        console.log(`    ${col.column_name}: ${col.data_type}`);
      });
    } else {
      console.log('  ❌ RFQ Requests table does NOT exist');
    }
    
    // 4. Check suppliers by category (using category_id since we fixed it)
    console.log('\n4. 🏭 CHECKING SUPPLIERS BY CATEGORY:');
    try {
      const supplierCategories = await pool.query(`
        SELECT 
          s.category_id,
          c.name as category_name,
          COUNT(*) as supplier_count
        FROM public.suppliers s
        LEFT JOIN public.categories c ON s.category_id = c.id
        GROUP BY s.category_id, c.name
        ORDER BY supplier_count DESC
      `);
      
      supplierCategories.rows.forEach(row => {
        console.log(`  Category ${row.category_id} (${row.category_name || 'Unknown'}): ${row.supplier_count} suppliers`);
      });
    } catch (error) {
      console.log(`  Error checking suppliers: ${error.message}`);
    }
    
    // 5. Final verification queries as specified
    console.log('\n5. ✅ FINAL CHECKLIST VERIFICATION:');
    
    // Check 1: Verify tables exist
    const tableCount = await pool.query(`
      SELECT COUNT(*) as count FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log(`  Tables count: ${tableCount.rows[0].count} (need at least 6-8)`);
    
    // Check 2: Verify suppliers exist
    const suppliersCount = await pool.query('SELECT COUNT(*) as count FROM public.suppliers');
    console.log(`  Suppliers count: ${suppliersCount.rows[0].count} (need at least 5)`);
    
    // Check 3: Verify categories exist
    const categoriesCount = await pool.query('SELECT COUNT(*) as count FROM public.categories');
    console.log(`  Categories count: ${categoriesCount.rows[0].count} (need at least 10)`);
    
    // Check 4: Verify RFQ table exists
    const rfqCount = await pool.query('SELECT COUNT(*) as count FROM public.rfq_requests');
    console.log(`  RFQ table records: ${rfqCount.rows[0].count} (0 is OK for empty table)`);
    
    // 6. IMMEDIATE ACTION QUERY as specified
    console.log('\n6. 🚀 IMMEDIATE ACTION QUERY RESULTS:');
    const immediateResult = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM public.suppliers) as suppliers,
        (SELECT COUNT(*) FROM public.categories) as categories,
        (SELECT COUNT(*) FROM public.rfq_requests) as rfq_table_exists
    `);
    
    const result = immediateResult.rows[0];
    console.log(`  Suppliers: ${result.suppliers}`);
    console.log(`  Categories: ${result.categories}`);
    console.log(`  RFQ Table Records: ${result.rfq_table_exists}`);
    
    // 7. N8N Readiness Assessment
    console.log('\n7. 🎯 N8N WORKFLOW READINESS ASSESSMENT:');
    console.log('========================================');
    
    const hasRequiredTables = tableCount.rows[0].count >= 6;
    const hasSuppliers = suppliersCount.rows[0].count >= 5;
    const hasCategories = categoriesCount.rows[0].count >= 10;
    const hasRfqTable = rfqExists;
    
    console.log(`✅ Tables (${tableCount.rows[0].count}/6+): ${hasRequiredTables ? 'READY' : 'MISSING'}`);
    console.log(`✅ Suppliers (${suppliersCount.rows[0].count}/5+): ${hasSuppliers ? 'READY' : 'MISSING'}`);
    console.log(`✅ Categories (${categoriesCount.rows[0].count}/10+): ${hasCategories ? 'READY' : 'MISSING'}`);
    console.log(`✅ RFQ Table: ${hasRfqTable ? 'READY' : 'MISSING'}`);
    
    const isReadyForN8N = hasRequiredTables && hasSuppliers && hasCategories && hasRfqTable;
    
    console.log('\n🎯 FINAL STATUS:');
    if (isReadyForN8N) {
      console.log('🎉 DATABASE IS READY FOR N8N WORKFLOW IMPORT!');
      console.log('\n🚀 NEXT STEPS:');
      console.log('1. Import N8N RFQ workflow');
      console.log('2. Configure API keys in N8N');
      console.log('3. Test RFQ automation');
    } else {
      console.log('⚠️  DATABASE NEEDS ADDITIONAL SETUP');
      console.log('\n🔧 REQUIRED ACTIONS:');
      if (!hasRfqTable) console.log('- Create RFQ requests table');
      if (!hasSuppliers) console.log('- Add more suppliers');
      if (!hasCategories) console.log('- Add more categories');
    }
    
    // 8. Generate SQL for missing components if needed
    if (!hasRfqTable) {
      console.log('\n📝 MISSING RFQ TABLE - CREATE WITH:');
      console.log(`
CREATE TABLE IF NOT EXISTS public.rfq_requests (
    id SERIAL PRIMARY KEY,
    rfq_id VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    specifications TEXT,
    quantity VARCHAR(100),
    budget_range VARCHAR(100),
    delivery_location VARCHAR(255),
    deadline DATE,
    priority VARCHAR(20) DEFAULT 'medium',
    buyer_email VARCHAR(255) NOT NULL,
    buyer_company VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    matched_suppliers_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_rfq_category ON public.rfq_requests(category);
CREATE INDEX idx_rfq_status ON public.rfq_requests(status);
CREATE INDEX idx_rfq_created ON public.rfq_requests(created_at);
      `);
    }
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  } finally {
    await pool.end();
  }
}

completeDatabaseVerification();
