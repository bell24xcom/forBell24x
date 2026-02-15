const { execSync } = require('child_process');

console.log('🔧 Setting up Bell24h production database...');

// Railway database URL
const DATABASE_URL = "postgresql://postgres:lTbKChgEtrkiElIkFNhXuXzxbyqECLPC@shortline.proxy.rlwy.net:45776/railway?sslmode=require";

try {
  console.log('📋 Database URL:', DATABASE_URL);
  
  // Set environment variable
  process.env.DATABASE_URL = DATABASE_URL;
  
  // Push the schema
  console.log('📋 Pushing Prisma schema to Railway...');
  execSync('npx prisma db push --accept-data-loss', { 
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
  
  console.log('✅ Production database setup complete!');
  
} catch (error) {
  console.error('❌ Production database setup failed:', error.message);
  // Don't exit with error code to allow build to continue
  console.log('⚠️ Continuing with build despite database setup issues...');
} 
