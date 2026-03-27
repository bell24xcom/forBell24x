#!/usr/bin/env node

/**
 * Basic Data Seeding Script for Bell24h
 * 
 * This script seeds the database with basic data using existing Prisma models
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Sample categories for the marketplace
const CATEGORIES = [
  'Agriculture',
  'Apparel & Fashion', 
  'Automobile',
  'Ayurveda & Herbal Products',
  'Business Services',
  'Chemical',
  'Computers and Internet',
  'Consumer Electronics',
  'Cosmetics & Personal Care',
  'Electronics & Electrical',
  'Food Products & Beverage',
  'Furniture & Carpentry Services',
  'Gifts & Crafts',
  'Health & Beauty',
  'Home Furnishings',
  'Home Supplies',
  'Industrial Machinery',
  'Industrial Supplies',
  'Jewelry & Jewelry Designers',
  'Mineral & Metals',
  'Office Supplies',
  'Packaging & Paper',
  'Real Estate, Building & Construction',
  'Security Products & Services',
  'Sports Goods & Entertainment',
  'Telecommunication',
  'Textiles, Yarn & Fabrics',
  'Tools & Equipment',
  'Tours, Travels & Hotels',
  'Toys & Games',
  'Renewable Energy Equipment',
  'Artificial Intelligence & Automation Tools',
  'Sustainable & Eco-Friendly Products',
  'Healthcare Equipment & Technology',
  'E-commerce & Digital Platforms Solutions',
  'Gaming & Esports Hardware',
  'Electric Vehicles (EVs) & Charging Solutions',
  'Drones & UAVs',
  'Wearable Technology',
  'Logistics & Supply Chain Solutions',
  '3D Printing Equipment',
  'Food Tech & Agri-Tech',
  'Iron & Steel Industry',
  'Mining & Raw Materials',
  'Metal Recycling',
  'Metallurgy & Metalworking',
  'Heavy Machinery & Mining Equipment',
  'Ferrous and Non-Ferrous Metals',
  'Mining Safety & Environmental Solutions',
  'Precious Metals & Mining'
];

// Sample companies
const SAMPLE_COMPANIES = [
  {
    name: 'SteelWorks India Ltd',
    email: 'contact@steelworks.in',
    phone: '+91-9876543210',
    website: 'https://steelworks.in',
    category: 'Iron & Steel Industry',
    subcategory: 'Steel Production',
    description: 'Leading steel manufacturer and supplier in India',
    city: 'Mumbai',
    state: 'Maharashtra',
    gstNumber: '27AABCU9603R1ZX',
    type: 'SUPPLIER'
  },
  {
    name: 'Textile Paradise',
    email: 'info@textileparadise.com',
    phone: '+91-9876543211',
    website: 'https://textileparadise.com',
    category: 'Textiles, Yarn & Fabrics',
    subcategory: 'Cotton Fabrics',
    description: 'Premium textile manufacturer and exporter',
    city: 'Surat',
    state: 'Gujarat',
    gstNumber: '24AABCU9603R1ZY',
    type: 'SUPPLIER'
  },
  {
    name: 'Tech Solutions Pvt Ltd',
    email: 'hello@techsolutions.in',
    phone: '+91-9876543212',
    website: 'https://techsolutions.in',
    category: 'Computers and Internet',
    subcategory: 'Software Development',
    description: 'IT services and software development company',
    city: 'Bangalore',
    state: 'Karnataka',
    gstNumber: '29AABCU9603R1ZZ',
    type: 'BOTH'
  },
  {
    name: 'AgriTech Innovations',
    email: 'contact@agritech.in',
    phone: '+91-9876543213',
    website: 'https://agritech.in',
    category: 'Agriculture',
    subcategory: 'Agriculture Equipment',
    description: 'Modern agricultural equipment and technology solutions',
    city: 'Pune',
    state: 'Maharashtra',
    gstNumber: '27AABCU9603R1ZA',
    type: 'SUPPLIER'
  },
  {
    name: 'AutoParts Pro',
    email: 'sales@autopartspro.in',
    phone: '+91-9876543214',
    website: 'https://autopartspro.in',
    category: 'Automobile',
    subcategory: 'Engine Parts',
    description: 'Automotive parts and components supplier',
    city: 'Chennai',
    state: 'Tamil Nadu',
    gstNumber: '33AABCU9603R1ZB',
    type: 'SUPPLIER'
  }
];

// Sample products
const SAMPLE_PRODUCTS = [
  {
    name: 'Steel Rods - Grade 60',
    description: 'High-quality steel rods for construction',
    category: 'Iron & Steel Industry',
    subcategory: 'Steel Production',
    price: 45000,
    currency: 'INR',
    specifications: {
      grade: 'Grade 60',
      diameter: '12mm',
      length: '12m',
      material: 'Carbon Steel'
    },
    stock: 1000,
    minOrderQty: 100
  },
  {
    name: 'Cotton Fabric - 100% Cotton',
    description: 'Premium cotton fabric for garment manufacturing',
    category: 'Textiles, Yarn & Fabrics',
    subcategory: 'Cotton Fabrics',
    price: 120,
    currency: 'INR',
    specifications: {
      material: '100% Cotton',
      weight: '180 GSM',
      width: '44 inches',
      color: 'White'
    },
    stock: 5000,
    minOrderQty: 100
  },
  {
    name: 'Custom Software Development',
    description: 'Custom software development services',
    category: 'Computers and Internet',
    subcategory: 'Software Development',
    price: 50000,
    currency: 'INR',
    specifications: {
      type: 'Custom Development',
      platform: 'Web & Mobile',
      duration: '3-6 months',
      support: '1 year included'
    },
    stock: 0,
    minOrderQty: 1
  }
];

// Sample RFQs
const SAMPLE_RFQS = [
  {
    title: 'Steel Rods for Construction Project',
    description: 'Need 10,000 steel rods of grade 60 for construction project in Mumbai',
    category: 'Iron & Steel Industry',
    subcategory: 'Steel Production',
    quantity: 10000,
    unit: 'pieces',
    budget: 4500000,
    currency: 'INR',
    urgency: 'HIGH'
  },
  {
    title: 'Cotton Fabric for Garment Manufacturing',
    description: 'Looking for premium cotton fabric for manufacturing 5000 shirts',
    category: 'Textiles, Yarn & Fabrics',
    subcategory: 'Cotton Fabrics',
    quantity: 2000,
    unit: 'meters',
    budget: 240000,
    currency: 'INR',
    urgency: 'MEDIUM'
  },
  {
    title: 'E-commerce Platform Development',
    description: 'Need custom e-commerce platform for B2B marketplace',
    category: 'Computers and Internet',
    subcategory: 'Software Development',
    quantity: 1,
    unit: 'project',
    budget: 500000,
    currency: 'INR',
    urgency: 'LOW'
  }
];

async function seedBasicData() {
  console.log('🌱 Starting basic data seeding for Bell24h...');
  
  try {
    // Test database connection
    console.log('🔌 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Connected to database successfully!');
    
    // Create sample companies
    console.log('🏢 Creating sample companies...');
    const companies = [];
    
    for (const companyData of SAMPLE_COMPANIES) {
      const company = await prisma.company.create({
        data: {
          name: companyData.name,
          email: companyData.email,
          phone: companyData.phone,
          website: companyData.website,
          category: companyData.category,
          subcategory: companyData.subcategory,
          description: companyData.description,
          city: companyData.city,
          state: companyData.state,
          country: 'India',
          gstNumber: companyData.gstNumber,
          type: companyData.type,
          isActive: true,
          isVerified: true
        }
      });
      companies.push(company);
      console.log(`  ✅ Created company: ${company.name}`);
    }
    
    // Create sample users
    console.log('👥 Creating sample users...');
    const users = [];
    
    for (let i = 0; i < 5; i++) {
      const user = await prisma.user.create({
        data: {
          email: `user${i + 1}@bell24h.com`,
          phone: `+91-98765432${i + 10}`,
          name: `User ${i + 1}`,
          role: i < 3 ? 'BUYER' : 'SUPPLIER',
          isActive: true,
          phoneVerified: true,
          trustScore: Math.floor(Math.random() * 40) + 60
        }
      });
      users.push(user);
      console.log(`  ✅ Created user: ${user.name}`);
    }
    
    // Create sample products
    console.log('📦 Creating sample products...');
    const products = [];
    
    for (let i = 0; i < SAMPLE_PRODUCTS.length; i++) {
      const product = await prisma.product.create({
        data: {
          name: SAMPLE_PRODUCTS[i].name,
          description: SAMPLE_PRODUCTS[i].description,
          category: SAMPLE_PRODUCTS[i].category,
          subcategory: SAMPLE_PRODUCTS[i].subcategory,
          price: SAMPLE_PRODUCTS[i].price,
          currency: SAMPLE_PRODUCTS[i].currency,
          specifications: SAMPLE_PRODUCTS[i].specifications,
          stock: SAMPLE_PRODUCTS[i].stock,
          minOrderQty: SAMPLE_PRODUCTS[i].minOrderQty,
          isActive: true,
          isFeatured: i === 0,
          companyId: companies[i % companies.length].id
        }
      });
      products.push(product);
      console.log(`  ✅ Created product: ${product.name}`);
    }
    
    // Create sample RFQs
    console.log('📋 Creating sample RFQs...');
    const rfqs = [];
    
    for (let i = 0; i < SAMPLE_RFQS.length; i++) {
      const rfq = await prisma.rFQ.create({
        data: {
          title: SAMPLE_RFQS[i].title,
          description: SAMPLE_RFQS[i].description,
          category: SAMPLE_RFQS[i].category,
          subcategory: SAMPLE_RFQS[i].subcategory,
          quantity: SAMPLE_RFQS[i].quantity,
          unit: SAMPLE_RFQS[i].unit,
          budget: SAMPLE_RFQS[i].budget,
          currency: SAMPLE_RFQS[i].currency,
          urgency: SAMPLE_RFQS[i].urgency,
          status: 'OPEN',
          buyerId: users[i % users.length].id,
          companyId: companies[i % companies.length].id
        }
      });
      rfqs.push(rfq);
      console.log(`  ✅ Created RFQ: ${rfq.title}`);
    }
    
    // Create sample quotes
    console.log('💰 Creating sample quotes...');
    for (let i = 0; i < rfqs.length; i++) {
      const quote = await prisma.quote.create({
        data: {
          rfqId: rfqs[i].id,
          supplierId: users[(i + 2) % users.length].id,
          price: SAMPLE_RFQS[i].budget * (0.8 + Math.random() * 0.4), // Random price within 80-120% of budget
          currency: 'INR',
          quantity: SAMPLE_RFQS[i].quantity,
          unit: SAMPLE_RFQS[i].unit,
          deliveryTime: `${Math.floor(Math.random() * 30) + 7} days`,
          validity: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          status: 'PENDING',
          specifications: SAMPLE_PRODUCTS[i % SAMPLE_PRODUCTS.length].specifications,
          terms: 'Standard terms and conditions apply',
          notes: 'Ready for immediate delivery'
        }
      });
      console.log(`  ✅ Created quote for RFQ: ${rfqs[i].title}`);
    }
    
    // Display summary
    console.log('\n📊 Seeding Summary:');
    console.log('==================');
    console.log(`  Companies: ${companies.length}`);
    console.log(`  Users: ${users.length}`);
    console.log(`  Products: ${products.length}`);
    console.log(`  RFQs: ${rfqs.length}`);
    console.log(`  Categories Available: ${CATEGORIES.length}`);
    console.log(`  Status: ✅ Ready for testing`);
    
    console.log('\n🎉 Basic data seeding completed successfully!');
    console.log('\nYou can now:');
    console.log('1. Test the marketplace functionality');
    console.log('2. Create RFQs and quotes');
    console.log('3. Browse products by category');
    console.log('4. Test the search and filtering features');
    
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding
if (require.main === module) {
  seedBasicData()
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedBasicData };
