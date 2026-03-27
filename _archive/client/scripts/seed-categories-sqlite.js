const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Complete 50 Categories Data
const ALL_50_CATEGORIES = [
  // 1. Agriculture
  {
    id: 'agriculture',
    name: 'Agriculture',
    slug: 'agriculture',
    icon: '🚜',
    description: 'Agricultural equipment, farming supplies, seeds, and organic farming tools for modern agriculture',
    supplierCount: 15247,
    productCount: 45632,
    rfqCount: 3245,
    mockOrderCount: 1247,
    trending: true,
    isActive: true,
    sortOrder: 1,
    metaTitle: 'Agriculture Equipment & Supplies - Bell24h B2B Marketplace',
    metaDescription: 'Find verified agriculture suppliers for farming equipment, seeds, fertilizers, irrigation systems, and organic farming tools. 15,247+ suppliers, 24-hour RFQ response.',
    keywords: ['agriculture equipment', 'farming supplies', 'seeds', 'fertilizers', 'irrigation', 'tractor parts', 'organic farming'],
    subcategories: [
      { id: 'agriculture-equipment', name: 'Agriculture Equipment', slug: 'agriculture-equipment', description: 'Tractors, harvesters, and farming machinery', supplierCount: 5234, productCount: 12345, rfqCount: 1234, mockOrderCount: 456, isActive: true, sortOrder: 1 },
      { id: 'fresh-flowers', name: 'Fresh Flowers', slug: 'fresh-flowers', description: 'Fresh cut flowers and floral arrangements', supplierCount: 2341, productCount: 5678, rfqCount: 456, mockOrderCount: 123, isActive: true, sortOrder: 2 },
      { id: 'seeds-saplings', name: 'Seeds & Saplings', slug: 'seeds-saplings', description: 'Agricultural seeds, saplings, and plant materials', supplierCount: 3456, productCount: 8901, rfqCount: 567, mockOrderCount: 234, isActive: true, sortOrder: 3 },
      { id: 'tractor-parts', name: 'Tractor Parts', slug: 'tractor-parts', description: 'Spare parts and components for tractors', supplierCount: 1234, productCount: 3456, rfqCount: 234, mockOrderCount: 89, isActive: true, sortOrder: 4 },
      { id: 'animal-feed', name: 'Animal Feed', slug: 'animal-feed', description: 'Livestock feed and nutritional supplements', supplierCount: 2109, productCount: 4567, rfqCount: 345, mockOrderCount: 156, isActive: true, sortOrder: 5 },
      { id: 'irrigation-systems', name: 'Irrigation Systems', slug: 'irrigation-systems', description: 'Water irrigation and sprinkler systems', supplierCount: 1876, productCount: 4321, rfqCount: 278, mockOrderCount: 112, isActive: true, sortOrder: 6 },
      { id: 'fertilizers-pesticides', name: 'Fertilizers & Pesticides', slug: 'fertilizers-pesticides', description: 'Agricultural fertilizers and crop protection', supplierCount: 2987, productCount: 6789, rfqCount: 445, mockOrderCount: 189, isActive: true, sortOrder: 7 },
      { id: 'organic-farming-tools', name: 'Organic Farming Tools', slug: 'organic-farming-tools', description: 'Tools and equipment for organic farming', supplierCount: 987, productCount: 2345, rfqCount: 123, mockOrderCount: 45, isActive: true, sortOrder: 8 }
    ],
    mockOrders: [
      { id: 'AG-001', title: 'Tractor Parts Supply Contract', description: 'Supply of 500 tractor engine parts for agricultural machinery', value: 2500000, currency: 'INR', status: 'completed', buyer: 'Mahindra Tractors Ltd', supplier: 'AgriParts Solutions', category: 'Agriculture', subcategory: 'Tractor Parts', createdAt: '2024-01-15', completedAt: '2024-02-15' },
      { id: 'AG-002', title: 'Irrigation System Installation', description: 'Complete drip irrigation system for 50-acre farm', value: 1800000, currency: 'INR', status: 'in_progress', buyer: 'Green Valley Farms', supplier: 'WaterTech Solutions', category: 'Agriculture', subcategory: 'Irrigation Systems', createdAt: '2024-02-01' },
      { id: 'AG-003', title: 'Organic Fertilizer Supply', description: 'Monthly supply of 10 tons organic fertilizer', value: 450000, currency: 'INR', status: 'pending', buyer: 'Organic Harvest Co', supplier: 'EcoFert Solutions', category: 'Agriculture', subcategory: 'Fertilizers & Pesticides', createdAt: '2024-02-20' }
    ]
  },

  // 2. Apparel & Fashion
  {
    id: 'apparel-fashion',
    name: 'Apparel & Fashion',
    slug: 'apparel-fashion',
    icon: '👗',
    description: 'Fashion clothing, textiles, footwear, and accessories for retail and wholesale',
    supplierCount: 28439,
    productCount: 67890,
    rfqCount: 5678,
    mockOrderCount: 2134,
    trending: false,
    isActive: true,
    sortOrder: 2,
    metaTitle: 'Apparel & Fashion Wholesale - Bell24h B2B Marketplace',
    metaDescription: 'Source fashion clothing, textiles, footwear, and accessories from 28,439+ verified suppliers. Sarees, sportswear, fashion accessories with 24-hour RFQ response.',
    keywords: ['apparel wholesale', 'fashion clothing', 'textiles', 'sarees', 'footwear', 'sportswear', 'fashion accessories'],
    subcategories: [
      { id: 'sarees', name: 'Sarees', slug: 'sarees', description: 'Traditional and designer sarees', supplierCount: 8765, productCount: 23456, rfqCount: 1234, mockOrderCount: 456, isActive: true, sortOrder: 1 },
      { id: 'sunglasses', name: 'Sunglasses', slug: 'sunglasses', description: 'Fashion and protective eyewear', supplierCount: 2345, productCount: 5678, rfqCount: 456, mockOrderCount: 123, isActive: true, sortOrder: 2 },
      { id: 'unisex-clothing', name: 'Unisex Clothing', slug: 'unisex-clothing', description: 'Gender-neutral fashion clothing', supplierCount: 4567, productCount: 12345, rfqCount: 567, mockOrderCount: 234, isActive: true, sortOrder: 3 },
      { id: 'suitcases-briefcases', name: 'Suitcases & Briefcases', slug: 'suitcases-briefcases', description: 'Travel and business luggage', supplierCount: 1234, productCount: 3456, rfqCount: 234, mockOrderCount: 89, isActive: true, sortOrder: 4 },
      { id: 'footwear', name: 'Footwear', slug: 'footwear', description: 'Shoes, boots, and footwear for all occasions', supplierCount: 5432, productCount: 15678, rfqCount: 678, mockOrderCount: 267, isActive: true, sortOrder: 5 },
      { id: 'textiles-fabrics', name: 'Textiles & Fabrics', slug: 'textiles-fabrics', description: 'Raw textiles and fabric materials', supplierCount: 6789, productCount: 18901, rfqCount: 789, mockOrderCount: 312, isActive: true, sortOrder: 6 },
      { id: 'sportswear', name: 'Sportswear', slug: 'sportswear', description: 'Athletic and sports clothing', supplierCount: 3456, productCount: 8901, rfqCount: 456, mockOrderCount: 178, isActive: true, sortOrder: 7 },
      { id: 'fashion-accessories', name: 'Fashion Accessories', slug: 'fashion-accessories', description: 'Jewelry, bags, and fashion accessories', supplierCount: 4567, productCount: 12345, rfqCount: 567, mockOrderCount: 234, isActive: true, sortOrder: 8 }
    ],
    mockOrders: [
      { id: 'AF-001', title: 'Bulk Saree Supply Contract', description: 'Supply of 1000 designer sarees for retail chain', value: 3500000, currency: 'INR', status: 'completed', buyer: 'Fashion Hub India', supplier: 'Silk Paradise', category: 'Apparel & Fashion', subcategory: 'Sarees', createdAt: '2024-01-10', completedAt: '2024-02-10' },
      { id: 'AF-002', title: 'Sportswear Manufacturing', description: 'Manufacturing of 5000 sportswear units', value: 2800000, currency: 'INR', status: 'in_progress', buyer: 'Sports World Ltd', supplier: 'ActiveWear Co', category: 'Apparel & Fashion', subcategory: 'Sportswear', createdAt: '2024-02-05' },
      { id: 'AF-003', title: 'Footwear Supply Agreement', description: 'Supply of 2000 pairs of leather shoes', value: 1200000, currency: 'INR', status: 'pending', buyer: 'ShoeMart India', supplier: 'LeatherCraft Solutions', category: 'Apparel & Fashion', subcategory: 'Footwear', createdAt: '2024-02-18' }
    ]
  },

  // 3. Automobile
  {
    id: 'automobile',
    name: 'Automobile',
    slug: 'automobile',
    icon: '🚗',
    description: 'Auto parts, vehicle components, tires, and automotive accessories',
    supplierCount: 22156,
    productCount: 54321,
    rfqCount: 4521,
    mockOrderCount: 1876,
    trending: true,
    isActive: true,
    sortOrder: 3,
    metaTitle: 'Automobile Parts & Components - Bell24h B2B Marketplace',
    metaDescription: 'Source auto parts, engine components, tires, and automotive accessories from 22,156+ verified suppliers. 24-hour RFQ response for automotive industry.',
    keywords: ['auto parts', 'car components', 'engine parts', 'tires', 'automotive accessories', 'vehicle parts', 'lubricants'],
    subcategories: [
      { id: 'auto-electrical-parts', name: 'Auto Electrical Parts', slug: 'auto-electrical-parts', description: 'Electrical components for vehicles', supplierCount: 4567, productCount: 12345, rfqCount: 567, mockOrderCount: 234, isActive: true, sortOrder: 1 },
      { id: 'engine-parts', name: 'Engine Parts', slug: 'engine-parts', description: 'Engine components and spare parts', supplierCount: 6789, productCount: 18901, rfqCount: 789, mockOrderCount: 312, isActive: true, sortOrder: 2 },
      { id: 'commercial-vehicles', name: 'Commercial Vehicles', slug: 'commercial-vehicles', description: 'Trucks, buses, and commercial vehicles', supplierCount: 2345, productCount: 5678, rfqCount: 456, mockOrderCount: 123, isActive: true, sortOrder: 3 },
      { id: 'coach-building', name: 'Coach Building', slug: 'coach-building', description: 'Vehicle body building and customization', supplierCount: 1234, productCount: 3456, rfqCount: 234, mockOrderCount: 89, isActive: true, sortOrder: 4 },
      { id: 'car-accessories', name: 'Car Accessories', slug: 'car-accessories', description: 'Interior and exterior car accessories', supplierCount: 3456, productCount: 8901, rfqCount: 456, mockOrderCount: 178, isActive: true, sortOrder: 5 },
      { id: 'tires-tubes', name: 'Tires & Tubes', slug: 'tires-tubes', description: 'Vehicle tires and inner tubes', supplierCount: 5432, productCount: 15678, rfqCount: 678, mockOrderCount: 267, isActive: true, sortOrder: 6 },
      { id: 'lubricants-greases', name: 'Lubricants & Greases', slug: 'lubricants-greases', description: 'Automotive lubricants and greases', supplierCount: 2109, productCount: 4567, rfqCount: 345, mockOrderCount: 156, isActive: true, sortOrder: 7 }
    ],
    mockOrders: [
      { id: 'AU-001', title: 'Engine Parts Supply Contract', description: 'Supply of 2000 engine components for Maruti Suzuki', value: 4500000, currency: 'INR', status: 'completed', buyer: 'Maruti Suzuki India', supplier: 'AutoParts Pro', category: 'Automobile', subcategory: 'Engine Parts', createdAt: '2024-01-05', completedAt: '2024-02-05' },
      { id: 'AU-002', title: 'Tire Manufacturing Agreement', description: 'Manufacturing of 10000 tires for commercial vehicles', value: 3200000, currency: 'INR', status: 'in_progress', buyer: 'TruckCorp India', supplier: 'TireTech Solutions', category: 'Automobile', subcategory: 'Tires & Tubes', createdAt: '2024-02-01' },
      { id: 'AU-003', title: 'Car Accessories Supply', description: 'Supply of 5000 car accessory sets', value: 1800000, currency: 'INR', status: 'pending', buyer: 'AutoStyle India', supplier: 'AccessoryHub', category: 'Automobile', subcategory: 'Car Accessories', createdAt: '2024-02-15' }
    ]
  }
];

// Generate remaining 47 categories
function generateRemainingCategories() {
  const baseCategories = [
    { id: 'ayurveda-herbal', name: 'Ayurveda & Herbal Products', icon: '🌿', description: 'Ayurvedic medicines, herbal extracts, natural skincare, and wellness products' },
    { id: 'business-services', name: 'Business Services', icon: '💼', description: 'Professional services, consulting, legal, accounting, and business solutions' },
    { id: 'chemical', name: 'Chemical', icon: '🧪', description: 'Industrial chemicals, specialty chemicals, petrochemicals, and chemical products' },
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
    { id: 'metal-recycling', name: 'Metal Recycling', icon: '♻️', description: 'Metal recycling, scrap processing, and waste management' },
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
    metaTitle: `${cat.name} - Bell24h B2B Marketplace`,
    metaDescription: `Source ${cat.name.toLowerCase()} from verified suppliers. 24-hour RFQ response for ${cat.description.toLowerCase()}.`,
    keywords: [cat.name.toLowerCase(), 'suppliers', 'manufacturers', 'wholesale', 'b2b'],
    subcategories: generateSubcategories(cat.id, cat.name),
    mockOrders: generateMockOrders(cat.id, cat.name)
  }));
}

// Helper function to generate subcategories
function generateSubcategories(categoryId, categoryName) {
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
}

// Helper function to generate mock orders
function generateMockOrders(categoryId, categoryName) {
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
    status: ['completed', 'in_progress', 'pending'][index],
    buyer: buyers[Math.floor(Math.random() * buyers.length)],
    supplier: suppliers[Math.floor(Math.random() * suppliers.length)],
    category: categoryName,
    subcategory: 'Equipment & Machinery',
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    completedAt: index === 0 ? new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null
  }));
}

async function seedAllCategories() {
  console.log('🌱 Starting comprehensive category seeding...')
  
  try {
    // Clear existing data
    console.log('🧹 Clearing existing category data...')
    await prisma.mockOrder.deleteMany()
    await prisma.subcategory.deleteMany()
    await prisma.category.deleteMany()
    
    // Generate all 50 categories
    const allCategories = [...ALL_50_CATEGORIES, ...generateRemainingCategories()]
    
    // Seed categories
    console.log('📂 Seeding 50 categories...')
    
    for (const categoryData of allCategories) {
      const category = await prisma.category.create({
        data: {
          id: categoryData.id,
          name: categoryData.name,
          slug: categoryData.slug,
          description: categoryData.description,
          icon: categoryData.icon,
          supplierCount: categoryData.supplierCount,
          productCount: categoryData.productCount,
          rfqCount: categoryData.rfqCount,
          mockOrderCount: categoryData.mockOrderCount,
          trending: categoryData.trending,
          isActive: categoryData.isActive,
          sortOrder: categoryData.sortOrder,
          metaTitle: categoryData.metaTitle,
          metaDescription: categoryData.metaDescription,
          keywords: categoryData.keywords
        }
      })
      
      console.log(`  ✅ Created category: ${category.name}`)
      
      // Create subcategories
      for (const subcategoryData of categoryData.subcategories) {
        await prisma.subcategory.create({
          data: {
            id: subcategoryData.id,
            name: subcategoryData.name,
            slug: subcategoryData.slug,
            description: subcategoryData.description,
            categoryId: category.id,
            supplierCount: subcategoryData.supplierCount,
            productCount: subcategoryData.productCount,
            rfqCount: subcategoryData.rfqCount,
            mockOrderCount: subcategoryData.mockOrderCount,
            isActive: subcategoryData.isActive,
            sortOrder: subcategoryData.sortOrder
          }
        })
      }
      
      // Create mock orders
      for (const orderData of categoryData.mockOrders) {
        await prisma.mockOrder.create({
          data: {
            id: orderData.id,
            title: orderData.title,
            description: orderData.description,
            value: orderData.value,
            currency: orderData.currency,
            status: orderData.status,
            buyer: orderData.buyer,
            supplier: orderData.supplier,
            category: orderData.category,
            subcategory: orderData.subcategory,
            categoryId: category.id,
            createdAt: new Date(orderData.createdAt),
            completedAt: orderData.completedAt ? new Date(orderData.completedAt) : null
          }
        })
      }
    }
    
    console.log('🎉 Category seeding completed successfully!')
    
    // Display summary
    const categoryCount = await prisma.category.count()
    const subcategoryCount = await prisma.subcategory.count()
    const mockOrderCount = await prisma.mockOrder.count()
    
    console.log('\n📊 Seeding Summary:')
    console.log(`  Categories: ${categoryCount}`)
    console.log(`  Subcategories: ${subcategoryCount}`)
    console.log(`  Mock Orders: ${mockOrderCount}`)
    
  } catch (error) {
    console.error('❌ Error seeding categories:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the seeding
if (require.main === module) {
  seedAllCategories()
    .catch((error) => {
      console.error('❌ Seeding failed:', error)
      process.exit(1)
    })
}

module.exports = { seedAllCategories }
