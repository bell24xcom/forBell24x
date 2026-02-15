// Simple customer tracking without database
export interface Customer {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  service: 'verification' | 'rfq-writing' | 'featured';
  amount: number;
  status: 'inquiry' | 'quoted' | 'paid' | 'delivered';
  date: string;
  notes?: string;
}

export class CustomerTracker {
  private customers: Customer[] = [];

  addCustomer(customer: Omit<Customer, 'id' | 'date'>) {
    const newCustomer: Customer = {
      ...customer,
      id: Date.now().toString(),
      date: new Date().toISOString()
    };

    this.customers.push(newCustomer);
    this.saveToLocalStorage();
    return newCustomer;
  }

  updateStatus(id: string, status: Customer['status']) {
    const customer = this.customers.find(c => c.id === id);
    if (customer) {
      customer.status = status;
      this.saveToLocalStorage();
    }
  }

  getRevenue() {
    return this.customers
      .filter(c => c.status === 'paid' || c.status === 'delivered')
      .reduce((sum, c) => sum + c.amount, 0);
  }

  getCustomers() {
    return this.customers;
  }

  getCustomersByStatus(status: Customer['status']) {
    return this.customers.filter(c => c.status === status);
  }

  getConversionRate() {
    const total = this.customers.length;
    const converted = this.customers.filter(c => c.status === 'paid' || c.status === 'delivered').length;
    return total > 0 ? Math.round((converted / total) * 100) : 0;
  }

  private saveToLocalStorage() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('customers', JSON.stringify(this.customers));
    }
  }

  loadFromLocalStorage() {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem('customers');
      if (data) {
        this.customers = JSON.parse(data);
      }
    }
  }
}
