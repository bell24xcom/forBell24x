// lib/db.ts - Prisma Client with Connection Pooling
import { PrismaClient } from '@prisma/client';

declare global {
  // Prevent multiple instances of Prisma in development
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Create Prisma client with optimized configuration
export const prisma = global.prisma || new PrismaClient({
  log: ['query', 'error', 'warn'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

// Prevent multiple instances in development
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// Graceful shutdown
process.on('beforeExit', async () => {
  console.log('🔄 Closing Prisma connection...');
  await prisma.$disconnect();
});

// Export for compatibility with existing code
export default prisma;