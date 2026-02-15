import { faker } from '@faker-js/faker';
import { RFQData } from '../test-utils';

type OverrideProps<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Factory for creating test data
 */
export class TestDataFactory {
  /**
   * Creates a random RFQ test data object
   */
  static createRFQ(overrides: Partial<RFQData> = {}): RFQData {
    const defaultData: RFQData = {
      productName: `Test Product ${faker.commerce.productName()}`,
      description: faker.commerce.productDescription(),
      quantity: faker.number.int({ min: 1, max: 1000 }),
      targetPrice: parseFloat(faker.commerce.price({ min: 10, max: 10000 })),
      unit: faker.helpers.arrayElement(['pcs', 'kg', 'g', 'l', 'm', 'm²']),
      category: faker.commerce.department(),
      priority: faker.helpers.arrayElement(['low', 'medium', 'high']) as 'low' | 'medium' | 'high',
      deadline: faker.date.future().toISOString().split('T')[0], // YYYY-MM-DD format
    };

    return { ...defaultData, ...overrides };
  }

  /**
   * Creates multiple RFQ test data objects
   */
  static createMultipleRFQs(count: number, overrides: Partial<RFQData> = {}): RFQData[] {
    return Array.from({ length: count }, () => this.createRFQ(overrides));
  }

  /**
   * Creates a random user object
   */
  static createUser(overrides: Partial<{ email: string; name: string; role: string }> = {}) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    
    return {
      id: faker.string.uuid(),
      email: overrides.email || faker.internet.email({ firstName, lastName }).toLowerCase(),
      name: overrides.name || `${firstName} ${lastName}`,
      role: overrides.role || faker.helpers.arrayElement(['user', 'admin', 'supplier']),
      company: faker.company.name(),
      phone: faker.phone.number(),
      createdAt: faker.date.past().toISOString(),
      updatedAt: faker.date.recent().toISOString(),
      ...overrides,
    };
  }

  /**
   * Creates authentication credentials
   */
  static createAuthCredentials(overrides: { email?: string; password?: string } = {}) {
    return {
      email: overrides.email || faker.internet.email().toLowerCase(),
      password: overrides.password || faker.internet.password({ length: 12, pattern: /[A-Za-z0-9]/, prefix: 'P@ssw0rd' }),
    };
  }

  /**
   * Creates a random API error response
   */
  static createErrorResponse(status: number, message?: string, code?: string) {
    return {
      status,
      error: {
        code: code || `ERR_${status}`,
        message: message || faker.lorem.sentence(),
        details: faker.lorem.paragraph(),
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * Creates a paginated API response
   */
  static createPaginatedResponse<T>(items: T[], page: number = 1, pageSize: number = 10, totalItems?: number) {
    const total = totalItems || items.length;
    const totalPages = Math.ceil(total / pageSize);
    
    return {
      data: items,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Creates a random file object for testing file uploads
   */
  static createTestFile(overrides: { name?: string; mimeType?: string; size?: number } = {}) {
    return {
      name: overrides.name || `${faker.system.commonFileName(faker.system.commonFileExt())}`,
      mimeType: overrides.mimeType || faker.system.mimeType(),
      size: overrides.size || faker.number.int({ min: 1024, max: 10 * 1024 * 1024 }), // 1KB to 10MB
      content: Buffer.from(faker.string.alphanumeric(1000)), // Sample content
    };
  }
}

// Export helper functions for convenience
export const createRFQ = TestDataFactory.createRFQ.bind(TestDataFactory);
export const createUser = TestDataFactory.createUser.bind(TestDataFactory);
export const createAuthCredentials = TestDataFactory.createAuthCredentials.bind(TestDataFactory);
export const createErrorResponse = TestDataFactory.createErrorResponse.bind(TestDataFactory);
export const createPaginatedResponse = TestDataFactory.createPaginatedResponse.bind(TestDataFactory);
export const createTestFile = TestDataFactory.createTestFile.bind(TestDataFactory);

// Type exports
export type { RFQData } from '../test-utils';
