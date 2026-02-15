-- =====================================================
-- BELL24H MISSING DATABASE TABLES
-- =====================================================

-- 1. SUPPLIERS TABLE
-- Stores supplier information and profiles
CREATE TABLE IF NOT EXISTS public.suppliers (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    source VARCHAR(100) NOT NULL,
    products JSONB,
    email VARCHAR(255),
    phone VARCHAR(50),
    website VARCHAR(500),
    location TEXT,
    established_year INTEGER,
    employee_count INTEGER,
    certifications JSONB,
    quality_score INTEGER DEFAULT 0,
    lead_priority VARCHAR(20) DEFAULT 'medium',
    ai_analysis JSONB,
    location_data JSONB,
    final_score INTEGER DEFAULT 0,
    raw_data JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. RFQ REQUESTS TABLE
-- Stores RFQ (Request for Quote) information
CREATE TABLE IF NOT EXISTS public.rfq_requests (
    id SERIAL PRIMARY KEY,
    rfq_id VARCHAR(100) UNIQUE NOT NULL,
    product_category VARCHAR(100) NOT NULL,
    quantity VARCHAR(100),
    deadline VARCHAR(100),
    specifications TEXT,
    priority VARCHAR(20) DEFAULT 'normal',
    buyer_email VARCHAR(255),
    budget_range VARCHAR(100),
    delivery_location TEXT,
    status VARCHAR(50) DEFAULT 'active',
    suppliers_notified INTEGER DEFAULT 0,
    notification_sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. LEADS TABLE
-- Stores lead scoring and management data
CREATE TABLE IF NOT EXISTS public.leads (
    id SERIAL PRIMARY KEY,
    lead_id VARCHAR(100) UNIQUE NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    company_size VARCHAR(50),
    website VARCHAR(500),
    location TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    contact_name VARCHAR(255),
    total_score INTEGER DEFAULT 0,
    priority VARCHAR(20) DEFAULT 'medium',
    priority_score INTEGER DEFAULT 1,
    individual_scores JSONB,
    insights JSONB,
    recommended_actions JSONB,
    next_follow_up VARCHAR(50),
    source VARCHAR(100),
    status VARCHAR(50) DEFAULT 'scored',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. CREATE INDEXES for performance
CREATE INDEX IF NOT EXISTS idx_suppliers_category ON public.suppliers(category);
CREATE INDEX IF NOT EXISTS idx_suppliers_priority ON public.suppliers(lead_priority);
CREATE INDEX IF NOT EXISTS idx_suppliers_score ON public.suppliers(final_score);
CREATE INDEX IF NOT EXISTS idx_suppliers_active ON public.suppliers(is_active);
CREATE INDEX IF NOT EXISTS idx_rfq_status ON public.rfq_requests(status);
CREATE INDEX IF NOT EXISTS idx_rfq_category ON public.rfq_requests(product_category);
CREATE INDEX IF NOT EXISTS idx_leads_priority ON public.leads(priority);
CREATE INDEX IF NOT EXISTS idx_leads_score ON public.leads(total_score);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);

-- 5. UPDATE EXISTING TABLES (if they exist)
-- Add missing columns to existing tables if needed
DO $$ 
BEGIN
    -- Add columns to categories table if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'priority') THEN
        ALTER TABLE public.categories ADD COLUMN priority INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'is_active') THEN
        ALTER TABLE public.categories ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
    
    -- Add columns to sources table if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sources' AND column_name = 'is_active') THEN
        ALTER TABLE public.sources ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sources' AND column_name = 'rate_limit_per_minute') THEN
        ALTER TABLE public.sources ADD COLUMN rate_limit_per_minute INTEGER DEFAULT 10;
    END IF;
END $$;

-- 6. INSERT SAMPLE DATA for testing
-- Insert sample RFQ requests
INSERT INTO public.rfq_requests (rfq_id, product_category, quantity, deadline, specifications, priority, buyer_email, budget_range, delivery_location) VALUES
('RFQ-2024-001', 'steel-metal-products', '100 tons', '2024-02-15', 'High-grade steel sheets, thickness 2-5mm', 'high', 'buyer1@example.com', '$50,000 - $75,000', 'Mumbai, India'),
('RFQ-2024-002', 'electronics-components', '500 units', '2024-02-20', 'Microcontrollers, 32-bit ARM Cortex', 'medium', 'buyer2@example.com', '$10,000 - $15,000', 'Bangalore, India'),
('RFQ-2024-003', 'textiles-apparel', '1000 pieces', '2024-02-25', 'Cotton fabric, various colors and patterns', 'normal', 'buyer3@example.com', '$5,000 - $8,000', 'Delhi, India')
ON CONFLICT (rfq_id) DO NOTHING;

-- Insert sample leads
INSERT INTO public.leads (lead_id, company_name, industry, company_size, website, location, contact_email, contact_phone, total_score, priority, individual_scores, insights, recommended_actions, next_follow_up, source) VALUES
('LEAD-2024-001', 'TechCorp Solutions', 'software-development', 'large', 'https://techcorp.com', 'Bangalore, India', 'contact@techcorp.com', '+91-9876543210', 85, 'high', '{"company_size": 90, "industry_match": 95, "website_quality": 80, "contact_completeness": 90, "location_relevance": 85, "response_time": 70, "previous_interactions": 80}', '["Large company with significant purchasing power", "High-value industry match", "Complete contact information available"]', '["Immediate follow-up required", "Contact information complete", "Company verified"]', 'immediate', 'webhook'),
('LEAD-2024-002', 'SteelWorks India', 'steel-metal-products', 'medium', 'https://steelworks.in', 'Mumbai, India', 'info@steelworks.in', '+91-9876543211', 72, 'medium', '{"company_size": 70, "industry_match": 90, "website_quality": 60, "contact_completeness": 80, "location_relevance": 85, "response_time": 60, "previous_interactions": 50}', '["High-value industry match", "Located in preferred market"]', '["Standard follow-up process", "Request complete contact information", "Verify company legitimacy"]', '24_hours', 'webhook')
ON CONFLICT (lead_id) DO NOTHING;

-- Success message
SELECT 'Missing database tables created successfully!' as status,
       (SELECT COUNT(*) FROM public.suppliers) as suppliers_count,
       (SELECT COUNT(*) FROM public.rfq_requests) as rfq_count,
       (SELECT COUNT(*) FROM public.leads) as leads_count;
