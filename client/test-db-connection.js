const { PrismaClient } = require('@prisma/client');

async function testDatabaseConnection() {
  const prisma = new PrismaClient();

  try {
    console.log('🔍 Testing database connection...');

    // Try to connect to the database
    await prisma.$connect();
    console.log('✅ Database connection successful!');

    // Try to run a simple query
    const userCount = await prisma.user.count();
    console.log(`📊 Current user count: ${userCount}`);

    // Try to create a test user
    const testUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        role: 'BUYER'
      }
    });
    console.log('✅ Test user created:', testUser.id);

    // Clean up - delete the test user
    await prisma.user.delete({
      where: { id: testUser.id }
    });
    console.log('🧹 Test user cleaned up');

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabaseConnection();
