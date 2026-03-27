#!/usr/bin/env node

/**
 * REAL Database Setup Script
 * This actually sets up the database with proper error handling
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function setupDatabase() {
  console.log('🔧 Setting up Bell24h database...')
  
  try {
    // Test database connection
    console.log('📡 Testing database connection...')
    await prisma.$connect()
    console.log('✅ Database connected successfully')
    
    // Run migrations
    console.log('🔄 Running database migrations...')
    const { execSync } = require('child_process')
    execSync('npx prisma migrate dev --name init', { stdio: 'inherit' })
    console.log('✅ Migrations completed')
    
    // Create admin user
    console.log('👤 Creating admin user...')
    const hashedPassword = await bcrypt.hash('admin123', 12)
    
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@bell24h.com' },
      update: {},
      create: {
        email: 'admin@bell24h.com',
        name: 'Bell24h Admin',
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true,
        isVerified: true,
        profile: {
          create: {
            firstName: 'Bell24h',
            lastName: 'Admin',
            phone: '+91-9876543210',
            designation: 'System Administrator',
          }
        }
      }
    })
    
    console.log('✅ Admin user created:', adminUser.email)
    
    // Create sample company
    console.log('🏢 Creating sample company...')
    const sampleCompany = await prisma.company.upsert({
      where: { slug: 'sample-company' },
      update: {},
      create: {
        name: 'Sample Company Ltd',
        slug: 'sample-company',
        description: 'A sample company for testing',
        category: 'Manufacturing',
        size: 'MEDIUM',
        type: 'SUPPLIER',
        isVerified: true,
        trustScore: 8.5,
      }
    })
    
    console.log('✅ Sample company created:', sampleCompany.name)
    
    // Test queries
    console.log('🧪 Testing database queries...')
    const userCount = await prisma.user.count()
    const companyCount = await prisma.company.count()
    
    console.log(`📊 Database stats: ${userCount} users, ${companyCount} companies`)
    
    console.log('🎉 Database setup completed successfully!')
    console.log('')
    console.log('Next steps:')
    console.log('1. Copy env.local.example to .env.local')
    console.log('2. Fill in your API keys and secrets')
    console.log('3. Run: npm run dev')
    console.log('4. Login with: admin@bell24h.com / admin123')
    
  } catch (error) {
    console.error('❌ Database setup failed:', error)
    console.log('')
    console.log('Common issues:')
    console.log('1. DATABASE_URL not set in .env.local')
    console.log('2. PostgreSQL not running')
    console.log('3. Database doesn\'t exist')
    console.log('')
    console.log('Solutions:')
    console.log('1. Create .env.local from env.local.example')
    console.log('2. Set up PostgreSQL database')
    console.log('3. Update DATABASE_URL in .env.local')
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run setup
setupDatabase()
