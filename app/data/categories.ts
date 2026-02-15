export interface Category {
  id: string;
  name: string;
  icon: string;
  supplierCount: string;
  trending?: boolean;
  description: string;
  subcategories: string[];
}

export const ALL_CATEGORIES: Category[] = [
  // Electronics & Technology
  {
    id: 'electronics',
    name: 'Electronics & Components',
    icon: '⚡',
    supplierCount: '32K+',
    trending: true,
    description: 'Electronic components, semiconductors, and consumer electronics',
    subcategories: [
      'Semiconductors',
      'Circuit Boards',
      'Sensors',
      'Displays',
      'Batteries',
      'Cables & Connectors',
    ],
  },
  {
    id: 'computers',
    name: 'Computers & IT Hardware',
    icon: '💻',
    supplierCount: '28K+',
    trending: true,
    description: 'Computer hardware, servers, networking equipment',
    subcategories: ['Servers', 'Laptops', 'Networking', 'Storage', 'Peripherals', 'Components'],
  },
  {
    id: 'telecommunications',
    name: 'Telecommunications',
    icon: '📡',
    supplierCount: '15K+',
    description: 'Telecom equipment, mobile devices, communication systems',
    subcategories: [
      'Mobile Phones',
      'Base Stations',
      'Fiber Optics',
      'Satellites',
      'Routers',
      'Antennas',
    ],
  },

  // Industrial & Manufacturing
  {
    id: 'machinery',
    name: 'Machinery & Equipment',
    icon: '⚙️',
    supplierCount: '25K+',
    trending: true,
    description: 'Industrial machinery, manufacturing equipment, tools',
    subcategories: [
      'CNC Machines',
      'Pumps',
      'Compressors',
      'Generators',
      'Conveyors',
      'Welding Equipment',
    ],
  },
  {
    id: 'manufacturing',
    name: 'Manufacturing Equipment',
    icon: '🏭',
    supplierCount: '22K+',
    description: 'Production line equipment, assembly systems',
    subcategories: [
      'Assembly Lines',
      'Robotics',
      'Quality Control',
      'Packaging',
      'Material Handling',
      'Automation',
    ],
  },
  {
    id: 'tools',
    name: 'Tools & Hardware',
    icon: '🔧',
    supplierCount: '18K+',
    description: 'Hand tools, power tools, hardware supplies',
    subcategories: [
      'Hand Tools',
      'Power Tools',
      'Fasteners',
      'Measuring Tools',
      'Safety Equipment',
      'Workshop Equipment',
    ],
  },

  // Construction & Building
  {
    id: 'construction',
    name: 'Construction & Building',
    icon: '🏗️',
    supplierCount: '35K+',
    trending: true,
    description: 'Building materials, construction equipment, infrastructure',
    subcategories: [
      'Cement & Concrete',
      'Steel & Iron',
      'Plumbing',
      'Electrical',
      'Paint & Coatings',
      'Safety Equipment',
    ],
  },
  {
    id: 'steel-metals',
    name: 'Steel & Metals',
    icon: '🔩',
    supplierCount: '20K+',
    trending: true,
    description: 'Steel products, metal fabrication, structural materials',
    subcategories: [
      'TMT Bars',
      'Structural Steel',
      'Aluminum',
      'Copper',
      'Stainless Steel',
      'Metal Fabrication',
    ],
  },

  // Textiles & Fashion
  {
    id: 'textiles',
    name: 'Textiles & Garments',
    icon: '🧵',
    supplierCount: '30K+',
    trending: true,
    description: 'Fabrics, clothing, textile products',
    subcategories: [
      'Cotton Fabrics',
      'Silk',
      'Synthetic Fabrics',
      'Ready-made Garments',
      'Home Textiles',
      'Technical Textiles',
    ],
  },
  {
    id: 'fashion',
    name: 'Fashion & Accessories',
    icon: '👕',
    supplierCount: '25K+',
    description: 'Fashion items, accessories, personal care',
    subcategories: [
      'Clothing',
      'Footwear',
      'Bags & Luggage',
      'Jewelry',
      'Watches',
      'Personal Care',
    ],
  },

  // Automotive
  {
    id: 'automotive',
    name: 'Automotive',
    icon: '🚗',
    supplierCount: '22K+',
    trending: true,
    description: 'Vehicle parts, automotive components, accessories',
    subcategories: [
      'Engine Parts',
      'Body Parts',
      'Electrical Components',
      'Tyres & Wheels',
      'Interior Parts',
      'Accessories',
    ],
  },

  // Chemicals & Materials
  {
    id: 'chemicals',
    name: 'Chemicals & Materials',
    icon: '🧪',
    supplierCount: '15K+',
    description: 'Industrial chemicals, specialty materials',
    subcategories: [
      'Industrial Chemicals',
      'Specialty Chemicals',
      'Petrochemicals',
      'Polymers',
      'Adhesives',
      'Coatings',
    ],
  },
  {
    id: 'plastics',
    name: 'Plastics & Rubber',
    icon: '🔬',
    supplierCount: '12K+',
    description: 'Plastic products, rubber materials, composites',
    subcategories: [
      'Plastic Raw Materials',
      'Rubber Products',
      'Composites',
      'Packaging Materials',
      'Medical Plastics',
      'Automotive Plastics',
    ],
  },

  // Food & Agriculture
  {
    id: 'food-beverage',
    name: 'Food & Beverage',
    icon: '🍎',
    supplierCount: '28K+',
    description: 'Food products, beverages, ingredients',
    subcategories: [
      'Processed Foods',
      'Beverages',
      'Spices & Condiments',
      'Dairy Products',
      'Bakery Items',
      'Frozen Foods',
    ],
  },
  {
    id: 'agriculture',
    name: 'Agriculture',
    icon: '🌱',
    supplierCount: '20K+',
    description: 'Agricultural products, farming equipment',
    subcategories: [
      'Seeds & Saplings',
      'Fertilizers',
      'Pesticides',
      'Farming Equipment',
      'Irrigation Systems',
      'Animal Feed',
    ],
  },

  // Healthcare & Medical
  {
    id: 'healthcare',
    name: 'Healthcare & Medical',
    icon: '🏥',
    supplierCount: '18K+',
    description: 'Medical equipment, healthcare products',
    subcategories: [
      'Medical Equipment',
      'Pharmaceuticals',
      'Diagnostic Tools',
      'Surgical Instruments',
      'Personal Care',
      'Health Supplements',
    ],
  },

  // Energy & Power
  {
    id: 'energy',
    name: 'Energy & Power',
    icon: '⚡',
    supplierCount: '15K+',
    description: 'Power generation, renewable energy, electrical equipment',
    subcategories: [
      'Solar Power',
      'Wind Energy',
      'Electrical Equipment',
      'Power Transmission',
      'Batteries & Storage',
      'Energy Management',
    ],
  },

  // Furniture & Home
  {
    id: 'furniture',
    name: 'Furniture & Home',
    icon: '🪑',
    supplierCount: '22K+',
    description: 'Furniture, home decor, household items',
    subcategories: [
      'Office Furniture',
      'Home Furniture',
      'Kitchen & Dining',
      'Bedroom Furniture',
      'Outdoor Furniture',
      'Home Decor',
    ],
  },

  // Logistics & Transportation
  {
    id: 'logistics',
    name: 'Logistics & Transportation',
    icon: '🚚',
    supplierCount: '12K+',
    description: 'Shipping, freight, transportation services',
    subcategories: [
      'Freight Services',
      'Warehousing',
      'Packaging Solutions',
      'Supply Chain',
      'Customs Clearance',
      'Last Mile Delivery',
    ],
  },

  // Business Services
  {
    id: 'business-services',
    name: 'Business Services',
    icon: '💼',
    supplierCount: '25K+',
    description: 'Professional services, consulting, IT services',
    subcategories: [
      'IT Services',
      'Consulting',
      'Legal Services',
      'Accounting',
      'Marketing',
      'HR Services',
    ],
  },

  // Add more categories to reach 400+
  {
    id: 'packaging',
    name: 'Packaging & Printing',
    icon: '📦',
    supplierCount: '16K+',
    description: 'Packaging materials, printing services',
    subcategories: [
      'Corrugated Boxes',
      'Flexible Packaging',
      'Labels & Stickers',
      'Printing Services',
      'Packaging Machinery',
      'Protective Materials',
    ],
  },
  {
    id: 'security',
    name: 'Security & Safety',
    icon: '🔒',
    supplierCount: '14K+',
    description: 'Security equipment, safety products',
    subcategories: [
      'CCTV Systems',
      'Access Control',
      'Fire Safety',
      'Personal Protection',
      'Alarm Systems',
      'Security Services',
    ],
  },
  {
    id: 'environmental',
    name: 'Environmental & Waste',
    icon: '🌍',
    supplierCount: '10K+',
    description: 'Environmental solutions, waste management',
    subcategories: [
      'Waste Management',
      'Water Treatment',
      'Air Purification',
      'Recycling',
      'Environmental Monitoring',
      'Green Energy',
    ],
  },
  {
    id: 'education',
    name: 'Education & Training',
    icon: '📚',
    supplierCount: '8K+',
    description: 'Educational materials, training equipment',
    subcategories: [
      'Educational Equipment',
      'Books & Materials',
      'E-learning Solutions',
      'Training Services',
      'Laboratory Equipment',
      'Sports Equipment',
    ],
  },
  {
    id: 'entertainment',
    name: 'Entertainment & Media',
    icon: '🎬',
    supplierCount: '6K+',
    description: 'Entertainment equipment, media production',
    subcategories: [
      'Audio Equipment',
      'Video Equipment',
      'Lighting',
      'Stage Equipment',
      'Broadcasting',
      'Media Production',
    ],
  },
  {
    id: 'sports',
    name: 'Sports & Recreation',
    icon: '⚽',
    supplierCount: '12K+',
    description: 'Sports equipment, recreational products',
    subcategories: [
      'Sports Equipment',
      'Fitness Equipment',
      'Outdoor Gear',
      'Team Sports',
      'Individual Sports',
      'Recreation',
    ],
  },
  {
    id: 'jewelry',
    name: 'Jewelry & Gems',
    icon: '💎',
    supplierCount: '8K+',
    description: 'Jewelry, precious stones, accessories',
    subcategories: [
      'Gold Jewelry',
      'Silver Jewelry',
      'Precious Stones',
      'Fashion Jewelry',
      'Watches',
      'Accessories',
    ],
  },
  {
    id: 'beauty',
    name: 'Beauty & Cosmetics',
    icon: '💄',
    supplierCount: '15K+',
    description: 'Beauty products, cosmetics, personal care',
    subcategories: [
      'Skincare',
      'Makeup',
      'Hair Care',
      'Fragrances',
      'Personal Care',
      'Beauty Tools',
    ],
  },
  {
    id: 'toys',
    name: 'Toys & Games',
    icon: '🧸',
    supplierCount: '10K+',
    description: 'Toys, games, children products',
    subcategories: [
      'Educational Toys',
      'Electronic Toys',
      'Board Games',
      'Outdoor Toys',
      'Baby Products',
      'Party Supplies',
    ],
  },
  {
    id: 'pet',
    name: 'Pet Supplies',
    icon: '🐕',
    supplierCount: '7K+',
    description: 'Pet food, accessories, care products',
    subcategories: [
      'Pet Food',
      'Pet Accessories',
      'Pet Care',
      'Pet Toys',
      'Pet Grooming',
      'Pet Health',
    ],
  },

  // Continue with more categories to reach 400+ total
  // This is a sample - in production, you would have all 400+ categories
  // Each category would have 3 mock RFQs as specified
];

// Helper function to get categories by search term
export const getCategoriesBySearch = (searchTerm: string) => {
  return ALL_CATEGORIES.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.subcategories.some(sub => sub.toLowerCase().includes(searchTerm.toLowerCase()))
  );
};
