const { Pool } = require('pg');

// Neon Database Connection
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_0Duqdxs3RoyA@ep-super-wind-a1c1ni4n-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false }
});

async function setupDatabaseAutomatically() {
  try {
    console.log('🚀 BELL24H DATABASE SETUP - 400+ CATEGORIES');
    console.log('=============================================');
    
    // Test connection
    console.log('1. Testing connection...');
    const testResult = await pool.query('SELECT NOW() as current_time');
    console.log('✅ Connected at:', testResult.rows[0].current_time);
    
    // 1. Create Tables
    console.log('\n2. Creating database tables...');
    
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
    
    // 3. Create Indexes
    console.log('\n3. Creating performance indexes...');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_suppliers_category ON suppliers(category_id)',
      'CREATE INDEX IF NOT EXISTS idx_suppliers_email ON suppliers(email)',
      'CREATE INDEX IF NOT EXISTS idx_suppliers_claimed ON suppliers(is_claimed)',
      'CREATE INDEX IF NOT EXISTS idx_supplier_products_supplier ON supplier_products(supplier_id)',
      'CREATE INDEX IF NOT EXISTS idx_rfq_requests_category ON rfq_requests(category_id)',
      'CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug)'
    ];
    
    for (const indexQuery of indexes) {
      await pool.query(indexQuery);
    }
    console.log('✅ Performance indexes created');
    
    // 4. Insert Main Categories (50)
    console.log('\n4. Inserting 50 main categories...');
    const mainCategories = [
      { name: 'Agriculture', slug: 'agriculture', description: 'Agricultural equipment, farming supplies, seeds, and organic farming tools', mock_rfq_count: 15 },
      { name: 'Apparel & Fashion', slug: 'apparel-fashion', description: 'Fashion clothing, textiles, footwear, and fashion accessories', mock_rfq_count: 18 },
      { name: 'Automobile', slug: 'automobile', description: 'Auto parts, vehicles, tires, and automotive accessories', mock_rfq_count: 22 },
      { name: 'Ayurveda & Herbal Products', slug: 'ayurveda-herbal-products', description: 'Herbal medicines, ayurvedic products, and natural remedies', mock_rfq_count: 12 },
      { name: 'Business Services', slug: 'business-services', description: 'Professional services, consulting, and business solutions', mock_rfq_count: 8 },
      { name: 'Chemical', slug: 'chemical', description: 'Industrial chemicals, specialty chemicals, and chemical products', mock_rfq_count: 16 },
      { name: 'Computers and Internet', slug: 'computers-internet', description: 'IT services, software development, and technology solutions', mock_rfq_count: 20 },
      { name: 'Consumer Electronics', slug: 'consumer-electronics', description: 'Electronic devices, gadgets, and consumer technology', mock_rfq_count: 25 },
      { name: 'Cosmetics & Personal Care', slug: 'cosmetics-personal-care', description: 'Beauty products, personal care items, and cosmetics', mock_rfq_count: 14 },
      { name: 'Electronics & Electrical', slug: 'electronics-electrical', description: 'Electrical components, equipment, and electronic devices', mock_rfq_count: 19 },
      { name: 'Food Products & Beverage', slug: 'food-products-beverage', description: 'Food items, beverages, and culinary products', mock_rfq_count: 17 },
      { name: 'Furniture & Carpentry Services', slug: 'furniture-carpentry-services', description: 'Furniture, carpentry services, and wooden products', mock_rfq_count: 13 },
      { name: 'Gifts & Crafts', slug: 'gifts-crafts', description: 'Handicrafts, gifts, and artistic products', mock_rfq_count: 11 },
      { name: 'Health & Beauty', slug: 'health-beauty', description: 'Health products, beauty enhancers, and wellness items', mock_rfq_count: 16 },
      { name: 'Home Furnishings', slug: 'home-furnishings', description: 'Home decoration, furnishings, and interior products', mock_rfq_count: 12 },
      { name: 'Home Supplies', slug: 'home-supplies', description: 'Household items, cleaning products, and home essentials', mock_rfq_count: 10 },
      { name: 'Industrial Machinery', slug: 'industrial-machinery', description: 'Heavy machinery, industrial equipment, and manufacturing tools', mock_rfq_count: 24 },
      { name: 'Industrial Supplies', slug: 'industrial-supplies', description: 'Industrial components, parts, and manufacturing supplies', mock_rfq_count: 18 },
      { name: 'Jewelry & Jewelry Designers', slug: 'jewelry-jewelry-designers', description: 'Precious jewelry, fashion jewelry, and jewelry design services', mock_rfq_count: 9 },
      { name: 'Mineral & Metals', slug: 'mineral-metals', description: 'Metals, minerals, and raw materials for industry', mock_rfq_count: 21 },
      { name: 'Office Supplies', slug: 'office-supplies', description: 'Office equipment, stationery, and workplace essentials', mock_rfq_count: 7 },
      { name: 'Packaging & Paper', slug: 'packaging-paper', description: 'Packaging materials, paper products, and packaging solutions', mock_rfq_count: 15 },
      { name: 'Real Estate, Building & Construction', slug: 'real-estate-building-construction', description: 'Construction materials, building supplies, and real estate services', mock_rfq_count: 26 },
      { name: 'Security Products & Services', slug: 'security-products-services', description: 'Security equipment, surveillance systems, and safety products', mock_rfq_count: 13 },
      { name: 'Sports Goods & Entertainment', slug: 'sports-goods-entertainment', description: 'Sports equipment, entertainment products, and recreational items', mock_rfq_count: 11 },
      { name: 'Telecommunication', slug: 'telecommunication', description: 'Telecom equipment, communication devices, and network solutions', mock_rfq_count: 17 },
      { name: 'Textiles, Yarn & Fabrics', slug: 'textiles-yarn-fabrics', description: 'Textile materials, fabrics, and yarn products', mock_rfq_count: 20 },
      { name: 'Tools & Equipment', slug: 'tools-equipment', description: 'Hand tools, power tools, and industrial equipment', mock_rfq_count: 19 },
      { name: 'Tours, Travels & Hotels', slug: 'tours-travels-hotels', description: 'Travel services, hotel bookings, and tourism solutions', mock_rfq_count: 8 },
      { name: 'Toys & Games', slug: 'toys-games', description: 'Children toys, games, and entertainment products', mock_rfq_count: 6 },
      { name: 'Renewable Energy Equipment', slug: 'renewable-energy-equipment', description: 'Solar panels, wind turbines, and clean energy solutions', mock_rfq_count: 14 },
      { name: 'Artificial Intelligence & Automation Tools', slug: 'artificial-intelligence-automation-tools', description: 'AI software, robotics, and automation solutions', mock_rfq_count: 22 },
      { name: 'Sustainable & Eco-Friendly Products', slug: 'sustainable-eco-friendly-products', description: 'Eco-friendly products, sustainable materials, and green solutions', mock_rfq_count: 13 },
      { name: 'Healthcare Equipment & Technology', slug: 'healthcare-equipment-technology', description: 'Medical devices, health technology, and healthcare solutions', mock_rfq_count: 18 },
      { name: 'E-commerce & Digital Platforms Solutions', slug: 'e-commerce-digital-platforms-solutions', description: 'Online platforms, digital solutions, and e-commerce services', mock_rfq_count: 16 },
      { name: 'Gaming & Esports Hardware', slug: 'gaming-esports-hardware', description: 'Gaming equipment, esports hardware, and gaming accessories', mock_rfq_count: 12 },
      { name: 'Electric Vehicles (EVs) & Charging Solutions', slug: 'electric-vehicles-evs-charging-solutions', description: 'EV components, charging stations, and electric vehicle solutions', mock_rfq_count: 15 },
      { name: 'Drones & UAVs', slug: 'drones-uavs', description: 'Drone equipment, UAV technology, and aerial solutions', mock_rfq_count: 11 },
      { name: 'Wearable Technology', slug: 'wearable-technology', description: 'Smartwatches, fitness trackers, and wearable devices', mock_rfq_count: 14 },
      { name: 'Logistics & Supply Chain Solutions', slug: 'logistics-supply-chain-solutions', description: 'Logistics services, supply chain management, and transportation', mock_rfq_count: 17 },
      { name: '3D Printing Equipment', slug: '3d-printing-equipment', description: '3D printers, printing materials, and additive manufacturing', mock_rfq_count: 10 },
      { name: 'Food Tech & Agri-Tech', slug: 'food-tech-agri-tech', description: 'Food technology, agricultural technology, and agri-tech solutions', mock_rfq_count: 13 },
      { name: 'Iron & Steel Industry', slug: 'iron-steel-industry', description: 'Steel production, iron smelting, and metallurgical products', mock_rfq_count: 25 },
      { name: 'Mining & Raw Materials', slug: 'mining-raw-materials', description: 'Mining equipment, raw materials, and mineral extraction', mock_rfq_count: 20 },
      { name: 'Metal Recycling', slug: 'metal-recycling', description: 'Metal recycling services, scrap processing, and waste management', mock_rfq_count: 12 },
      { name: 'Metallurgy & Metalworking', slug: 'metallurgy-metalworking', description: 'Metal processing, forging, and metallurgical services', mock_rfq_count: 18 },
      { name: 'Heavy Machinery & Mining Equipment', slug: 'heavy-machinery-mining-equipment', description: 'Heavy equipment, mining machinery, and industrial vehicles', mock_rfq_count: 23 },
      { name: 'Ferrous and Non-Ferrous Metals', slug: 'ferrous-non-ferrous-metals', description: 'Steel, aluminum, copper, and other metal products', mock_rfq_count: 21 },
      { name: 'Mining Safety & Environmental Solutions', slug: 'mining-safety-environmental-solutions', description: 'Safety equipment, environmental monitoring, and mining safety', mock_rfq_count: 9 },
      { name: 'Precious Metals & Mining', slug: 'precious-metals-mining', description: 'Gold, silver, platinum, and precious metal mining', mock_rfq_count: 7 }
    ];
    
    for (const category of mainCategories) {
      await pool.query(`
        INSERT INTO categories (name, slug, description, mock_rfq_count)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (slug) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          updated_at = CURRENT_TIMESTAMP
      `, [category.name, category.slug, category.description, category.mock_rfq_count]);
    }
    console.log('✅ 50 main categories inserted');
    
    // 5. Insert Key Subcategories (sample of 400+)
    console.log('\n5. Inserting key subcategories...');
    const subcategories = [
      // Agriculture subcategories
      { name: 'Agriculture Equipment', slug: 'agriculture-equipment', parent_id: 1, description: 'Tractors, harvesters, and farming machinery', mock_rfq_count: 8 },
      { name: 'Fresh Flowers', slug: 'fresh-flowers', parent_id: 1, description: 'Fresh cut flowers and floral arrangements', mock_rfq_count: 5 },
      { name: 'Seeds & Saplings', slug: 'seeds-saplings', parent_id: 1, description: 'Agricultural seeds, saplings, and plant materials', mock_rfq_count: 6 },
      { name: 'Tractor Parts', slug: 'tractor-parts', parent_id: 1, description: 'Spare parts and components for tractors', mock_rfq_count: 4 },
      
      // Textiles subcategories
      { name: 'Cotton Fabrics', slug: 'cotton-fabrics', parent_id: 27, description: 'Cotton textile materials and fabrics', mock_rfq_count: 15 },
      { name: 'Leather Materials', slug: 'leather-materials', parent_id: 27, description: 'Leather goods and leather products', mock_rfq_count: 8 },
      { name: 'Synthetic Fibers', slug: 'synthetic-fibers', parent_id: 27, description: 'Synthetic textile fibers and materials', mock_rfq_count: 12 },
      
      // Electronics subcategories
      { name: 'Electronic Components', slug: 'electronic-components', parent_id: 10, description: 'Electronic components and parts', mock_rfq_count: 11 },
      { name: 'Cables & Wires', slug: 'cables-wires', parent_id: 10, description: 'Electrical cables, wires, and connectors', mock_rfq_count: 9 },
      { name: 'Batteries & Energy Storage', slug: 'batteries-energy-storage', parent_id: 10, description: 'Batteries and energy storage solutions', mock_rfq_count: 12 },
      
      // Steel Industry subcategories
      { name: 'Steel Production', slug: 'steel-production', parent_id: 43, description: 'Steel manufacturing and production equipment', mock_rfq_count: 18 },
      { name: 'Iron Smelting', slug: 'iron-smelting', parent_id: 43, description: 'Iron smelting and processing equipment', mock_rfq_count: 15 },
      { name: 'Ferrous Metals', slug: 'ferrous-metals', parent_id: 43, description: 'Iron and steel products', mock_rfq_count: 20 }
    ];
    
    for (const subcategory of subcategories) {
      await pool.query(`
        INSERT INTO categories (name, slug, parent_id, description, mock_rfq_count)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (slug) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          updated_at = CURRENT_TIMESTAMP
      `, [subcategory.name, subcategory.slug, subcategory.parent_id, subcategory.description, subcategory.mock_rfq_count]);
    }
    console.log('✅ Key subcategories inserted');
    
    // 6. Insert Sources
    console.log('\n6. Inserting scraping sources...');
    const sources = [
      { name: 'IndiaMART', url: 'https://www.indiamart.com', source_type: 'B2B Marketplace', scrape_frequency: 24, category_match_method: 'url-slug' },
      { name: 'TradeIndia', url: 'https://www.tradeindia.com', source_type: 'B2B Marketplace', scrape_frequency: 24, category_match_method: 'url-slug' },
      { name: 'ExportersIndia', url: 'https://www.exportersindia.com', source_type: 'B2B Marketplace', scrape_frequency: 24, category_match_method: 'url-slug' },
      { name: 'Udyam Registration', url: 'https://udyamregistration.gov.in', source_type: 'Government Portal', scrape_frequency: 168, category_match_method: 'llm-classifier' },
      { name: 'GeM Portal', url: 'https://gem.gov.in', source_type: 'Government Portal', scrape_frequency: 168, category_match_method: 'llm-classifier' }
    ];
    
    for (const source of sources) {
      await pool.query(`
        INSERT INTO sources (name, url, source_type, scrape_frequency, category_match_method)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT DO NOTHING
      `, [source.name, source.url, source.source_type, source.scrape_frequency, source.category_match_method]);
    }
    console.log('✅ Scraping sources inserted');
    
    // 7. Insert Sample Suppliers
    console.log('\n7. Inserting sample suppliers...');
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
        category_id: 27,
        subcategory_id: 64,
        gst_number: '24AABCR1234A1Z5',
        pan_number: 'AABCR1234A',
        source_id: 1,
        lead_score: 85,
        is_verified: true
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
        category_id: 10,
        subcategory_id: 67,
        gst_number: '27AABCR1234A1Z6',
        pan_number: 'AABCR1234B',
        source_id: 2,
        lead_score: 92,
        is_verified: true
      },
      {
        company_name: 'Delhi Steel Works',
        contact_person: 'Amit Singh',
        email: 'amit@delhisteel.com',
        phone: '+91-9876543212',
        website: 'https://www.delhisteel.com',
        address: '789 Industrial Area, Delhi',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110001',
        category_id: 43,
        subcategory_id: 70,
        gst_number: '07AABCR1234A1Z7',
        pan_number: 'AABCR1234C',
        source_id: 3,
        lead_score: 78,
        is_verified: true
      }
    ];
    
    for (const supplier of suppliers) {
      const result = await pool.query(`
        INSERT INTO suppliers (
          company_name, contact_person, email, phone, website, address,
          city, state, pincode, category_id, subcategory_id, gst_number,
          pan_number, source_id, lead_score, is_verified
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING id
      `, [
        supplier.company_name, supplier.contact_person, supplier.email,
        supplier.phone, supplier.website, supplier.address, supplier.city,
        supplier.state, supplier.pincode, supplier.category_id,
        supplier.subcategory_id, supplier.gst_number, supplier.pan_number,
        supplier.source_id, supplier.lead_score, supplier.is_verified
      ]);
      
      const supplierId = result.rows[0].id;
      
      // Add sample product
      await pool.query(`
        INSERT INTO supplier_products (
          supplier_id, product_name, product_description, price_range_min,
          price_range_max, unit, category_id, specifications, is_featured
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        supplierId, 
        `Sample Product from ${supplier.company_name}`,
        'High quality product for B2B marketplace',
        100.00, 500.00, 'per unit', supplier.category_id,
        JSON.stringify({ material: 'Premium Quality', warranty: '1 year' }),
        true
      ]);
    }
    console.log('✅ Sample suppliers and products inserted');
    
    // 8. Insert Sample RFQs
    console.log('\n8. Inserting sample RFQ requests...');
    await pool.query(`
      INSERT INTO rfq_requests (
        title, description, category_id, budget_min, budget_max, quantity, unit,
        buyer_name, buyer_email, buyer_phone, buyer_company, status, priority
      ) VALUES 
      ('Cotton Fabric for Apparel Manufacturing', 'Need high quality cotton fabric for manufacturing 1000 pieces of shirts', 
       27, 50000.00, 75000.00, 1000, 'meters', 'John Smith', 'john@fashioncorp.com', '+91-9876543215', 
       'Fashion Corp Ltd', 'open', 'high'),
      ('Steel Rods for Construction Project', 'Need TMT steel rods for residential construction project', 
       43, 200000.00, 300000.00, 50, 'tons', 'Mike Wilson', 'mike@construction.com', '+91-9876543217', 
       'BuildCorp Ltd', 'open', 'high'),
      ('Electronic Components for IoT Project', 'Looking for electronic components for IoT device development', 
       10, 25000.00, 40000.00, 500, 'pieces', 'Sarah Johnson', 'sarah@techstartup.com', '+91-9876543216', 
       'TechStartup Inc', 'open', 'medium')
    `);
    console.log('✅ Sample RFQ requests inserted');
    
    // 9. Update Category Statistics
    console.log('\n9. Updating category statistics...');
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
    
    // 10. Final Verification
    console.log('\n10. Final verification...');
    const counts = await pool.query(`
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
    `);
    
    console.log('\n📊 DATABASE SETUP COMPLETE!');
    console.log('===========================');
    counts.rows.forEach(row => {
      console.log(`${row.table_name}: ${row.count} records`);
    });
    
    // Categories breakdown
    const categoriesBreakdown = await pool.query(`
      SELECT 
        CASE WHEN parent_id IS NULL THEN 'Main Categories' ELSE 'Subcategories' END as type,
        COUNT(*) as count
      FROM categories 
      GROUP BY CASE WHEN parent_id IS NULL THEN 'Main Categories' ELSE 'Subcategories' END
    `);
    
    console.log('\n📋 Categories Breakdown:');
    categoriesBreakdown.rows.forEach(row => {
      console.log(`${row.type}: ${row.count}`);
    });
    
    console.log('\n🎉 Bell24H Database Setup Completed Successfully!');
    console.log('\n✅ What was created:');
    console.log('   • 50 main categories + subcategories');
    console.log('   • Complete table structure for suppliers, products, RFQs');
    console.log('   • Sample data for testing');
    console.log('   • Performance indexes');
    console.log('   • Proper relationships between tables');
    
    console.log('\n🚀 Next Steps:');
    console.log('   1. Import N8N workflows with database connections');
    console.log('   2. Configure API keys in N8N');
    console.log('   3. Test RFQ automation workflow');
    console.log('   4. Set up supplier claim pages');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await pool.end();
  }
}

setupDatabaseAutomatically();
