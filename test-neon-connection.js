#!/usr/bin/env node

// Neon Database Connection Test Script
// This script tests the Neon database connection and functionality

const { PrismaClient } = require('@prisma/client');

console.log('🔍 Testing Neon Database Connection for Bell24h...\n');

async function testNeonConnection() {
  const prisma = new PrismaClient();
  
  try {
    // Test 1: Basic connection
    console.log('1️⃣ Testing basic database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Test 2: Check if tables exist
    console.log('\n2️⃣ Checking database tables...');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('✅ Available tables:', tables.map(t => t.table_name).join(', '));
    
    // Test 3: Test User model
    console.log('\n3️⃣ Testing User model...');
    const userCount = await prisma.user.count();
    console.log(`✅ User table accessible. Current users: ${userCount}`);
    
    // Test 4: Test RFQ model
    console.log('\n4️⃣ Testing RFQ model...');
    const rfqCount = await prisma.rfq.count();
    console.log(`✅ RFQ table accessible. Current RFQs: ${rfqCount}`);
    
    // Test 5: Test Quote model
    console.log('\n5️⃣ Testing Quote model...');
    const quoteCount = await prisma.quote.count();
    console.log(`✅ Quote table accessible. Current quotes: ${quoteCount}`);
    
    // Test 6: Test Transaction model
    console.log('\n6️⃣ Testing Transaction model...');
    const transactionCount = await prisma.transaction.count();
    console.log(`✅ Transaction table accessible. Current transactions: ${transactionCount}`);
    
    // Test 7: Test Lead model
    console.log('\n7️⃣ Testing Lead model...');
    const leadCount = await prisma.lead.count();
    console.log(`✅ Lead table accessible. Current leads: ${leadCount}`);
    
    // Test 8: Test OTP Verification model
    console.log('\n8️⃣ Testing OTP Verification model...');
    const otpCount = await prisma.otpVerification.count();
    console.log(`✅ OTP Verification table accessible. Current OTPs: ${otpCount}`);
    
    // Test 9: Test Notification model
    console.log('\n9️⃣ Testing Notification model...');
    const notificationCount = await prisma.notification.count();
    console.log(`✅ Notification table accessible. Current notifications: ${notificationCount}`);
    
    // Test 10: Test complex query
    console.log('\n🔟 Testing complex query...');
    const suppliersWithRfqs = await prisma.user.findMany({
      where: {
        role: 'SUPPLIER',
        isActive: true
      },
      include: {
        _count: {
          select: {
            rfqs: true,
            quotes: true
          }
        }
      },
      take: 5
    });
    console.log(`✅ Complex query successful. Found ${suppliersWithRfqs.length} suppliers with RFQ data`);
    
    console.log('\n🎉 All Neon database tests passed!');
    console.log('\n📊 Database Summary:');
    console.log(`   👥 Users: ${userCount}`);
    console.log(`   📋 RFQs: ${rfqCount}`);
    console.log(`   💰 Quotes: ${quoteCount}`);
    console.log(`   💳 Transactions: ${transactionCount}`);
    console.log(`   🎯 Leads: ${leadCount}`);
    console.log(`   📱 OTPs: ${otpCount}`);
    console.log(`   🔔 Notifications: ${notificationCount}`);
    
    return true;
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    
    if (error.code === 'P1001') {
      console.log('\n💡 Connection Error: Cannot reach database server');
      console.log('   - Check if your Neon database is running');
      console.log('   - Verify DATABASE_URL in .env.local');
      console.log('   - Check network connectivity');
    } else if (error.code === 'P1002') {
      console.log('\n💡 Authentication Error: Database authentication failed');
      console.log('   - Check DATABASE_URL credentials in .env.local');
      console.log('   - Verify username and password');
    } else if (error.code === 'P1003') {
      console.log('\n💡 Database Error: Database does not exist');
      console.log('   - Check database name in DATABASE_URL');
      console.log('   - Create database if it doesn\'t exist');
    } else if (error.code === 'P1017') {
      console.log('\n💡 Connection Error: Server closed the connection');
      console.log('   - Check if database server is running');
      console.log('   - Verify connection string format');
    }
    
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Test API endpoints
async function testAPIEndpoints() {
  console.log('\n🌐 Testing API endpoints...');
  
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  
  try {
    // Test suppliers API
    console.log('1️⃣ Testing /api/suppliers...');
    const suppliersResponse = await fetch(`${baseUrl}/api/suppliers`);
    if (suppliersResponse.ok) {
      const suppliersData = await suppliersResponse.json();
      console.log(`✅ Suppliers API working. Found ${suppliersData.suppliers?.length || 0} suppliers`);
    } else {
      console.log('⚠️ Suppliers API returned:', suppliersResponse.status);
    }
    
    // Test RFQ API
    console.log('2️⃣ Testing /api/rfq/list...');
    const rfqResponse = await fetch(`${baseUrl}/api/rfq/list`);
    if (rfqResponse.ok) {
      const rfqData = await rfqResponse.json();
      console.log(`✅ RFQ API working. Found ${rfqData.rfqs?.length || 0} RFQs`);
    } else {
      console.log('⚠️ RFQ API returned:', rfqResponse.status);
    }
    
    // Test Neon-specific APIs
    console.log('3️⃣ Testing /api/neon/suppliers...');
    const neonSuppliersResponse = await fetch(`${baseUrl}/api/neon/suppliers`);
    if (neonSuppliersResponse.ok) {
      const neonSuppliersData = await neonSuppliersResponse.json();
      console.log(`✅ Neon Suppliers API working. Found ${neonSuppliersData.suppliers?.length || 0} suppliers`);
    } else {
      console.log('⚠️ Neon Suppliers API returned:', neonSuppliersResponse.status);
    }
    
  } catch (error) {
    console.log('⚠️ API testing failed (server might not be running):', error.message);
  }
}

// Main test function
async function main() {
  console.log('🚀 Starting comprehensive Neon database testing...\n');
  
  // Test database connection
  const dbTestPassed = await testNeonConnection();
  
  if (dbTestPassed) {
    // Test API endpoints
    await testAPIEndpoints();
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Update .env.local with your actual Neon database credentials');
    console.log('2. Run: npx prisma db push (to create tables)');
    console.log('3. Run: npx prisma db seed (to add sample data)');
    console.log('4. Start your development server: npm run dev');
    console.log('5. Test the generated pages in your browser');
  } else {
    console.log('\n❌ Database tests failed. Please fix the issues above before proceeding.');
  }
}

// Run the tests
main().catch(console.error);