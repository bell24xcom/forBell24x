const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_0Duqdxs3RoyA@ep-super-wind-a1c1ni4n-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false }
});

async function checkCategoriesStructure() {
  try {
    console.log('🔍 CHECKING CATEGORIES TABLE STRUCTURE');
    console.log('=====================================');
    
    // Check categories table structure
    const columnsResult = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'categories' AND table_schema = 'public'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 CATEGORIES TABLE COLUMNS:');
    columnsResult.rows.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    
    // Check current categories count
    const countResult = await pool.query('SELECT COUNT(*) as count FROM categories');
    console.log(`\n📊 Total Categories: ${countResult.rows[0].count}`);
    
    // List all current categories
    const categoriesResult = await pool.query('SELECT id, name, slug FROM categories ORDER BY id LIMIT 20');
    
    console.log('\n🏷️  CURRENT CATEGORIES (first 20):');
    categoriesResult.rows.forEach(cat => {
      console.log(`  ${cat.id}. ${cat.name} (${cat.slug})`);
    });
    
    // Check if we have the required structure
    const hasParentId = columnsResult.rows.some(col => col.column_name === 'parent_id');
    const hasSlug = columnsResult.rows.some(col => col.column_name === 'slug');
    const hasDescription = columnsResult.rows.some(col => col.column_name === 'description');
    
    console.log('\n🔍 STRUCTURE ANALYSIS:');
    console.log(`  parent_id column: ${hasParentId ? '✅ EXISTS' : '❌ MISSING'}`);
    console.log(`  slug column: ${hasSlug ? '✅ EXISTS' : '❌ MISSING'}`);
    console.log(`  description column: ${hasDescription ? '✅ EXISTS' : '❌ MISSING'}`);
    
    // Check other important tables
    console.log('\n📊 OTHER TABLES RECORD COUNTS:');
    const tables = ['suppliers', 'sources', 'rfq_requests', 'supplier_products'];
    
    for (const table of tables) {
      try {
        const result = await pool.query(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`  ${table}: ${result.rows[0].count} records`);
      } catch (error) {
        console.log(`  ${table}: Error - ${error.message}`);
      }
    }
    
    // Final assessment
    console.log('\n🎯 CURRENT STATUS ASSESSMENT:');
    console.log('=============================');
    
    if (countResult.rows[0].count > 0) {
      console.log(`✅ Categories table exists with ${countResult.rows[0].count} records`);
      
      if (hasParentId) {
        console.log('✅ Categories table has parent_id structure for subcategories');
      } else {
        console.log('⚠️  Categories table missing parent_id structure');
        console.log('   Need to add parent_id column for subcategories');
      }
      
      if (countResult.rows[0].count >= 50) {
        console.log('✅ Found 50+ categories');
      } else {
        console.log(`⚠️  Found ${countResult.rows[0].count} categories (need 50+ main categories)`);
      }
      
    } else {
      console.log('❌ Categories table is empty');
      console.log('   Need to populate with 50 main categories + 400+ subcategories');
    }
    
    console.log('\n📋 WHAT NEEDS TO BE DONE:');
    if (!hasParentId) {
      console.log('1. Add parent_id column to categories table');
    }
    if (countResult.rows[0].count < 50) {
      console.log('2. Insert 50 main categories');
    }
    if (countResult.rows[0].count < 450) {
      console.log('3. Insert 400+ subcategories');
    }
    console.log('4. Verify all tables have proper data');
    
  } catch (error) {
    console.error('❌ Check failed:', error.message);
  } finally {
    await pool.end();
  }
}

checkCategoriesStructure();
