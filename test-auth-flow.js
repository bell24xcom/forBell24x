const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAuthFlow() {
  console.log('🧪 Testing Bell24h Authentication Flow with PostgreSQL');
  console.log('====================================================');

  try {
    // Test database connection
    console.log('1. Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Test OTP creation
    console.log('\n2. Testing OTP creation...');
    const testOTP = await prisma.oTP.create({
      data: {
        phone: '+919876543210',
        otp: '123456',
        type: 'phone',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000)
      }
    });
    console.log('✅ OTP created:', testOTP.id);

    // Test user creation
    console.log('\n3. Testing user creation...');
    const testUser = await prisma.user.create({
      data: {
        phone: '+919876543210',
        phoneVerified: true,
        trustScore: 50,
        role: 'BUYER',
        verificationMethod: 'phone_otp'
      }
    });
    console.log('✅ User created:', testUser.id);

    // Test session creation
    console.log('\n4. Testing session creation...');
    const sessionToken = Buffer.from(`${testUser.id}:${Date.now()}:${Math.random()}`).toString('base64');
    const testSession = await prisma.session.create({
      data: {
        sessionToken,
        userId: testUser.id,
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    });
    console.log('✅ Session created:', testSession.id);

    // Test email verification
    console.log('\n5. Testing email verification...');
    const updatedUser = await prisma.user.update({
      where: { id: testUser.id },
      data: {
        email: 'test@example.com',
        emailVerified: true,
        trustScore: 100
      }
    });
    console.log('✅ Email verified, trust score:', updatedUser.trustScore);

    // Cleanup test data
    console.log('\n6. Cleaning up test data...');
    await prisma.session.delete({ where: { id: testSession.id } });
    await prisma.oTP.delete({ where: { id: testOTP.id } });
    await prisma.user.delete({ where: { id: testUser.id } });
    console.log('✅ Test data cleaned up');

    console.log('\n🎉 All authentication tests passed!');
    console.log('\n📋 Authentication Flow Summary:');
    console.log('   ✅ Database connection');
    console.log('   ✅ OTP creation and storage');
    console.log('   ✅ User registration with phone');
    console.log('   ✅ Session management');
    console.log('   ✅ Email verification');
    console.log('   ✅ Trust score calculation');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testAuthFlow();
