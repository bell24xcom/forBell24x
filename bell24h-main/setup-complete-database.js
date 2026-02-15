const { Pool } = require('pg');

// Neon Database Connection
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_0Duqdxs3RoyA@ep-super-wind-a1c1ni4n-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false }
});

async function setupCompleteDatabase() {
  try {
    console.log('🚀 Setting up complete Bell24H database...');
    
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Connected to Neon database');
    
    // 1. Create all required tables
    console.log('\n📋 Creating database tables...');
    
    // Categories table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        parent_id INTEGER REFERENCES categories(id),
        description TEXT,
        icon VARCHAR(50),
        color VARCHAR(20),
        total_suppliers INTEGER DEFAULT 0,
        total_products INTEGER DEFAULT 0,
        avg_rating DECIMAL(3,2) DEFAULT 0.00,
        is_active BOOLEAN DEFAULT true,
        featured BOOLEAN DEFAULT false,
        mock_rfq_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Categories table created');
    
    // Sources table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sources (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        url TEXT NOT NULL,
        source_type VARCHAR(100) NOT NULL,
        scrape_frequency INTEGER DEFAULT 24,
        category_match_method VARCHAR(100),
        is_active BOOLEAN DEFAULT true,
        last_scraped_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Sources table created');
    
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
        country VARCHAR(100) DEFAULT 'India',
        pincode VARCHAR(10),
        category_id INTEGER REFERENCES categories(id),
        subcategory_id INTEGER REFERENCES categories(id),
        gst_number VARCHAR(15),
        pan_number VARCHAR(10),
        is_verified BOOLEAN DEFAULT false,
        is_claimed BOOLEAN DEFAULT false,
        claim_token VARCHAR(255),
        claim_expires_at TIMESTAMP,
        source_id INTEGER REFERENCES sources(id),
        source_url TEXT,
        lead_score INTEGER DEFAULT 0,
        last_contacted_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_scraped_at TIMESTAMP
      );
    `);
    console.log('✅ Suppliers table created');
    
    // Supplier Products table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS supplier_products (
        id SERIAL PRIMARY KEY,
        supplier_id INTEGER REFERENCES suppliers(id) ON DELETE CASCADE,
        product_name VARCHAR(255) NOT NULL,
        product_description TEXT,
        product_image_url TEXT,
        product_image_placeholder TEXT,
        price_range_min DECIMAL(10,2),
        price_range_max DECIMAL(10,2),
        unit VARCHAR(50),
        category_id INTEGER REFERENCES categories(id),
        specifications JSONB,
        is_featured BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Supplier Products table created');
    
    // RFQ Requests table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS rfq_requests (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category_id INTEGER REFERENCES categories(id),
        subcategory_id INTEGER REFERENCES categories(id),
        budget_min DECIMAL(12,2),
        budget_max DECIMAL(12,2),
        quantity INTEGER,
        unit VARCHAR(50),
        buyer_name VARCHAR(255),
        buyer_email VARCHAR(255),
        buyer_phone VARCHAR(20),
        buyer_company VARCHAR(255),
        status VARCHAR(50) DEFAULT 'open',
        priority VARCHAR(20) DEFAULT 'medium',
        deadline DATE,
        location VARCHAR(255),
        specifications JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ RFQ Requests table created');
    
    // Leads table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id SERIAL PRIMARY KEY,
        supplier_id INTEGER REFERENCES suppliers(id),
        rfq_id INTEGER REFERENCES rfq_requests(id),
        lead_score INTEGER DEFAULT 0,
        match_reason TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        contacted_at TIMESTAMP,
        responded_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Leads table created');
    
    // Scraping Batches table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS scraping_batches (
        id SERIAL PRIMARY KEY,
        source_id INTEGER REFERENCES sources(id),
        category_id INTEGER REFERENCES categories(id),
        batch_name VARCHAR(255),
        status VARCHAR(50) DEFAULT 'pending',
        total_urls INTEGER DEFAULT 0,
        processed_urls INTEGER DEFAULT 0,
        successful_urls INTEGER DEFAULT 0,
        failed_urls INTEGER DEFAULT 0,
        started_at TIMESTAMP,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Scraping Batches table created');
    
    // Scraping Logs table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS scraping_logs (
        id SERIAL PRIMARY KEY,
        batch_id INTEGER REFERENCES scraping_batches(id),
        url TEXT NOT NULL,
        status VARCHAR(50) NOT NULL,
        error_message TEXT,
        data_extracted JSONB,
        processing_time_ms INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Scraping Logs table created');
    
    // GST Verifications table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS gst_verifications (
        id SERIAL PRIMARY KEY,
        supplier_id INTEGER REFERENCES suppliers(id),
        gst_number VARCHAR(15) NOT NULL,
        verification_status VARCHAR(50) DEFAULT 'pending',
        verification_data JSONB,
        verified_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ GST Verifications table created');
    
    // 2. Create indexes for performance
    console.log('\n🔍 Creating database indexes...');
    
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_suppliers_category ON suppliers(category_id)',
      'CREATE INDEX IF NOT EXISTS idx_suppliers_email ON suppliers(email)',
      'CREATE INDEX IF NOT EXISTS idx_suppliers_phone ON suppliers(phone)',
      'CREATE INDEX IF NOT EXISTS idx_suppliers_claimed ON suppliers(is_claimed)',
      'CREATE INDEX IF NOT EXISTS idx_suppliers_verified ON suppliers(is_verified)',
      'CREATE INDEX IF NOT EXISTS idx_supplier_products_supplier ON supplier_products(supplier_id)',
      'CREATE INDEX IF NOT EXISTS idx_supplier_products_category ON supplier_products(category_id)',
      'CREATE INDEX IF NOT EXISTS idx_rfq_requests_category ON rfq_requests(category_id)',
      'CREATE INDEX IF NOT EXISTS idx_rfq_requests_status ON rfq_requests(status)',
      'CREATE INDEX IF NOT EXISTS idx_leads_supplier ON leads(supplier_id)',
      'CREATE INDEX IF NOT EXISTS idx_leads_rfq ON leads(rfq_id)',
      'CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug)',
      'CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id)'
    ];
    
    for (const indexQuery of indexes) {
      await pool.query(indexQuery);
    }
    console.log('✅ Database indexes created');
    
    // 3. Seed categories data
    console.log('\n🌱 Seeding categories data...');
    
    const categories = [
      // Main Categories
      { name: 'Textiles & Apparel', slug: 'textiles-apparel', description: 'All textile and apparel products' },
      { name: 'Electronics & Electrical', slug: 'electronics-electrical', description: 'Electronic components and electrical equipment' },
      { name: 'Machinery & Equipment', slug: 'machinery-equipment', description: 'Industrial machinery and equipment' },
      { name: 'Chemicals & Materials', slug: 'chemicals-materials', description: 'Chemical products and raw materials' },
      { name: 'Food & Beverages', slug: 'food-beverages', description: 'Food products and beverages' },
      { name: 'Automotive & Transportation', slug: 'automotive-transportation', description: 'Automotive parts and transportation equipment' },
      { name: 'Construction & Building', slug: 'construction-building', description: 'Construction materials and building supplies' },
      { name: 'Healthcare & Medical', slug: 'healthcare-medical', description: 'Medical equipment and healthcare products' },
      { name: 'Agriculture & Farming', slug: 'agriculture-farming', description: 'Agricultural equipment and farming supplies' },
      { name: 'Packaging & Printing', slug: 'packaging-printing', description: 'Packaging materials and printing services' },
      
      // Textiles Subcategories
      { name: 'Cotton Fabrics', slug: 'cotton-fabrics', parent_id: 1, description: 'Cotton textile products' },
      { name: 'Silk Fabrics', slug: 'silk-fabrics', parent_id: 1, description: 'Silk textile products' },
      { name: 'Woolen Fabrics', slug: 'woolen-fabrics', parent_id: 1, description: 'Woolen textile products' },
      { name: 'Synthetic Fabrics', slug: 'synthetic-fabrics', parent_id: 1, description: 'Synthetic textile products' },
      { name: 'Handloom Products', slug: 'handloom-products', parent_id: 1, description: 'Traditional handloom products' },
      
      // Electronics Subcategories
      { name: 'Electronic Components', slug: 'electronic-components', parent_id: 2, description: 'Electronic components and parts' },
      { name: 'Consumer Electronics', slug: 'consumer-electronics', parent_id: 2, description: 'Consumer electronic devices' },
      { name: 'Industrial Electronics', slug: 'industrial-electronics', parent_id: 2, description: 'Industrial electronic equipment' },
      { name: 'Telecommunications', slug: 'telecommunications', parent_id: 2, description: 'Telecom equipment and devices' },
      
      // Machinery Subcategories
      { name: 'Textile Machinery', slug: 'textile-machinery', parent_id: 3, description: 'Machinery for textile industry' },
      { name: 'Food Processing Machinery', slug: 'food-processing-machinery', parent_id: 3, description: 'Food processing equipment' },
      { name: 'Packaging Machinery', slug: 'packaging-machinery', parent_id: 3, description: 'Packaging and wrapping machinery' },
      { name: 'Construction Machinery', slug: 'construction-machinery', parent_id: 3, description: 'Construction equipment and machinery' },
      
      // Chemicals Subcategories
      { name: 'Industrial Chemicals', slug: 'industrial-chemicals', parent_id: 4, description: 'Industrial chemical products' },
      { name: 'Agricultural Chemicals', slug: 'agricultural-chemicals', parent_id: 4, description: 'Agricultural chemical products' },
      { name: 'Pharmaceutical Chemicals', slug: 'pharmaceutical-chemicals', parent_id: 4, description: 'Pharmaceutical chemical products' },
      { name: 'Specialty Chemicals', slug: 'specialty-chemicals', parent_id: 4, description: 'Specialty chemical products' }
    ];
    
    for (const category of categories) {
      await pool.query(`
        INSERT INTO categories (name, slug, parent_id, description, mock_rfq_count)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (slug) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          updated_at = CURRENT_TIMESTAMP
      `, [category.name, category.slug, category.parent_id || null, category.description, Math.floor(Math.random() * 10) + 1]);
    }
    console.log('✅ Categories seeded');
    
    // 4. Seed sources data
    console.log('\n🌱 Seeding sources data...');
    
    const sources = [
      { name: 'IndiaMART', url: 'https://www.indiamart.com', source_type: 'B2B Marketplace', scrape_frequency: 24 },
      { name: 'TradeIndia', url: 'https://www.tradeindia.com', source_type: 'B2B Marketplace', scrape_frequency: 24 },
      { name: 'ExportersIndia', url: 'https://www.exportersindia.com', source_type: 'B2B Marketplace', scrape_frequency: 24 },
      { name: 'Udyam Registration', url: 'https://udyamregistration.gov.in', source_type: 'Government Portal', scrape_frequency: 168 },
      { name: 'GeM Portal', url: 'https://gem.gov.in', source_type: 'Government Portal', scrape_frequency: 168 },
      { name: 'DGFT IEC', url: 'https://dgft.gov.in', source_type: 'Government Portal', scrape_frequency: 168 },
      { name: 'CII Directory', url: 'https://www.cii.in', source_type: 'Industry Association', scrape_frequency: 168 },
      { name: 'FICCI Members', url: 'https://www.ficci.in', source_type: 'Industry Association', scrape_frequency: 168 }
    ];
    
    for (const source of sources) {
      await pool.query(`
        INSERT INTO sources (name, url, source_type, scrape_frequency, category_match_method)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT DO NOTHING
      `, [source.name, source.url, source.source_type, source.scrape_frequency, 'url-slug']);
    }
    console.log('✅ Sources seeded');
    
    // 5. Seed suppliers data
    console.log('\n🌱 Seeding suppliers data...');
    
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
        pincode: '395001',
        category_id: 1,
        subcategory_id: 11,
        gst_number: '24AABCR1234A1Z5',
        pan_number: 'AABCR1234A',
        source_id: 1,
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
        pincode: '400001',
        category_id: 2,
        subcategory_id: 16,
        gst_number: '27AABCR1234A1Z6',
        pan_number: 'AABCR1234B',
        source_id: 2,
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
        pincode: '110001',
        category_id: 3,
        subcategory_id: 20,
        gst_number: '07AABCR1234A1Z7',
        pan_number: 'AABCR1234C',
        source_id: 3,
        lead_score: 78
      },
      {
        company_name: 'Chennai Chemical Industries',
        contact_person: 'Suresh Reddy',
        email: 'suresh@chennaichemical.com',
        phone: '+91-9876543213',
        website: 'https://www.chennaichemical.com',
        address: '321 Chemical Zone, Chennai, Tamil Nadu',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600001',
        category_id: 4,
        subcategory_id: 24,
        gst_number: '33AABCR1234A1Z8',
        pan_number: 'AABCR1234D',
        source_id: 4,
        lead_score: 88
      },
      {
        company_name: 'Bangalore Food Products',
        contact_person: 'Kavitha Nair',
        email: 'kavitha@bangalorefood.com',
        phone: '+91-9876543214',
        website: 'https://www.bangalorefood.com',
        address: '654 Food Park, Bangalore, Karnataka',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560001',
        category_id: 5,
        gst_number: '29AABCR1234A1Z9',
        pan_number: 'AABCR1234E',
        source_id: 5,
        lead_score: 75
      }
    ];
    
    for (const supplier of suppliers) {
      const result = await pool.query(`
        INSERT INTO suppliers (
          company_name, contact_person, email, phone, website, address,
          city, state, pincode, category_id, subcategory_id, gst_number,
          pan_number, source_id, lead_score, is_verified, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        RETURNING id
      `, [
        supplier.company_name, supplier.contact_person, supplier.email,
        supplier.phone, supplier.website, supplier.address, supplier.city,
        supplier.state, supplier.pincode, supplier.category_id,
        supplier.subcategory_id, supplier.gst_number, supplier.pan_number,
        supplier.source_id, supplier.lead_score, true, new Date()
      ]);
      
      const supplierId = result.rows[0].id;
      
      // Add products for each supplier
      const products = [
        {
          product_name: 'Premium Cotton Fabric',
          product_description: 'High quality cotton fabric for apparel manufacturing',
          price_range_min: 150.00,
          price_range_max: 300.00,
          unit: 'per meter',
          category_id: supplier.category_id,
          specifications: { material: '100% Cotton', weight: '150 GSM', color: 'White' }
        },
        {
          product_name: 'Electronic Components Kit',
          product_description: 'Complete kit of electronic components for DIY projects',
          price_range_min: 500.00,
          price_range_max: 1500.00,
          unit: 'per kit',
          category_id: supplier.category_id,
          specifications: { components: 50, voltage: '12V', current: '2A' }
        },
        {
          product_name: 'Industrial Textile Machine',
          product_description: 'Heavy duty textile processing machine',
          price_range_min: 50000.00,
          price_range_max: 150000.00,
          unit: 'per unit',
          category_id: supplier.category_id,
          specifications: { capacity: '1000 kg/hour', power: '10 HP', automation: 'Semi-automatic' }
        },
        {
          product_name: 'Industrial Chemical Solution',
          product_description: 'Specialized chemical solution for industrial applications',
          price_range_min: 200.00,
          price_range_max: 800.00,
          unit: 'per liter',
          category_id: supplier.category_id,
          specifications: { concentration: '95%', pH: '7.2', purity: '99.9%' }
        },
        {
          product_name: 'Organic Food Products',
          product_description: 'Certified organic food products for health-conscious consumers',
          price_range_min: 100.00,
          price_range_max: 500.00,
          unit: 'per kg',
          category_id: supplier.category_id,
          specifications: { certification: 'Organic', shelf_life: '12 months', packaging: 'Eco-friendly' }
        }
      ];
      
      const product = products[supplierId - 1] || products[0];
      
      await pool.query(`
        INSERT INTO supplier_products (
          supplier_id, product_name, product_description, price_range_min,
          price_range_max, unit, category_id, specifications, is_featured
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        supplierId, product.product_name, product.product_description,
        product.price_range_min, product.price_range_max, product.unit,
        product.category_id, JSON.stringify(product.specifications), true
      ]);
    }
    console.log('✅ Suppliers and products seeded');
    
    // 6. Update category counts
    console.log('\n📊 Updating category statistics...');
    
    await pool.query(`
      UPDATE categories SET 
        total_suppliers = (
          SELECT COUNT(*) FROM suppliers 
          WHERE category_id = categories.id OR subcategory_id = categories.id
        ),
        total_products = (
          SELECT COUNT(*) FROM supplier_products sp
          JOIN suppliers s ON sp.supplier_id = s.id
          WHERE s.category_id = categories.id OR s.subcategory_id = categories.id
        )
    `);
    console.log('✅ Category statistics updated');
    
    // 7. Verify final data
    console.log('\n📋 Final database verification...');
    
    const tableCounts = await pool.query(`
      SELECT 
        'categories' as table_name, COUNT(*) as count FROM categories
      UNION ALL
      SELECT 'sources', COUNT(*) FROM sources
      UNION ALL
      SELECT 'suppliers', COUNT(*) FROM suppliers
      UNION ALL
      SELECT 'supplier_products', COUNT(*) FROM supplier_products
      UNION ALL
      SELECT 'rfq_requests', COUNT(*) FROM rfq_requests
      UNION ALL
      SELECT 'leads', COUNT(*) FROM leads
      UNION ALL
      SELECT 'scraping_batches', COUNT(*) FROM scraping_batches
      UNION ALL
      SELECT 'scraping_logs', COUNT(*) FROM scraping_logs
      UNION ALL
      SELECT 'gst_verifications', COUNT(*) FROM gst_verifications
    `);
    
    console.log('\n📊 Database Summary:');
    console.log('===================');
    tableCounts.rows.forEach(row => {
      console.log(`${row.table_name}: ${row.count} records`);
    });
    
    console.log('\n🎉 Database setup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Import N8N workflows with database connections');
    console.log('2. Configure API keys in N8N');
    console.log('3. Test RFQ automation workflow');
    console.log('4. Set up supplier claim pages');
    
  } catch (error) {
    console.error('❌ Database setup error:', error.message);
    console.error('Full error:', error);
  } finally {
    await pool.end();
  }
}

setupCompleteDatabase();
