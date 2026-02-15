// Database seed script for Bell24h
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');
  
  // Create sample users
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'admin@bell24h.com' },
      update: {},
      create: {
        email: 'admin@bell24h.com',
        name: 'Admin User',
        role: 'ADMIN',
        isActive: true,
        isVerified: true,
        company: 'Bell24h',
        phone: '+91-9876543210'
      }
    }),
    prisma.user.upsert({
      where: { email: 'supplier@example.com' },
      update: {},
      create: {
        email: 'supplier@example.com',
        name: 'Sample Supplier',
        role: 'SUPPLIER',
        isActive: true,
        isVerified: true,
        company: 'Sample Steel Co',
        phone: '+91-9876543211'
      }
    }),
    prisma.user.upsert({
      where: { email: 'buyer@example.com' },
      update: {},
      create: {
        email: 'buyer@example.com',
        name: 'Sample Buyer',
        role: 'BUYER',
        isActive: true,
        isVerified: true,
        company: 'Sample Construction Co',
        phone: '+91-9876543212'
      }
    })
  ]);
  
  console.log('✅ Created users:', users.length);
  
  // Create sample RFQs
  const rfqs = await Promise.all([
    prisma.rfq.create({
      data: {
        title: 'Steel Pipes for Construction',
        description: 'Need 1000 steel pipes for construction project',
        category: 'steel',
        quantity: '1000 pieces',
        budget: '500000',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        urgency: 'NORMAL',
        status: 'OPEN',
        buyerId: users[2].id
      }
    }),
    prisma.rfq.create({
      data: {
        title: 'Cotton Fabric for Textile',
        description: 'Need premium cotton fabric for textile manufacturing',
        category: 'textiles',
        quantity: '500 meters',
        budget: '100000',
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        urgency: 'LOW',
        status: 'OPEN',
        buyerId: users[2].id
      }
    })
  ]);
  
  console.log('✅ Created RFQs:', rfqs.length);
  
  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });