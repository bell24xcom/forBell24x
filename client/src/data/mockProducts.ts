// Mock product and RFQ data for Bell24H marketplace
import { ALL_CATEGORIES, type Category } from './categories';

export interface MockProduct {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  price: string;
  minOrder: string;
  supplier: {
    name: string;
    location: string;
    rating: number;
    verified: boolean;
    responseTime: string;
  };
  image: string;
  description: string;
  features: string[];
  availability: 'In Stock' | 'Limited' | 'On Order';
  lastUpdated: string;
  specifications: Record<string, string>;
}

export interface MockRFQ {
  id: string;
  title: string;
  category: string;
  subcategory: string;
  description: string;
  quantity: string;
  budget: string;
  timeline: string;
  location: string;
  rfqType: 'standard' | 'voice' | 'video';
  postedBy: string;
  postedDate: string;
  responses: number;
  urgency: 'Low' | 'Medium' | 'High' | 'Urgent';
  isDemo: boolean;
  disclaimer: string;
  specifications: Record<string, string>;
  views?: number;
  shortlisted?: number;
  audioUrl?: string;
  videoUrl?: string;
  transcription?: string;
  aiAnalysis?: string;
}

// Professional Indian business hub locations
const BUSINESS_LOCATIONS = [
  'Mumbai, Maharashtra',
  'Delhi, NCR',
  'Bangalore, Karnataka',
  'Chennai, Tamil Nadu',
  'Pune, Maharashtra',
  'Hyderabad, Telangana',
  'Ahmedabad, Gujarat',
  'Kolkata, West Bengal',
  'Coimbatore, Tamil Nadu',
  'Surat, Gujarat',
  'Indore, Madhya Pradesh',
  'Jaipur, Rajasthan',
  'Kanpur, Uttar Pradesh',
  'Nagpur, Maharashtra',
  'Vadodara, Gujarat',
  'Ludhiana, Punjab',
  'Agra, Uttar Pradesh',
  'Nashik, Maharashtra',
  'Faridabad, Haryana',
  'Rajkot, Gujarat',
];

// Professional company names for realistic business appearance
const ENTERPRISE_COMPANIES = [
  'Tata Industries - Procurement Team',
  'Reliance Industries - Supply Chain',
  'Mahindra Group - Purchasing',
  'L&T Limited - Manufacturing',
  'Wipro Technologies - Operations',
  'Infosys - Infrastructure',
  'HDFC Corporation - Facilities',
  'ICICI Bank - Operations',
  'Bajaj Group - Manufacturing',
  'TVS Motors - Production',
  'Hero MotoCorp - Assembly',
  'Maruti Suzuki - Manufacturing',
  'Asian Paints - Production',
  'UltraTech Cement - Operations',
  'Godrej Industries - Manufacturing',
  'ITC Limited - Operations',
  'Bharti Airtel - Infrastructure',
  'Aditya Birla Group - Manufacturing',
  'Vedanta Resources - Mining Operations',
  'JSW Steel - Production',
  'Hindalco Industries - Manufacturing',
  'NTPC Limited - Power Generation',
  'ONGC - Exploration Division',
  'Coal India - Operations',
  'Indian Railways - Procurement',
  'BHEL - Manufacturing',
  'HAL - Aerospace Division',
  'DRDO - Defense Research',
  'ISRO - Space Technology',
  'Municipal Corporation - Infrastructure',
  'Government Projects - Public Works',
  'State Industrial Development - Manufacturing',
  'Export House - International Trade',
  'Manufacturing Hub - Industrial Complex',
];

// Budget ranges for different categories (in Indian Rupees)
const getBudgetRange = (categoryId: string): string => {
  const budgetRanges: Record<string, string[]> = {
    // High-value categories
    aerospace: ['₹50L - ₹1Cr', '₹1Cr - ₹5Cr', '₹2Cr - ₹10Cr'],
    'oil-gas': ['₹75L - ₹2Cr', '₹1Cr - ₹8Cr', '₹3Cr - ₹15Cr'],
    mining: ['₹40L - ₹1.5Cr', '₹80L - ₹4Cr', '₹2Cr - ₹12Cr'],
    infrastructure: ['₹60L - ₹2Cr', '₹1.5Cr - ₹6Cr', '₹3Cr - ₹20Cr'],
    energy: ['₹45L - ₹1.2Cr', '₹90L - ₹5Cr', '₹2.5Cr - ₹18Cr'],
    renewable: ['₹35L - ₹80L', '₹70L - ₹3Cr', '₹1.5Cr - ₹10Cr'],

    // Medium-high value categories
    machinery: ['₹25L - ₹60L', '₹50L - ₹2Cr', '₹1Cr - ₹8Cr'],
    manufacturing: ['₹30L - ₹75L', '₹60L - ₹2.5Cr', '₹1.5Cr - ₹6Cr'],
    automotive: ['₹20L - ₹50L', '₹40L - ₹1.5Cr', '₹80L - ₹4Cr'],
    chemicals: ['₹15L - ₹40L', '₹30L - ₹80L', '₹60L - ₹3Cr'],
    metals: ['₹18L - ₹45L', '₹35L - ₹90L', '₹70L - ₹3.5Cr'],
    electronics: ['₹12L - ₹35L', '₹25L - ₹70L', '₹50L - ₹2Cr'],

    // Medium value categories
    textiles: ['₹8L - ₹25L', '₹15L - ₹45L', '₹30L - ₹1Cr'],
    food: ['₹10L - ₹30L', '₹20L - ₹60L', '₹40L - ₹1.5Cr'],
    construction: ['₹12L - ₹35L', '₹25L - ₹75L', '₹50L - ₹2.5Cr'],
    medical: ['₹15L - ₹40L', '₹30L - ₹80L', '₹60L - ₹2Cr'],
    pharmaceuticals: ['₹20L - ₹50L', '₹40L - ₹1Cr', '₹80L - ₹3Cr'],

    // Lower-medium value categories
    packaging: ['₹5L - ₹18L', '₹10L - ₹35L', '₹20L - ₹75L'],
    printing: ['₹4L - ₹15L', '₹8L - ₹30L', '₹15L - ₹60L'],
    office: ['₹3L - ₹12L', '₹6L - ₹25L', '₹12L - ₹50L'],
    furniture: ['₹5L - ₹20L', '₹10L - ₹40L', '₹20L - ₹80L'],
    security: ['₹6L - ₹22L', '₹12L - ₹45L', '₹25L - ₹90L'],

    // Consumer and retail categories
    consumer: ['₹4L - ₹15L', '₹8L - ₹30L', '₹15L - ₹60L'],
    retail: ['₹5L - ₹18L', '₹10L - ₹35L', '₹20L - ₹70L'],
    sports: ['₹3L - ₹12L', '₹6L - ₹25L', '₹12L - ₹50L'],
    beauty: ['₹2L - ₹8L', '₹4L - ₹18L', '₹8L - ₹35L'],
    toys: ['₹2L - ₹10L', '₹5L - ₹22L', '₹10L - ₹45L'],
  };

  const ranges = budgetRanges[categoryId] || ['₹5L - ₹20L', '₹10L - ₹40L', '₹20L - ₹80L'];
  return ranges[Math.floor(Math.random() * ranges.length)];
};

// Generate realistic specifications for each category
const getSpecifications = (categoryId: string, subcategory: string): Record<string, string> => {
  const baseSpecs = {
    Quality: ['Premium Grade', 'Industrial Grade', 'Commercial Grade', 'Export Quality'][
      Math.floor(Math.random() * 4)
    ],
    Certification: ['ISO 9001', 'BIS Certified', 'CE Marking', 'ISI Approved'][
      Math.floor(Math.random() * 4)
    ],
    Warranty: ['1 Year', '2 Years', '3 Years', '5 Years'][Math.floor(Math.random() * 4)],
    Support: ['24/7 Support', 'Business Hours', 'On-site Support', 'Remote Support'][
      Math.floor(Math.random() * 4)
    ],
  };

  // Category-specific specifications
  const categorySpecs: Record<string, Record<string, string>> = {
    electronics: {
      'Operating Voltage': '220V AC',
      'IP Rating': 'IP65',
      'Temperature Range': '-10°C to +50°C',
    },
    machinery: {
      'Power Rating': '15-50 HP',
      'Control System': 'PLC Based',
      'Safety Features': 'Emergency Stop',
    },
    chemicals: { Purity: '99.5% minimum', Packaging: 'Industrial Grade', Storage: 'Cool & Dry' },
    textiles: { GSM: '150-300', 'Thread Count': '100-200 TC', 'Color Fastness': 'Grade 4-5' },
    automotive: {
      Material: 'High Grade Steel',
      Finish: 'Powder Coated',
      Testing: 'Quality Tested',
    },
    construction: { Strength: 'M25 Grade', Compliance: 'IS Standards', Durability: '50+ Years' },
    medical: { Sterilization: 'Gamma Ray', Biocompatibility: 'USP Class VI', Accuracy: '±0.1%' },
    food: {
      'Food Grade': 'FDA Approved',
      Hygiene: 'HACCP Compliant',
      'Shelf Life': '12-24 Months',
    },
  };

  return { ...baseSpecs, ...(categorySpecs[categoryId] || {}) };
};

// Generate comprehensive mock RFQs for all categories
const generateComprehensiveMockRFQs = (): MockRFQ[] => {
  const allRFQs: MockRFQ[] = [];

  ALL_CATEGORIES.forEach(category => {
    // Determine RFQ count based on category importance and supplier count
    const supplierCount = parseInt(category.supplierCount.replace(/[^\d]/g, ''));
    let rfqCount: number;

    if (category.trending) {
      rfqCount = 28; // Trending categories get most RFQs
    } else if (supplierCount > 20000) {
      rfqCount = 25; // High supplier count categories
    } else if (supplierCount > 15000) {
      rfqCount = 20; // Medium-high supplier count
    } else if (supplierCount > 10000) {
      rfqCount = 18; // Medium supplier count
    } else if (supplierCount > 5000) {
      rfqCount = 15; // Lower-medium supplier count
    } else {
      rfqCount = 12; // Specialized categories
    }

    // Generate RFQs for this category
    for (let i = 0; i < rfqCount; i++) {
      const subcategory =
        category.subcategories[Math.floor(Math.random() * category.subcategories.length)];
      const location = BUSINESS_LOCATIONS[Math.floor(Math.random() * BUSINESS_LOCATIONS.length)];
      const company = ENTERPRISE_COMPANIES[Math.floor(Math.random() * ENTERPRISE_COMPANIES.length)];

      // Determine RFQ type (70% standard, 20% voice, 10% video)
      const rand = Math.random();
      const rfqType: 'standard' | 'voice' | 'video' =
        rand < 0.7 ? 'standard' : rand < 0.9 ? 'voice' : 'video';

      // Generate realistic quantities
      const quantities = [
        '50 units',
        '100 units',
        '200 units',
        '500 units',
        '1000 units',
        '2000 units',
        '10 pieces',
        '25 pieces',
        '50 pieces',
        '100 pieces',
        '500 pieces',
        '1 ton',
        '5 tons',
        '10 tons',
        '25 tons',
        '50 tons',
        '100 tons',
        '1000 kg',
        '5000 kg',
        '10000 kg',
        '1 set',
        '5 sets',
        '10 sets',
        '1000 meters',
        '5000 meters',
        '10000 meters',
        '1 lot',
        '2 lots',
      ];

      const timelines = ['7 days', '15 days', '1 month', '2 months', '3 months', '6 months'];
      const urgencies: ('Low' | 'Medium' | 'High' | 'Urgent')[] = [
        'Low',
        'Medium',
        'High',
        'Urgent',
      ];

      // Generate realistic title based on category and subcategory
      const titleTemplates = [
        `${subcategory} - ${category.name} Supply Required`,
        `Bulk ${subcategory} Procurement - ${category.name}`,
        `${subcategory} for ${category.name} Project`,
        `High Quality ${subcategory} - Manufacturing Requirement`,
        `${subcategory} Supply Chain - ${category.name} Industry`,
        `Professional ${subcategory} Services - ${category.name}`,
        `Industrial ${subcategory} - Large Scale Project`,
        `Premium ${subcategory} - ${category.name} Application`,
      ];

      const title = titleTemplates[Math.floor(Math.random() * titleTemplates.length)];

      // Generate realistic descriptions
      const descriptionTemplates = [
        `Looking for reliable suppliers of high-quality ${subcategory.toLowerCase()} for our ${category.name.toLowerCase()} operations. Need competitive pricing and proven track record.`,
        `Sourcing ${subcategory.toLowerCase()} for large-scale ${category.name.toLowerCase()} project. Quality and timely delivery are critical requirements.`,
        `Need professional-grade ${subcategory.toLowerCase()} for ${category.name.toLowerCase()} manufacturing. Supplier must have proper certifications and quality assurance.`,
        `Bulk procurement requirement for ${subcategory.toLowerCase()} in ${category.name.toLowerCase()} sector. Long-term partnership opportunity available.`,
        `Seeking experienced suppliers for ${subcategory.toLowerCase()} with expertise in ${category.name.toLowerCase()} applications. Technical support required.`,
        `Urgent requirement for ${subcategory.toLowerCase()} for ongoing ${category.name.toLowerCase()} project. Need immediate quotations from verified suppliers.`,
      ];

      const description =
        descriptionTemplates[Math.floor(Math.random() * descriptionTemplates.length)];

      // Generate realistic posted date (within last 30 days)
      const daysAgo = Math.floor(Math.random() * 30);
      const postedDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

      const mockRFQ: MockRFQ = {
        id: `rfq_${category.id}_${String(i + 1).padStart(3, '0')}`,
        title: title,
        category: category.name,
        subcategory: subcategory,
        description: description,
        quantity: quantities[Math.floor(Math.random() * quantities.length)],
        budget: getBudgetRange(category.id),
        timeline: timelines[Math.floor(Math.random() * timelines.length)],
        location: location,
        rfqType: rfqType,
        postedBy: company,
        postedDate: postedDate,
        responses: Math.floor(Math.random() * 25) + 1,
        urgency: urgencies[Math.floor(Math.random() * urgencies.length)],
        isDemo: true,
        disclaimer:
          '🔍 DEMO RFQ: Sample content for platform demonstration. Real RFQs from verified buyers will be clearly distinguished.',
        specifications: getSpecifications(category.id, subcategory),
        views: Math.floor(Math.random() * 200) + 50,
        shortlisted: Math.floor(Math.random() * 8) + 1,
      };

      // Add audio/video specific fields
      if (rfqType === 'voice') {
        mockRFQ.audioUrl = `/api/demo/audio/${mockRFQ.id}.mp3`;
        mockRFQ.transcription = `Voice recording discussing detailed requirements for ${subcategory.toLowerCase()}. Quality specifications, delivery timeline, and budget constraints mentioned.`;
        mockRFQ.aiAnalysis = `AI extracted key specifications: ${Object.keys(mockRFQ.specifications)
          .slice(0, 3)
          .join(', ')}. Confidence: 94%`;
      } else if (rfqType === 'video') {
        mockRFQ.videoUrl = `/api/demo/video/${mockRFQ.id}.mp4`;
        mockRFQ.transcription = `Video showing current ${subcategory.toLowerCase()} setup and requirements. Site conditions and technical specifications demonstrated.`;
        mockRFQ.aiAnalysis = `AI video analysis identified: Product type, quantity estimates, quality requirements. Recommended specifications generated automatically.`;
      }

      allRFQs.push(mockRFQ);
    }
  });

  return allRFQs;
};

// Generate all mock RFQs
export const ALL_MOCK_RFQS: MockRFQ[] = generateComprehensiveMockRFQs();

// Static mock products (keeping original 3 for performance)
export const ALL_MOCK_PRODUCTS: MockProduct[] = [
  {
    id: 'electronics_product_1',
    name: 'Industrial LED Panel 150W',
    category: 'Electronics & Components',
    subcategory: 'LED Lighting',
    price: '₹3.5K',
    minOrder: '50 units',
    supplier: {
      name: 'Prime Electronics Ltd',
      location: 'Mumbai, Maharashtra',
      rating: 4.2,
      verified: true,
      responseTime: '< 2 hours',
    },
    image: '/api/placeholder/400/300?text=LED+Panel',
    description: 'High-efficiency LED panel for industrial applications with 5-year warranty.',
    features: ['Energy Efficient', 'Long Lifespan', 'Industrial Grade', 'Easy Installation'],
    availability: 'In Stock',
    lastUpdated: '2024-01-15',
    specifications: {
      'Power Rating': '150W',
      'IP Rating': 'IP65',
      Warranty: '5 years',
      Certification: 'BIS, CE',
    },
  },
  {
    id: 'textiles_product_1',
    name: 'Premium Cotton Fabric 180 GSM',
    category: 'Textiles & Apparel',
    subcategory: 'Cotton Fabrics',
    price: '₹450/meter',
    minOrder: '100 meters',
    supplier: {
      name: 'Textile Solutions Inc',
      location: 'Ahmedabad, Gujarat',
      rating: 4.5,
      verified: true,
      responseTime: '< 4 hours',
    },
    image: '/api/placeholder/400/300?text=Cotton+Fabric',
    description:
      'Export quality cotton fabric, pre-shrunk and mercerized for garment manufacturing.',
    features: ['Export Quality', 'Pre-shrunk', 'Colorfast', 'OEKO-TEX Certified'],
    availability: 'In Stock',
    lastUpdated: '2024-01-14',
    specifications: {
      Material: '100% Cotton',
      GSM: '180',
      Width: '58-60 inches',
      Certification: 'OEKO-TEX Standard 100',
    },
  },
  {
    id: 'machinery_product_1',
    name: 'CNC Vertical Machining Center',
    category: 'Machinery & Equipment',
    subcategory: 'CNC Machines',
    price: '₹35L',
    minOrder: '1 unit',
    supplier: {
      name: 'Precision Machines Co',
      location: 'Bangalore, Karnataka',
      rating: 4.8,
      verified: true,
      responseTime: '< 1 hour',
    },
    image: '/api/placeholder/400/300?text=CNC+Machine',
    description: '3-axis vertical machining center with Fanuc control for precision manufacturing.',
    features: ['High Precision', 'Fanuc Control', 'Auto Tool Changer', 'Professional Grade'],
    availability: 'Limited',
    lastUpdated: '2024-01-13',
    specifications: {
      Type: '3-Axis VMC',
      'Table Size': '1000x500mm',
      'Spindle Speed': '8000 RPM',
      Control: 'Fanuc',
    },
  },
];

// Helper functions
export const getProductsByCategory = (categoryId: string): MockProduct[] => {
  const category = ALL_CATEGORIES.find(cat => cat.id === categoryId);
  if (!category) return [];

  return ALL_MOCK_PRODUCTS.filter(
    product =>
      product.category.toLowerCase().includes(category.name.toLowerCase()) ||
      (categoryId === 'electronics' && product.category.includes('Electronics')) ||
      (categoryId === 'textiles' && product.category.includes('Textiles')) ||
      (categoryId === 'machinery' && product.category.includes('Machinery'))
  );
};

export const getRFQsByCategory = (categoryId: string): MockRFQ[] => {
  const category = ALL_CATEGORIES.find(cat => cat.id === categoryId);
  if (!category) return [];

  return ALL_MOCK_RFQS.filter(rfq => rfq.category === category.name);
};

export const searchProducts = (searchTerm: string): MockProduct[] => {
  const term = searchTerm.toLowerCase();
  return ALL_MOCK_PRODUCTS.filter(
    product =>
      product.name.toLowerCase().includes(term) ||
      product.category.toLowerCase().includes(term) ||
      product.description.toLowerCase().includes(term)
  );
};

export const searchRFQs = (searchTerm: string): MockRFQ[] => {
  const term = searchTerm.toLowerCase();
  return ALL_MOCK_RFQS.filter(
    rfq =>
      rfq.title.toLowerCase().includes(term) ||
      rfq.category.toLowerCase().includes(term) ||
      rfq.description.toLowerCase().includes(term) ||
      rfq.subcategory.toLowerCase().includes(term)
  );
};

// Enhanced statistics
export const getMockDataStats = () => ({
  totalProducts: ALL_MOCK_PRODUCTS.length,
  totalRFQs: ALL_MOCK_RFQS.length,
  totalCategories: ALL_CATEGORIES.length,
  voiceRFQs: ALL_MOCK_RFQS.filter(rfq => rfq.rfqType === 'voice').length,
  videoRFQs: ALL_MOCK_RFQS.filter(rfq => rfq.rfqType === 'video').length,
  urgentRFQs: ALL_MOCK_RFQS.filter(rfq => rfq.urgency === 'Urgent').length,
  verifiedSuppliers: ALL_MOCK_PRODUCTS.filter(product => product.supplier.verified).length,
  totalBudget: ALL_MOCK_RFQS.reduce((sum, rfq) => {
    const budget = rfq.budget.match(/₹([\d.]+)[KL]/);
    if (budget) {
      const value = parseFloat(budget[1]);
      const multiplier = budget[0].includes('L') ? 100000 : 1000;
      return sum + value * multiplier;
    }
    return sum;
  }, 0),
  averageResponses: Math.round(
    ALL_MOCK_RFQS.reduce((sum, rfq) => sum + rfq.responses, 0) / ALL_MOCK_RFQS.length
  ),
  activeLocations: [...new Set(ALL_MOCK_RFQS.map(rfq => rfq.location))].length,
  trendingCategories: ALL_CATEGORIES.filter(cat => cat.trending).length,
});
