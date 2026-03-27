const { PrismaClient } = require('@prisma/client');

// Set the Railway database URL
process.env.DATABASE_URL = "postgresql://postgres:lTbKChgEtrkiElIkFNhXuXzxbyqECLPC@shortline.proxy.rlwy.net:45776/railway?sslmode=require";

const prisma = new PrismaClient();

async function initDatabase() {
  try {
    console.log('🔧 Initializing Bell24h database on Railway...');
    console.log('📋 Database URL:', process.env.DATABASE_URL);
    
    // Push the schema to the database
    console.log('📋 Pushing schema to database...');
    const { execSync } = require('child_process');
    execSync('npx prisma db push', { 
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL }
    });
    
    console.log('✅ Database schema pushed successfully!');
    
    // Test the connection
    console.log('🔍 Testing database connection...');
    const userCount = await prisma.user.count();
    console.log(`✅ Database connected! Found ${userCount} users.`);
    
    // Create a test user if none exist
    if (userCount === 0) {
      console.log('👤 Creating test user...');
      const testUser = await prisma.user.create({
        data: {
          email: 'admin@bell24h.com',
          name: 'Bell24h Admin',
          companyname: 'Bell24h',
          role: 'SUPPLIER',
          roles: ['supplier', 'buyer'],
          trafficTier: 'PLATINUM',
          showcaseEnabled: true,
          hashedPassword: 'hashed_password_here', // Replace with actual hashed password
          brandName: 'Bell24h',
          about: 'Bell24h B2B Marketplace Admin',
        }
      });
      console.log(`✅ Test user created: ${testUser.email}`);
    }
    
    console.log('🎉 Database initialization complete!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

initDatabase(); 
