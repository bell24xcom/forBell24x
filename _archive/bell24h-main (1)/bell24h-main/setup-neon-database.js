#!/usr/bin/env node

// Neon Database Setup Script for Bell24h
// This script sets up the Neon database connection and runs migrations

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Neon Database for Bell24h...\n');

// Neon database configuration template
const neonConfig = `# Neon Database Configuration for Bell24h
# Replace with your actual Neon database credentials

# Neon Database URL (Primary connection)
DATABASE_URL="postgresql://username:password@ep-xxxxx.us-east-1.aws.neon.tech/neondb?sslmode=require"

# Neon Direct URL (For migrations and direct connections)
DIRECT_URL="postgresql://username:password@ep-xxxxx.us-east-1.aws.neon.tech/neondb?sslmode=require"

# Neon Connection Pooling (Optional - for better performance)
NEON_POOLED_URL="postgresql://username:password@ep-xxxxx-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require"

# Database Configuration
DB_HOST="ep-xxxxx.us-east-1.aws.neon.tech"
DB_PORT="5432"
DB_NAME="neondb"
DB_USER="username"
DB_PASSWORD="password"

# SSL Configuration for Neon
DB_SSL="require"

# Connection Pool Settings
DB_POOL_MIN="2"
DB_POOL_MAX="10"
DB_POOL_IDLE_TIMEOUT_MS="30000"
DB_POOL_CONNECTION_TIMEOUT_MS="2000"

# Neon-specific settings
NEON_PROJECT_ID="your-neon-project-id"
NEON_BRANCH="main"
NEON_REGION="us-east-1"

# Application Settings
NEXT_PUBLIC_SITE_URL="https://www.bell24h.com"
NODE_ENV="production"

# JWT Secret for authentication
JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters-long"

# MSG91 Configuration for OTP
MSG91_AUTH_KEY="your-msg91-auth-key"
MSG91_TEMPLATE_ID="your-template-id"
MSG91_SENDER_ID="BELL24H"

# Feature Flags
ENABLE_VOICE_RFQ=true
ENABLE_AI_MATCHING=true
ENABLE_ESCROW_PAYMENTS=true
ENABLE_REAL_TIME_NOTIFICATIONS=true

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000

# Security
ENCRYPTION_KEY="your-encryption-key-here"`;

// Update .env.local with Neon configuration
function updateEnvLocal() {
  console.log('📝 Updating .env.local with Neon configuration...');
  
  const envLocalPath = path.join(process.cwd(), '.env.local');
  let existingContent = '';
  
  // Read existing .env.local if it exists
  if (fs.existsSync(envLocalPath)) {
    existingContent = fs.readFileSync(envLocalPath, 'utf8');
  }
  
  // Add Neon configuration if not already present
  if (!existingContent.includes('DATABASE_URL')) {
    const updatedContent = existingContent + '\n\n' + neonConfig;
    fs.writeFileSync(envLocalPath, updatedContent);
    console.log('✅ Updated .env.local with Neon database configuration');
  } else {
    console.log('✅ .env.local already contains database configuration');
  }
}

// Update Prisma schema for Neon
function updatePrismaSchema() {
  console.log('🔧 Updating Prisma schema for Neon...');
  
  const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
  
  if (fs.existsSync(schemaPath)) {
    let schemaContent = fs.readFileSync(schemaPath, 'utf8');
    
    // Update datasource for Neon
    schemaContent = schemaContent.replace(
      /datasource db \{[\s\S]*?\}/,
      `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}`
    );
    
    fs.writeFileSync(schemaPath, schemaContent);
    console.log('✅ Updated Prisma schema for Neon database');
  }
}

// Generate Prisma client
function generatePrismaClient() {
  console.log('🔨 Generating Prisma client...');
  
  try {
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ Prisma client generated successfully');
  } catch (error) {
    console.log('⚠️ Prisma client generation failed:', error.message);
  }
}

// Run database migrations
function runMigrations() {
  console.log('🗄️ Running database migrations...');
  
  try {
    execSync('npx prisma db push', { stdio: 'inherit' });
    console.log('✅ Database migrations completed');
  } catch (error) {
    console.log('⚠️ Database migrations failed:', error.message);
    console.log('💡 Make sure your Neon database credentials are correct in .env.local');
  }
}

// Test database connection
function testConnection() {
  console.log('🔍 Testing database connection...');
  
  try {
    execSync('npx prisma db pull', { stdio: 'inherit' });
    console.log('✅ Database connection successful');
  } catch (error) {
    console.log('⚠️ Database connection test failed:', error.message);
  }
}

// Create database seed script
function createSeedScript() {
  console.log('🌱 Creating database seed script...');
  
  const seedContent = `// Database seed script for Bell24h
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');
  
  // Create sample users
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'admin@bell24h.com' },
      update: {},
      create: {
        email: 'admin@bell24h.com',
        name: 'Admin User',
        role: 'ADMIN',
        isActive: true,
        isVerified: true,
        company: 'Bell24h',
        phone: '+91-9876543210'
      }
    }),
    prisma.user.upsert({
      where: { email: 'supplier@example.com' },
      update: {},
      create: {
        email: 'supplier@example.com',
        name: 'Sample Supplier',
        role: 'SUPPLIER',
        isActive: true,
        isVerified: true,
        company: 'Sample Steel Co',
        phone: '+91-9876543211'
      }
    }),
    prisma.user.upsert({
      where: { email: 'buyer@example.com' },
      update: {},
      create: {
        email: 'buyer@example.com',
        name: 'Sample Buyer',
        role: 'BUYER',
        isActive: true,
        isVerified: true,
        company: 'Sample Construction Co',
        phone: '+91-9876543212'
      }
    })
  ]);
  
  console.log('✅ Created users:', users.length);
  
  // Create sample RFQs
  const rfqs = await Promise.all([
    prisma.rfq.create({
      data: {
        title: 'Steel Pipes for Construction',
        description: 'Need 1000 steel pipes for construction project',
        category: 'steel',
        quantity: '1000 pieces',
        budget: '500000',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        urgency: 'NORMAL',
        status: 'OPEN',
        buyerId: users[2].id
      }
    }),
    prisma.rfq.create({
      data: {
        title: 'Cotton Fabric for Textile',
        description: 'Need premium cotton fabric for textile manufacturing',
        category: 'textiles',
        quantity: '500 meters',
        budget: '100000',
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        urgency: 'LOW',
        status: 'OPEN',
        buyerId: users[2].id
      }
    })
  ]);
  
  console.log('✅ Created RFQs:', rfqs.length);
  
  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });`;

  const seedPath = path.join(process.cwd(), 'prisma', 'seed.ts');
  fs.writeFileSync(seedPath, seedContent);
  console.log('✅ Created database seed script');
}

// Main setup function
async function main() {
  try {
    updateEnvLocal();
    updatePrismaSchema();
    generatePrismaClient();
    createSeedScript();
    
    console.log('\n🎉 Neon database setup completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Update .env.local with your actual Neon database credentials');
    console.log('2. Run: npx prisma db push');
    console.log('3. Run: npx prisma db seed');
    console.log('4. Test your application');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run the setup
main();
