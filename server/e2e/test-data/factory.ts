import { faker } from '@faker-js/faker';
import type { RFQ, Supplier, User } from '../../src/types';

export class TestDataFactory {
  static createRFQ(overrides: Partial<RFQ> = {}): RFQ {
    return {
      id: faker.string.uuid(),
      title: faker.company.name(),
      description: faker.lorem.paragraph(),
      quantity: faker.number.int({ min: 1, max: 1000 }),
      unit: 'units',
      deliveryDate: faker.date.future().toISOString(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...overrides
    };
  }

  static createSupplier(overrides: Partial<Supplier> = {}): Supplier {
    return {
      id: faker.string.uuid(),
      name: faker.company.name(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      address: {
        street: faker.location.street(),
        city: faker.location.city(),
        state: faker.location.state(),
        zip: faker.location.zipCode(),
        country: 'India'
      },
      rating: faker.number.float({ min: 0, max: 5, precision: 0.1 }),
      specialties: [
        faker.commerce.productAdjective(),
        faker.commerce.productAdjective()
      ],
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...overrides
    };
  }

  static createUser(overrides: Partial<User> = {}): User {
    return {
      id: faker.string.uuid(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      role: 'supplier',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...overrides
    };
  }

  static createScenario(): {
    rfq: RFQ;
    supplier: Supplier;
    user: User;
  } {
    const user = this.createUser({ role: 'supplier' });
    const supplier = this.createSupplier({ userId: user.id });
    const rfq = this.createRFQ({
      createdBy: user.id,
      supplierId: supplier.id
    });

    return { rfq, supplier, user };
  }
}
