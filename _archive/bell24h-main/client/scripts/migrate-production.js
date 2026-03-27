#!/usr/bin/env node

/**
 * Production Database Migration Script
 * Handles database setup, migrations, and seeding for 1000+ concurrent users
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const fs = require('fs')
const path = require('path')

// Initialize Prisma client
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: ['query', 'info', 'warn', 'error'],
})

// Production database configuration
const PRODUCTION_CONFIG = {
  connectionLimit: 20,
  poolTimeout: 20,
  connectTimeout: 60,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
}

// Admin user data for initial setup
const ADMIN_USER = {
  email: 'admin@bell24h.com',
  name: 'Bell24h Admin',
  password: 'Bell24h@Admin2025!',
  role: 'ADMIN',
  isActive: true,
  isVerified: true,
}

// Sample companies for testing
const SAMPLE_COMPANIES = [
  {
    name: 'Tata Steel Limited',
    slug: 'tata-steel-limited',
    description: 'Leading steel manufacturer in India',
    gstNumber: '19AABCT1234C1Z5',
    panNumber: 'AABCT1234C',
    category: 'Steel & Metals',
    size: 'LARGE',
    type: 'SUPPLIER',
    isVerified: true,
    trustScore: 9.5,
  },
  {
    name: 'Reliance Industries Limited',
    slug: 'reliance-industries-limited',
    description: 'Diversified conglomerate with petrochemicals and textiles',
    gstNumber: '27AABCR1234C1Z5',
    panNumber: 'AABCR1234C',
    category: 'Petrochemicals',
    size: 'LARGE',
    type: 'BOTH',
    isVerified: true,
    trustScore: 9.8,
  },
  {
    name: 'Mahindra & Mahindra',
    slug: 'mahindra-mahindra',
    description: 'Automotive and farm equipment manufacturer',
    gstNumber: '27AABCM1234C1Z5',
    panNumber: 'AABCM1234C',
    category: 'Automotive',
    size: 'LARGE',
    type: 'BOTH',
    isVerified: true,
    trustScore: 9.2,
  },
]

// Sample products for testing
const SAMPLE_PRODUCTS = [
  {
    name: 'Steel Rods - Grade 60',
    description: 'High-quality steel rods for construction',
    category: 'Steel & Metals',
    subcategory: 'Construction Steel',
    price: 45000.00,
    currency: 'INR',
    specifications: {
      grade: 'Grade 60',
      diameter: '12mm',
      length: '12m',
      tensile_strength: '600 N/mm²',
      yield_strength: '415 N/mm²',
    },
    stock: 1000,
    minOrderQty: 100,
    isActive: true,
    isFeatured: true,
  },
  {
    name: 'Cotton Fabric - 100% Cotton',
    description: 'Premium cotton fabric for textile industry',
    category: 'Textiles',
    subcategory: 'Cotton Fabric',
    price: 120.00,
    currency: 'INR',
    specifications: {
      material: '100% Cotton',
      weight: '150 GSM',
      width: '44 inches',
      color: 'White',
      finish: 'Bleached',
    },
    stock: 5000,
    minOrderQty: 100,
    isActive: true,
    isFeatured: true,
  },
]

/**
 * Create database indexes for performance optimization
 */
async function createIndexes() {
  console.log('🔧 Creating database indexes for performance...')
  
  try {
    // User indexes
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);`
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id);`
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);`
    
    // Company indexes
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_companies_slug ON companies(slug);`
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_companies_gst_number ON companies(gst_number);`
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_companies_category ON companies(category);`
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_companies_trust_score ON companies(trust_score);`
    
    // Product indexes
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);`
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_products_company_id ON products(company_id);`
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);`
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);`
    
    // RFQ indexes
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_rfqs_buyer_id ON rfqs(buyer_id);`
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_rfqs_category ON rfqs(category);`
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_rfqs_status ON rfqs(status);`
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_rfqs_created_at ON rfqs(created_at);`
    
    // Quote indexes
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_quotes_rfq_id ON quotes(rfq_id);`
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_quotes_supplier_id ON quotes(supplier_id);`
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);`
    
    // Order indexes
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON orders(buyer_id);`
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_orders_supplier_id ON orders(supplier_id);`
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);`
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);`
    
    // Payment indexes
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);`
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);`
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);`
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments(transaction_id);`
    
    // Notification indexes
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);`
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);`
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);`
    
    // Audit log indexes
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);`
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);`
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);`
    
    console.log('✅ Database indexes created successfully')
  } catch (error) {
    console.error('❌ Error creating indexes:', error)
    throw error
  }
}

/**
 * Create admin user
 */
async function createAdminUser() {
  console.log('👤 Creating admin user...')
  
  try {
    const existingAdmin = await prisma.user.findUnique({
      where: { email: ADMIN_USER.email }
    })
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists')
      return existingAdmin
    }
    
    const hashedPassword = await bcrypt.hash(ADMIN_USER.password, 12)
    
    const admin = await prisma.user.create({
      data: {
        ...ADMIN_USER,
        password: hashedPassword,
        profile: {
          create: {
            firstName: 'Bell24h',
            lastName: 'Admin',
            phone: '+91-9876543210',
            designation: 'System Administrator',
            department: 'IT',
            experience: 10,
          }
        }
      }
    })
    
    console.log('✅ Admin user created successfully')
    return admin
  } catch (error) {
    console.error('❌ Error creating admin user:', error)
    throw error
  }
}

/**
 * Create sample companies
 */
async function createSampleCompanies() {
  console.log('🏢 Creating sample companies...')
  
  try {
    const companies = []
    
    for (const companyData of SAMPLE_COMPANIES) {
      const existingCompany = await prisma.company.findUnique({
        where: { slug: companyData.slug }
      })
      
      if (existingCompany) {
        console.log(`✅ Company ${companyData.name} already exists`)
        companies.push(existingCompany)
        continue
      }
      
      const company = await prisma.company.create({
        data: {
          ...companyData,
          verifiedAt: new Date(),
        }
      })
      
      companies.push(company)
      console.log(`✅ Created company: ${company.name}`)
    }
    
    return companies
  } catch (error) {
    console.error('❌ Error creating sample companies:', error)
    throw error
  }
}

/**
 * Create sample products
 */
async function createSampleProducts(companies) {
  console.log('📦 Creating sample products...')
  
  try {
    const products = []
    
    for (let i = 0; i < SAMPLE_PRODUCTS.length; i++) {
      const productData = SAMPLE_PRODUCTS[i]
      const company = companies[i % companies.length] // Distribute products across companies
      
      const product = await prisma.product.create({
        data: {
          ...productData,
          companyId: company.id,
        }
      })
      
      products.push(product)
      console.log(`✅ Created product: ${product.name}`)
    }
    
    return products
  } catch (error) {
    console.error('❌ Error creating sample products:', error)
    throw error
  }
}

/**
 * Create database constraints and triggers
 */
async function createConstraints() {
  console.log('🔒 Creating database constraints...')
  
  try {
    // Add check constraints
    await prisma.$executeRaw`ALTER TABLE users ADD CONSTRAINT check_user_role CHECK (role IN ('ADMIN', 'BUYER', 'SUPPLIER', 'MODERATOR'));`
    await prisma.$executeRaw`ALTER TABLE companies ADD CONSTRAINT check_company_size CHECK (size IN ('MICRO', 'SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE'));`
    await prisma.$executeRaw`ALTER TABLE companies ADD CONSTRAINT check_company_type CHECK (type IN ('BUYER', 'SUPPLIER', 'BOTH'));`
    await prisma.$executeRaw`ALTER TABLE rfqs ADD CONSTRAINT check_rfq_status CHECK (status IN ('OPEN', 'CLOSED', 'CANCELLED', 'COMPLETED'));`
    await prisma.$executeRaw`ALTER TABLE quotes ADD CONSTRAINT check_quote_status CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED'));`
    await prisma.$executeRaw`ALTER TABLE orders ADD CONSTRAINT check_order_status CHECK (status IN ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'));`
    await prisma.$executeRaw`ALTER TABLE payments ADD CONSTRAINT check_payment_status CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED'));`
    
    // Add unique constraints
    await prisma.$executeRaw`ALTER TABLE companies ADD CONSTRAINT unique_gst_number UNIQUE (gst_number);`
    await prisma.$executeRaw`ALTER TABLE companies ADD CONSTRAINT unique_pan_number UNIQUE (pan_number);`
    await prisma.$executeRaw`ALTER TABLE orders ADD CONSTRAINT unique_order_number UNIQUE (order_number);`
    await prisma.$executeRaw`ALTER TABLE payments ADD CONSTRAINT unique_transaction_id UNIQUE (transaction_id);`
    
    console.log('✅ Database constraints created successfully')
  } catch (error) {
    console.error('❌ Error creating constraints:', error)
    throw error
  }
}

/**
 * Main migration function
 */
async function migrate() {
  console.log('🚀 Starting production database migration...')
  console.log('📊 Target: 1000+ concurrent users support')
  
  try {
    // Test database connection
    await prisma.$connect()
    console.log('✅ Database connection established')
    
    // Create indexes for performance
    await createIndexes()
    
    // Create constraints
    await createConstraints()
    
    // Create admin user
    const admin = await createAdminUser()
    
    // Create sample companies
    const companies = await createSampleCompanies()
    
    // Create sample products
    const products = await createSampleProducts(companies)
    
    console.log('🎉 Production database migration completed successfully!')
    console.log(`📈 Database optimized for 1000+ concurrent users`)
    console.log(`👤 Admin user: ${admin.email}`)
    console.log(`🏢 Companies created: ${companies.length}`)
    console.log(`📦 Products created: ${products.length}`)
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run migration if called directly
if (require.main === module) {
  migrate()
}

module.exports = { migrate, createIndexes, createAdminUser, createSampleCompanies, createSampleProducts }
