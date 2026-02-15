const { Pool } = require('pg');

// Set the DATABASE_URL
process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_0Duqdxs3RoyA@ep-super-wind-a1c1ni4n-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function quickSetup() {
  try {
    console.log('🚀 Quick Database Setup for Bell24H');
    console.log('=====================================');
    
    // Test connection
    console.log('1. Testing connection...');
    const testResult = await pool.query('SELECT NOW() as current_time');
    console.log('✅ Connected at:', testResult.rows[0].current_time);
    
    // Check existing tables
    console.log('\n2. Checking existing tables...');
    const tablesResult = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' ORDER BY table_name
    `);
    
    if (tablesResult.rows.length === 0) {
      console.log('No tables found. Creating basic structure...');
    } else {
      console.log('Existing tables:');
      tablesResult.rows.forEach(table => console.log('  -', table.table_name));
    }
    
    // Create basic tables if they don't exist
    console.log('\n3. Creating essential tables...');
    
    // Categories table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        parent_id INTEGER REFERENCES categories(id),
        description TEXT,
        total_suppliers INTEGER DEFAULT 0,
        total_products INTEGER DEFAULT 0,
        mock_rfq_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Categories table ready');
    
    // Suppliers table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS suppliers (
        id SERIAL PRIMARY KEY,
        company_name VARCHAR(255) NOT NULL,
        contact_person VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(20),
        website TEXT,
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        category_id INTEGER REFERENCES categories(id),
        gst_number VARCHAR(15),
        is_verified BOOLEAN DEFAULT false,
        is_claimed BOOLEAN DEFAULT false,
        lead_score INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Suppliers table ready');
    
    // Supplier Products table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS supplier_products (
        id SERIAL PRIMARY KEY,
        supplier_id INTEGER REFERENCES suppliers(id) ON DELETE CASCADE,
        product_name VARCHAR(255) NOT NULL,
        product_description TEXT,
        price_range_min DECIMAL(10,2),
        price_range_max DECIMAL(10,2),
        unit VARCHAR(50),
        category_id INTEGER REFERENCES categories(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Supplier Products table ready');
    
    // RFQ Requests table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS rfq_requests (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category_id INTEGER REFERENCES categories(id),
        budget_min DECIMAL(12,2),
        budget_max DECIMAL(12,2),
        buyer_name VARCHAR(255),
        buyer_email VARCHAR(255),
        status VARCHAR(50) DEFAULT 'open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ RFQ Requests table ready');
    
    // Seed some basic categories
    console.log('\n4. Seeding basic categories...');
    const categories = [
      { name: 'Textiles & Apparel', slug: 'textiles-apparel' },
      { name: 'Electronics & Electrical', slug: 'electronics-electrical' },
      { name: 'Machinery & Equipment', slug: 'machinery-equipment' },
      { name: 'Chemicals & Materials', slug: 'chemicals-materials' },
      { name: 'Food & Beverages', slug: 'food-beverages' },
      { name: 'Automotive & Transportation', slug: 'automotive-transportation' },
      { name: 'Construction & Building', slug: 'construction-building' },
      { name: 'Healthcare & Medical', slug: 'healthcare-medical' }
    ];
    
    for (const category of categories) {
      await pool.query(`
        INSERT INTO categories (name, slug, mock_rfq_count)
        VALUES ($1, $2, $3)
        ON CONFLICT (slug) DO UPDATE SET
          name = EXCLUDED.name,
          updated_at = CURRENT_TIMESTAMP
      `, [category.name, category.slug, Math.floor(Math.random() * 10) + 1]);
    }
    console.log('✅ Categories seeded');
    
    // Seed some sample suppliers
    console.log('\n5. Seeding sample suppliers...');
    const suppliers = [
      {
        company_name: 'Rajesh Textiles Pvt Ltd',
        contact_person: 'Rajesh Kumar',
        email: 'rajesh@rajeshtextiles.com',
        phone: '+91-9876543210',
        website: 'https://www.rajeshtextiles.com',
        address: '123 Textile Street, Surat, Gujarat',
        city: 'Surat',
        state: 'Gujarat',
        category_id: 1,
        gst_number: '24AABCR1234A1Z5',
        lead_score: 85
      },
      {
        company_name: 'Mumbai Electronics Co',
        contact_person: 'Priya Sharma',
        email: 'priya@mumbaielectronics.com',
        phone: '+91-9876543211',
        website: 'https://www.mumbaielectronics.com',
        address: '456 Electronics Hub, Mumbai, Maharashtra',
        city: 'Mumbai',
        state: 'Maharashtra',
        category_id: 2,
        gst_number: '27AABCR1234A1Z6',
        lead_score: 92
      },
      {
        company_name: 'Delhi Machinery Works',
        contact_person: 'Amit Singh',
        email: 'amit@delhimachinery.com',
        phone: '+91-9876543212',
        website: 'https://www.delhimachinery.com',
        address: '789 Industrial Area, Delhi',
        city: 'Delhi',
        state: 'Delhi',
        category_id: 3,
        gst_number: '07AABCR1234A1Z7',
        lead_score: 78
      }
    ];
    
    for (const supplier of suppliers) {
      const result = await pool.query(`
        INSERT INTO suppliers (
          company_name, contact_person, email, phone, website, address,
          city, state, category_id, gst_number, lead_score, is_verified
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id
      `, [
        supplier.company_name, supplier.contact_person, supplier.email,
        supplier.phone, supplier.website, supplier.address, supplier.city,
        supplier.state, supplier.category_id, supplier.gst_number,
        supplier.lead_score, true
      ]);
      
      const supplierId = result.rows[0].id;
      
      // Add a sample product
      await pool.query(`
        INSERT INTO supplier_products (
          supplier_id, product_name, product_description, price_range_min,
          price_range_max, unit, category_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        supplierId, 
        `Sample Product from ${supplier.company_name}`,
        'High quality product for B2B marketplace',
        100.00, 500.00, 'per unit', supplier.category_id
      ]);
    }
    console.log('✅ Sample suppliers and products seeded');
    
    // Final verification
    console.log('\n6. Final verification...');
    const counts = await pool.query(`
      SELECT 
        'categories' as table_name, COUNT(*) as count FROM categories
      UNION ALL
      SELECT 'suppliers', COUNT(*) FROM suppliers
      UNION ALL
      SELECT 'supplier_products', COUNT(*) FROM supplier_products
      UNION ALL
      SELECT 'rfq_requests', COUNT(*) FROM rfq_requests
    `);
    
    console.log('\n📊 Database Summary:');
    console.log('===================');
    counts.rows.forEach(row => {
      console.log(`${row.table_name}: ${row.count} records`);
    });
    
    console.log('\n🎉 Quick setup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Import N8N workflows');
    console.log('2. Configure API keys');
    console.log('3. Test RFQ automation');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await pool.end();
  }
}

quickSetup();
