const { execSync } = require('child_process');

console.log('🔧 Pushing Prisma schema to Railway database...');

try {
  // Set the production database URL
  process.env.DATABASE_URL = "postgresql://postgres:lTbKChgEtrkiElIkFNhXuXzxbyqECLPC@shortline.proxy.rlwy.net:45776/railway?sslmode=require";
  
  console.log('📋 Database URL set:', process.env.DATABASE_URL);
  
  // Push the schema
  execSync('npx prisma db push', { 
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL }
  });
  
  console.log('✅ Schema pushed successfully!');
  
  // Test the connection
  console.log('🔍 Testing database connection...');
  execSync('npx prisma db execute --stdin', { 
    input: 'SELECT 1 as test;',
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL }
  });
  
  console.log('✅ Database connection test successful!');
  
} catch (error) {
  console.error('❌ Error pushing schema:', error.message);
  process.exit(1);
} 
