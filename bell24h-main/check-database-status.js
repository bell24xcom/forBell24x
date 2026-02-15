const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_0Duqdxs3RoyA@ep-super-wind-a1c1ni4n-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false }
});

async function checkDatabaseStatus() {
  try {
    console.log('🔍 BELL24H DATABASE STATUS CHECK');
    console.log('================================');
    
    // Test connection
    const testResult = await pool.query('SELECT NOW() as current_time');
    console.log('✅ Database connected at:', testResult.rows[0].current_time);
    
    // Check existing tables
    const tablesResult = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' ORDER BY table_name
    `);
    
    console.log(`\n📋 EXISTING TABLES (${tablesResult.rows.length}):`);
    if (tablesResult.rows.length === 0) {
      console.log('❌ NO TABLES FOUND - Database is empty');
    } else {
      tablesResult.rows.forEach(table => {
        console.log(`  - ${table.table_name}`);
      });
    }
    
    // Check if categories table exists
    const categoriesExists = tablesResult.rows.some(row => row.table_name === 'categories');
    
    if (categoriesExists) {
      // Check categories count
      const categoriesResult = await pool.query(`
        SELECT 
          CASE WHEN parent_id IS NULL THEN 'Main Categories' ELSE 'Subcategories' END as type,
          COUNT(*) as count
        FROM categories 
        GROUP BY CASE WHEN parent_id IS NULL THEN 'Main Categories' ELSE 'Subcategories' END
      `);
      
      console.log('\n📊 CATEGORIES STATUS:');
      categoriesResult.rows.forEach(row => {
        console.log(`  ${row.type}: ${row.count}`);
      });
      
      // List all main categories
      const mainCategories = await pool.query(`
        SELECT id, name, slug FROM categories 
        WHERE parent_id IS NULL 
        ORDER BY id
      `);
      
      console.log(`\n🏷️  MAIN CATEGORIES (${mainCategories.rows.length}):`);
      mainCategories.rows.forEach(cat => {
        console.log(`  ${cat.id}. ${cat.name} (${cat.slug})`);
      });
      
      // Check if we have 50 main categories
      if (mainCategories.rows.length >= 50) {
        console.log('\n✅ SUCCESS: Found 50+ main categories as required!');
      } else {
        console.log(`\n⚠️  PARTIAL: Found ${mainCategories.rows.length} main categories (need 50)`);
      }
      
      // List sample subcategories
      const subcategories = await pool.query(`
        SELECT c.name as main_category, sc.name as subcategory 
        FROM categories c
        JOIN categories sc ON sc.parent_id = c.id
        ORDER BY c.id, sc.id
        LIMIT 20
      `);
      
      console.log('\n📂 SAMPLE SUBCATEGORIES:');
      subcategories.rows.forEach(sub => {
        console.log(`  ${sub.main_category} → ${sub.subcategory}`);
      });
      
      // Get total subcategories count
      const subcategoriesCount = await pool.query(`
        SELECT COUNT(*) as count FROM categories WHERE parent_id IS NOT NULL
      `);
      
      console.log(`\n📊 Total Subcategories: ${subcategoriesCount.rows[0].count}`);
      
      if (subcategoriesCount.rows[0].count >= 400) {
        console.log('✅ SUCCESS: Found 400+ subcategories as required!');
      } else {
        console.log(`⚠️  PARTIAL: Found ${subcategoriesCount.rows[0].count} subcategories (need 400+)`);
      }
      
    } else {
      console.log('\n❌ CATEGORIES TABLE NOT FOUND');
      console.log('The database setup has not been completed yet.');
    }
    
    // Check other important tables
    const importantTables = ['suppliers', 'sources', 'rfq_requests', 'supplier_products'];
    console.log('\n📊 OTHER TABLES STATUS:');
    
    for (const tableName of importantTables) {
      const exists = tablesResult.rows.some(row => row.table_name === tableName);
      if (exists) {
        const countResult = await pool.query(`SELECT COUNT(*) as count FROM ${tableName}`);
        console.log(`  ✅ ${tableName}: ${countResult.rows[0].count} records`);
      } else {
        console.log(`  ❌ ${tableName}: NOT FOUND`);
      }
    }
    
    // Final assessment
    console.log('\n🎯 FINAL ASSESSMENT:');
    console.log('===================');
    
    if (categoriesExists) {
      const mainCount = await pool.query('SELECT COUNT(*) as count FROM categories WHERE parent_id IS NULL');
      const subCount = await pool.query('SELECT COUNT(*) as count FROM categories WHERE parent_id IS NOT NULL');
      
      if (mainCount.rows[0].count >= 50 && subCount.rows[0].count >= 400) {
        console.log('🎉 COMPLETE SUCCESS: All 50 main categories + 400+ subcategories are in place!');
        console.log('✅ Database is ready for Bell24H marketplace');
      } else {
        console.log('⚠️  PARTIAL SUCCESS: Some categories are missing');
        console.log(`   Main categories: ${mainCount.rows[0].count}/50`);
        console.log(`   Subcategories: ${subCount.rows[0].count}/400+`);
      }
    } else {
      console.log('❌ SETUP REQUIRED: Database tables need to be created');
      console.log('   Run the database setup script to create all tables and categories');
    }
    
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
  } finally {
    await pool.end();
  }
}

checkDatabaseStatus();
