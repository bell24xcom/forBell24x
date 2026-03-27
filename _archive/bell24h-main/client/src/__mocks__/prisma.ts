// Mock Prisma Client for testing
export const mockPrismaClient = {
  // User operations
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    upsert: jest.fn(),
  },

  // RFQ operations
  rFQ: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },

  // Video RFQ operations
  videoRFQ: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },

  // Voice RFQ operations
  voiceRFQ: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },

  // Supplier operations
  supplier: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },

  // Search operations
  searchHistory: {
    findMany: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },

  // Transaction operations
  $transaction: jest.fn(),
  $executeRaw: jest.fn(),
  $queryRaw: jest.fn(),
  $connect: jest.fn().mockResolvedValue(undefined),
  $disconnect: jest.fn().mockResolvedValue(undefined),
};

// Mock PrismaClient constructor
export const PrismaClient = jest.fn(() => mockPrismaClient);

// Default export mock
const prisma = mockPrismaClient;
export default prisma;
