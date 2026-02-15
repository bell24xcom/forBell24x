// Bell24H Comprehensive RFQ Generation System
// Generates 600+ realistic demo RFQs for all 50 categories and 300+ subcategories

export interface RFQ {
  id: string;
  title: string;
  category: string;
  subcategory: string;
  description: string;
  quantity: string;
  budget: string;
  location: string;
  urgency: 'High' | 'Medium' | 'Low';
  deadline: string;
  specifications: string[];
  business_type: string;
  contact_person: {
    name: string;
    designation: string;
    company: string;
    phone: string;
    email: string;
  };
  created_date: string;
  status: 'Active' | 'Closed' | 'In Progress';
  tags: string[];
}

// Complete 50 Categories with All Subcategories
export const ALL_CATEGORIES_WITH_SUBCATEGORIES = [
  {
    name: 'Agriculture',
    subcategories: [
      'Agriculture Equipment',
      'Fresh Flowers',
      'Seeds & Saplings',
      'Tractor Parts',
      'Animal Feed',
      'Irrigation Systems',
      'Fertilizers & Pesticides',
      'Organic Farming Tools',
    ],
  },
  {
    name: 'Apparel & Fashion',
    subcategories: [
      'Sarees',
      'Sunglasses',
      'Unisex Clothing',
      'Suitcases & Briefcases',
      'Footwear',
      'Textiles & Fabrics',
      'Sportswear',
      'Fashion Accessories',
    ],
  },
  {
    name: 'Automobile',
    subcategories: [
      'Auto Electrical Parts',
      'Engine Parts',
      'Commercial Vehicles',
      'Coach Building',
      'Car Accessories',
      'Tires & Tubes',
      'Lubricants & Greases',
    ],
  },
  {
    name: 'Ayurveda & Herbal',
    subcategories: [
      'Ayurvedic Medicines',
      'Herbal Cosmetics',
      'Organic Supplements',
      'Traditional Remedies',
      'Herbal Extracts',
      'Wellness Products',
    ],
  },
  {
    name: 'Business Services',
    subcategories: [
      'IT Services',
      'Consulting Services',
      'Legal Services',
      'Financial Services',
      'Marketing Services',
      'HR Services',
    ],
  },
  {
    name: 'Chemical',
    subcategories: [
      'Catalysts',
      'PET Granules',
      'Dyes & Pigments',
      'Agrochemicals',
      'Specialty Chemicals',
      'Industrial Gases',
      'Detergent Chemicals',
    ],
  },
  {
    name: 'Computers & Internet',
    subcategories: [
      'Computer Hardware',
      'Software Solutions',
      'Network Equipment',
      'Data Storage',
      'Cloud Services',
      'Cybersecurity',
      'IT Consulting',
    ],
  },
  {
    name: 'Consumer Electronics',
    subcategories: [
      'Mobile Phones',
      'Laptops & Tablets',
      'Audio Systems',
      'Home Appliances',
      'Gaming Consoles',
      'Cameras & Photography',
    ],
  },
  {
    name: 'Cosmetics & Personal Care',
    subcategories: [
      'Skincare Products',
      'Hair Care',
      'Makeup & Beauty',
      'Personal Hygiene',
      'Fragrances',
      "Men's Grooming",
      'Baby Care',
    ],
  },
  {
    name: 'Electronics & Electrical',
    subcategories: [
      'Cables & Wires',
      'Active Devices',
      'Testing Devices',
      'Electrical Transformers',
      'Batteries & Energy Storage',
      'Switches & Circuit Breakers',
    ],
  },
  {
    name: 'Food Products & Beverage',
    subcategories: [
      'Processed Foods',
      'Beverages',
      'Dairy Products',
      'Snacks & Confectionery',
      'Organic Foods',
      'Spices & Seasonings',
      'Frozen Foods',
    ],
  },
  {
    name: 'Furniture & Carpentry',
    subcategories: [
      'Office Furniture',
      'Home Furniture',
      'Wooden Products',
      'Carpentry Tools',
      'Interior Design',
      'Modular Furniture',
      'Outdoor Furniture',
    ],
  },
  {
    name: 'Gifts & Crafts',
    subcategories: [
      'Handicrafts',
      'Corporate Gifts',
      'Decorative Items',
      'Festive Gifts',
      'Personalized Items',
      'Art & Crafts',
    ],
  },
  {
    name: 'Health & Beauty',
    subcategories: [
      'Medical Equipment',
      'Health Supplements',
      'Beauty Products',
      'Fitness Equipment',
      'Wellness Products',
    ],
  },
  {
    name: 'Home Furnishings',
    subcategories: [
      'Curtains & Blinds',
      'Bedding & Linens',
      'Carpets & Rugs',
      'Wall Decor',
      'Lighting',
      'Home Accessories',
    ],
  },
  {
    name: 'Home Supplies',
    subcategories: [
      'Cleaning Products',
      'Kitchen Supplies',
      'Bathroom Accessories',
      'Storage Solutions',
      'Home Maintenance',
    ],
  },
  {
    name: 'Industrial Machinery',
    subcategories: [
      'Chemical Machinery',
      'CNC Machines',
      'Milling Tools',
      'Heavy Machinery',
      'Hydraulic Equipment',
      'Packaging Machines',
    ],
  },
  {
    name: 'Industrial Supplies',
    subcategories: [
      'Industrial Tools',
      'Safety Equipment',
      'Maintenance Supplies',
      'Raw Materials',
      'Industrial Chemicals',
    ],
  },
  {
    name: 'Jewelry & Designers',
    subcategories: [
      'Gold Jewelry',
      'Silver Jewelry',
      'Diamond Jewelry',
      'Fashion Jewelry',
      'Precious Stones',
    ],
  },
  {
    name: 'Mineral & Metals',
    subcategories: [
      'Iron & Steel',
      'Non-Ferrous Metals',
      'Precious Metals',
      'Industrial Minerals',
      'Metal Alloys',
      'Scrap Metals',
    ],
  },
  {
    name: 'Office Supplies',
    subcategories: [
      'Stationery',
      'Office Equipment',
      'Printing Supplies',
      'Office Furniture',
      'IT Accessories',
    ],
  },
  {
    name: 'Packaging & Paper',
    subcategories: [
      'Packaging Materials',
      'Paper Products',
      'Cardboard & Boxes',
      'Flexible Packaging',
      'Labels & Stickers',
      'Printing Materials',
    ],
  },
  {
    name: 'Real Estate & Construction',
    subcategories: [
      'Construction Materials',
      'Building Hardware',
      'Electrical Fittings',
      'Plumbing Supplies',
      'Interior Design',
      'Real Estate Services',
    ],
  },
  {
    name: 'Security Products',
    subcategories: [
      'CCTV Systems',
      'Access Control',
      'Security Equipment',
      'Fire Safety',
      'Surveillance Systems',
    ],
  },
  {
    name: 'Sports & Entertainment',
    subcategories: [
      'Sports Equipment',
      'Outdoor Gear',
      'Entertainment Systems',
      'Gaming Products',
      'Fitness Equipment',
    ],
  },
  {
    name: 'Telecommunication',
    subcategories: [
      'Mobile Networks',
      'Telecom Equipment',
      'Communication Devices',
      'Network Infrastructure',
      'Satellite Communication',
    ],
  },
  {
    name: 'Textiles, Yarn & Fabrics',
    subcategories: [
      'Cotton Fabrics',
      'Synthetic Fabrics',
      'Yarns',
      'Textile Machinery',
      'Garment Accessories',
    ],
  },
  {
    name: 'Tools & Equipment',
    subcategories: [
      'Hand Tools',
      'Power Tools',
      'Measuring Tools',
      'Construction Equipment',
      'Industrial Tools',
    ],
  },
  {
    name: 'Tours, Travels & Hotels',
    subcategories: [
      'Travel Services',
      'Hotel Booking',
      'Transportation',
      'Tour Packages',
      'Event Management',
    ],
  },
  {
    name: 'Toys & Games',
    subcategories: [
      'Educational Toys',
      'Electronic Games',
      'Outdoor Games',
      'Board Games',
      'Baby Toys',
    ],
  },
  {
    name: 'Renewable Energy',
    subcategories: ['Solar Panels', 'Wind Energy', 'Energy Storage', 'Green Technology'],
  },
  {
    name: 'AI & Automation',
    subcategories: ['Robotics', 'AI Software', 'Automation Systems', 'Machine Learning'],
  },
  {
    name: 'Sustainable Products',
    subcategories: [
      'Eco-Friendly Materials',
      'Recycled Products',
      'Sustainable Packaging',
      'Green Building Materials',
    ],
  },
  {
    name: 'Healthcare Technology',
    subcategories: [
      'Medical Devices',
      'Healthcare Software',
      'Diagnostic Equipment',
      'Telemedicine',
    ],
  },
  {
    name: 'E-commerce Solutions',
    subcategories: [
      'Online Platforms',
      'Payment Systems',
      'Logistics Software',
      'Digital Marketing',
    ],
  },
  {
    name: 'Gaming & Esports',
    subcategories: [
      'Gaming Hardware',
      'Esports Equipment',
      'Game Development',
      'Streaming Technology',
    ],
  },
  {
    name: 'Electric Vehicles',
    subcategories: [
      'EV Components',
      'Charging Infrastructure',
      'Battery Technology',
      'Electric Motors',
    ],
  },
  {
    name: 'Drones & UAVs',
    subcategories: ['Commercial Drones', 'Drone Components', 'Aerial Imaging', 'Drone Software'],
  },
  {
    name: 'Wearable Technology',
    subcategories: ['Smart Watches', 'Fitness Trackers', 'Health Monitors', 'AR/VR Devices'],
  },
  {
    name: 'Logistics Solutions',
    subcategories: [
      'Supply Chain Management',
      'Warehousing',
      'Transportation',
      'Logistics Software',
    ],
  },
  {
    name: '3D Printing',
    subcategories: ['3D Printers', 'Printing Materials', '3D Scanning', 'Rapid Prototyping'],
  },
  {
    name: 'Food Tech & Agri-Tech',
    subcategories: ['Food Processing', 'Agricultural Technology', 'Smart Farming', 'Food Safety'],
  },
  {
    name: 'Iron & Steel Industry',
    subcategories: ['Steel Products', 'Iron Ore', 'Steel Processing', 'Metal Fabrication'],
  },
  {
    name: 'Mining & Raw Materials',
    subcategories: ['Mining Equipment', 'Raw Materials', 'Mineral Processing', 'Mining Services'],
  },
  {
    name: 'Metal Recycling',
    subcategories: ['Scrap Metal', 'Recycling Equipment', 'Metal Recovery', 'Waste Management'],
  },
  {
    name: 'Metallurgy & Metalworking',
    subcategories: ['Metal Processing', 'Alloy Production', 'Metalworking Tools', 'Heat Treatment'],
  },
  {
    name: 'Heavy Machinery',
    subcategories: [
      'Construction Machinery',
      'Mining Equipment',
      'Industrial Machinery',
      'Agricultural Machinery',
    ],
  },
  {
    name: 'Ferrous & Non-Ferrous',
    subcategories: ['Iron Products', 'Aluminum', 'Copper', 'Steel Alloys'],
  },
  {
    name: 'Mining Safety',
    subcategories: [
      'Safety Equipment',
      'Monitoring Systems',
      'Emergency Equipment',
      'Safety Training',
    ],
  },
  {
    name: 'Precious Metals',
    subcategories: ['Gold', 'Silver', 'Platinum', 'Precious Metal Trading'],
  },
];

// Indian Business Data for Realistic RFQs
export const INDIAN_BUSINESS_DATA = {
  locations: [
    'Mumbai, Maharashtra',
    'Delhi NCR',
    'Bangalore, Karnataka',
    'Chennai, Tamil Nadu',
    'Hyderabad, Telangana',
    'Pune, Maharashtra',
    'Ahmedabad, Gujarat',
    'Kolkata, West Bengal',
    'Surat, Gujarat',
    'Kanpur, Uttar Pradesh',
    'Lucknow, Uttar Pradesh',
    'Nagpur, Maharashtra',
    'Indore, Madhya Pradesh',
    'Bhopal, Madhya Pradesh',
    'Ludhiana, Punjab',
    'Agra, Uttar Pradesh',
    'Nashik, Maharashtra',
    'Faridabad, Haryana',
    'Meerut, Uttar Pradesh',
    'Rajkot, Gujarat',
    'Vadodara, Gujarat',
    'Ghaziabad, Uttar Pradesh',
    'Visakhapatnam, Andhra Pradesh',
    'Kochi, Kerala',
    'Coimbatore, Tamil Nadu',
    'Madurai, Tamil Nadu',
    'Jaipur, Rajasthan',
  ],

  businessTypes: [
    'Large Enterprise',
    'Manufacturing Company',
    'Retail Chain',
    'Export House',
    'Government Department',
    'Public Sector',
    'Private Limited Company',
    'Partnership Firm',
    'Startup',
    'SME',
    'Industrial Group',
    'Trading Company',
    'Distribution Network',
  ],

  personNames: [
    'Rajesh Kumar',
    'Priya Sharma',
    'Amit Patel',
    'Sunita Singh',
    'Vikram Gupta',
    'Neha Agarwal',
    'Suresh Reddy',
    'Kavita Joshi',
    'Ravi Verma',
    'Deepika Mehta',
    'Ashok Yadav',
    'Pooja Malhotra',
    'Manoj Tiwari',
    'Shweta Bansal',
    'Arjun Nair',
    'Meera Iyer',
    'Sanjay Kapoor',
    'Anita Desai',
    'Rohit Saxena',
    'Shreya Pandey',
  ],

  designations: [
    'Procurement Manager',
    'Purchase Head',
    'Supply Chain Manager',
    'Operations Director',
    'General Manager',
    'Senior Manager',
    'Assistant General Manager',
    'Vice President',
    'Head of Operations',
    'Chief Procurement Officer',
    'Materials Manager',
    'Sourcing Manager',
    'Business Development Manager',
    'Project Manager',
    'Technical Manager',
  ],

  companyPrefixes: [
    'Bharat',
    'Indian',
    'National',
    'Supreme',
    'Premier',
    'Elite',
    'Advanced',
    'Modern',
    'Global',
    'Universal',
    'Excel',
    'Perfect',
    'Prime',
    'Royal',
    'Crown',
    'Golden',
    'Silver',
    'Diamond',
    'Platinum',
    'Crystal',
    'Stellar',
    'Apex',
    'Pinnacle',
    'Summit',
  ],

  companySuffixes: [
    'Industries',
    'Enterprises',
    'Corporation',
    'Limited',
    'Pvt Ltd',
    'Group',
    'Systems',
    'Solutions',
    'Technologies',
    'Manufacturing',
    'Trading',
    'Exports',
    'Imports',
    'Services',
    'Products',
    'Equipment',
    'Machinery',
    'Materials',
    'Supplies',
    'Resources',
  ],
};

// Budget Templates by Business Type and Category
export const BUDGET_TEMPLATES = {
  enterprise: {
    high: ['₹2-5 Crore', '₹5-10 Crore', '₹1-3 Crore', '₹3-7 Crore'],
    medium: ['₹50L-1Cr', '₹1-2Cr', '₹25-75L', '₹75L-1.5Cr'],
    low: ['₹10-25L', '₹25-50L', '₹15-40L', '₹30-60L'],
  },
  manufacturing: {
    high: ['₹1-3 Crore', '₹2-4 Crore', '₹80L-2Cr', '₹1.5-3.5Cr'],
    medium: ['₹25-75L', '₹40-80L', '₹30-60L', '₹50-90L'],
    low: ['₹5-20L', '₹10-30L', '₹8-25L', '₹12-35L'],
  },
  retail: {
    high: ['₹50-80L', '₹60-90L', '₹40-70L', '₹45-85L'],
    medium: ['₹15-40L', '₹20-45L', '₹12-35L', '₹25-50L'],
    low: ['₹3-12L', '₹5-18L', '₹4-15L', '₹6-20L'],
  },
  startup: {
    high: ['₹25-50L', '₹30-60L', '₹20-45L', '₹35-65L'],
    medium: ['₹8-20L', '₹10-25L', '₹6-18L', '₹12-28L'],
    low: ['₹2-8L', '₹3-10L', '₹1.5-6L', '₹4-12L'],
  },
};

// Quantity Templates by Category Type
export const QUANTITY_TEMPLATES = {
  equipment: ['2-5 units', '10-25 units', '50-100 units', '100-500 units'],
  materials: ['500-2000 kg', '1-10 MT', '10-50 MT', '100-500 MT'],
  electronics: ['100-1000 pieces', '1000-5000 pieces', '5000-20000 pieces', '20000-100000 pieces'],
  chemicals: ['200-1000 liters', '1000-5000 liters', '5-25 MT', '25-100 MT'],
  textiles: ['500-2000 meters', '2000-10000 meters', '10000-50000 meters', '1000-5000 pieces'],
  food: ['100-500 kg', '500-2000 kg', '2-10 MT', '10-50 MT'],
  construction: ['10-50 units', '50-200 units', '200-1000 units', '1000-5000 units'],
  services: ['1-3 months', '3-6 months', '6-12 months', '1-2 years'],
};

// Utility Functions
export const generateRandomId = () =>
  `rfq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const getRandomElement = <T>(array: T[]): T =>
  array[Math.floor(Math.random() * array.length)];

export const generateCompanyName = () => {
  const prefix = getRandomElement(INDIAN_BUSINESS_DATA.companyPrefixes);
  const suffix = getRandomElement(INDIAN_BUSINESS_DATA.companySuffixes);
  return `${prefix} ${suffix}`;
};

export const generatePhoneNumber = () => {
  const prefixes = ['+91 98', '+91 99', '+91 97', '+91 96', '+91 95'];
  const prefix = getRandomElement(prefixes);
  const number = Math.floor(Math.random() * 100000000)
    .toString()
    .padStart(8, '0');
  return `${prefix}${number}`;
};

export const generateEmail = (name: string, company: string) => {
  const cleanName = name.toLowerCase().replace(/\s+/g, '.');
  const cleanCompany = company
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z]/g, '');
  return `${cleanName}@${cleanCompany}.com`;
};

export const getRecentDate = () => {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 30); // Random date within last 30 days
  const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  return date.toISOString().split('T')[0];
};

export const getRealisticDeadline = (urgency: 'high' | 'medium' | 'low'): string => {
  const deadlines = {
    high: ['7 days', '10 days', '15 days', '20 days'],
    medium: ['30 days', '45 days', '60 days', '90 days'],
    low: ['90 days', '120 days', '180 days', '6 months'],
  };
  return getRandomElement(deadlines[urgency]);
};

// RFQ Title Templates
export const RFQ_TITLE_TEMPLATES = {
  bulk: 'Bulk Order: {subcategory} for {business_type}',
  supply: 'Regular Supply: {subcategory} for Manufacturing',
  urgent: 'Urgent Requirement: {subcategory} for Project',
  tender: 'Tender: {subcategory} for Government Project',
  export: 'Export Order: {subcategory} for International Market',
  oem: 'OEM Supply: {subcategory} for Production Line',
  retail: 'Retail Stock: {subcategory} for Distribution Network',
  import: 'Import Requirement: {subcategory} from Global Suppliers',
};

// Specification Templates by Category
export const SPECIFICATION_TEMPLATES = {
  Agriculture: {
    'Agriculture Equipment': [
      'Heavy duty construction',
      'Fuel efficient',
      'GPS enabled',
      'Warranty 2+ years',
    ],
    'Fresh Flowers': [
      'Grade A quality',
      'Cold chain delivery',
      'Morning delivery',
      'Proper packaging',
    ],
    'Seeds & Saplings': [
      'High germination rate',
      'Disease resistant',
      'Certified quality',
      'Proper documentation',
    ],
    'Irrigation Systems': [
      'Drip irrigation',
      'Water efficient',
      'Automated control',
      'Durable materials',
    ],
  },
  'Electronics & Electrical': {
    'Cables & Wires': [
      'ISI certified',
      'Copper conductor',
      'Fire retardant',
      'High voltage rating',
    ],
    'Active Devices': [
      'SMD components',
      'RoHS compliant',
      'Extended temperature range',
      'High reliability',
    ],
    'Batteries & Energy Storage': [
      'Maintenance free',
      'Long life',
      'Fast charging',
      'Safety certified',
    ],
  },
  Automobile: {
    'Auto Electrical Parts': ['OE quality', 'Warranty included', 'ISO certified', 'Bulk packaging'],
    'Engine Parts': [
      'Genuine parts',
      'Performance tested',
      'Corrosion resistant',
      'Proper fitment',
    ],
    'Tires & Tubes': ['DOT approved', 'Fuel efficient', 'All weather', 'Extended warranty'],
  },
};

// RFQ Generation Functions
export const generateRFQTitle = (subcategory: string, businessType: string): string => {
  const templates = Object.values(RFQ_TITLE_TEMPLATES);
  const template = getRandomElement(templates);
  return template.replace('{subcategory}', subcategory).replace('{business_type}', businessType);
};

export const generateRFQDescription = (
  category: string,
  subcategory: string,
  businessType: string
): string => {
  const descriptions = [
    `We are looking for reliable suppliers for ${subcategory} to support our ${businessType.toLowerCase()} operations. Need consistent quality and timely delivery.`,
    `Requirement for ${subcategory} in bulk quantities for our ${category.toLowerCase()} business. Looking for competitive pricing and good after-sales support.`,
    `Our company requires ${subcategory} for ongoing projects. Interested suppliers should have good track record and industry certifications.`,
    `We need ${subcategory} for our ${businessType.toLowerCase()} requirements. Quality and reliability are our top priorities.`,
    `Looking for established suppliers of ${subcategory} for long-term business partnership. Bulk orders with regular requirements.`,
  ];
  return getRandomElement(descriptions);
};

export const generateContactPerson = () => {
  const name = getRandomElement(INDIAN_BUSINESS_DATA.personNames);
  const designation = getRandomElement(INDIAN_BUSINESS_DATA.designations);
  const company = generateCompanyName();
  const phone = generatePhoneNumber();
  const email = generateEmail(name, company);

  return {
    name,
    designation,
    company,
    phone,
    email,
  };
};

export const getSpecificationsForSubcategory = (
  category: string,
  subcategory: string
): string[] => {
  const categorySpecs = (SPECIFICATION_TEMPLATES as any)[category];
  if (categorySpecs && categorySpecs[subcategory]) {
    return categorySpecs[subcategory];
  }
  return ['High quality', 'Durable', 'Cost-effective', 'Quick delivery'];
};

export const generateSingleRFQ = (
  category: string,
  subcategory: string,
  scenario: 'enterprise' | 'manufacturing' | 'retail' | 'startup' = 'enterprise'
): RFQ => {
  const businessType = getRandomElement(INDIAN_BUSINESS_DATA.businessTypes);
  const location = getRandomElement(INDIAN_BUSINESS_DATA.locations);
  const urgency = getRandomElement(['High', 'Medium', 'Low'] as const);
  const contactPerson = generateContactPerson();

  // Determine budget and quantity based on scenario
  const budgetCategory = urgency === 'High' ? 'high' : urgency === 'Medium' ? 'medium' : 'low';
  const budget = getRandomElement(BUDGET_TEMPLATES[scenario][budgetCategory]);

  // Get appropriate quantity template
  const categoryType = getCategoryType(category);
  const quantity = getRandomElement(QUANTITY_TEMPLATES[categoryType]);

  return {
    id: generateRandomId(),
    title: generateRFQTitle(subcategory, businessType),
    category,
    subcategory,
    description: generateRFQDescription(category, subcategory, businessType),
    quantity,
    budget,
    location,
    urgency,
    deadline: getRealisticDeadline(urgency.toLowerCase() as 'high' | 'medium' | 'low'),
    specifications: getSpecificationsForSubcategory(category, subcategory),
    business_type: businessType,
    contact_person: contactPerson,
    created_date: getRecentDate(),
    status: getRandomElement(['Active', 'Active', 'Active', 'In Progress', 'Closed'] as const), // Mostly active
    tags: [category.toLowerCase(), subcategory.toLowerCase(), businessType.toLowerCase()],
  };
};

const getCategoryType = (category: string): keyof typeof QUANTITY_TEMPLATES => {
  const mapping: Record<string, keyof typeof QUANTITY_TEMPLATES> = {
    Agriculture: 'equipment',
    'Electronics & Electrical': 'electronics',
    Automobile: 'equipment',
    Chemical: 'chemicals',
    'Textiles, Yarn & Fabrics': 'textiles',
    'Food Products & Beverage': 'food',
    'Real Estate & Construction': 'construction',
    'Business Services': 'services',
    'Industrial Machinery': 'equipment',
    'Packaging & Paper': 'materials',
  };
  return mapping[category] || 'materials';
};

// Main RFQ Generation Function
export const generateAllRFQs = (rfqsPerSubcategory: number = 3): RFQ[] => {
  const allRFQs: RFQ[] = [];

  ALL_CATEGORIES_WITH_SUBCATEGORIES.forEach(category => {
    category.subcategories.forEach(subcategory => {
      // Generate different scenarios for variety
      const scenarios: Array<'enterprise' | 'manufacturing' | 'retail' | 'startup'> = [
        'enterprise',
        'manufacturing',
        'retail',
      ];

      for (let i = 0; i < rfqsPerSubcategory; i++) {
        const scenario = scenarios[i % scenarios.length];
        const rfq = generateSingleRFQ(category.name, subcategory, scenario);
        allRFQs.push(rfq);
      }
    });
  });

  return allRFQs;
};

// Quick Generate Function for Testing
export const generateQuickRFQs = (count: number = 50): RFQ[] => {
  const allRFQs: RFQ[] = [];
  const categories = ALL_CATEGORIES_WITH_SUBCATEGORIES.slice(0, 10); // First 10 categories

  let generated = 0;
  while (generated < count) {
    const category = getRandomElement(categories);
    const subcategory = getRandomElement(category.subcategories);
    const scenario = getRandomElement([
      'enterprise',
      'manufacturing',
      'retail',
      'startup',
    ] as const);

    const rfq = generateSingleRFQ(category.name, subcategory, scenario);
    allRFQs.push(rfq);
    generated++;
  }

  return allRFQs;
};

// Export comprehensive RFQ generation
export const GENERATE_COMPREHENSIVE_RFQS = () => {
  console.log('🚀 Generating comprehensive RFQ database...');
  const startTime = Date.now();

  const allRFQs = generateAllRFQs(3); // 3 RFQs per subcategory

  const endTime = Date.now();
  const totalSubcategories = ALL_CATEGORIES_WITH_SUBCATEGORIES.reduce(
    (sum, cat) => sum + cat.subcategories.length,
    0
  );

  console.log(
    `✅ Generated ${allRFQs.length} RFQs for ${totalSubcategories} subcategories in ${
      endTime - startTime
    }ms`
  );
  console.log(
    `📊 Coverage: ${ALL_CATEGORIES_WITH_SUBCATEGORIES.length} categories, ${totalSubcategories} subcategories`
  );

  return allRFQs;
};
