const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDatabase() {
  try {
    console.log('🔍 Testing database connection...');

    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful');

    // Test if User table exists by trying to count users
    const userCount = await prisma.user.count();
    console.log(`✅ User table exists with ${userCount} users`);

    // Test if we can create a test user
    const testUser = await prisma.user.create({
      data: {
        email: 'test@bell24h.com',
        name: 'Test User',
        companyname: 'Test Company',
        role: 'BUYER',
        password: 'hashedpassword',
        isemailverified: true,
      },
    });
    console.log('✅ Test user created successfully:', testUser.email);

    // Clean up test user
    await prisma.user.delete({
      where: { email: 'test@bell24h.com' },
    });
    console.log('✅ Test user cleaned up');

    console.log('🎉 Database is working perfectly!');
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
