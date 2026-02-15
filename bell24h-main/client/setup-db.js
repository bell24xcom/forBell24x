const { execSync } = require('child_process');

console.log('🔧 Setting up Bell24h database on Railway...');

// Set the Railway database URL
const DATABASE_URL = "postgresql://postgres:lTbKChgEtrkiElIkFNhXuXzxbyqECLPC@shortline.proxy.rlwy.net:45776/railway?sslmode=require";

try {
  console.log('📋 Database URL:', DATABASE_URL);
  
  // Set environment variable
  process.env.DATABASE_URL = DATABASE_URL;
  
  // Push the schema
  console.log('📋 Pushing Prisma schema...');
  execSync('npx prisma db push', { 
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL }
  });
  
  console.log('✅ Schema pushed successfully!');
  
  // Generate Prisma client
  console.log('📋 Generating Prisma client...');
  execSync('npx prisma generate', { 
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL }
  });
  
  console.log('✅ Prisma client generated!');
  
  // Test connection
  console.log('🔍 Testing database connection...');
  execSync('npx prisma db execute --stdin', { 
    input: 'SELECT 1 as test;',
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL }
  });
  
  console.log('✅ Database setup complete!');
  
} catch (error) {
  console.error('❌ Database setup failed:', error.message);
  process.exit(1);
} 
