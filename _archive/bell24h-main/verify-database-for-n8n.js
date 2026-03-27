const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_0Duqdxs3RoyA@ep-super-wind-a1c1ni4n-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false }
});

async function verifyDatabaseForN8N() {
  try {
    console.log('🔍 DATABASE VERIFICATION FOR N8N RFQ WORKFLOW');
    console.log('==============================================');
    
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
    
    // 2. Check row counts for key tables
    console.log('\n2. 📊 CHECKING ROW COUNTS:');
    try {
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
      
    } catch (error) {
      console.log(`  Error checking counts: ${error.message}`);
    }
    
    // 3. Check RFQ table specifically
    console.log('\n3. 🎯 CHECKING RFQ REQUESTS TABLE:');
    const rfqExists = tablesResult.rows.some(row => row.table_name === 'rfq_requests');
    
    if (rfqExists) {
      try {
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
        
      } catch (error) {
        console.log(`  ❌ Error accessing RFQ table: ${error.message}`);
      }
    } else {
      console.log('  ❌ RFQ Requests table does NOT exist');
      console.log('  🚨 CRITICAL: Need to create RFQ table for N8N workflow!');
    }
    
    // 4. Check supplier data by category
    console.log('\n4. 🏭 CHECKING SUPPLIERS BY CATEGORY:');
    try {
      const supplierCategories = await pool.query(`
        SELECT 
          category,
          COUNT(*) as supplier_count
        FROM public.suppliers 
        GROUP BY category 
        ORDER BY supplier_count DESC
      `);
      
      if (supplierCategories.rows.length > 0) {
        supplierCategories.rows.forEach(row => {
          console.log(`  ${row.category}: ${row.supplier_count} suppliers`);
        });
      } else {
        console.log('  ⚠️  No suppliers found or category column missing');
      }
    } catch (error) {
      console.log(`  Error checking suppliers: ${error.message}`);
    }
    
    // 5. Check categories structure
    console.log('\n5. 🏷️  CHECKING CATEGORIES STRUCTURE:');
    try {
      const categoryColumns = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'categories' AND table_schema = 'public'
        ORDER BY ordinal_position
      `);
      
      console.log('  📋 Categories Table Structure:');
      categoryColumns.rows.forEach(col => {
        console.log(`    ${col.column_name}: ${col.data_type}`);
      });
      
      // Check if parent_id exists
      const hasParentId = categoryColumns.rows.some(col => col.column_name === 'parent_id' || col.column_name === 'parent_category_id');
      console.log(`  Parent ID column: ${hasParentId ? '✅ EXISTS' : '❌ MISSING'}`);
      
    } catch (error) {
      console.log(`  Error checking categories: ${error.message}`);
    }
    
    // 6. Final verification query
    console.log('\n6. 🎯 FINAL VERIFICATION QUERY:');
    try {
      const finalCheck = await pool.query(`
        SELECT 
          (SELECT COUNT(*) FROM public.suppliers) as suppliers,
          (SELECT COUNT(*) FROM public.categories) as categories,
          (SELECT COUNT(*) FROM public.rfq_requests) as rfq_table_exists
      `);
      
      const result = finalCheck.rows[0];
      console.log(`  Suppliers: ${result.suppliers}`);
      console.log(`  Categories: ${result.categories}`);
      console.log(`  RFQ Table Records: ${result.rfq_table_exists}`);
      
    } catch (error) {
      console.log(`  ❌ RFQ table error: ${error.message}`);
      console.log('  🚨 NEED TO CREATE RFQ TABLE!');
    }
    
    // 7. Assessment and recommendations
    console.log('\n🎯 ASSESSMENT FOR N8N SETUP:');
    console.log('=============================');
    
    const rfqTableExists = tablesResult.rows.some(row => row.table_name === 'rfq_requests');
    const suppliersCount = await pool.query('SELECT COUNT(*) as count FROM public.suppliers').then(r => r.rows[0].count).catch(() => 0);
    const categoriesCount = await pool.query('SELECT COUNT(*) as count FROM public.categories').then(r => r.rows[0].count).catch(() => 0);
    
    if (rfqTableExists) {
      console.log('✅ RFQ table exists - N8N workflow can be imported');
    } else {
      console.log('❌ RFQ table missing - Need to create before N8N import');
    }
    
    if (suppliersCount >= 5) {
      console.log('✅ Sufficient suppliers for testing');
    } else {
      console.log('⚠️  Need more suppliers for testing');
    }
    
    if (categoriesCount >= 10) {
      console.log('✅ Categories available for matching');
    } else {
      console.log('⚠️  Need more categories');
    }
    
    console.log('\n🚀 NEXT STEPS:');
    if (!rfqTableExists) {
      console.log('1. Create RFQ requests table');
      console.log('2. Import N8N RFQ workflow');
      console.log('3. Test RFQ automation');
    } else {
      console.log('1. Import N8N RFQ workflow');
      console.log('2. Configure API keys');
      console.log('3. Test RFQ automation');
    }
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  } finally {
    await pool.end();
  }
}

verifyDatabaseForN8N();
