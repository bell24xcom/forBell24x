import { PrismaClient } from '@prisma/client';

async function testConnection() {
  const prisma = new PrismaClient();
  console.log('--- Database Connection Test ---');
  try {
    console.log('Attempting to connect to Neon...');
    const userCount = await prisma.user.count();
    console.log(`Successfully connected! User count: ${userCount}`);
    
    // Test a simple find
    const latestUser = await prisma.user.findFirst({
      select: { id: true, name: true, role: true }
    });
    console.log('Latest user sample:', latestUser);
    
    console.log('--- Test Passed ---');
  } catch (error) {
    console.error('--- Test Failed ---');
    console.error('Prisma connection error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
