const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_0Duqdxs3RoyA@ep-super-wind-a1c1ni4n-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false }
});

async function checkSuppliersStructure() {
  try {
    console.log('🔍 CHECKING SUPPLIERS TABLE STRUCTURE');
    console.log('=====================================');
    
    // Check suppliers table structure
    const columnsResult = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'suppliers' AND table_schema = 'public'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 SUPPLIERS TABLE COLUMNS:');
    columnsResult.rows.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    
    // Check actual supplier data
    console.log('\n🏭 CURRENT SUPPLIERS DATA:');
    const suppliersResult = await pool.query('SELECT * FROM suppliers LIMIT 5');
    
    if (suppliersResult.rows.length > 0) {
      suppliersResult.rows.forEach((supplier, index) => {
        console.log(`\n  Supplier ${index + 1}:`);
        Object.entries(supplier).forEach(([key, value]) => {
          if (value !== null) {
            console.log(`    ${key}: ${value}`);
          }
        });
      });
    } else {
      console.log('  No suppliers found');
    }
    
    // Check if we have category_id field
    const hasCategoryId = columnsResult.rows.some(col => col.column_name === 'category_id');
    const hasCategory = columnsResult.rows.some(col => col.column_name === 'category');
    
    console.log('\n🔍 CATEGORY FIELD ANALYSIS:');
    console.log(`  category_id field: ${hasCategoryId ? '✅ EXISTS' : '❌ MISSING'}`);
    console.log(`  category field: ${hasCategory ? '✅ EXISTS' : '❌ MISSING'}`);
    
    if (hasCategoryId) {
      // Check suppliers by category_id
      console.log('\n📊 SUPPLIERS BY CATEGORY_ID:');
      try {
        const supplierCategories = await pool.query(`
          SELECT 
            s.category_id,
            c.name as category_name,
            COUNT(*) as supplier_count
          FROM suppliers s
          LEFT JOIN categories c ON s.category_id = c.id
          GROUP BY s.category_id, c.name
          ORDER BY supplier_count DESC
        `);
        
        supplierCategories.rows.forEach(row => {
          console.log(`  Category ID ${row.category_id} (${row.category_name || 'Unknown'}): ${row.supplier_count} suppliers`);
        });
      } catch (error) {
        console.log(`  Error: ${error.message}`);
      }
    }
    
    // Check categories data
    console.log('\n🏷️  CATEGORIES DATA:');
    const categoriesResult = await pool.query('SELECT id, name, slug FROM categories ORDER BY id');
    
    categoriesResult.rows.forEach(cat => {
      console.log(`  ${cat.id}. ${cat.name} (${cat.slug})`);
    });
    
    console.log('\n🎯 N8N WORKFLOW READINESS:');
    console.log('===========================');
    
    if (hasCategoryId) {
      console.log('✅ Suppliers have category_id field - N8N can match RFQs to suppliers');
    } else if (hasCategory) {
      console.log('⚠️  Suppliers have category field (string) - May need conversion for N8N');
    } else {
      console.log('❌ No category field in suppliers - Need to add for N8N matching');
    }
    
    console.log('\n📋 RECOMMENDATIONS:');
    if (hasCategoryId) {
      console.log('✅ Database is ready for N8N RFQ workflow');
      console.log('✅ Can proceed with importing N8N workflows');
    } else {
      console.log('⚠️  Need to add category_id field to suppliers table');
      console.log('⚠️  Or update existing category field to use category_id');
    }
    
  } catch (error) {
    console.error('❌ Check failed:', error.message);
  } finally {
    await pool.end();
  }
}

checkSuppliersStructure();
