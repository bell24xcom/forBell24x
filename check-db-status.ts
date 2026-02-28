import { prisma } from './lib/prisma';

async function checkDatabaseStatus() {
  console.log('📊 CHECKING DATABASE STATUS...\n');

  try {
    // Count all tables
    const counts = await Promise.all([
      prisma.user.count(),
      prisma.rFQ.count(),
      prisma.quote.count(),
      prisma.category.count(),
      prisma.transaction.count(),
      prisma.lead.count(),
      prisma.notification.count(),
    ]);

    const [users, rfqs, quotes, categories, transactions, leads, notifications] = counts;

    console.log('✅ DATABASE RECORD COUNTS:');
    console.log(`   Users: ${users}`);
    console.log(`   RFQs: ${rfqs}`);
    console.log(`   Quotes: ${quotes}`);
    console.log(`   Categories: ${categories}`);
    console.log(`   Transactions: ${transactions}`);
    console.log(`   Leads: ${leads}`);
    console.log(`   Notifications: ${notifications}`);
    console.log('');

    // Check for supplier data specifically
    const suppliers = await prisma.user.count({ where: { role: 'SUPPLIER' } });
    const buyers = await prisma.user.count({ where: { role: 'BUYER' } });
    const admins = await prisma.user.count({ where: { role: 'ADMIN' } });

    console.log('👥 USER BREAKDOWN:');
    console.log(`   Suppliers: ${suppliers}`);
    console.log(`   Buyers: ${buyers}`);
    console.log(`   Admins: ${admins}`);
    console.log('');

    // Check for scraped data (users with certain fields filled)
    const withGST = await prisma.user.count({ where: { gstNumber: { not: null } } });
    const withUdyam = await prisma.user.count({ where: { udyamNumber: { not: null } } });
    const verified = await prisma.user.count({ where: { isVerified: true } });

    console.log('📋 DATA QUALITY:');
    console.log(`   Users with GST: ${withGST}`);
    console.log(`   Users with Udyam: ${withUdyam}`);
    console.log(`   Verified users: ${verified}`);
    console.log('');

    // Sample one user to show data structure
    const sampleUser = await prisma.user.findFirst({
      where: { role: 'SUPPLIER' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        company: true,
        gstNumber: true,
        udyamNumber: true,
        trustScore: true,
        isVerified: true,
      }
    });

    if (sampleUser) {
      console.log('📌 SAMPLE SUPPLIER DATA:');
      console.log(JSON.stringify(sampleUser, null, 2));
    } else {
      console.log('⚠️  NO SUPPLIER DATA FOUND');
    }

  } catch (error) {
    console.error('❌ ERROR:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseStatus();
