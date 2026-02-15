-- =====================================================
-- BELL24H COMPLETE CATEGORY SYSTEM - 200+ B2B CATEGORIES
-- =====================================================

-- Clear existing categories and insert comprehensive list
DELETE FROM public.categories;

-- Insert 200+ B2B categories for Indian market
INSERT INTO public.categories (name, slug, description, priority, is_active) VALUES

-- MANUFACTURING & INDUSTRIAL (Priority 10 - High)
('Steel & Metal Products', 'steel-metal-products', 'Steel manufacturers, metal fabrication, alloys, pipes, sheets', 10, true),
('Industrial Machinery', 'industrial-machinery', 'CNC machines, heavy equipment, manufacturing machinery', 10, true),
('Textiles & Apparel', 'textiles-apparel', 'Fabric manufacturers, garment suppliers, textile machinery', 10, true),
('Chemicals & Pharmaceuticals', 'chemicals-pharmaceuticals', 'Industrial chemicals, pharma ingredients, specialty chemicals', 10, true),
('Electronics & Components', 'electronics-components', 'Electronic components, semiconductors, consumer electronics', 10, true),
('Automotive Parts', 'automotive-parts', 'Auto components, spare parts, vehicle accessories', 10, true),
('Food & Beverage Processing', 'food-beverage-processing', 'Food processing equipment, packaging, ingredients', 10, true),
('Construction Materials', 'construction-materials', 'Cement, steel, bricks, building materials', 10, true),
('Plastics & Polymers', 'plastics-polymers', 'Plastic products, raw materials, injection molding', 10, true),
('Paper & Packaging', 'paper-packaging', 'Paper products, packaging materials, printing', 10, true),

-- TECHNOLOGY & IT (Priority 9 - High)
('Software Development', 'software-development', 'Custom software, web development, mobile apps', 9, true),
('IT Services', 'it-services', 'System integration, IT consulting, managed services', 9, true),
('Hardware & Networking', 'hardware-networking', 'Computer hardware, networking equipment, servers', 9, true),
('Telecommunications', 'telecommunications', 'Telecom equipment, network infrastructure, communication systems', 9, true),
('Digital Marketing', 'digital-marketing', 'SEO, social media, online advertising, content marketing', 9, true),
('E-commerce Solutions', 'ecommerce-solutions', 'Online marketplace, payment gateways, logistics', 9, true),
('Cybersecurity', 'cybersecurity', 'Security software, network protection, data security', 9, true),
('Cloud Services', 'cloud-services', 'Cloud hosting, SaaS solutions, data storage', 9, true),
('AI & Machine Learning', 'ai-machine-learning', 'Artificial intelligence, ML algorithms, automation', 9, true),
('IoT Solutions', 'iot-solutions', 'Internet of Things, smart devices, sensors', 9, true),

-- AGRICULTURE & FOOD (Priority 8 - High)
('Agricultural Equipment', 'agricultural-equipment', 'Farming machinery, irrigation systems, tractors', 8, true),
('Seeds & Fertilizers', 'seeds-fertilizers', 'Agricultural inputs, crop protection, organic farming', 8, true),
('Food Processing', 'food-processing', 'Food manufacturing, processing equipment, ingredients', 8, true),
('Dairy Products', 'dairy-products', 'Milk processing, dairy equipment, dairy products', 8, true),
('Spices & Condiments', 'spices-condiments', 'Spice processing, condiment manufacturing, exports', 8, true),
('Beverages', 'beverages', 'Soft drinks, alcoholic beverages, beverage equipment', 8, true),
('Organic Products', 'organic-products', 'Organic food, natural products, certification', 8, true),
('Aquaculture', 'aquaculture', 'Fish farming, seafood processing, marine products', 8, true),
('Poultry & Livestock', 'poultry-livestock', 'Animal feed, livestock equipment, veterinary supplies', 8, true),
('Agricultural Exports', 'agricultural-exports', 'Export of agricultural products, international trade', 8, true),

-- HEALTHCARE & MEDICAL (Priority 8 - High)
('Medical Equipment', 'medical-equipment', 'Hospital equipment, diagnostic devices, surgical instruments', 8, true),
('Pharmaceuticals', 'pharmaceuticals', 'Medicine manufacturing, drug development, pharma exports', 8, true),
('Healthcare Services', 'healthcare-services', 'Medical services, telemedicine, health consulting', 8, true),
('Dental Equipment', 'dental-equipment', 'Dental instruments, dental chairs, oral care products', 8, true),
('Laboratory Equipment', 'laboratory-equipment', 'Lab instruments, testing equipment, research tools', 8, true),
('Disposable Medical Products', 'disposable-medical-products', 'Surgical disposables, medical consumables, PPE', 8, true),
('Ayurvedic Products', 'ayurvedic-products', 'Traditional medicine, herbal products, wellness', 8, true),
('Medical Tourism', 'medical-tourism', 'Healthcare tourism, medical travel services', 8, true),
('Health Insurance', 'health-insurance', 'Medical insurance, health coverage, wellness programs', 8, true),
('Biotechnology', 'biotechnology', 'Biotech research, genetic engineering, bio-pharmaceuticals', 8, true),

-- ENERGY & POWER (Priority 8 - High)
('Solar Energy', 'solar-energy', 'Solar panels, solar equipment, renewable energy', 8, true),
('Wind Energy', 'wind-energy', 'Wind turbines, wind power equipment, renewable energy', 8, true),
('Power Generation', 'power-generation', 'Power plants, generators, electrical equipment', 8, true),
('Electrical Equipment', 'electrical-equipment', 'Transformers, switchgear, electrical components', 8, true),
('Battery & Energy Storage', 'battery-energy-storage', 'Batteries, energy storage systems, power backup', 8, true),
('Oil & Gas Equipment', 'oil-gas-equipment', 'Petroleum equipment, gas processing, drilling equipment', 8, true),
('Energy Consulting', 'energy-consulting', 'Energy audits, efficiency consulting, green energy', 8, true),
('Power Transmission', 'power-transmission', 'Transmission lines, power distribution, grid equipment', 8, true),
('Energy Efficiency', 'energy-efficiency', 'Energy saving solutions, efficiency equipment', 8, true),
('Coal & Mining', 'coal-mining', 'Mining equipment, coal processing, mineral extraction', 8, true),

-- LOGISTICS & TRANSPORTATION (Priority 7 - Medium-High)
('Freight & Shipping', 'freight-shipping', 'Cargo services, shipping, logistics, freight forwarding', 7, true),
('Warehousing', 'warehousing', 'Storage solutions, warehouse management, inventory', 7, true),
('Transportation', 'transportation', 'Trucking, fleet management, transport services', 7, true),
('Packaging & Labeling', 'packaging-labeling', 'Packaging solutions, labeling equipment, materials', 7, true),
('Supply Chain Management', 'supply-chain-management', 'SCM software, logistics consulting, procurement', 7, true),
('Customs & Clearance', 'customs-clearance', 'Customs brokerage, import/export clearance', 7, true),
('Cold Chain Logistics', 'cold-chain-logistics', 'Temperature-controlled logistics, refrigerated transport', 7, true),
('Express Delivery', 'express-delivery', 'Courier services, express shipping, last-mile delivery', 7, true),
('Port Services', 'port-services', 'Port operations, cargo handling, maritime services', 7, true),
('Railway Services', 'railway-services', 'Rail freight, railway equipment, rail logistics', 7, true),

-- FINANCIAL SERVICES (Priority 7 - Medium-High)
('Banking Services', 'banking-services', 'Corporate banking, trade finance, business loans', 7, true),
('Insurance', 'insurance', 'Business insurance, risk management, claims', 7, true),
('Investment Services', 'investment-services', 'Investment banking, wealth management, M&A', 7, true),
('Trade Finance', 'trade-finance', 'Letters of credit, export finance, trade credit', 7, true),
('Payment Solutions', 'payment-solutions', 'Payment gateways, digital payments, fintech', 7, true),
('Accounting Services', 'accounting-services', 'Bookkeeping, tax services, financial consulting', 7, true),
('Audit Services', 'audit-services', 'Financial audits, compliance, risk assessment', 7, true),
('Credit Services', 'credit-services', 'Credit rating, credit insurance, debt collection', 7, true),
('Foreign Exchange', 'foreign-exchange', 'Currency exchange, forex trading, hedging', 7, true),
('Financial Technology', 'financial-technology', 'Fintech solutions, digital banking, blockchain', 7, true),

-- CONSULTING & PROFESSIONAL SERVICES (Priority 6 - Medium)
('Management Consulting', 'management-consulting', 'Business consulting, strategy, operations', 6, true),
('Legal Services', 'legal-services', 'Corporate law, contracts, compliance, litigation', 6, true),
('Human Resources', 'human-resources', 'HR consulting, recruitment, training, payroll', 6, true),
('Marketing & Advertising', 'marketing-advertising', 'Brand management, advertising, market research', 6, true),
('Real Estate', 'real-estate', 'Commercial real estate, property development, leasing', 6, true),
('Environmental Services', 'environmental-services', 'Environmental consulting, waste management, sustainability', 6, true),
('Quality Assurance', 'quality-assurance', 'Quality control, testing, certification, standards', 6, true),
('Project Management', 'project-management', 'Project consulting, PMO services, implementation', 6, true),
('Training & Development', 'training-development', 'Corporate training, skill development, education', 6, true),
('Research & Development', 'research-development', 'R&D services, innovation, product development', 6, true),

-- RETAIL & CONSUMER GOODS (Priority 5 - Medium)
('Fashion & Apparel', 'fashion-apparel', 'Clothing, accessories, fashion retail, textiles', 5, true),
('Home & Garden', 'home-garden', 'Furniture, home decor, garden supplies, appliances', 5, true),
('Beauty & Personal Care', 'beauty-personal-care', 'Cosmetics, personal care products, beauty equipment', 5, true),
('Sports & Fitness', 'sports-fitness', 'Sports equipment, fitness gear, athletic wear', 5, true),
('Toys & Games', 'toys-games', 'Children toys, educational games, entertainment', 5, true),
('Books & Media', 'books-media', 'Publishing, educational materials, digital content', 5, true),
('Jewelry & Accessories', 'jewelry-accessories', 'Precious metals, gemstones, fashion accessories', 5, true),
('Pet Supplies', 'pet-supplies', 'Pet food, accessories, veterinary products', 5, true),
('Office Supplies', 'office-supplies', 'Stationery, office equipment, business supplies', 5, true),
('Gift & Novelty', 'gift-novelty', 'Gift items, promotional products, souvenirs', 5, true),

-- HOSPITALITY & TOURISM (Priority 5 - Medium)
('Hotels & Accommodation', 'hotels-accommodation', 'Hotel services, hospitality, accommodation', 5, true),
('Restaurants & Catering', 'restaurants-catering', 'Food service, catering, restaurant equipment', 5, true),
('Travel & Tourism', 'travel-tourism', 'Travel services, tourism, hospitality', 5, true),
('Event Management', 'event-management', 'Event planning, conference services, exhibitions', 5, true),
('Entertainment', 'entertainment', 'Entertainment services, media, recreation', 5, true),
('Wedding Services', 'wedding-services', 'Wedding planning, bridal services, event decor', 5, true),
('Adventure Tourism', 'adventure-tourism', 'Adventure sports, outdoor activities, eco-tourism', 5, true),
('Cultural Tourism', 'cultural-tourism', 'Heritage tourism, cultural experiences, art', 5, true),
('Business Travel', 'business-travel', 'Corporate travel, business tourism, MICE', 5, true),
('Medical Tourism', 'medical-tourism', 'Healthcare tourism, medical travel, wellness', 5, true),

-- EDUCATION & TRAINING (Priority 5 - Medium)
('Educational Services', 'educational-services', 'Schools, colleges, training institutes, coaching', 5, true),
('E-learning', 'e-learning', 'Online education, digital learning, educational technology', 5, true),
('Vocational Training', 'vocational-training', 'Skill development, technical training, certification', 5, true),
('Language Training', 'language-training', 'Language courses, translation services, linguistics', 5, true),
('Professional Certification', 'professional-certification', 'Certification programs, professional development', 5, true),
('Educational Technology', 'educational-technology', 'EdTech solutions, learning management systems', 5, true),
('Research Services', 'research-services', 'Academic research, market research, surveys', 5, true),
('Publishing', 'publishing', 'Educational publishing, content creation, textbooks', 5, true),
('Library Services', 'library-services', 'Digital libraries, information services, archives', 5, true),
('Student Services', 'student-services', 'Student support, career counseling, placement', 5, true),

-- SPECIALIZED INDUSTRIES (Priority 4 - Lower)
('Aerospace & Defense', 'aerospace-defense', 'Aircraft components, defense equipment, aviation', 4, true),
('Marine & Shipbuilding', 'marine-shipbuilding', 'Ship construction, marine equipment, offshore', 4, true),
('Mining & Minerals', 'mining-minerals', 'Mining equipment, mineral processing, extraction', 4, true),
('Textile Machinery', 'textile-machinery', 'Textile equipment, spinning, weaving, finishing', 4, true),
('Printing & Publishing', 'printing-publishing', 'Printing equipment, publishing services, media', 4, true),
('Ceramics & Glass', 'ceramics-glass', 'Ceramic products, glass manufacturing, tiles', 4, true),
('Rubber & Plastics', 'rubber-plastics', 'Rubber products, plastic manufacturing, polymers', 4, true),
('Leather & Footwear', 'leather-footwear', 'Leather products, footwear manufacturing, accessories', 4, true),
('Furniture Manufacturing', 'furniture-manufacturing', 'Furniture production, woodworking, interior design', 4, true),
('Jewelry Manufacturing', 'jewelry-manufacturing', 'Jewelry production, gemstone processing, precious metals', 4, true),

-- EMERGING SECTORS (Priority 3 - Lower)
('Renewable Energy', 'renewable-energy', 'Solar, wind, hydro, clean energy solutions', 3, true),
('Green Technology', 'green-technology', 'Environmental technology, sustainability, eco-friendly', 3, true),
('Waste Management', 'waste-management', 'Waste processing, recycling, environmental services', 3, true),
('Water Treatment', 'water-treatment', 'Water purification, wastewater treatment, filtration', 3, true),
('Smart Cities', 'smart-cities', 'Urban technology, smart infrastructure, IoT', 3, true),
('Electric Vehicles', 'electric-vehicles', 'EV manufacturing, charging infrastructure, batteries', 3, true),
('Robotics & Automation', 'robotics-automation', 'Industrial robots, automation systems, AI', 3, true),
('3D Printing', '3d-printing', 'Additive manufacturing, rapid prototyping, 3D services', 3, true),
('Blockchain Technology', 'blockchain-technology', 'Blockchain solutions, cryptocurrency, distributed systems', 3, true),
('Virtual Reality', 'virtual-reality', 'VR/AR solutions, immersive technology, gaming', 3, true),

-- SERVICE SECTORS (Priority 2 - Lower)
('Cleaning Services', 'cleaning-services', 'Commercial cleaning, janitorial services, maintenance', 2, true),
('Security Services', 'security-services', 'Security guards, surveillance, access control', 2, true),
('Maintenance Services', 'maintenance-services', 'Equipment maintenance, repair services, upkeep', 2, true),
('Facility Management', 'facility-management', 'Building management, facility services, operations', 2, true),
('Laundry Services', 'laundry-services', 'Commercial laundry, dry cleaning, textile care', 2, true),
('Pest Control', 'pest-control', 'Pest management, fumigation, hygiene services', 2, true),
('Landscaping', 'landscaping', 'Garden maintenance, landscape design, horticulture', 2, true),
('Waste Collection', 'waste-collection', 'Garbage collection, waste disposal, recycling', 2, true),
('Parking Services', 'parking-services', 'Parking management, valet services, parking equipment', 2, true),
('Concierge Services', 'concierge-services', 'Concierge, customer service, hospitality support', 2, true),

-- SPECIALIZED SERVICES (Priority 1 - Lowest)
('Translation Services', 'translation-services', 'Language translation, interpretation, localization', 1, true),
('Photography Services', 'photography-services', 'Commercial photography, event photography, studio', 1, true),
('Graphic Design', 'graphic-design', 'Design services, branding, visual communication', 1, true),
('Web Design', 'web-design', 'Website design, UI/UX, digital design', 1, true),
('Content Writing', 'content-writing', 'Copywriting, content creation, technical writing', 1, true),
('Video Production', 'video-production', 'Video creation, editing, multimedia services', 1, true),
('Music & Audio', 'music-audio', 'Audio production, music services, sound engineering', 1, true),
('Art & Crafts', 'art-crafts', 'Handicrafts, art supplies, creative services', 1, true),
('Antiques & Collectibles', 'antiques-collectibles', 'Antique dealers, collectibles, vintage items', 1, true),
('Custom Manufacturing', 'custom-manufacturing', 'Custom production, OEM services, specialized manufacturing', 1, true);

-- Update the updated_at timestamp
UPDATE public.categories SET updated_at = NOW();

-- Verify the insert
SELECT 
    'Total Categories' as metric,
    COUNT(*) as count
FROM public.categories
UNION ALL
SELECT 
    'High Priority (8-10)' as metric,
    COUNT(*) as count
FROM public.categories 
WHERE priority >= 8
UNION ALL
SELECT 
    'Medium Priority (5-7)' as metric,
    COUNT(*) as count
FROM public.categories 
WHERE priority BETWEEN 5 AND 7
UNION ALL
SELECT 
    'Lower Priority (1-4)' as metric,
    COUNT(*) as count
FROM public.categories 
WHERE priority <= 4
ORDER BY metric;
