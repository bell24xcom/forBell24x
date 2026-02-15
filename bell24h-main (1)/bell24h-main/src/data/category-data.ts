/**
 * Bell24H Complete Category Data Structure
 *
 * Comprehensive category system with subcategories, RFQs, suppliers, and products
 * This connects the category flow from homepage to individual business actions
 */

export interface RFQ {
  id: string;
  title: string;
  description: string;
  budget: string;
  urgency: 'High' | 'Medium' | 'Low';
  location: string;
  postedDate: string;
  responses: number;
  subcategory: string;
  requirements: string[];
  contactInfo: {
    companyName: string;
    contactPerson: string;
    email: string;
    phone: string;
  };
}

export interface Supplier {
  id: string;
  companyName: string;
  description: string;
  location: string;
  rating: number;
  reviews: number;
  verified: boolean;
  specializations: string[];
  certifications: string[];
  yearsInBusiness: number;
  contactInfo: {
    email: string;
    phone: string;
    website: string;
  };
  products: string[];
  minimumOrder: string;
  paymentTerms: string;
}

export interface Category {
  slug: string;
  name: string;
  icon: string;
  subcategories: string[];
  supplierCount: number;
  rfqs: RFQ[];
  suppliers: Supplier[];
  trending?: boolean;
}

// Sample RFQ data for each category
const generateRFQs = (category: string, count: number): RFQ[] => {
  const rfqTemplates = [
    {
      title: `Industrial ${category} Supply Required`,
      description: `Looking for high-quality ${category} products for our manufacturing facility`,
      budget: '₹5,00,000 - ₹10,00,000',
      urgency: 'High' as const,
      requirements: ['ISO certified', 'Bulk supply capability', 'Quality documentation'],
    },
    {
      title: `${category} Equipment Procurement`,
      description: `Bulk procurement of ${category} equipment for new project`,
      budget: '₹2,00,000 - ₹5,00,000',
      urgency: 'Medium' as const,
      requirements: ['Warranty coverage', 'Technical support', 'Installation services'],
    },
    {
      title: `${category} Raw Materials`,
      description: `Regular supply of ${category} raw materials needed`,
      budget: '₹1,00,000 - ₹3,00,000',
      urgency: 'Low' as const,
      requirements: ['Regular supply', 'Quality assurance', 'Competitive pricing'],
    },
  ];

  return Array.from({ length: count }, (_, i) => {
    const template = rfqTemplates[i % rfqTemplates.length];
    return {
      id: `rfq-${category}-${i + 1}`,
      title: template.title,
      description: template.description,
      budget: template.budget,
      urgency: template.urgency,
      location: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Pune'][i % 5],
      postedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      responses: Math.floor(Math.random() * 20) + 1,
      subcategory: ['General', 'Premium', 'Industrial', 'Commercial'][i % 4],
      requirements: template.requirements,
      contactInfo: {
        companyName: `${category} Industries Pvt Ltd`,
        contactPerson: 'Procurement Manager',
        email: `procurement@${category.toLowerCase()}.com`,
        phone: '+91 98765 43210',
      },
    };
  });
};

// Sample Supplier data for each category
const generateSuppliers = (category: string, count: number): Supplier[] => {
  const companyTypes = ['Industries', 'Enterprises', 'Corporation', 'Manufacturing', 'Solutions'];
  const locations = [
    'Mumbai',
    'Delhi',
    'Bangalore',
    'Chennai',
    'Pune',
    'Ahmedabad',
    'Hyderabad',
    'Kolkata',
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: `supplier-${category}-${i + 1}`,
    companyName: `${category} ${companyTypes[i % companyTypes.length]}`,
    description: `Leading manufacturer and supplier of ${category} products with over ${
      5 + i
    } years of experience`,
    location: locations[i % locations.length],
    rating: 4.0 + Math.random() * 1.0,
    reviews: Math.floor(Math.random() * 500) + 50,
    verified: Math.random() > 0.2,
    specializations: [
      `${category} Manufacturing`,
      `${category} Export`,
      `${category} Quality Control`,
    ],
    certifications: ['ISO 9001:2015', 'CE Certified', 'Export License'],
    yearsInBusiness: 5 + Math.floor(Math.random() * 20),
    contactInfo: {
      email: `info@${category.toLowerCase()}corp.com`,
      phone: '+91 98765 43210',
      website: `www.${category.toLowerCase()}corp.com`,
    },
    products: [`${category} Type A`, `${category} Type B`, `${category} Premium`],
    minimumOrder: '₹50,000',
    paymentTerms: '30 days credit',
  }));
};

// All 50 Categories with complete data
export const CATEGORY_DATA: Category[] = [
  {
    slug: 'agriculture',
    name: 'Agriculture',
    icon: '🌾',
    subcategories: [
      'Seeds & Planting',
      'Fertilizers',
      'Pesticides',
      'Farm Equipment',
      'Irrigation',
      'Harvesting',
      'Post-Harvest',
      'Organic Products',
    ],
    supplierCount: 15247,
    rfqs: generateRFQs('Agriculture', 12),
    suppliers: generateSuppliers('Agriculture', 25),
  },
  {
    slug: 'apparel-fashion',
    name: 'Apparel & Fashion',
    icon: '👔',
    subcategories: [
      'Clothing',
      'Footwear',
      'Accessories',
      'Textiles',
      'Fabrics',
      'Garments',
      'Fashion Wear',
      'Sportswear',
    ],
    supplierCount: 28439,
    rfqs: generateRFQs('Apparel', 15),
    suppliers: generateSuppliers('Apparel', 30),
  },
  {
    slug: 'automobile',
    name: 'Automobile',
    icon: '🚗',
    subcategories: [
      'Auto Parts',
      'Tires',
      'Batteries',
      'Lubricants',
      'Accessories',
      'Tools',
      'Service Equipment',
    ],
    supplierCount: 19582,
    rfqs: generateRFQs('Automobile', 18),
    suppliers: generateSuppliers('Automobile', 28),
  },
  {
    slug: 'ayurveda-herbal',
    name: 'Ayurveda & Herbal',
    icon: '🌿',
    subcategories: [
      'Herbal Medicines',
      'Ayurvedic Products',
      'Essential Oils',
      'Herbal Extracts',
      'Natural Cosmetics',
      'Wellness Products',
    ],
    supplierCount: 8293,
    rfqs: generateRFQs('Ayurveda', 8),
    suppliers: generateSuppliers('Ayurveda', 15),
  },
  {
    slug: 'business-services',
    name: 'Business Services',
    icon: '💼',
    subcategories: [
      'Consulting',
      'Legal Services',
      'Accounting',
      'Marketing',
      'IT Services',
      'HR Services',
    ],
    supplierCount: 12394,
    rfqs: generateRFQs('Business Services', 10),
    suppliers: generateSuppliers('Business Services', 20),
  },
  {
    slug: 'chemicals',
    name: 'Chemical',
    icon: '🧪',
    subcategories: [
      'Industrial Chemicals',
      'Organic Chemicals',
      'Inorganic Chemicals',
      'Specialty Chemicals',
      'Petrochemicals',
      'Dyes & Pigments',
      'Polymers',
    ],
    supplierCount: 16758,
    rfqs: generateRFQs('Chemical', 20),
    suppliers: generateSuppliers('Chemical', 32),
  },
  {
    slug: 'computers-internet',
    name: 'Computers & Internet',
    icon: '💻',
    subcategories: [
      'Hardware',
      'Software',
      'Networking',
      'Servers',
      'Storage',
      'Peripherals',
      'Internet Services',
    ],
    supplierCount: 24567,
    rfqs: generateRFQs('Computer', 22),
    suppliers: generateSuppliers('Computer', 35),
  },
  {
    slug: 'electronics',
    name: 'Consumer Electronics',
    icon: '📱',
    subcategories: [
      'Mobile Devices',
      'Audio Systems',
      'Home Appliances',
      'Gaming',
      'Wearables',
      'Smart Home',
    ],
    supplierCount: 32629,
    rfqs: generateRFQs('Electronics', 25),
    suppliers: generateSuppliers('Electronics', 40),
  },
  {
    slug: 'cosmetics-personal-care',
    name: 'Cosmetics & Personal Care',
    icon: '💄',
    subcategories: [
      'Skincare',
      'Haircare',
      'Makeup',
      'Fragrances',
      'Personal Hygiene',
      'Beauty Tools',
      'Organic Beauty',
    ],
    supplierCount: 18472,
    rfqs: generateRFQs('Cosmetics', 14),
    suppliers: generateSuppliers('Cosmetics', 25),
  },
  {
    slug: 'electronics-electrical',
    name: 'Electronics & Electrical',
    icon: '⚡',
    subcategories: [
      'Electrical Components',
      'Power Equipment',
      'Lighting',
      'Cables',
      'Switches',
      'Motors',
    ],
    supplierCount: 28394,
    rfqs: generateRFQs('Electrical', 20),
    suppliers: generateSuppliers('Electrical', 35),
  },
  {
    slug: 'food-beverage',
    name: 'Food Products & Beverage',
    icon: '🍎',
    subcategories: [
      'Processed Foods',
      'Beverages',
      'Dairy Products',
      'Spices',
      'Snacks',
      'Organic Foods',
      'Frozen Foods',
    ],
    supplierCount: 35628,
    rfqs: generateRFQs('Food', 28),
    suppliers: generateSuppliers('Food', 45),
  },
  {
    slug: 'furniture-carpentry',
    name: 'Furniture & Carpentry',
    icon: '🪑',
    subcategories: [
      'Office Furniture',
      'Home Furniture',
      'Wooden Products',
      'Carpentry Tools',
      'Interior Design',
      'Custom Furniture',
      'Outdoor Furniture',
    ],
    supplierCount: 14729,
    rfqs: generateRFQs('Furniture', 12),
    suppliers: generateSuppliers('Furniture', 22),
  },
  {
    slug: 'gifts-crafts',
    name: 'Gifts & Crafts',
    icon: '🎁',
    subcategories: [
      'Handicrafts',
      'Decorative Items',
      'Gifts',
      'Art Supplies',
      'Stationery',
      'Promotional Items',
    ],
    supplierCount: 9847,
    rfqs: generateRFQs('Gifts', 8),
    suppliers: generateSuppliers('Gifts', 18),
  },
  {
    slug: 'health-beauty',
    name: 'Health & Beauty',
    icon: '🏥',
    subcategories: [
      'Medical Equipment',
      'Health Supplements',
      'Beauty Products',
      'Wellness',
      'Fitness Equipment',
    ],
    supplierCount: 16394,
    rfqs: generateRFQs('Health', 15),
    suppliers: generateSuppliers('Health', 25),
  },
  {
    slug: 'home-furnishings',
    name: 'Home Furnishings',
    icon: '🏠',
    subcategories: [
      'Curtains',
      'Carpets',
      'Bedding',
      'Kitchen Items',
      'Bathroom Accessories',
      'Decor Items',
    ],
    supplierCount: 12758,
    rfqs: generateRFQs('Home', 10),
    suppliers: generateSuppliers('Home', 20),
  },
  {
    slug: 'home-supplies',
    name: 'Home Supplies',
    icon: '🏡',
    subcategories: [
      'Cleaning Supplies',
      'Storage Solutions',
      'Garden Supplies',
      'Tools',
      'Safety Equipment',
    ],
    supplierCount: 8629,
    rfqs: generateRFQs('Home Supplies', 8),
    suppliers: generateSuppliers('Home Supplies', 15),
  },
  {
    slug: 'machinery',
    name: 'Industrial Machinery',
    icon: '⚙️',
    subcategories: [
      'Manufacturing Equipment',
      'Construction Machinery',
      'Agricultural Machinery',
      'Mining Equipment',
      'Food Processing',
      'Textile Machinery',
    ],
    supplierCount: 18394,
    rfqs: generateRFQs('Machinery', 22),
    suppliers: generateSuppliers('Machinery', 30),
  },
  {
    slug: 'industrial-supplies',
    name: 'Industrial Supplies',
    icon: '🔧',
    subcategories: ['Safety Equipment', 'Tools', 'Fasteners', 'Adhesives', 'Lubricants'],
    supplierCount: 15847,
    rfqs: generateRFQs('Industrial', 18),
    suppliers: generateSuppliers('Industrial', 25),
  },
  {
    slug: 'jewelry-designers',
    name: 'Jewelry & Designers',
    icon: '💎',
    subcategories: [
      'Gold Jewelry',
      'Silver Jewelry',
      'Precious Stones',
      'Fashion Jewelry',
      'Custom Design',
    ],
    supplierCount: 7293,
    rfqs: generateRFQs('Jewelry', 6),
    suppliers: generateSuppliers('Jewelry', 12),
  },
  {
    slug: 'mineral-metals',
    name: 'Mineral & Metals',
    icon: '⛏️',
    subcategories: [
      'Iron & Steel',
      'Non-Ferrous Metals',
      'Precious Metals',
      'Minerals',
      'Alloys',
      'Metal Products',
    ],
    supplierCount: 13582,
    rfqs: generateRFQs('Metals', 16),
    suppliers: generateSuppliers('Metals', 25),
  },
  {
    slug: 'office-supplies',
    name: 'Office Supplies',
    icon: '📄',
    subcategories: [
      'Stationery',
      'Office Equipment',
      'Printing Supplies',
      'Furniture',
      'Technology',
    ],
    supplierCount: 11394,
    rfqs: generateRFQs('Office', 10),
    suppliers: generateSuppliers('Office', 18),
  },
  {
    slug: 'packaging-paper',
    name: 'Packaging & Paper',
    icon: '📦',
    subcategories: [
      'Packaging Materials',
      'Paper Products',
      'Printing Services',
      'Labels',
      'Boxes',
      'Flexible Packaging',
    ],
    supplierCount: 14628,
    rfqs: generateRFQs('Packaging', 14),
    suppliers: generateSuppliers('Packaging', 22),
  },
  {
    slug: 'real-estate-construction',
    name: 'Real Estate & Construction',
    icon: '🏗️',
    subcategories: [
      'Building Materials',
      'Construction Equipment',
      'Interior Design',
      'Architecture',
      'Property Development',
      'Civil Engineering',
    ],
    supplierCount: 22847,
    rfqs: generateRFQs('Construction', 25),
    suppliers: generateSuppliers('Construction', 35),
  },
  {
    slug: 'security-products',
    name: 'Security Products',
    icon: '🛡️',
    subcategories: ['CCTV Systems', 'Access Control', 'Alarms', 'Fire Safety', 'Security Services'],
    supplierCount: 9472,
    rfqs: generateRFQs('Security', 8),
    suppliers: generateSuppliers('Security', 15),
  },
  {
    slug: 'sports-entertainment',
    name: 'Sports & Entertainment',
    icon: '⚽',
    subcategories: [
      'Sports Equipment',
      'Fitness Gear',
      'Entertainment Systems',
      'Games',
      'Outdoor Activities',
    ],
    supplierCount: 8394,
    rfqs: generateRFQs('Sports', 8),
    suppliers: generateSuppliers('Sports', 15),
  },
  {
    slug: 'telecommunication',
    name: 'Telecommunication',
    icon: '📡',
    subcategories: ['Network Equipment', 'Communication Devices', 'Cables', 'Towers', 'Software'],
    supplierCount: 12758,
    rfqs: generateRFQs('Telecom', 12),
    suppliers: generateSuppliers('Telecom', 20),
  },
  {
    slug: 'textiles',
    name: 'Textiles, Yarn & Fabrics',
    icon: '🧵',
    subcategories: ['Cotton Textiles', 'Synthetic Fabrics', 'Yarn', 'Dyes', 'Garments'],
    supplierCount: 24582,
    rfqs: generateRFQs('Textiles', 20),
    suppliers: generateSuppliers('Textiles', 35),
  },
  {
    slug: 'tools-equipment',
    name: 'Tools & Equipment',
    icon: '🔨',
    subcategories: [
      'Hand Tools',
      'Power Tools',
      'Measuring Instruments',
      'Industrial Tools',
      'Workshop Equipment',
    ],
    supplierCount: 16829,
    rfqs: generateRFQs('Tools', 15),
    suppliers: generateSuppliers('Tools', 25),
  },
  {
    slug: 'tours-travels-hotels',
    name: 'Tours, Travels & Hotels',
    icon: '✈️',
    subcategories: [
      'Travel Services',
      'Hotel Booking',
      'Tour Packages',
      'Transportation',
      'Hospitality',
    ],
    supplierCount: 7394,
    rfqs: generateRFQs('Travel', 6),
    suppliers: generateSuppliers('Travel', 12),
  },
  {
    slug: 'toys-games',
    name: 'Toys & Games',
    icon: '🧸',
    subcategories: [
      'Educational Toys',
      'Electronic Games',
      'Outdoor Toys',
      'Board Games',
      'Puzzles',
    ],
    supplierCount: 6728,
    rfqs: generateRFQs('Toys', 6),
    suppliers: generateSuppliers('Toys', 12),
  },
  {
    slug: 'renewable-energy',
    name: 'Renewable Energy',
    icon: '☀️',
    subcategories: ['Solar Products', 'Wind Energy', 'Hydroelectric', 'Biomass'],
    supplierCount: 5847,
    rfqs: generateRFQs('Renewable Energy', 8),
    suppliers: generateSuppliers('Renewable Energy', 15),
  },
  {
    slug: 'ai-automation',
    name: 'AI & Automation',
    icon: '🤖',
    subcategories: ['AI Software', 'Robotics', 'Automation Systems', 'Machine Learning'],
    supplierCount: 4293,
    rfqs: generateRFQs('AI', 6),
    suppliers: generateSuppliers('AI', 10),
  },
  {
    slug: 'sustainable-products',
    name: 'Sustainable Products',
    icon: '♻️',
    subcategories: [
      'Eco-Friendly Products',
      'Recycled Materials',
      'Green Technology',
      'Sustainable Packaging',
    ],
    supplierCount: 3628,
    rfqs: generateRFQs('Sustainable', 5),
    suppliers: generateSuppliers('Sustainable', 8),
  },
  {
    slug: 'healthcare-technology',
    name: 'Healthcare Technology',
    icon: '🩺',
    subcategories: ['Medical Devices', 'Health Software', 'Diagnostic Equipment', 'Telemedicine'],
    supplierCount: 8472,
    rfqs: generateRFQs('Healthcare Tech', 10),
    suppliers: generateSuppliers('Healthcare Tech', 15),
  },
  {
    slug: 'ecommerce-solutions',
    name: 'E-commerce Solutions',
    icon: '🛒',
    subcategories: ['E-commerce Platforms', 'Payment Solutions', 'Logistics', 'Digital Marketing'],
    supplierCount: 6394,
    rfqs: generateRFQs('E-commerce', 8),
    suppliers: generateSuppliers('E-commerce', 12),
  },
  {
    slug: 'gaming-esports',
    name: 'Gaming & Esports',
    icon: '🎮',
    subcategories: [
      'Gaming Hardware',
      'Esports Equipment',
      'Gaming Software',
      'Streaming Equipment',
    ],
    supplierCount: 3758,
    rfqs: generateRFQs('Gaming', 5),
    suppliers: generateSuppliers('Gaming', 8),
  },
  {
    slug: 'electric-vehicles',
    name: 'Electric Vehicles',
    icon: '🔋',
    subcategories: ['EV Components', 'Charging Systems', 'Batteries', 'Electric Motors'],
    supplierCount: 4829,
    rfqs: generateRFQs('Electric Vehicles', 8),
    suppliers: generateSuppliers('Electric Vehicles', 12),
  },
  {
    slug: 'drones-uavs',
    name: 'Drones & UAVs',
    icon: '🚁',
    subcategories: ['Commercial Drones', 'Drone Components', 'UAV Software', 'Drone Services'],
    supplierCount: 2394,
    rfqs: generateRFQs('Drones', 4),
    suppliers: generateSuppliers('Drones', 6),
  },
  {
    slug: 'wearable-technology',
    name: 'Wearable Technology',
    icon: '⌚',
    subcategories: ['Smart Watches', 'Fitness Trackers', 'Health Monitors', 'AR/VR Devices'],
    supplierCount: 5628,
    rfqs: generateRFQs('Wearables', 8),
    suppliers: generateSuppliers('Wearables', 12),
  },
  {
    slug: 'logistics-solutions',
    name: 'Logistics Solutions',
    icon: '🚚',
    subcategories: ['Supply Chain', 'Warehousing', 'Transportation', 'Logistics Software'],
    supplierCount: 9847,
    rfqs: generateRFQs('Logistics', 12),
    suppliers: generateSuppliers('Logistics', 18),
  },
  {
    slug: '3d-printing',
    name: '3D Printing',
    icon: '🖨️',
    subcategories: ['3D Printers', 'Printing Materials', '3D Software', 'Printing Services'],
    supplierCount: 3472,
    rfqs: generateRFQs('3D Printing', 5),
    suppliers: generateSuppliers('3D Printing', 8),
  },
  {
    slug: 'food-tech-agri-tech',
    name: 'Food Tech & Agri-Tech',
    icon: '🧬',
    subcategories: [
      'Food Processing Tech',
      'Agricultural Technology',
      'Food Safety',
      'Smart Farming',
    ],
    supplierCount: 4394,
    rfqs: generateRFQs('Food Tech', 6),
    suppliers: generateSuppliers('Food Tech', 10),
  },
  {
    slug: 'iron-steel-industry',
    name: 'Iron & Steel Industry',
    icon: '🏭',
    subcategories: ['Iron Products', 'Steel Manufacturing', 'Metal Processing', 'Industrial Steel'],
    supplierCount: 8758,
    rfqs: generateRFQs('Iron Steel', 12),
    suppliers: generateSuppliers('Iron Steel', 18),
  },
  {
    slug: 'mining-raw-materials',
    name: 'Mining & Raw Materials',
    icon: '⛰️',
    subcategories: [
      'Mining Equipment',
      'Raw Materials',
      'Mining Services',
      'Extraction Technology',
    ],
    supplierCount: 6629,
    rfqs: generateRFQs('Mining', 8),
    suppliers: generateSuppliers('Mining', 15),
  },
  {
    slug: 'metal-recycling',
    name: 'Metal Recycling',
    icon: '♻️',
    subcategories: ['Scrap Metal', 'Recycling Equipment', 'Metal Recovery', 'Waste Management'],
    supplierCount: 5394,
    rfqs: generateRFQs('Metal Recycling', 6),
    suppliers: generateSuppliers('Metal Recycling', 12),
  },
  {
    slug: 'metallurgy-metalworking',
    name: 'Metallurgy & Metalworking',
    icon: '🔥',
    subcategories: ['Metal Fabrication', 'Metallurgy Services', 'Welding', 'Metal Finishing'],
    supplierCount: 7628,
    rfqs: generateRFQs('Metallurgy', 10),
    suppliers: generateSuppliers('Metallurgy', 15),
  },
  {
    slug: 'heavy-machinery',
    name: 'Heavy Machinery',
    icon: '🚜',
    subcategories: [
      'Construction Equipment',
      'Industrial Machinery',
      'Agricultural Equipment',
      'Mining Machinery',
    ],
    supplierCount: 4847,
    rfqs: generateRFQs('Heavy Machinery', 8),
    suppliers: generateSuppliers('Heavy Machinery', 12),
  },
  {
    slug: 'ferrous-non-ferrous',
    name: 'Ferrous & Non-Ferrous',
    icon: '⚒️',
    subcategories: ['Ferrous Metals', 'Non-Ferrous Metals', 'Metal Alloys', 'Metal Processing'],
    supplierCount: 6293,
    rfqs: generateRFQs('Ferrous Metals', 8),
    suppliers: generateSuppliers('Ferrous Metals', 15),
  },
  {
    slug: 'mining-safety',
    name: 'Mining Safety',
    icon: '🦺',
    subcategories: ['Safety Equipment', 'Protective Gear', 'Safety Systems', 'Emergency Equipment'],
    supplierCount: 3728,
    rfqs: generateRFQs('Mining Safety', 5),
    suppliers: generateSuppliers('Mining Safety', 8),
  },
  {
    slug: 'precious-metals',
    name: 'Precious Metals',
    icon: '🥇',
    subcategories: ['Gold', 'Silver', 'Platinum', 'Precious Metal Trading'],
    supplierCount: 2847,
    rfqs: generateRFQs('Precious Metals', 4),
    suppliers: generateSuppliers('Precious Metals', 6),
  },
];

// Helper functions
export const getCategoryBySlug = (slug: string): Category | undefined => {
  return CATEGORY_DATA.find(category => category.slug === slug);
};

export const getAllCategories = (): Category[] => {
  return CATEGORY_DATA;
};

export const getTrendingCategories = (): Category[] => {
  return CATEGORY_DATA.filter(category => category.trending);
};

export const searchCategories = (query: string): Category[] => {
  const lowercaseQuery = query.toLowerCase();
  return CATEGORY_DATA.filter(
    category =>
      category.name.toLowerCase().includes(lowercaseQuery) ||
      category.subcategories.some(sub => sub.toLowerCase().includes(lowercaseQuery))
  );
};

export const getCategoryStats = () => {
  const totalSuppliers = CATEGORY_DATA.reduce((sum, cat) => sum + cat.supplierCount, 0);
  const totalRFQs = CATEGORY_DATA.reduce((sum, cat) => sum + cat.rfqs.length, 0);
  const totalSubcategories = CATEGORY_DATA.reduce((sum, cat) => sum + cat.subcategories.length, 0);

  return {
    totalCategories: CATEGORY_DATA.length,
    totalSuppliers,
    totalRFQs,
    totalSubcategories,
  };
};

// Missing functions that are being imported
export const getCategoryData = (categorySlug: string): Category | undefined => {
  return CATEGORY_DATA.find(category => category.slug === categorySlug);
};

export const getSubcategoryData = (categorySlug: string, subcategoryName: string) => {
  const category = getCategoryData(categorySlug);
  if (!category) return null;

  return {
    category,
    subcategory: subcategoryName,
    rfqs: category.rfqs.filter(
      rfq => rfq.subcategory === subcategoryName || subcategoryName === 'General'
    ),
    suppliers: category.suppliers,
  };
};

export const getRFQsBySubcategory = (categorySlug: string, subcategoryName: string): RFQ[] => {
  const category = getCategoryData(categorySlug);
  if (!category) return [];

  return category.rfqs.filter(
    rfq => rfq.subcategory === subcategoryName || subcategoryName === 'General'
  );
};

export const getSuppliersBySubcategory = (
  categorySlug: string,
  subcategoryName: string
): Supplier[] => {
  const category = getCategoryData(categorySlug);
  if (!category) return [];

  return category.suppliers;
};

// Sample data exports for individual pages
export const SAMPLE_RFQS = CATEGORY_DATA.reduce((allRFQs, category) => {
  return [...allRFQs, ...category.rfqs];
}, [] as RFQ[]);

export const SAMPLE_SUPPLIERS = CATEGORY_DATA.reduce((allSuppliers, category) => {
  return [...allSuppliers, ...category.suppliers];
}, [] as Supplier[]);
