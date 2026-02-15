#!/usr/bin/env node

/**
 * Database Migration Script for Bell24h
 * This script migrates the database schema and seeds initial data
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function migrateDatabase() {
  console.log('🚀 Starting Bell24h database migration...');

  try {
    // Test database connection
    console.log('🔌 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Connected to database successfully!');

    // Check if we need to create the database
    console.log('📊 Checking database schema...');
    
    // Try to query a table to see if schema exists
    try {
      await prisma.user.findFirst();
      console.log('✅ Database schema already exists');
    } catch (error) {
      console.log('⚠️  Database schema not found, this is expected for new databases');
      console.log('💡 Run: npx prisma migrate deploy');
    }

    // Seed basic data if tables are empty
    console.log('🌱 Checking if data needs to be seeded...');
    
    const userCount = await prisma.user.count();
    const companyCount = await prisma.company.count();
    
    if (userCount === 0 && companyCount === 0) {
      console.log('📦 Seeding initial data...');
      await seedInitialData();
    } else {
      console.log('✅ Database already has data, skipping seed');
    }

    console.log('🎉 Database migration completed successfully!');

  } catch (error) {
    console.error('❌ Database migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function seedInitialData() {
  try {
    // Create sample companies
    console.log('🏢 Creating sample companies...');
    
    const company1 = await prisma.company.create({
      data: {
        name: 'SteelWorks India Ltd',
        email: 'contact@steelworks.com',
        phone: '+919876543210',
        website: 'https://www.steelworks.com',
        description: 'Leading manufacturer of steel products.',
        category: 'Iron & Steel Industry',
        subcategory: 'Steel Production',
        type: 'SUPPLIER',
        isVerified: true,
        gstNumber: '27ABCDE1234F1Z5',
        users: {
          create: {
            email: 'supplier1@example.com',
            phone: '+919999999991',
            password: await bcrypt.hash('password123', 10),
            role: 'SUPPLIER',
            isVerified: true,
            phoneVerified: true,
            name: 'Supplier User 1',
          },
        },
      },
    });
    console.log(`  ✅ Created company: ${company1.name}`);

    const company2 = await prisma.company.create({
      data: {
        name: 'Textile Paradise',
        email: 'info@textileparadise.com',
        phone: '+919876543211',
        website: 'https://www.textileparadise.com',
        description: 'Exporter of high-quality textiles.',
        category: 'Textiles, Yarn & Fabrics',
        subcategory: 'Cotton Fabrics',
        type: 'SUPPLIER',
        isVerified: true,
        gstNumber: '27FGHIJ5678K2Z6',
        users: {
          create: {
            email: 'supplier2@example.com',
            phone: '+919999999992',
            password: await bcrypt.hash('password123', 10),
            role: 'SUPPLIER',
            isVerified: true,
            phoneVerified: true,
            name: 'Supplier User 2',
          },
        },
      },
    });
    console.log(`  ✅ Created company: ${company2.name}`);

    const company3 = await prisma.company.create({
      data: {
        name: 'Tech Solutions Pvt Ltd',
        email: 'sales@techsolutions.com',
        phone: '+919876543212',
        website: 'https://www.techsolutions.com',
        description: 'Provider of IT and software services.',
        category: 'Computers and Internet',
        subcategory: 'Software Development',
        type: 'BOTH',
        isVerified: true,
        gstNumber: '27KLMNO9012L3Z7',
        users: {
          create: {
            email: 'buyer1@example.com',
            phone: '+919999999993',
            password: await bcrypt.hash('password123', 10),
            role: 'BUYER',
            isVerified: true,
            phoneVerified: true,
            name: 'Buyer User 1',
          },
        },
      },
    });
    console.log(`  ✅ Created company: ${company3.name}`);

    // Create sample RFQs
    console.log('📋 Creating sample RFQs...');
    
    const rfq1 = await prisma.rFQ.create({
      data: {
        title: 'Steel Rods for Construction',
        description: 'Need 1000 tons of steel rods for construction project',
        category: 'Iron & Steel Industry',
        subcategory: 'Steel Production',
        quantity: 1000,
        unit: 'tons',
        budget: 5000000,
        currency: 'INR',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        urgency: 'MEDIUM',
        status: 'OPEN',
        buyerId: company3.users[0].id,
      },
    });
    console.log(`  ✅ Created RFQ: ${rfq1.title}`);

    // Create sample quotes
    console.log('💰 Creating sample quotes...');
    
    const quote1 = await prisma.quote.create({
      data: {
        rfqId: rfq1.id,
        supplierId: company1.users[0].id,
        price: 4500000,
        currency: 'INR',
        deliveryTime: 15,
        validity: 7,
        status: 'PENDING',
        message: 'We can provide high-quality steel rods with 15-day delivery',
      },
    });
    console.log(`  ✅ Created quote: ${quote1.id}`);

    console.log('✅ Initial data seeding completed!');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  migrateDatabase();
}

module.exports = { migrateDatabase };
