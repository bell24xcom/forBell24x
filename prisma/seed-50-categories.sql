-- Bell24h - Seed 50 Main Categories
-- Run this in Neon SQL Editor to populate the categories table

-- IMPORTANT: This script uses SERIAL for id (auto-increment integers)
-- All categories are main categories (parent_id = NULL)
-- Priority determines display order (lower number = higher priority)

INSERT INTO categories (name, slug, description, parent_id, is_active, priority, icon, created_at, updated_at)
VALUES
  -- Top Priority Categories (1-10)
  ('Packaging', 'packaging', 'Corrugated boxes, cartons, labels, and packaging materials', NULL, true, 1, '📦', NOW(), NOW()),
  ('Chemicals', 'chemicals', 'Industrial chemicals, solvents, acids, and chemical products', NULL, true, 2, '⚗️', NOW(), NOW()),
  ('Electronics', 'electronics', 'Electronic components, PCBs, semiconductors, and devices', NULL, true, 3, '⚡', NOW(), NOW()),
  ('Construction', 'construction', 'Building materials, cement, steel, and construction supplies', NULL, true, 4, '🏗️', NOW(), NOW()),
  ('Machinery', 'machinery', 'Industrial machinery, CNC machines, and manufacturing equipment', NULL, true, 5, '🔧', NOW(), NOW()),
  ('Textiles', 'textiles', 'Fabrics, garments, yarn, and textile products', NULL, true, 6, '👕', NOW(), NOW()),
  ('Pharmaceuticals', 'pharmaceuticals', 'API, medicines, medical supplies, and pharma products', NULL, true, 7, '💊', NOW(), NOW()),
  ('Agricultural', 'agricultural', 'Seeds, fertilizers, pesticides, and farming equipment', NULL, true, 8, '🌾', NOW(), NOW()),
  ('Automotive', 'automotive', 'Auto parts, components, accessories, and automotive supplies', NULL, true, 9, '🚗', NOW(), NOW()),
  ('IT Services', 'it-services', 'Software development, cloud services, and IT solutions', NULL, true, 10, '💻', NOW(), NOW()),

  -- High Priority Categories (11-20)
  ('Gems & Jewelry', 'gems-jewelry', 'Precious stones, gold, silver, and jewelry manufacturing', NULL, true, 11, '💎', NOW(), NOW()),
  ('Handicrafts', 'handicrafts', 'Artisan products, handmade crafts, and decorative items', NULL, true, 12, '🎨', NOW(), NOW()),
  ('Food Processing', 'food-processing', 'Food processing equipment, packaging, and ingredients', NULL, true, 13, '🍽️', NOW(), NOW()),
  ('Metals & Steel', 'metals-steel', 'Steel products, metal sheets, bars, and fabrication', NULL, true, 14, '🔩', NOW(), NOW()),
  ('Plastics', 'plastics', 'Plastic raw materials, molded products, and polymers', NULL, true, 15, '🔄', NOW(), NOW()),
  ('Paper', 'paper', 'Paper products, pulp, cardboard, and stationery', NULL, true, 16, '📄', NOW(), NOW()),
  ('Rubber', 'rubber', 'Rubber products, sheets, tires, and industrial rubber', NULL, true, 17, '🛞', NOW(), NOW()),
  ('Ceramics', 'ceramics', 'Ceramic tiles, sanitaryware, and pottery products', NULL, true, 18, '🏺', NOW(), NOW()),
  ('Glass', 'glass', 'Glass products, sheets, bottles, and glassware', NULL, true, 19, '🪟', NOW(), NOW()),
  ('Wood', 'wood', 'Timber, plywood, furniture, and wooden products', NULL, true, 20, '🪵', NOW(), NOW()),

  -- Medium Priority Categories (21-30)
  ('Leather', 'leather', 'Leather products, hides, shoes, and accessories', NULL, true, 21, '👜', NOW(), NOW()),
  ('Paints & Coatings', 'paints-coatings', 'Industrial paints, coatings, and surface treatments', NULL, true, 22, '🎨', NOW(), NOW()),
  ('Safety Equipment', 'safety-equipment', 'PPE, safety gear, helmets, and protective equipment', NULL, true, 23, '🦺', NOW(), NOW()),
  ('Office Supplies', 'office-supplies', 'Stationery, furniture, printers, and office equipment', NULL, true, 24, '📎', NOW(), NOW()),
  ('Medical Equipment', 'medical-equipment', 'Hospital equipment, diagnostic devices, and medical instruments', NULL, true, 25, '🏥', NOW(), NOW()),
  ('Energy & Power', 'energy-power', 'Solar panels, generators, batteries, and power equipment', NULL, true, 26, '🔋', NOW(), NOW()),
  ('Telecommunications', 'telecommunications', 'Telecom equipment, cables, and networking hardware', NULL, true, 27, '📡', NOW(), NOW()),
  ('Water Treatment', 'water-treatment', 'Water purification, filters, and treatment equipment', NULL, true, 28, '💧', NOW(), NOW()),
  ('HVAC', 'hvac', 'Heating, ventilation, air conditioning, and cooling systems', NULL, true, 29, '❄️', NOW(), NOW()),
  ('Logistics', 'logistics', 'Transport, warehousing, supply chain, and logistics services', NULL, true, 30, '🚚', NOW(), NOW()),

  -- Standard Priority Categories (31-40)
  ('Printing', 'printing', 'Printing services, presses, inks, and printing equipment', NULL, true, 31, '🖨️', NOW(), NOW()),
  ('Advertising', 'advertising', 'Marketing materials, signage, and promotional products', NULL, true, 32, '📢', NOW(), NOW()),
  ('Security Systems', 'security-systems', 'CCTV, access control, alarms, and security equipment', NULL, true, 33, '🔒', NOW(), NOW()),
  ('Industrial Tools', 'industrial-tools', 'Hand tools, power tools, and precision instruments', NULL, true, 34, '🔨', NOW(), NOW()),
  ('Electrical', 'electrical', 'Wires, cables, switches, and electrical components', NULL, true, 35, '💡', NOW(), NOW()),
  ('Pumps & Valves', 'pumps-valves', 'Industrial pumps, valves, and fluid handling equipment', NULL, true, 36, '⚙️', NOW(), NOW()),
  ('Bearings', 'bearings', 'Ball bearings, roller bearings, and bearing assemblies', NULL, true, 37, '⚙️', NOW(), NOW()),
  ('Fasteners', 'fasteners', 'Bolts, nuts, screws, and fastening hardware', NULL, true, 38, '🔩', NOW(), NOW()),
  ('Lubricants', 'lubricants', 'Industrial oils, greases, and lubrication products', NULL, true, 39, '🛢️', NOW(), NOW()),
  ('Testing Equipment', 'testing-equipment', 'Quality testing, measurement, and inspection tools', NULL, true, 40, '🔬', NOW(), NOW()),

  -- Lower Priority Categories (41-50)
  ('Environmental', 'environmental', 'Waste management, pollution control, and eco-friendly solutions', NULL, true, 41, '♻️', NOW(), NOW()),
  ('Sports Equipment', 'sports-equipment', 'Sports goods, fitness equipment, and recreational products', NULL, true, 42, '⚽', NOW(), NOW()),
  ('Toys & Games', 'toys-games', 'Toys, educational games, and entertainment products', NULL, true, 43, '🎮', NOW(), NOW()),
  ('Cosmetics', 'cosmetics', 'Beauty products, personal care, and cosmetic ingredients', NULL, true, 44, '💄', NOW(), NOW()),
  ('Furniture', 'furniture', 'Commercial and residential furniture and fixtures', NULL, true, 45, '🪑', NOW(), NOW()),
  ('Marine Equipment', 'marine-equipment', 'Shipping equipment, marine hardware, and nautical supplies', NULL, true, 46, '⚓', NOW(), NOW()),
  ('Mining Equipment', 'mining-equipment', 'Mining machinery, tools, and extraction equipment', NULL, true, 47, '⛏️', NOW(), NOW()),
  ('Renewable Energy', 'renewable-energy', 'Solar, wind, biomass, and green energy solutions', NULL, true, 48, '🌱', NOW(), NOW()),
  ('Laboratory Supplies', 'laboratory-supplies', 'Lab equipment, glassware, and scientific instruments', NULL, true, 49, '🧪', NOW(), NOW()),
  ('Event Management', 'event-management', 'Event planning, venue services, and exhibition equipment', NULL, true, 50, '🎪', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- Verify the insert
SELECT COUNT(*) as total_categories FROM categories WHERE parent_id IS NULL;

-- Show first 10 categories
SELECT id, name, slug, priority, icon FROM categories ORDER BY priority LIMIT 10;
