const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Simple categories data that works with your current schema
const CATEGORIES_DATA = [
  {
    name: 'Agriculture',
    description: 'Agricultural equipment, farming supplies, seeds, and organic farming tools',
    icon: '🚜',
    supplierCount: 15247,
    productCount: 45632,
    rfqCount: 3245,
    mockOrderCount: 1247,
    trending: true,
    subcategories: [
      'Agriculture Equipment',
      'Fresh Flowers', 
      'Seeds & Saplings',
      'Tractor Parts',
      'Animal Feed',
      'Irrigation Systems',
      'Fertilizers & Pesticides',
      'Organic Farming Tools'
    ],
    mockOrders: [
      {
        title: 'Tractor Parts Supply Contract',
        description: 'Supply of 500 tractor engine parts for agricultural machinery',
        value: 2500000,
        currency: 'INR',
        status: 'completed',
        buyer: 'Mahindra Tractors Ltd',
        supplier: 'AgriParts Solutions'
      },
      {
        title: 'Irrigation System Installation',
        description: 'Complete drip irrigation system for 50-acre farm',
        value: 1800000,
        currency: 'INR',
        status: 'in_progress',
        buyer: 'Green Valley Farms',
        supplier: 'WaterTech Solutions'
      },
      {
        title: 'Organic Fertilizer Supply',
        description: 'Monthly supply of 10 tons organic fertilizer',
        value: 450000,
        currency: 'INR',
        status: 'pending',
        buyer: 'Organic Harvest Co',
        supplier: 'EcoFert Solutions'
      }
    ]
  },
  {
    name: 'Apparel & Fashion',
    description: 'Fashion clothing, textiles, footwear, and accessories for retail and wholesale',
    icon: '👗',
    supplierCount: 28439,
    productCount: 67890,
    rfqCount: 5678,
    mockOrderCount: 2134,
    trending: false,
    subcategories: [
      'Sarees',
      'Sunglasses',
      'Unisex Clothing',
      'Suitcases & Briefcases',
      'Footwear',
      'Textiles & Fabrics',
      'Sportswear',
      'Fashion Accessories'
    ],
    mockOrders: [
      {
        title: 'Bulk Saree Supply Contract',
        description: 'Supply of 1000 designer sarees for retail chain',
        value: 3500000,
        currency: 'INR',
        status: 'completed',
        buyer: 'Fashion Hub India',
        supplier: 'Silk Paradise'
      },
      {
        title: 'Sportswear Manufacturing',
        description: 'Manufacturing of 5000 sportswear units',
        value: 2800000,
        currency: 'INR',
        status: 'in_progress',
        buyer: 'Sports World Ltd',
        supplier: 'ActiveWear Co'
      },
      {
        title: 'Footwear Supply Agreement',
        description: 'Supply of 2000 pairs of leather shoes',
        value: 1200000,
        currency: 'INR',
        status: 'pending',
        buyer: 'ShoeMart India',
        supplier: 'LeatherCraft Solutions'
      }
    ]
  },
  {
    name: 'Automobile',
    description: 'Auto parts, vehicle components, tires, and automotive accessories',
    icon: '🚗',
    supplierCount: 22156,
    productCount: 54321,
    rfqCount: 4521,
    mockOrderCount: 1876,
    trending: true,
    subcategories: [
      'Auto Electrical Parts',
      'Engine Parts',
      'Commercial Vehicles',
      'Coach Building',
      'Car Accessories',
      'Tires & Tubes',
      'Lubricants & Greases'
    ],
    mockOrders: [
      {
        title: 'Engine Parts Supply Contract',
        description: 'Supply of 2000 engine components for Maruti Suzuki',
        value: 4500000,
        currency: 'INR',
        status: 'completed',
        buyer: 'Maruti Suzuki India',
        supplier: 'AutoParts Pro'
      },
      {
        title: 'Tire Manufacturing Agreement',
        description: 'Manufacturing of 10000 tires for commercial vehicles',
        value: 3200000,
        currency: 'INR',
        status: 'in_progress',
        buyer: 'TruckCorp India',
        supplier: 'TireTech Solutions'
      },
      {
        title: 'Car Accessories Supply',
        description: 'Supply of 5000 car accessory sets',
        value: 1800000,
        currency: 'INR',
        status: 'pending',
        buyer: 'AutoStyle India',
        supplier: 'AccessoryHub'
      }
    ]
  }
];

// Generate remaining 47 categories
function generateRemainingCategories() {
  const baseCategories = [
    { name: 'Ayurveda & Herbal Products', icon: '🌿', description: 'Ayurvedic medicines, herbal extracts, natural skincare, and wellness products' },
    { name: 'Business Services', icon: '💼', description: 'Professional services, consulting, legal, accounting, and business solutions' },
    { name: 'Chemical', icon: '🧪', description: 'Industrial chemicals, specialty chemicals, petrochemicals, and chemical products' },
    { name: 'Computers and Internet', icon: '💻', description: 'IT services, software development, cloud computing, and cybersecurity solutions' },
    { name: 'Consumer Electronics', icon: '📱', description: 'Mobile phones, laptops, TVs, audio systems, and consumer electronic devices' },
    { name: 'Cosmetics & Personal Care', icon: '💄', description: 'Beauty products, skincare, hair care, and personal hygiene products' },
    { name: 'Electronics & Electrical', icon: '⚡', description: 'Electronic components, electrical equipment, and power systems' },
    { name: 'Food Products & Beverage', icon: '🍽️', description: 'Food products, beverages, processing equipment, and ingredients' },
    { name: 'Furniture & Carpentry Services', icon: '🪑', description: 'Furniture manufacturing, carpentry services, and home decor' },
    { name: 'Gifts & Crafts', icon: '🎁', description: 'Handicrafts, gifts, decorative items, and artistic products' },
    { name: 'Health & Beauty', icon: '🏥', description: 'Health products, beauty equipment, and wellness solutions' },
    { name: 'Home Furnishings', icon: '🏠', description: 'Home decor, furnishings, textiles, and interior design products' },
    { name: 'Home Supplies', icon: '🧽', description: 'Household supplies, cleaning products, and home maintenance' },
    { name: 'Industrial Machinery', icon: '⚙️', description: 'Heavy machinery, manufacturing equipment, and industrial tools' },
    { name: 'Industrial Supplies', icon: '🔧', description: 'Industrial components, supplies, and manufacturing materials' },
    { name: 'Jewelry & Jewelry Designers', icon: '💎', description: 'Jewelry, precious metals, gemstones, and accessories' },
    { name: 'Mineral & Metals', icon: '🔩', description: 'Minerals, metals, ores, and metal products' },
    { name: 'Office Supplies', icon: '📋', description: 'Office equipment, stationery, and business supplies' },
    { name: 'Packaging & Paper', icon: '📦', description: 'Packaging materials, paper products, and containers' },
    { name: 'Real Estate, Building & Construction', icon: '🏗️', description: 'Construction materials, building supplies, and real estate services' },
    { name: 'Security Products & Services', icon: '🔒', description: 'Security systems, surveillance equipment, and safety products' },
    { name: 'Sports Goods & Entertainment', icon: '⚽', description: 'Sports equipment, fitness gear, and entertainment products' },
    { name: 'Telecommunication', icon: '📡', description: 'Telecom equipment, communication systems, and network solutions' },
    { name: 'Textiles, Yarn & Fabrics', icon: '🧵', description: 'Textile materials, yarns, fabrics, and textile machinery' },
    { name: 'Tools & Equipment', icon: '🔨', description: 'Hand tools, power tools, and industrial equipment' },
    { name: 'Tours, Travels & Hotels', icon: '✈️', description: 'Travel services, hotel supplies, and tourism equipment' },
    { name: 'Toys & Games', icon: '🧸', description: 'Toys, games, educational products, and entertainment items' },
    { name: 'Renewable Energy Equipment', icon: '🌞', description: 'Solar panels, wind turbines, and renewable energy systems' },
    { name: 'Artificial Intelligence & Automation Tools', icon: '🤖', description: 'AI software, robotics, and automation solutions' },
    { name: 'Sustainable & Eco-Friendly Products', icon: '🌱', description: 'Eco-friendly products, sustainable materials, and green solutions' },
    { name: 'Healthcare Equipment & Technology', icon: '🏥', description: 'Medical equipment, health technology, and healthcare solutions' },
    { name: 'E-commerce & Digital Platforms Solutions', icon: '💻', description: 'E-commerce platforms, digital solutions, and online services' },
    { name: 'Gaming & Esports Hardware', icon: '🎮', description: 'Gaming equipment, esports hardware, and entertainment technology' },
    { name: 'Electric Vehicles (EVs) & Charging Solutions', icon: '🚗', description: 'Electric vehicles, EV charging stations, and sustainable transportation' },
    { name: 'Drones & UAVs', icon: '🚁', description: 'Drones, UAVs, aerial equipment, and drone services' },
    { name: 'Wearable Technology', icon: '⌚', description: 'Smartwatches, fitness trackers, and wearable devices' },
    { name: 'Logistics & Supply Chain Solutions', icon: '🚚', description: 'Logistics services, supply chain management, and transportation' },
    { name: '3D Printing Equipment', icon: '🖨️', description: '3D printers, printing materials, and additive manufacturing' },
    { name: 'Food Tech & Agri-Tech', icon: '🌾', description: 'Food technology, agricultural technology, and smart farming' },
    { name: 'Iron & Steel Industry', icon: '🏭', description: 'Steel production, iron manufacturing, and metal processing' },
    { name: 'Mining & Raw Materials', icon: '⛏️', description: 'Mining equipment, raw materials, and mineral extraction' },
    { name: 'Metal Recycling', icon: '♻️', description: 'Metal recycling, scrap processing, and waste management' },
    { name: 'Metallurgy & Metalworking', icon: '🔨', description: 'Metal processing, metallurgy, and metalworking services' },
    { name: 'Heavy Machinery & Mining Equipment', icon: '🚛', description: 'Heavy machinery, mining equipment, and construction vehicles' },
    { name: 'Ferrous and Non-Ferrous Metals', icon: '🔩', description: 'Steel, aluminum, copper, and other metal products' },
    { name: 'Mining Safety & Environmental Solutions', icon: '🛡️', description: 'Mining safety equipment, environmental protection, and safety solutions' },
    { name: 'Precious Metals & Mining', icon: '💎', description: 'Gold, silver, platinum, and precious metal mining' }
  ];

  return baseCategories.map((cat, index) => ({
    ...cat,
    supplierCount: Math.floor(Math.random() * 50000) + 5000,
    productCount: Math.floor(Math.random() * 100000) + 10000,
    rfqCount: Math.floor(Math.random() * 5000) + 500,
    mockOrderCount: Math.floor(Math.random() * 2000) + 200,
    trending: Math.random() > 0.7,
    subcategories: [
      'Equipment & Machinery',
      'Raw Materials',
      'Components & Parts',
      'Tools & Accessories',
      'Services & Solutions',
      'Technology & Software',
      'Maintenance & Support',
      'Consulting & Advisory'
    ],
    mockOrders: [
      {
        title: `${cat.name} Supply Contract`,
        description: `Supply of ${cat.name.toLowerCase()} products and services`,
        value: Math.floor(Math.random() * 5000000) + 500000,
        currency: 'INR',
        status: 'completed',
        buyer: 'TechCorp India',
        supplier: 'Pro Solutions'
      },
      {
        title: `${cat.name} Manufacturing Agreement`,
        description: `Manufacturing of ${cat.name.toLowerCase()} products`,
        value: Math.floor(Math.random() * 3000000) + 300000,
        currency: 'INR',
        status: 'in_progress',
        buyer: 'Manufacturing Ltd',
        supplier: 'Expert Services'
      },
      {
        title: `${cat.name} Service Contract`,
        description: `Service contract for ${cat.name.toLowerCase()}`,
        value: Math.floor(Math.random() * 1000000) + 100000,
        currency: 'INR',
        status: 'pending',
        buyer: 'Business Hub',
        supplier: 'Quality Suppliers'
      }
    ]
  }));
}

async function seedCategories() {
  console.log('🌱 Starting category seeding for Bell24h...')
  
  try {
    // Test database connection
    console.log('🔌 Testing Neon database connection...')
    await prisma.$connect()
    console.log('✅ Connected to Neon PostgreSQL successfully!')
    
    // Generate all 50 categories
    const allCategories = [...CATEGORIES_DATA, ...generateRemainingCategories()]
    
    console.log(`📂 Processing ${allCategories.length} categories...`)
    
    // Create a simple categories data structure
    const categoriesData = {
      categories: allCategories,
      totalCategories: allCategories.length,
      totalSubcategories: allCategories.reduce((sum, cat) => sum + cat.subcategories.length, 0),
      totalMockOrders: allCategories.reduce((sum, cat) => sum + cat.mockOrders.length, 0),
      trendingCategories: allCategories.filter(cat => cat.trending).length,
      createdAt: new Date().toISOString()
    }
    
    // Save to a simple JSON file for now (since we don't have Category model)
    const fs = require('fs')
    const path = require('path')
    
    const dataPath = path.join(__dirname, '../data/categories-data.json')
    fs.writeFileSync(dataPath, JSON.stringify(categoriesData, null, 2))
    
    console.log('✅ Categories data saved successfully!')
    
    // Display summary
    console.log('\n📊 Seeding Summary:')
    console.log(`  Categories: ${categoriesData.totalCategories}`)
    console.log(`  Subcategories: ${categoriesData.totalSubcategories}`)
    console.log(`  Mock Orders: ${categoriesData.totalMockOrders}`)
    console.log(`  Trending Categories: ${categoriesData.trendingCategories}`)
    console.log(`  Database: Neon PostgreSQL`)
    console.log(`  Data File: ${dataPath}`)
    console.log(`  Status: ✅ Ready for use`)
    
    console.log('\n🎉 Category seeding completed successfully!')
    console.log('📁 Categories data saved to: client/data/categories-data.json')
    console.log('🌐 You can now use this data in your application!')
    
  } catch (error) {
    console.error('❌ Error seeding categories:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the seeding
if (require.main === module) {
  seedCategories()
    .catch((error) => {
      console.error('❌ Seeding failed:', error)
      process.exit(1)
    })
}

module.exports = { seedCategories }
