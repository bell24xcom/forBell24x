// Remaining 47 Categories for Bell24h - www.bell24h.com
// This file contains categories 4-50 with comprehensive mock data

import { Category } from './complete-categories';

export const REMAINING_CATEGORIES: Category[] = [
  // 4. Ayurveda & Herbal Products
  {
    id: 'ayurveda-herbal',
    name: 'Ayurveda & Herbal Products',
    slug: 'ayurveda-herbal',
    icon: '🌿',
    description: 'Ayurvedic medicines, herbal extracts, natural skincare, and wellness products',
    supplierCount: 8765,
    productCount: 23456,
    rfqCount: 1234,
    mockOrderCount: 456,
    trending: true,
    isActive: true,
    sortOrder: 4,
    seo: {
      metaTitle: 'Ayurveda & Herbal Products - Bell24h B2B Marketplace',
      metaDescription: 'Source authentic ayurvedic medicines, herbal extracts, and natural skincare from 8,765+ verified suppliers. 24-hour RFQ response.',
      keywords: ['ayurvedic medicines', 'herbal extracts', 'natural skincare', 'wellness products', 'herbal oils', 'ayurvedic supplements']
    },
    subcategories: [
      { id: 'herbal-henna', name: 'Herbal Henna', slug: 'herbal-henna', description: 'Natural henna and hair coloring products', supplierCount: 1234, productCount: 3456, rfqCount: 234, mockOrderCount: 89, isActive: true, sortOrder: 1 },
      { id: 'ayurvedic-extracts', name: 'Ayurvedic Extracts', slug: 'ayurvedic-extracts', description: 'Pure ayurvedic plant extracts', supplierCount: 2345, productCount: 5678, rfqCount: 456, mockOrderCount: 123, isActive: true, sortOrder: 2 },
      { id: 'herbal-foods', name: 'Herbal Foods', slug: 'herbal-foods', description: 'Health foods and nutritional supplements', supplierCount: 3456, productCount: 8901, rfqCount: 567, mockOrderCount: 234, isActive: true, sortOrder: 3 },
      { id: 'ayurvedic-medicines', name: 'Ayurvedic Medicines', slug: 'ayurvedic-medicines', description: 'Traditional ayurvedic medicines', supplierCount: 4567, productCount: 12345, rfqCount: 678, mockOrderCount: 267, isActive: true, sortOrder: 4 },
      { id: 'herbal-oils', name: 'Herbal Oils', slug: 'herbal-oils', description: 'Essential oils and herbal extracts', supplierCount: 2109, productCount: 4567, rfqCount: 345, mockOrderCount: 156, isActive: true, sortOrder: 5 },
      { id: 'natural-skincare', name: 'Natural Skincare', slug: 'natural-skincare', description: 'Organic and natural skincare products', supplierCount: 1876, productCount: 4321, rfqCount: 278, mockOrderCount: 112, isActive: true, sortOrder: 6 }
    ],
    mockOrders: [
      { id: 'AH-001', title: 'Ayurvedic Medicine Supply', description: 'Supply of 5000 units ayurvedic medicines', value: 1200000, currency: 'INR', status: 'completed', buyer: 'Wellness Pharma', supplier: 'Herbal Solutions', category: 'Ayurveda & Herbal Products', subcategory: 'Ayurvedic Medicines', createdAt: '2024-01-20', completedAt: '2024-02-20' },
      { id: 'AH-002', title: 'Herbal Oil Manufacturing', description: 'Manufacturing of 1000 liters herbal oils', value: 800000, currency: 'INR', status: 'in_progress', buyer: 'Natural Care Co', supplier: 'OilCraft India', category: 'Ayurveda & Herbal Products', subcategory: 'Herbal Oils', createdAt: '2024-02-10' }
    ]
  },

  // 5. Business Services
  {
    id: 'business-services',
    name: 'Business Services',
    slug: 'business-services',
    icon: '💼',
    description: 'Professional services, consulting, legal, accounting, and business solutions',
    supplierCount: 18234,
    productCount: 45678,
    rfqCount: 2341,
    mockOrderCount: 987,
    trending: true,
    isActive: true,
    sortOrder: 5,
    seo: {
      metaTitle: 'Business Services & Consulting - Bell24h B2B Marketplace',
      metaDescription: 'Find professional business services, consulting, legal, and accounting services from 18,234+ verified providers. 24-hour RFQ response.',
      keywords: ['business consulting', 'legal services', 'accounting', 'professional services', 'business solutions', 'consulting firms']
    },
    subcategories: [
      { id: 'turnkey-project-services', name: 'Turnkey Project Services', slug: 'turnkey-project-services', description: 'Complete project management and execution', supplierCount: 2345, productCount: 5678, rfqCount: 456, mockOrderCount: 123, isActive: true, sortOrder: 1 },
      { id: 'environmental-services', name: 'Environmental Services', slug: 'environmental-services', description: 'Environmental consulting and compliance', supplierCount: 1234, productCount: 3456, rfqCount: 234, mockOrderCount: 89, isActive: true, sortOrder: 2 },
      { id: 'business-consultants', name: 'Business Consultants', slug: 'business-consultants', description: 'Strategic business consulting services', supplierCount: 4567, productCount: 12345, rfqCount: 678, mockOrderCount: 267, isActive: true, sortOrder: 3 },
      { id: 'import-export-documentation', name: 'Import/Export Documentation', slug: 'import-export-documentation', description: 'Trade documentation and compliance services', supplierCount: 2109, productCount: 4567, rfqCount: 345, mockOrderCount: 156, isActive: true, sortOrder: 4 },
      { id: 'financial-consulting', name: 'Financial Consulting', slug: 'financial-consulting', description: 'Financial advisory and consulting services', supplierCount: 3456, productCount: 8901, rfqCount: 456, mockOrderCount: 178, isActive: true, sortOrder: 5 },
      { id: 'legal-compliance-services', name: 'Legal & Compliance Services', slug: 'legal-compliance-services', description: 'Legal advice and compliance services', supplierCount: 2987, productCount: 6789, rfqCount: 445, mockOrderCount: 189, isActive: true, sortOrder: 6 }
    ],
    mockOrders: [
      { id: 'BS-001', title: 'Business Consulting Contract', description: 'Strategic consulting for digital transformation', value: 2500000, currency: 'INR', status: 'completed', buyer: 'TechCorp India', supplier: 'Strategy Consultants', category: 'Business Services', subcategory: 'Business Consultants', createdAt: '2024-01-15', completedAt: '2024-02-15' },
      { id: 'BS-002', title: 'Legal Compliance Services', description: 'Legal compliance audit and documentation', value: 800000, currency: 'INR', status: 'in_progress', buyer: 'Manufacturing Ltd', supplier: 'Legal Solutions', category: 'Business Services', subcategory: 'Legal & Compliance Services', createdAt: '2024-02-05' }
    ]
  },

  // 6. Chemical
  {
    id: 'chemical',
    name: 'Chemical',
    slug: 'chemical',
    icon: '🧪',
    description: 'Industrial chemicals, specialty chemicals, petrochemicals, and chemical products',
    supplierCount: 12567,
    productCount: 34567,
    rfqCount: 1876,
    mockOrderCount: 734,
    trending: false,
    isActive: true,
    sortOrder: 6,
    seo: {
      metaTitle: 'Industrial Chemicals & Specialty Chemicals - Bell24h B2B Marketplace',
      metaDescription: 'Source industrial chemicals, specialty chemicals, petrochemicals from 12,567+ verified suppliers. 24-hour RFQ response for chemical industry.',
      keywords: ['industrial chemicals', 'specialty chemicals', 'petrochemicals', 'chemical products', 'catalysts', 'dyes', 'agrochemicals']
    },
    subcategories: [
      { id: 'catalysts', name: 'Catalysts', slug: 'catalysts', description: 'Chemical catalysts and reaction agents', supplierCount: 1234, productCount: 3456, rfqCount: 234, mockOrderCount: 89, isActive: true, sortOrder: 1 },
      { id: 'pet-granules', name: 'PET Granules', slug: 'pet-granules', description: 'PET plastic granules and raw materials', supplierCount: 2345, productCount: 5678, rfqCount: 456, mockOrderCount: 123, isActive: true, sortOrder: 2 },
      { id: 'dyes-pigments', name: 'Dyes & Pigments', slug: 'dyes-pigments', description: 'Industrial dyes and color pigments', supplierCount: 3456, productCount: 8901, rfqCount: 567, mockOrderCount: 234, isActive: true, sortOrder: 3 },
      { id: 'agrochemicals', name: 'Agrochemicals', slug: 'agrochemicals', description: 'Agricultural chemicals and fertilizers', supplierCount: 4567, productCount: 12345, rfqCount: 678, mockOrderCount: 267, isActive: true, sortOrder: 4 },
      { id: 'specialty-chemicals', name: 'Specialty Chemicals', slug: 'specialty-chemicals', description: 'High-value specialty chemical products', supplierCount: 2109, productCount: 4567, rfqCount: 345, mockOrderCount: 156, isActive: true, sortOrder: 5 },
      { id: 'industrial-gases', name: 'Industrial Gases', slug: 'industrial-gases', description: 'Industrial and medical gases', supplierCount: 1876, productCount: 4321, rfqCount: 278, mockOrderCount: 112, isActive: true, sortOrder: 6 },
      { id: 'detergent-chemicals', name: 'Detergent Chemicals', slug: 'detergent-chemicals', description: 'Cleaning and detergent chemicals', supplierCount: 2987, productCount: 6789, rfqCount: 445, mockOrderCount: 189, isActive: true, sortOrder: 7 }
    ],
    mockOrders: [
      { id: 'CH-001', title: 'Specialty Chemicals Supply', description: 'Supply of 100 tons specialty chemicals', value: 3500000, currency: 'INR', status: 'completed', buyer: 'ChemCorp India', supplier: 'Specialty Chem Solutions', category: 'Chemical', subcategory: 'Specialty Chemicals', createdAt: '2024-01-10', completedAt: '2024-02-10' },
      { id: 'CH-002', title: 'PET Granules Manufacturing', description: 'Manufacturing of 500 tons PET granules', value: 2800000, currency: 'INR', status: 'in_progress', buyer: 'Plastic Industries', supplier: 'PET Solutions', category: 'Chemical', subcategory: 'PET Granules', createdAt: '2024-02-01' }
    ]
  },

  // Continue with categories 7-50...
  // (I'll create a comprehensive script to generate all remaining categories)
];

// Function to generate all 50 categories with mock data
export const generateAllCategories = (): Category[] => {
  const baseCategories = [
    { id: 'computers-internet', name: 'Computers and Internet', icon: '💻', description: 'IT services, software development, cloud computing, and cybersecurity solutions' },
    { id: 'consumer-electronics', name: 'Consumer Electronics', icon: '📱', description: 'Mobile phones, laptops, TVs, audio systems, and consumer electronic devices' },
    { id: 'cosmetics-personal-care', name: 'Cosmetics & Personal Care', icon: '💄', description: 'Beauty products, skincare, hair care, and personal hygiene products' },
    { id: 'electronics-electrical', name: 'Electronics & Electrical', icon: '⚡', description: 'Electronic components, electrical equipment, and power systems' },
    { id: 'food-products-beverage', name: 'Food Products & Beverage', icon: '🍽️', description: 'Food products, beverages, processing equipment, and ingredients' },
    { id: 'furniture-carpentry-services', name: 'Furniture & Carpentry Services', icon: '🪑', description: 'Furniture manufacturing, carpentry services, and home decor' },
    { id: 'gifts-crafts', name: 'Gifts & Crafts', icon: '🎁', description: 'Handicrafts, gifts, decorative items, and artistic products' },
    { id: 'health-beauty', name: 'Health & Beauty', icon: '🏥', description: 'Health products, beauty equipment, and wellness solutions' },
    { id: 'home-furnishings', name: 'Home Furnishings', icon: '🏠', description: 'Home decor, furnishings, textiles, and interior design products' },
    { id: 'home-supplies', name: 'Home Supplies', icon: '🧽', description: 'Household supplies, cleaning products, and home maintenance' },
    { id: 'industrial-machinery', name: 'Industrial Machinery', icon: '⚙️', description: 'Heavy machinery, manufacturing equipment, and industrial tools' },
    { id: 'industrial-supplies', name: 'Industrial Supplies', icon: '🔧', description: 'Industrial components, supplies, and manufacturing materials' },
    { id: 'jewelry-jewelry-designers', name: 'Jewelry & Jewelry Designers', icon: '💎', description: 'Jewelry, precious metals, gemstones, and accessories' },
    { id: 'mineral-metals', name: 'Mineral & Metals', icon: '🔩', description: 'Minerals, metals, ores, and metal products' },
    { id: 'office-supplies', name: 'Office Supplies', icon: '📋', description: 'Office equipment, stationery, and business supplies' },
    { id: 'packaging-paper', name: 'Packaging & Paper', icon: '📦', description: 'Packaging materials, paper products, and containers' },
    { id: 'real-estate-building-construction', name: 'Real Estate, Building & Construction', icon: '🏗️', description: 'Construction materials, building supplies, and real estate services' },
    { id: 'security-products-services', name: 'Security Products & Services', icon: '🔒', description: 'Security systems, surveillance equipment, and safety products' },
    { id: 'sports-goods-entertainment', name: 'Sports Goods & Entertainment', icon: '⚽', description: 'Sports equipment, fitness gear, and entertainment products' },
    { id: 'telecommunication', name: 'Telecommunication', icon: '📡', description: 'Telecom equipment, communication systems, and network solutions' },
    { id: 'textiles-yarn-fabrics', name: 'Textiles, Yarn & Fabrics', icon: '🧵', description: 'Textile materials, yarns, fabrics, and textile machinery' },
    { id: 'tools-equipment', name: 'Tools & Equipment', icon: '🔨', description: 'Hand tools, power tools, and industrial equipment' },
    { id: 'tours-travels-hotels', name: 'Tours, Travels & Hotels', icon: '✈️', description: 'Travel services, hotel supplies, and tourism equipment' },
    { id: 'toys-games', name: 'Toys & Games', icon: '🧸', description: 'Toys, games, educational products, and entertainment items' },
    { id: 'renewable-energy-equipment', name: 'Renewable Energy Equipment', icon: '🌞', description: 'Solar panels, wind turbines, and renewable energy systems' },
    { id: 'artificial-intelligence-automation-tools', name: 'Artificial Intelligence & Automation Tools', icon: '🤖', description: 'AI software, robotics, and automation solutions' },
    { id: 'sustainable-eco-friendly-products', name: 'Sustainable & Eco-Friendly Products', icon: '🌱', description: 'Eco-friendly products, sustainable materials, and green solutions' },
    { id: 'healthcare-equipment-technology', name: 'Healthcare Equipment & Technology', icon: '🏥', description: 'Medical equipment, health technology, and healthcare solutions' },
    { id: 'e-commerce-digital-platforms-solutions', name: 'E-commerce & Digital Platforms Solutions', icon: '💻', description: 'E-commerce platforms, digital solutions, and online services' },
    { id: 'gaming-esports-hardware', name: 'Gaming & Esports Hardware', icon: '🎮', description: 'Gaming equipment, esports hardware, and entertainment technology' },
    { id: 'electric-vehicles-ev-charging-solutions', name: 'Electric Vehicles (EVs) & Charging Solutions', icon: '🚗', description: 'Electric vehicles, EV charging stations, and sustainable transportation' },
    { id: 'drones-uavs', name: 'Drones & UAVs', icon: '🚁', description: 'Drones, UAVs, aerial equipment, and drone services' },
    { id: 'wearable-technology', name: 'Wearable Technology', icon: '⌚', description: 'Smartwatches, fitness trackers, and wearable devices' },
    { id: 'logistics-supply-chain-solutions', name: 'Logistics & Supply Chain Solutions', icon: '🚚', description: 'Logistics services, supply chain management, and transportation' },
    { id: '3d-printing-equipment', name: '3D Printing Equipment', icon: '🖨️', description: '3D printers, printing materials, and additive manufacturing' },
    { id: 'food-tech-agri-tech', name: 'Food Tech & Agri-Tech', icon: '🌾', description: 'Food technology, agricultural technology, and smart farming' },
    { id: 'iron-steel-industry', name: 'Iron & Steel Industry', icon: '🏭', description: 'Steel production, iron manufacturing, and metal processing' },
    { id: 'mining-raw-materials', name: 'Mining & Raw Materials', icon: '⛏️', description: 'Mining equipment, raw materials, and mineral extraction' },
    { id: 'metal-recycling', name: 'Metal Recycling', slug: 'metal-recycling', icon: '♻️', description: 'Metal recycling, scrap processing, and waste management' },
    { id: 'metallurgy-metalworking', name: 'Metallurgy & Metalworking', icon: '🔨', description: 'Metal processing, metallurgy, and metalworking services' },
    { id: 'heavy-machinery-mining-equipment', name: 'Heavy Machinery & Mining Equipment', icon: '🚛', description: 'Heavy machinery, mining equipment, and construction vehicles' },
    { id: 'ferrous-non-ferrous-metals', name: 'Ferrous and Non-Ferrous Metals', icon: '🔩', description: 'Steel, aluminum, copper, and other metal products' },
    { id: 'mining-safety-environmental-solutions', name: 'Mining Safety & Environmental Solutions', icon: '🛡️', description: 'Mining safety equipment, environmental protection, and safety solutions' },
    { id: 'precious-metals-mining', name: 'Precious Metals & Mining', icon: '💎', description: 'Gold, silver, platinum, and precious metal mining' }
  ];

  return baseCategories.map((cat, index) => ({
    ...cat,
    slug: cat.id,
    supplierCount: Math.floor(Math.random() * 50000) + 5000,
    productCount: Math.floor(Math.random() * 100000) + 10000,
    rfqCount: Math.floor(Math.random() * 5000) + 500,
    mockOrderCount: Math.floor(Math.random() * 2000) + 200,
    trending: Math.random() > 0.7,
    isActive: true,
    sortOrder: index + 4,
    seo: {
      metaTitle: `${cat.name} - Bell24h B2B Marketplace`,
      metaDescription: `Source ${cat.name.toLowerCase()} from verified suppliers. 24-hour RFQ response for ${cat.description.toLowerCase()}.`,
      keywords: [cat.name.toLowerCase(), 'suppliers', 'manufacturers', 'wholesale', 'b2b']
    },
    subcategories: generateSubcategories(cat.id, cat.name),
    mockOrders: generateMockOrders(cat.id, cat.name)
  }));
};

// Helper function to generate subcategories
const generateSubcategories = (categoryId: string, categoryName: string) => {
  const subcategoryNames = [
    'Equipment & Machinery',
    'Raw Materials',
    'Components & Parts',
    'Tools & Accessories',
    'Services & Solutions',
    'Technology & Software',
    'Maintenance & Support',
    'Consulting & Advisory'
  ];

  return subcategoryNames.map((name, index) => ({
    id: `${categoryId}-${name.toLowerCase().replace(/\s+/g, '-')}`,
    name,
    slug: name.toLowerCase().replace(/\s+/g, '-'),
    description: `${name} for ${categoryName}`,
    supplierCount: Math.floor(Math.random() * 5000) + 500,
    productCount: Math.floor(Math.random() * 10000) + 1000,
    rfqCount: Math.floor(Math.random() * 500) + 50,
    mockOrderCount: Math.floor(Math.random() * 200) + 20,
    isActive: true,
    sortOrder: index + 1
  }));
};

// Helper function to generate mock orders
const generateMockOrders = (categoryId: string, categoryName: string) => {
  const orderTitles = [
    'Supply Contract',
    'Manufacturing Agreement',
    'Service Contract',
    'Equipment Supply',
    'Consulting Services',
    'Technology Solutions',
    'Maintenance Contract',
    'Installation Services'
  ];

  const buyers = [
    'TechCorp India',
    'Manufacturing Ltd',
    'Industrial Solutions',
    'Business Hub',
    'Enterprise Corp',
    'Innovation Labs',
    'Global Industries',
    'Smart Solutions'
  ];

  const suppliers = [
    'Pro Solutions',
    'Expert Services',
    'Quality Suppliers',
    'Reliable Partners',
    'Trusted Vendors',
    'Premium Solutions',
    'Elite Services',
    'Top Suppliers'
  ];

  return orderTitles.slice(0, 3).map((title, index) => ({
    id: `${categoryId.toUpperCase()}-${String(index + 1).padStart(3, '0')}`,
    title: `${title} - ${categoryName}`,
    description: `Supply of ${categoryName.toLowerCase()} products and services`,
    value: Math.floor(Math.random() * 5000000) + 500000,
    currency: 'INR',
    status: ['completed', 'in_progress', 'pending'][index] as 'completed' | 'in_progress' | 'pending',
    buyer: buyers[Math.floor(Math.random() * buyers.length)],
    supplier: suppliers[Math.floor(Math.random() * suppliers.length)],
    category: categoryName,
    subcategory: 'Equipment & Machinery',
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    completedAt: index === 0 ? new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined
  }));
};
