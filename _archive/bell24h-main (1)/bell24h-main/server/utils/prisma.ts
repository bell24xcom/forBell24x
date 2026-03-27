import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Export the Prisma Client and types
export * from '@prisma/client';

// Helper function to handle Prisma errors
export function handlePrismaError(error: any) {
  if (error.code) {
    switch (error.code) {
      case 'P2002':
        return { error: 'A unique constraint was violated', fields: error.meta?.target };
      case 'P2025':
        return { error: 'Record not found' };
      default:
        return { error: 'Database error', code: error.code };
    }
  }
  return { error: 'An unexpected error occurred' };
}

// Helper function to handle transactions
export async function transaction<T>(callback: (prisma: PrismaClient) => Promise<T>): Promise<T> {
  return prisma.$transaction(async (tx) => {
    try {
      return await callback(tx as PrismaClient);
    } catch (error) {
      console.error('Transaction error:', error);
      throw error;
    }
  });
}

// Helper function to handle pagination
export function paginate(page: number = 1, pageSize: number = 10) {
  const skip = page > 0 ? (page - 1) * pageSize : 0;
  const take = pageSize > 0 ? pageSize : 10;
  
  return { skip, take };
}

// Helper function to format pagination metadata
export function formatPaginationMeta(
  total: number,
  page: number,
  pageSize: number
) {
  const totalPages = Math.ceil(total / pageSize);
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;
  
  return {
    total,
    page,
    pageSize,
    totalPages,
    hasNextPage,
    hasPreviousPage,
  };
}
