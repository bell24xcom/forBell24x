import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabase() {
  console.log('📊 CHECKING DATABASE STATUS...\n');

  try {
    const [users, rfqs, quotes, categories] = await Promise.all([
      prisma.user.count(),
      prisma.rFQ.count().catch(() => 0),
      prisma.quote.count().catch(() => 0),
      prisma.category.count().catch(() => 0),
    ]);

    console.log(`Users: ${users}`);
    console.log(`RFQs: ${rfqs}`);
    console.log(`Quotes: ${quotes}`);
    console.log(`Categories: ${categories}`);

    const suppliers = await prisma.user.count({ where: { role: 'SUPPLIER' } }).catch(() => 0);
    console.log(`\nSuppliers: ${suppliers}`);

    if (suppliers > 0) {
      const sample = await prisma.user.findFirst({
        where: { role: 'SUPPLIER' },
        select: { name: true, company: true, email: true, phone: true }
      });
      console.log('\nSample:', JSON.stringify(sample, null, 2));
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
