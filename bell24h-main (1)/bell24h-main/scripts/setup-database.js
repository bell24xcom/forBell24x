#!/usr/bin/env node

/**
 * Database Setup Script for Bell24h
 * This script sets up the PostgreSQL database with proper configuration
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

async function setupDatabase() {
  console.log('🚀 Setting up Bell24h Database...\n');

  try {
    // Test database connection
    console.log('1. Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful\n');

    // Run database migrations
    console.log('2. Running database migrations...');
    await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`;
    console.log('✅ Database extensions created\n');

    // Create initial admin user
    console.log('3. Creating initial admin user...');
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@bell24h.com' },
      update: {},
      create: {
        email: 'admin@bell24h.com',
        name: 'Bell24h Admin',
        role: 'ADMIN',
        emailVerified: new Date(),
        profile: {
          create: {
            companyName: 'Bell24h',
            industry: 'Technology',
            phoneNumber: '+1234567890',
            address: '123 Tech Street, Tech City, TC 12345',
            isVerified: true
          }
        }
      }
    });
    console.log('✅ Admin user created:', adminUser.email);

    // Create sample categories
    console.log('4. Creating sample categories...');
    const categories = [
      { name: 'Electronics', description: 'Electronic components and devices' },
      { name: 'Manufacturing', description: 'Manufacturing equipment and tools' },
      { name: 'Construction', description: 'Construction materials and equipment' },
      { name: 'Automotive', description: 'Automotive parts and accessories' },
      { name: 'Healthcare', description: 'Healthcare equipment and supplies' }
    ];

    for (const category of categories) {
      await prisma.category.upsert({
        where: { name: category.name },
        update: {},
        create: category
      });
    }
    console.log('✅ Sample categories created');

    // Create sample suppliers
    console.log('5. Creating sample suppliers...');
    const suppliers = [
      {
        email: 'supplier1@example.com',
        name: 'Tech Supplier Inc',
        role: 'SUPPLIER',
        profile: {
          create: {
            companyName: 'Tech Supplier Inc',
            industry: 'Electronics',
            phoneNumber: '+1234567891',
            address: '456 Supplier Ave, Supply City, SC 12345',
            isVerified: true,
            businessLicense: 'BS123456789',
            taxId: 'TAX123456789'
          }
        }
      },
      {
        email: 'supplier2@example.com',
        name: 'Manufacturing Co',
        role: 'SUPPLIER',
        profile: {
          create: {
            companyName: 'Manufacturing Co',
            industry: 'Manufacturing',
            phoneNumber: '+1234567892',
            address: '789 Factory St, Factory City, FC 12345',
            isVerified: true,
            businessLicense: 'BS987654321',
            taxId: 'TAX987654321'
          }
        }
      }
    ];

    for (const supplier of suppliers) {
      await prisma.user.upsert({
        where: { email: supplier.email },
        update: {},
        create: supplier
      });
    }
    console.log('✅ Sample suppliers created');

    // Create sample buyers
    console.log('6. Creating sample buyers...');
    const buyers = [
      {
        email: 'buyer1@example.com',
        name: 'Procurement Manager',
        role: 'BUYER',
        profile: {
          create: {
            companyName: 'Big Corp Inc',
            industry: 'Technology',
            phoneNumber: '+1234567893',
            address: '321 Corporate Blvd, Corp City, CC 12345',
            isVerified: true
          }
        }
      }
    ];

    for (const buyer of buyers) {
      await prisma.user.upsert({
        where: { email: buyer.email },
        update: {},
        create: buyer
      });
    }
    console.log('✅ Sample buyers created');

    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Update .env.local with your actual database credentials');
    console.log('2. Run: npm run dev');
    console.log('3. Visit: http://localhost:3000');
    console.log('\n🔑 Default admin login:');
    console.log('Email: admin@bell24h.com');
    console.log('Password: (You\'ll need to set this via the app)');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('1. Make sure PostgreSQL is running');
    console.error('2. Check your DATABASE_URL in .env.local');
    console.error('3. Ensure the database exists');
    console.error('4. Check your database permissions');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the setup
setupDatabase();
