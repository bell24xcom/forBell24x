// Demo data for development and testing

export interface DemoRFQ {
  id: string;
  title: string;
  description: string;
  category: string;
  quantity: number;
  budget: number;
  deadline: string;
  status: string;
}

export interface DemoSupplier {
  id: string;
  name: string;
  category: string;
  rating: number;
  location: string;
}

export interface DemoQuote {
  id: string;
  rfqId: string;
  supplierId: string;
  price: number;
  deliveryTime: number;
  status: string;
}

export const demoRFQs: DemoRFQ[] = [
  {
    id: 'rfq-1001',
    title: 'Steel Pipes Required',
    description: 'Need 5000 units of steel pipes, 2 inch diameter',
    category: 'Steel',
    quantity: 5000,
    budget: 500000,
    deadline: '2024-12-15',
    status: 'active'
  }
];

export const demoSuppliers: DemoSupplier[] = [
  {
    id: 'supplier-001',
    name: 'ABC Steel Works',
    category: 'Steel',
    rating: 4.5,
    location: 'Delhi'
  }
];

export const demoQuotes: DemoQuote[] = [
  {
    id: 'quote-001',
    rfqId: 'rfq-1001',
    supplierId: 'supplier-001',
    price: 450000,
    deliveryTime: 15,
    status: 'pending'
  }
];

export function getQuotesForRFQ(rfqId: string): DemoQuote[] {
  return demoQuotes.filter(quote => quote.rfqId === rfqId);
}

export function getSuppliersByCategory(category: string): DemoSupplier[] {
  return demoSuppliers.filter(supplier => supplier.category === category);
}

