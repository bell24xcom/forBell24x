-- Bell24H Complete Database Setup for Neon PostgreSQL
-- Run this script using: psql 'postgresql://neondb_owner:npg_0Duqdxs3RoyA@ep-super-wind-a1c1ni4n-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'

-- 1. Create Categories Table
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

-- 2. Create Sources Table
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

-- 3. Create Suppliers Table
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

-- 4. Create Supplier Products Table
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

-- 5. Create RFQ Requests Table
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

-- 6. Create Leads Table
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

-- 7. Create Scraping Batches Table
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

-- 8. Create Scraping Logs Table
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

-- 9. Create GST Verifications Table
CREATE TABLE IF NOT EXISTS gst_verifications (
    id SERIAL PRIMARY KEY,
    supplier_id INTEGER REFERENCES suppliers(id),
    gst_number VARCHAR(15) NOT NULL,
    verification_status VARCHAR(50) DEFAULT 'pending',
    verification_data JSONB,
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_suppliers_category ON suppliers(category_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_email ON suppliers(email);
CREATE INDEX IF NOT EXISTS idx_suppliers_phone ON suppliers(phone);
CREATE INDEX IF NOT EXISTS idx_suppliers_claimed ON suppliers(is_claimed);
CREATE INDEX IF NOT EXISTS idx_suppliers_verified ON suppliers(is_verified);
CREATE INDEX IF NOT EXISTS idx_supplier_products_supplier ON supplier_products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_products_category ON supplier_products(category_id);
CREATE INDEX IF NOT EXISTS idx_rfq_requests_category ON rfq_requests(category_id);
CREATE INDEX IF NOT EXISTS idx_rfq_requests_status ON rfq_requests(status);
CREATE INDEX IF NOT EXISTS idx_leads_supplier ON leads(supplier_id);
CREATE INDEX IF NOT EXISTS idx_leads_rfq ON leads(rfq_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);

-- 11. Insert Categories Data
INSERT INTO categories (name, slug, description, mock_rfq_count) VALUES
('Textiles & Apparel', 'textiles-apparel', 'All textile and apparel products', 15),
('Electronics & Electrical', 'electronics-electrical', 'Electronic components and electrical equipment', 12),
('Machinery & Equipment', 'machinery-equipment', 'Industrial machinery and equipment', 18),
('Chemicals & Materials', 'chemicals-materials', 'Chemical products and raw materials', 10),
('Food & Beverages', 'food-beverages', 'Food products and beverages', 8),
('Automotive & Transportation', 'automotive-transportation', 'Automotive parts and transportation equipment', 14),
('Construction & Building', 'construction-building', 'Construction materials and building supplies', 16),
('Healthcare & Medical', 'healthcare-medical', 'Medical equipment and healthcare products', 9),
('Agriculture & Farming', 'agriculture-farming', 'Agricultural equipment and farming supplies', 11),
('Packaging & Printing', 'packaging-printing', 'Packaging materials and printing services', 7)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    updated_at = CURRENT_TIMESTAMP;

-- 12. Insert Subcategories
INSERT INTO categories (name, slug, parent_id, description, mock_rfq_count) VALUES
-- Textiles subcategories
('Cotton Fabrics', 'cotton-fabrics', 1, 'Cotton textile products', 8),
('Silk Fabrics', 'silk-fabrics', 1, 'Silk textile products', 5),
('Woolen Fabrics', 'woolen-fabrics', 1, 'Woolen textile products', 4),
('Synthetic Fabrics', 'synthetic-fabrics', 1, 'Synthetic textile products', 6),
('Handloom Products', 'handloom-products', 1, 'Traditional handloom products', 3),

-- Electronics subcategories
('Electronic Components', 'electronic-components', 2, 'Electronic components and parts', 7),
('Consumer Electronics', 'consumer-electronics', 2, 'Consumer electronic devices', 5),
('Industrial Electronics', 'industrial-electronics', 2, 'Industrial electronic equipment', 6),
('Telecommunications', 'telecommunications', 2, 'Telecom equipment and devices', 4),

-- Machinery subcategories
('Textile Machinery', 'textile-machinery', 3, 'Machinery for textile industry', 9),
('Food Processing Machinery', 'food-processing-machinery', 3, 'Food processing equipment', 6),
('Packaging Machinery', 'packaging-machinery', 3, 'Packaging and wrapping machinery', 5),
('Construction Machinery', 'construction-machinery', 3, 'Construction equipment and machinery', 8)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    updated_at = CURRENT_TIMESTAMP;

-- 13. Insert Sources Data
INSERT INTO sources (name, url, source_type, scrape_frequency, category_match_method) VALUES
('IndiaMART', 'https://www.indiamart.com', 'B2B Marketplace', 24, 'url-slug'),
('TradeIndia', 'https://www.tradeindia.com', 'B2B Marketplace', 24, 'url-slug'),
('ExportersIndia', 'https://www.exportersindia.com', 'B2B Marketplace', 24, 'url-slug'),
('Udyam Registration', 'https://udyamregistration.gov.in', 'Government Portal', 168, 'llm-classifier'),
('GeM Portal', 'https://gem.gov.in', 'Government Portal', 168, 'llm-classifier'),
('DGFT IEC', 'https://dgft.gov.in', 'Government Portal', 168, 'llm-classifier'),
('CII Directory', 'https://www.cii.in', 'Industry Association', 168, 'url-slug'),
('FICCI Members', 'https://www.ficci.in', 'Industry Association', 168, 'url-slug')
ON CONFLICT DO NOTHING;

-- 14. Insert Sample Suppliers
INSERT INTO suppliers (
    company_name, contact_person, email, phone, website, address,
    city, state, pincode, category_id, subcategory_id, gst_number,
    pan_number, source_id, lead_score, is_verified
) VALUES
('Rajesh Textiles Pvt Ltd', 'Rajesh Kumar', 'rajesh@rajeshtextiles.com', '+91-9876543210', 
 'https://www.rajeshtextiles.com', '123 Textile Street, Surat, Gujarat', 'Surat', 'Gujarat', 
 '395001', 1, 11, '24AABCR1234A1Z5', 'AABCR1234A', 1, 85, true),
 
('Mumbai Electronics Co', 'Priya Sharma', 'priya@mumbaielectronics.com', '+91-9876543211', 
 'https://www.mumbaielectronics.com', '456 Electronics Hub, Mumbai, Maharashtra', 'Mumbai', 'Maharashtra', 
 '400001', 2, 16, '27AABCR1234A1Z6', 'AABCR1234B', 2, 92, true),
 
('Delhi Machinery Works', 'Amit Singh', 'amit@delhimachinery.com', '+91-9876543212', 
 'https://www.delhimachinery.com', '789 Industrial Area, Delhi', 'Delhi', 'Delhi', 
 '110001', 3, 20, '07AABCR1234A1Z7', 'AABCR1234C', 3, 78, true),
 
('Chennai Chemical Industries', 'Suresh Reddy', 'suresh@chennaichemical.com', '+91-9876543213', 
 'https://www.chennaichemical.com', '321 Chemical Zone, Chennai, Tamil Nadu', 'Chennai', 'Tamil Nadu', 
 '600001', 4, 24, '33AABCR1234A1Z8', 'AABCR1234D', 4, 88, true),
 
('Bangalore Food Products', 'Kavitha Nair', 'kavitha@bangalorefood.com', '+91-9876543214', 
 'https://www.bangalorefood.com', '654 Food Park, Bangalore, Karnataka', 'Bangalore', 'Karnataka', 
 '560001', 5, NULL, '29AABCR1234A1Z9', 'AABCR1234E', 5, 75, true);

-- 15. Insert Sample Products
INSERT INTO supplier_products (
    supplier_id, product_name, product_description, price_range_min, price_range_max, 
    unit, category_id, specifications, is_featured
) VALUES
(1, 'Premium Cotton Fabric', 'High quality cotton fabric for apparel manufacturing', 150.00, 300.00, 
 'per meter', 1, '{"material": "100% Cotton", "weight": "150 GSM", "color": "White"}', true),
 
(2, 'Electronic Components Kit', 'Complete kit of electronic components for DIY projects', 500.00, 1500.00, 
 'per kit', 2, '{"components": 50, "voltage": "12V", "current": "2A"}', true),
 
(3, 'Industrial Textile Machine', 'Heavy duty textile processing machine', 50000.00, 150000.00, 
 'per unit', 3, '{"capacity": "1000 kg/hour", "power": "10 HP", "automation": "Semi-automatic"}', true),
 
(4, 'Industrial Chemical Solution', 'Specialized chemical solution for industrial applications', 200.00, 800.00, 
 'per liter', 4, '{"concentration": "95%", "pH": "7.2", "purity": "99.9%"}', true),
 
(5, 'Organic Food Products', 'Certified organic food products for health-conscious consumers', 100.00, 500.00, 
 'per kg', 5, '{"certification": "Organic", "shelf_life": "12 months", "packaging": "Eco-friendly"}', true);

-- 16. Insert Sample RFQ Requests
INSERT INTO rfq_requests (
    title, description, category_id, budget_min, budget_max, quantity, unit,
    buyer_name, buyer_email, buyer_phone, buyer_company, status, priority
) VALUES
('Cotton Fabric for Apparel Manufacturing', 'Need high quality cotton fabric for manufacturing 1000 pieces of shirts', 
 1, 50000.00, 75000.00, 1000, 'meters', 'John Smith', 'john@fashioncorp.com', '+91-9876543215', 
 'Fashion Corp Ltd', 'open', 'high'),
 
('Electronic Components for IoT Project', 'Looking for electronic components for IoT device development', 
 2, 25000.00, 40000.00, 500, 'pieces', 'Sarah Johnson', 'sarah@techstartup.com', '+91-9876543216', 
 'TechStartup Inc', 'open', 'medium'),
 
('Industrial Machinery for Textile Plant', 'Need textile processing machinery for new manufacturing facility', 
 3, 500000.00, 750000.00, 2, 'units', 'Mike Wilson', 'mike@textilecorp.com', '+91-9876543217', 
 'Textile Corp Ltd', 'open', 'high');

-- 17. Update Category Statistics
UPDATE categories SET 
    total_suppliers = (
        SELECT COUNT(*) FROM suppliers 
        WHERE category_id = categories.id OR subcategory_id = categories.id
    ),
    total_products = (
        SELECT COUNT(*) FROM supplier_products sp
        JOIN suppliers s ON sp.supplier_id = s.id
        WHERE s.category_id = categories.id OR s.subcategory_id = categories.id
    );

-- 18. Final Verification Query
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
SELECT 'gst_verifications', COUNT(*) FROM gst_verifications;

-- Success message
SELECT 'Database setup completed successfully! All tables created and seeded with sample data.' as status;
