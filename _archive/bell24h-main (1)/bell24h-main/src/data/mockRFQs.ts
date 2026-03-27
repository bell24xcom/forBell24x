export type MockRFQ = {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  type: 'voice' | 'video' | 'text';
  quotesCount: number;
  postedAt: Date;
  quantity?: string;
  budget?: string;
  quoteCount?: number;
  views?: number;
  requirements?: string[];
  tags?: string[];
  audioUrl?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
};

export const ALL_MOCK_RFQS: MockRFQ[] = [
  {
    id: 'rfq-1001',
    title: 'Procurement of Steel Bars (Grade 60)',
    description: 'Need 500 kg steel bars for construction project in Mumbai.',
    category: 'Steel & Metals',
    location: 'Mumbai',
    type: 'voice',
    quotesCount: 7,
    postedAt: new Date(Date.now() - 1000 * 60 * 15),
    quantity: '500 kg',
  },
  {
    id: 'rfq-1002',
    title: 'Industrial Chemical Solvents Bulk Purchase',
    description: 'Monthly requirement, deliver to Navi Mumbai warehouse.',
    category: 'Chemicals',
    location: 'Navi Mumbai',
    type: 'text',
    quotesCount: 4,
    postedAt: new Date(Date.now() - 1000 * 60 * 60),
    quantity: '2,000 L',
  },
  {
    id: 'rfq-1003',
    title: 'CNC Machine Spares and Maintenance',
    description: 'OEM parts preferred; warranty required.',
    category: 'Machinery',
    location: 'Pune',
    type: 'video',
    quotesCount: 5,
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
  },
  {
    id: 'rfq-1004',
    title: 'Office Furniture for New Facility',
    description: 'Ergonomic chairs and modular desks.',
    category: 'Furniture',
    location: 'Bengaluru',
    type: 'text',
    quotesCount: 9,
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
  },
  {
    id: 'rfq-1005',
    title: 'Electrical Cables (Fire Retardant)',
    description: 'IS standards compliant; immediate delivery.',
    category: 'Electricals',
    location: 'Hyderabad',
    type: 'voice',
    quotesCount: 3,
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 9),
  },
  {
    id: 'rfq-1006',
    title: 'IT Hardware - Laptops and Monitors',
    description: 'Corporate bulk purchase with support.',
    category: 'IT Hardware',
    location: 'Chennai',
    type: 'text',
    quotesCount: 6,
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
  },
];

// Helper function to get RFQ statistics
export function getMockRFQStats() {
  const total = ALL_MOCK_RFQS.length;
  const voiceRFQs = ALL_MOCK_RFQS.filter(rfq => rfq.type === 'voice').length;
  const videoRFQs = ALL_MOCK_RFQS.filter(rfq => rfq.type === 'video').length;
  const textRFQs = ALL_MOCK_RFQS.filter(rfq => rfq.type === 'text').length;
  
  return {
    total,
    voiceRFQs,
    videoRFQs,
    textRFQs,
  };
}

// Helper function to get RFQs by category
export function getMockRFQsByCategory(category: string): MockRFQ[] {
  return ALL_MOCK_RFQS.filter(rfq => rfq.category === category);
}

// Helper function to get recent RFQs
export function getRecentRFQs(limit: number = 10): MockRFQ[] {
  return ALL_MOCK_RFQS
    .sort((a, b) => b.postedAt.getTime() - a.postedAt.getTime())
    .slice(0, limit);
}

// Helper function to get RFQ by ID
export function getMockRFQById(id: string): MockRFQ | undefined {
  return ALL_MOCK_RFQS.find(rfq => rfq.id === id);
}

// Helper function to get RFQs by type
export function getMockRFQsByType(type: 'voice' | 'video' | 'text'): MockRFQ[] {
  return ALL_MOCK_RFQS.filter(rfq => rfq.type === type);
}
