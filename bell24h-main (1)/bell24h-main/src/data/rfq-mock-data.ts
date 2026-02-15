// RFQ Mock Data Generator - 1200+ RFQs across 50 categories
export const CATEGORIES = [
  'Electronics & Components',
  'Textiles & Garments', 
  'Machinery & Equipment',
  'Automotive & Parts',
  'Chemicals & Materials',
  'Food & Beverages',
  'Construction & Building',
  'Healthcare & Medical',
  'Agriculture & Farming',
  'Energy & Power',
  'IT & Software',
  'Packaging & Printing',
  'Furniture & Furnishings',
  'Sports & Recreation',
  'Beauty & Personal Care',
  'Home & Garden',
  'Office Supplies',
  'Security & Safety',
  'Transportation & Logistics',
  'Education & Training',
  'Entertainment & Media',
  'Real Estate',
  'Financial Services',
  'Legal Services',
  'Consulting Services',
  'Manufacturing',
  'Mining & Metals',
  'Oil & Gas',
  'Renewable Energy',
  'Waste Management',
  'Water Treatment',
  'Telecommunications',
  'Aerospace & Defense',
  'Marine & Shipping',
  'Railway & Metro',
  'Aviation',
  'Hospitality & Tourism',
  'Retail & E-commerce',
  'Wholesale & Distribution',
  'Import & Export',
  'Custom Manufacturing',
  'Prototype Development',
  'Quality Control',
  'Testing & Certification',
  'Maintenance & Repair',
  'Installation Services',
  'Training & Development',
  'Research & Development',
  'Design Services',
  'Marketing & Advertising'
];

export const RFQ_TYPES = [
  'Text RFQ',
  'Voice RFQ', 
  'Video RFQ',
  'AI Matching RFQ'
];

export const RFQ_STATUSES = [
  'Active',
  'Pending',
  'Completed',
  'Cancelled',
  'Expired'
];

export const SUPPLIER_TYPES = [
  'Manufacturer',
  'Distributor',
  'Wholesaler',
  'Retailer',
  'Service Provider'
];

// Generate mock RFQ data
export function generateMockRFQs(count: number = 1200) {
  const rfqs = [];
  
  for (let i = 1; i <= count; i++) {
    const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    const rfqType = RFQ_TYPES[Math.floor(Math.random() * RFQ_TYPES.length)];
    const status = RFQ_STATUSES[Math.floor(Math.random() * RFQ_STATUSES.length)];
    const supplierType = SUPPLIER_TYPES[Math.floor(Math.random() * SUPPLIER_TYPES.length)];
    
    const basePrice = Math.floor(Math.random() * 1000000) + 10000; // ₹10,000 to ₹1,010,000
    const quantity = Math.floor(Math.random() * 1000) + 1;
    const unitPrice = Math.floor(basePrice / quantity);
    
    rfqs.push({
      id: `RFQ-${i.toString().padStart(4, '0')}`,
      title: `${category} - ${rfqType} Request`,
      description: `Looking for ${supplierType.toLowerCase()} to supply ${category.toLowerCase()} products. Requirements include quality certification, timely delivery, and competitive pricing.`,
      category: category,
      subcategory: `${category} - Subcategory ${Math.floor(Math.random() * 5) + 1}`,
      rfqType: rfqType,
      status: status,
      budget: basePrice,
      quantity: quantity,
      unitPrice: unitPrice,
      currency: 'INR',
      location: 'Mumbai, Maharashtra',
      deliveryDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      quotesReceived: Math.floor(Math.random() * 10),
      suppliersInterested: Math.floor(Math.random() * 20),
      tags: [
        category.toLowerCase().replace(/\s+/g, '-'),
        rfqType.toLowerCase().replace(/\s+/g, '-'),
        supplierType.toLowerCase(),
        'urgent',
        'bulk-order'
      ],
      requirements: [
        'Quality certification required',
        'Timely delivery essential',
        'Competitive pricing expected',
        'After-sales support needed',
        'Documentation required'
      ],
      specifications: {
        material: 'High quality materials',
        dimensions: 'As per requirements',
        color: 'Standard colors available',
        finish: 'Professional finish required',
        packaging: 'Export quality packaging'
      }
    });
  }
  
  return rfqs;
}

// Generate category-wise RFQ counts
export function getCategoryRFQCounts() {
  const counts: { [key: string]: number } = {};
  
  CATEGORIES.forEach(category => {
    counts[category] = Math.floor(Math.random() * 50) + 10; // 10-60 RFQs per category
  });
  
  return counts;
}

// Generate RFQ statistics
export function getRFQStatistics() {
  const totalRFQs = 1200;
  const activeRFQs = Math.floor(totalRFQs * 0.6); // 60% active
  const completedRFQs = Math.floor(totalRFQs * 0.25); // 25% completed
  const pendingRFQs = Math.floor(totalRFQs * 0.15); // 15% pending
  
  return {
    total: totalRFQs,
    active: activeRFQs,
    completed: completedRFQs,
    pending: pendingRFQs,
    categories: CATEGORIES.length,
    avgQuotesPerRFQ: 5.2,
    avgResponseTime: '2.5 hours',
    successRate: '94.8%'
  };
}

// Generate supplier mock data
export function generateMockSuppliers(count: number = 500) {
  const suppliers = [];
  
  for (let i = 1; i <= count; i++) {
    const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    const supplierType = SUPPLIER_TYPES[Math.floor(Math.random() * SUPPLIER_TYPES.length)];
    
    suppliers.push({
      id: `SUP-${i.toString().padStart(4, '0')}`,
      name: `${category} ${supplierType} ${i}`,
      category: category,
      type: supplierType,
      location: 'Mumbai, Maharashtra',
      rating: (Math.random() * 2 + 3).toFixed(1), // 3.0 to 5.0
      trustScore: Math.floor(Math.random() * 20 + 80), // 80-100
      yearsInBusiness: Math.floor(Math.random() * 20 + 1),
      employees: Math.floor(Math.random() * 500 + 10),
      annualRevenue: Math.floor(Math.random() * 100000000) + 1000000,
      certifications: ['ISO 9001', 'ISO 14001', 'OHSAS 18001'],
      specialties: [category, 'Quality Assurance', 'Timely Delivery'],
      responseTime: `${Math.floor(Math.random() * 24) + 1} hours`,
      minOrderValue: Math.floor(Math.random() * 100000) + 10000,
      maxOrderValue: Math.floor(Math.random() * 10000000) + 1000000,
      paymentTerms: ['Advance', 'LC', 'Escrow'],
      deliveryTime: `${Math.floor(Math.random() * 30) + 1} days`,
      verified: Math.random() > 0.2, // 80% verified
      featured: Math.random() > 0.7, // 30% featured
      lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    });
  }
  
  return suppliers;
}
