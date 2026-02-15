// Customer tracking functionality
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  createdAt: Date;
  updatedAt: Date;
}

export class CustomerTracker {
  private customers: Customer[] = [];

  addCustomer(customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Customer {
    const newCustomer: Customer = {
      ...customer,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.customers.push(newCustomer);
    return newCustomer;
  }

  getCustomers(): Customer[] {
    return this.customers;
  }

  getCustomerById(id: string): Customer | undefined {
    return this.customers.find(customer => customer.id === id);
  }

  updateCustomer(id: string, updates: Partial<Customer>): Customer | null {
    const customerIndex = this.customers.findIndex(customer => customer.id === id);
    
    if (customerIndex === -1) {
      return null;
    }

    this.customers[customerIndex] = {
      ...this.customers[customerIndex],
      ...updates,
      updatedAt: new Date(),
    };

    return this.customers[customerIndex];
  }

  deleteCustomer(id: string): boolean {
    const customerIndex = this.customers.findIndex(customer => customer.id === id);
    
    if (customerIndex === -1) {
      return false;
    }

    this.customers.splice(customerIndex, 1);
    return true;
  }
}

export const customerTracker = new CustomerTracker();