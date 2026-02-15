// Simple Neon Database Connection Test
console.log('🔍 Testing Neon Database Connection...\n');

const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: "postgresql://neondb_owner:npg_0Duqdxs3RoyA@ep-super-wind-a1c1ni4n-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
      }
    }
  });

  try {
    console.log('📡 Connecting to Neon database...');
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    console.log('🔍 Testing basic query...');
    const result = await prisma.$queryRaw`SELECT 1 as test, NOW() as current_time`;
    console.log('✅ Query test successful:', result);
    
    console.log('📊 Checking database info...');
    const dbInfo = await prisma.$queryRaw`
      SELECT 
        current_database() as database_name,
        current_user as current_user,
        version() as postgres_version
    `;
    console.log('✅ Database info:', dbInfo);
    
    console.log('\n🎉 NEON DATABASE CONNECTION TEST PASSED!');
    console.log('✅ Your database is ready for production use!');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\n📡 Database connection closed.');
  }
}

testConnection();
