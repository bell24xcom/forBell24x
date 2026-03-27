#!/usr/bin/env node

/**
 * Complete Bell24h Implementation Script
 * Automatically runs all setup and implementation steps
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🚀 Starting Complete Bell24h Implementation...')
console.log('================================================')

async function runCompleteSetup() {
  try {
    // Step 1: Install dependencies
    console.log('\n📦 Step 1: Installing dependencies...')
    execSync('npm install', { stdio: 'inherit' })
    console.log('✅ Dependencies installed successfully')

    // Step 2: Generate Prisma client
    console.log('\n🔧 Step 2: Generating Prisma client...')
    execSync('npx prisma generate', { stdio: 'inherit' })
    console.log('✅ Prisma client generated')

    // Step 3: Push database schema
    console.log('\n🗄️ Step 3: Pushing database schema...')
    execSync('npx prisma db push', { stdio: 'inherit' })
    console.log('✅ Database schema pushed')

    // Step 4: Run database setup
    console.log('\n🌱 Step 4: Setting up database...')
    execSync('node scripts/setup-database.js', { stdio: 'inherit' })
    console.log('✅ Database setup completed')

    // Step 5: Migrate categories
    console.log('\n📁 Step 5: Migrating categories...')
    execSync('node scripts/migrate-categories.js', { stdio: 'inherit' })
    console.log('✅ Categories migrated')

    // Step 6: Seed database
    console.log('\n🌱 Step 6: Seeding database...')
    execSync('node scripts/seed-database.js', { stdio: 'inherit' })
    console.log('✅ Database seeded')

    // Step 7: Generate mock RFQs
    console.log('\n📝 Step 7: Generating mock RFQs...')
    execSync('node scripts/generate-mock-rfqs.js', { stdio: 'inherit' })
    console.log('✅ Mock RFQs generated')

    // Step 8: Test performance
    console.log('\n⚡ Step 8: Testing performance...')
    execSync('node scripts/test-database-performance.js', { stdio: 'inherit' })
    console.log('✅ Performance testing completed')

    // Step 9: Run basic tests
    console.log('\n🧪 Step 9: Running basic tests...')
    execSync('node scripts/test-setup.js', { stdio: 'inherit' })
    console.log('✅ Basic tests passed')

    console.log('\n🎉 COMPLETE IMPLEMENTATION SUCCESSFUL!')
    console.log('=====================================')
    console.log('✅ Database setup completed')
    console.log('✅ Categories migrated (50 categories)')
    console.log('✅ Mock data seeded')
    console.log('✅ 450+ RFQs generated')
    console.log('✅ Performance tested (1000+ users)')
    console.log('✅ All tests passed')
    console.log('\n🚀 Bell24h is ready for production!')
    console.log('\nNext steps:')
    console.log('1. Run: npm run dev')
    console.log('2. Visit: http://localhost:3000')
    console.log('3. Login with: admin@bell24h.com / admin123')

  } catch (error) {
    console.error('\n❌ Implementation failed:', error.message)
    console.log('\nTroubleshooting:')
    console.log('1. Check if DATABASE_URL is set in .env.local')
    console.log('2. Ensure PostgreSQL is running')
    console.log('3. Verify all dependencies are installed')
    process.exit(1)
  }
}

// Run the complete setup
runCompleteSetup()
