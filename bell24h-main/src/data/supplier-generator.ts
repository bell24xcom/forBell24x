/**
 * Bell24H Comprehensive Supplier Generation System
 *
 * Generates 2,000+ realistic Indian supplier profiles across all 50 categories
 * Focus: Professional business data without images for enterprise marketplace
 */

import { ALL_CATEGORIES } from './categories';

export interface SupplierProfile {
  // Company Information
  companyId: string;
  companyName: string;
  establishedYear: number;
  companyType: 'Manufacturer' | 'Distributor' | 'Trader' | 'Exporter' | 'Service Provider';

  // Registration Details
  gstNumber: string;
  panNumber: string;
  cinNumber?: string;
  udyamNumber?: string; // MSME registration

  // Business Metrics
  annualTurnover: string;
  employeeCount: string;
  factorySize: string;
  productionCapacity: string;

  // Location & Contact
  address: {
    factory: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };

  contactPerson: {
    name: string;
    designation: string;
    phone: string;
    email: string;
    whatsapp: string;
    linkedin?: string;
  };

  // Business Capabilities
  categories: string[];
  subcategories: string[];
  specialization: string[];
  productRange: string[];
  servicesOffered: string[];
  exportCountries: string[];

  // Certifications & Quality
  certifications: string[];
  qualityControl: string;
  rdCapabilities: string;
  qualityManagement: string;

  // Financial & Terms
  paymentTerms: string[];
  creditFacility: string;
  minimumOrderValue: string;
  deliveryTime: string;
  shippingMethods: string[];

  // Marketplace Performance
  bellMantraRating: number;
  totalOrders: number;
  responseTime: string;
  deliveryRating: number;
  qualityRating: number;
  communicationRating: number;
  repeatCustomers: number;
  customerSatisfaction: number;

  // Competitive Advantages
  uniqueSellingPoints: string[];
  awardsRecognition: string[];
  keyClients: string[];
  testimonials: string[];

  // Operational Details
  workingHours: string;
  holidaySchedule: string;
  supportAvailability: string;
  languages: string[];

  // Additional Information
  companyDescription: string;
  vision: string;
  coreValues: string[];
  sustainability: string[];
  socialResponsibility: string;
}

export interface ProductListing {
  productId: string;
  productName: string;
  category: string;
  subcategory: string;
  productCode: string;
  supplierId: string;

  // Specifications
  technicalSpecs: {
    material?: string;
    dimensions?: string;
    weight?: string;
    capacity?: string;
    powerRating?: string;
    operatingConditions?: string;
    performance?: string;
    efficiency?: string;
  };

  // Business Details
  priceRange: string;
  minimumOrder: string;
  packagingDetails: string;
  deliveryTime: string;
  availableQuantity: string;

  // Quality & Compliance
  standards: string[];
  warranty: string;
  afterSalesService: string;
  installation: string;
  training: string;

  // Additional Information
  applications: string[];
  features: string[];
  advantages: string[];
  targetIndustries: string[];

  // Marketplace Data
  views: number;
  inquiries: number;
  orders: number;
  rating: number;
  reviews: number;
}

// Indian Business Data Templates
const INDIAN_CITIES = [
  { city: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
  { city: 'Delhi', state: 'Delhi', pincode: '110001' },
  { city: 'Bangalore', state: 'Karnataka', pincode: '560001' },
  { city: 'Chennai', state: 'Tamil Nadu', pincode: '600001' },
  { city: 'Hyderabad', state: 'Telangana', pincode: '500001' },
  { city: 'Pune', state: 'Maharashtra', pincode: '411001' },
  { city: 'Ahmedabad', state: 'Gujarat', pincode: '380001' },
  { city: 'Kolkata', state: 'West Bengal', pincode: '700001' },
  { city: 'Surat', state: 'Gujarat', pincode: '395001' },
  { city: 'Jaipur', state: 'Rajasthan', pincode: '302001' },
  { city: 'Lucknow', state: 'Uttar Pradesh', pincode: '226001' },
  { city: 'Kanpur', state: 'Uttar Pradesh', pincode: '208001' },
  { city: 'Nagpur', state: 'Maharashtra', pincode: '440001' },
  { city: 'Indore', state: 'Madhya Pradesh', pincode: '452001' },
  { city: 'Thane', state: 'Maharashtra', pincode: '400601' },
  { city: 'Bhopal', state: 'Madhya Pradesh', pincode: '462001' },
  { city: 'Visakhapatnam', state: 'Andhra Pradesh', pincode: '530001' },
  { city: 'Vadodara', state: 'Gujarat', pincode: '390001' },
  { city: 'Firozabad', state: 'Uttar Pradesh', pincode: '283203' },
  { city: 'Ludhiana', state: 'Punjab', pincode: '141001' },
  { city: 'Rajkot', state: 'Gujarat', pincode: '360001' },
  { city: 'Agra', state: 'Uttar Pradesh', pincode: '282001' },
  { city: 'Siliguri', state: 'West Bengal', pincode: '734001' },
  { city: 'Nashik', state: 'Maharashtra', pincode: '422001' },
  { city: 'Faridabad', state: 'Haryana', pincode: '121001' },
  { city: 'Patiala', state: 'Punjab', pincode: '147001' },
  { city: 'Ghaziabad', state: 'Uttar Pradesh', pincode: '201001' },
  { city: 'Ludhiana', state: 'Punjab', pincode: '141001' },
  { city: 'Coimbatore', state: 'Tamil Nadu', pincode: '641001' },
  { city: 'Madurai', state: 'Tamil Nadu', pincode: '625001' },
];

const COMPANY_SUFFIXES = [
  'Pvt Ltd',
  'Ltd',
  'LLP',
  'Industries',
  'Enterprises',
  'Corporation',
  'Manufacturing Co',
  'Trading Co',
  'Exports',
  'International',
  'Group',
];

const INDIAN_NAMES = {
  first: [
    'Rajesh',
    'Suresh',
    'Ramesh',
    'Mahesh',
    'Dinesh',
    'Naresh',
    'Mukesh',
    'Hitesh',
    'Amit',
    'Sumit',
    'Rohit',
    'Mohit',
    'Lalit',
    'Ajit',
    'Ravi',
    'Sanjay',
    'Vijay',
    'Manoj',
    'Anil',
    'Sunil',
    'Ashok',
    'Vinod',
    'Pramod',
    'Santosh',
    'Pradeep',
    'Sandeep',
    'Kuldeep',
    'Hardeep',
    'Amarjeet',
    'Jagjeet',
    'Manpreet',
    'Arjun',
    'Varun',
    'Tarun',
    'Karan',
    'Vikram',
    'Akram',
    'Param',
    'Shyam',
  ],
  last: [
    'Kumar',
    'Singh',
    'Sharma',
    'Gupta',
    'Agarwal',
    'Jain',
    'Bansal',
    'Mittal',
    'Shah',
    'Patel',
    'Modi',
    'Joshi',
    'Mehta',
    'Desai',
    'Thakkar',
    'Vora',
    'Reddy',
    'Rao',
    'Murthy',
    'Naidu',
    'Chandra',
    'Prasad',
    'Varma',
    'Sastry',
    'Khan',
    'Ahmed',
    'Ali',
    'Hassan',
    'Hussain',
    'Rahman',
    'Malik',
    'Sheikh',
  ],
};

const DESIGNATIONS = [
  'Managing Director',
  'General Manager',
  'Sales Manager',
  'Purchase Manager',
  'Business Development Manager',
  'Export Manager',
  'Operations Manager',
  'Production Manager',
  'Quality Manager',
  'Technical Manager',
  'Owner',
  'Partner',
  'Director',
  'Vice President',
  'Assistant Manager',
];

const CERTIFICATIONS_BY_CATEGORY = {
  Agriculture: ['ISO 9001:2015', 'BIS', 'FSSAI', 'Organic India', 'GlobalGAP'],
  Electronics: ['ISO 9001:2015', 'CE', 'ROHS', 'FCC', 'UL', 'BIS', 'IEC'],
  Automobile: ['ISO 9001:2015', 'TS 16949', 'CE', 'DOT', 'ARAI', 'BSVI'],
  Chemical: ['ISO 9001:2015', 'ISO 14001', 'OHSAS 18001', 'REACH', 'GMP'],
  Textiles: ['ISO 9001:2015', 'OEKO-TEX', 'GOTS', 'BCI', 'Cradle to Cradle'],
  Food: ['ISO 22000', 'HACCP', 'FSSAI', 'BRC', 'IFS', 'Halal', 'Kosher'],
  Default: ['ISO 9001:2015', 'CE', 'BIS', 'ISI'],
};

class SupplierGenerator {
  private supplierCounter = 1;
  private productCounter = 1;

  // Generate unique GST number
  generateGSTNumber(stateCode: number): string {
    const randomDigits = Math.floor(Math.random() * 900000) + 100000;
    const checkDigit = Math.floor(Math.random() * 10);
    const randomChar = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    return `${stateCode
      .toString()
      .padStart(2, '0')}ABCDE${randomDigits}${randomChar}1Z${checkDigit}`;
  }

  // Generate PAN number
  generatePANNumber(): string {
    const letters1 = Array(3)
      .fill(0)
      .map(() => String.fromCharCode(65 + Math.floor(Math.random() * 26)))
      .join('');
    const letters2 = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    const numbers = Math.floor(Math.random() * 9000) + 1000;
    const lastLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    return `${letters1}P${letters2}${numbers}${lastLetter}`;
  }

  // Generate CIN number for Pvt Ltd companies
  generateCINNumber(): string {
    const year = Math.floor(Math.random() * 25) + 1995;
    const stateCode = ['MH', 'DL', 'KA', 'TN', 'GJ'][Math.floor(Math.random() * 5)];
    const random = Math.floor(Math.random() * 900000) + 100000;
    return `U74999${stateCode}${year}PTC${random}`;
  }

  // Generate realistic company name
  generateCompanyName(category: string): string {
    const prefixes = [
      'Supreme',
      'Royal',
      'Elite',
      'Premium',
      'Advanced',
      'Modern',
      'Global',
      'Universal',
      'National',
      'International',
      'United',
      'Associated',
      'Integrated',
      'Comprehensive',
      'Strategic',
      'Dynamic',
      'Innovative',
    ];

    const categoryWords = {
      Agriculture: ['Agro', 'Farm', 'Crop', 'Harvest', 'Green', 'Organic'],
      Electronics: ['Electronics', 'Systems', 'Technologies', 'Components'],
      Automobile: ['Auto', 'Motors', 'Automotive', 'Vehicle', 'Parts'],
      Chemical: ['Chemicals', 'Pharma', 'Bio', 'Specialty', 'Fine'],
      Textiles: ['Textiles', 'Fabrics', 'Garments', 'Weaving', 'Spinning'],
      Food: ['Foods', 'Nutrition', 'Beverages', 'Processing', 'Fresh'],
      Default: ['Industries', 'Manufacturing', 'Production', 'Engineering'],
    };

    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const categoryWord = (categoryWords as any)[category] || categoryWords['Default'];
    const word = categoryWord[Math.floor(Math.random() * categoryWord.length)];
    const suffix = COMPANY_SUFFIXES[Math.floor(Math.random() * COMPANY_SUFFIXES.length)];

    return `${prefix} ${word} ${suffix}`;
  }

  // Generate contact person
  generateContactPerson(companyEmail: string): any {
    const firstName = INDIAN_NAMES.first[Math.floor(Math.random() * INDIAN_NAMES.first.length)];
    const lastName = INDIAN_NAMES.last[Math.floor(Math.random() * INDIAN_NAMES.last.length)];
    const designation = DESIGNATIONS[Math.floor(Math.random() * DESIGNATIONS.length)];

    const phone = `+91 ${Math.floor(Math.random() * 90000) + 10000} ${
      Math.floor(Math.random() * 90000) + 10000
    }`;
    const whatsapp = `+91 ${Math.floor(Math.random() * 900000000) + 100000000}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${
      companyEmail.split('@')[1]
    }`;

    return {
      name: `${firstName} ${lastName}`,
      designation,
      phone,
      email,
      whatsapp,
      linkedin: `linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}`,
    };
  }

  // Generate realistic business metrics
  generateBusinessMetrics(companyType: string): any {
    const turnoverRanges = {
      Manufacturer: [
        '₹5-10 Crore',
        '₹10-25 Crore',
        '₹25-50 Crore',
        '₹50-100 Crore',
        '₹100-250 Crore',
      ],
      Distributor: ['₹2-5 Crore', '₹5-15 Crore', '₹15-35 Crore', '₹35-75 Crore'],
      Trader: ['₹1-3 Crore', '₹3-8 Crore', '₹8-20 Crore', '₹20-50 Crore'],
      Exporter: ['₹5-15 Crore', '₹15-40 Crore', '₹40-100 Crore', '₹100-300 Crore'],
      'Service Provider': ['₹50 Lakh-2 Crore', '₹2-8 Crore', '₹8-25 Crore'],
    };

    const employeeCounts = ['10-25', '25-50', '50-100', '100-250', '250-500', '500-1000'];
    const factorySizes = [
      '2,000 sq ft',
      '5,000 sq ft',
      '10,000 sq ft',
      '25,000 sq ft',
      '50,000 sq ft',
      '1,00,000 sq ft',
    ];

    return {
      annualTurnover: (turnoverRanges as any)[companyType][
        Math.floor(Math.random() * (turnoverRanges as any)[companyType].length)
      ],
      employeeCount:
        employeeCounts[Math.floor(Math.random() * employeeCounts.length)] + ' employees',
      factorySize: factorySizes[Math.floor(Math.random() * factorySizes.length)],
      productionCapacity: this.generateProductionCapacity(),
    };
  }

  generateProductionCapacity(): string {
    const capacities = [
      '1,000 units/month',
      '5,000 units/month',
      '10,000 units/month',
      '25,000 units/month',
      '50,000 units/month',
      '1,00,000 units/month',
      '50 MT/month',
      '100 MT/month',
      '500 MT/month',
      '1,000 MT/month',
    ];
    return capacities[Math.floor(Math.random() * capacities.length)];
  }

  // Generate marketplace performance metrics
  generateMarketplaceMetrics(): any {
    return {
      bellMantraRating: Math.round((Math.random() * 2 + 7.5) * 10) / 10, // 7.5-9.5
      totalOrders: Math.floor(Math.random() * 1800) + 200, // 200-2000
      responseTime: ['Within 1 hour', 'Within 2 hours', 'Within 4 hours', 'Same day'][
        Math.floor(Math.random() * 4)
      ],
      deliveryRating: Math.round((Math.random() * 0.7 + 4.2) * 10) / 10, // 4.2-4.9
      qualityRating: Math.round((Math.random() * 1 + 4.0) * 10) / 10, // 4.0-5.0
      communicationRating: Math.round((Math.random() * 0.8 + 4.1) * 10) / 10, // 4.1-4.9
      repeatCustomers: Math.floor(Math.random() * 25) + 60, // 60-85%
      customerSatisfaction: Math.floor(Math.random() * 15) + 85, // 85-99%
    };
  }

  // Generate category-specific data
  generateCategorySpecificData(category: string, subcategory: string): any {
    const categoryData = {
      Agriculture: {
        specialization: ['Organic Farming', 'Precision Agriculture', 'Post-harvest Technology'],
        services: ['Installation', 'Training', 'Maintenance', 'Technical Support'],
        targetMarkets: ['Farmers', 'Agricultural Cooperatives', 'Government Schemes'],
      },
      Electronics: {
        specialization: ['PCB Design', 'Embedded Systems', 'IoT Solutions'],
        services: ['Custom Design', 'Prototyping', 'Testing', 'Certification'],
        targetMarkets: ['OEMs', 'System Integrators', 'Distributors'],
      },
      Automobile: {
        specialization: ['Precision Engineering', 'Quality Testing', 'Just-in-Time Delivery'],
        services: ['Design Support', 'Tool Development', 'Testing', 'Logistics'],
        targetMarkets: ['OEMs', 'Tier 1 Suppliers', 'Aftermarket'],
      },
      Chemical: {
        specialization: ['Synthesis', 'Purification', 'Quality Control'],
        services: ['Custom Synthesis', 'R&D Support', 'Regulatory Affairs'],
        targetMarkets: ['Pharmaceuticals', 'Agrochemicals', 'Industrial'],
      },
      Textiles: {
        specialization: ['Yarn Manufacturing', 'Fabric Weaving', 'Garment Production'],
        services: ['Design Support', 'Sample Development', 'Logistics'],
        targetMarkets: ['Fashion Brands', 'Retailers', 'Exporters'],
      },
    };

    return (
      (categoryData as any)[category] || {
        specialization: ['Manufacturing', 'Quality Control', 'Customer Service'],
        services: ['Technical Support', 'After-sales Service', 'Training'],
        targetMarkets: ['Industries', 'Distributors', 'End Users'],
      }
    );
  }

  // Generate single supplier profile
  generateSupplier(category: string, subcategory: string): SupplierProfile {
    const location = INDIAN_CITIES[Math.floor(Math.random() * INDIAN_CITIES.length)];
    const companyType = ['Manufacturer', 'Distributor', 'Trader', 'Exporter', 'Service Provider'][
      Math.floor(Math.random() * 5)
    ] as any;
    const companyName = this.generateCompanyName(category);
    const businessMetrics = this.generateBusinessMetrics(companyType);
    const marketplaceMetrics = this.generateMarketplaceMetrics();
    const categoryData = this.generateCategorySpecificData(category, subcategory);

    const companyId = `SUPP${this.supplierCounter.toString().padStart(6, '0')}`;
    this.supplierCounter++;

    const companyEmail = `info@${companyName.toLowerCase().replace(/[^a-z]/g, '')}.com`;
    const contactPerson = this.generateContactPerson(companyEmail);

    return {
      companyId,
      companyName,
      establishedYear: Math.floor(Math.random() * 25) + 1995,
      companyType,

      gstNumber: this.generateGSTNumber(Math.floor(Math.random() * 37) + 1),
      panNumber: this.generatePANNumber(),
      cinNumber: companyType === 'Manufacturer' ? this.generateCINNumber() : undefined,
      udyamNumber: `UDYAM-${location.state.substring(0, 2)}-${
        Math.floor(Math.random() * 900000) + 100000
      }`,

      ...businessMetrics,

      address: {
        factory: `Plot ${Math.floor(Math.random() * 500) + 1}, Industrial Area Phase ${
          Math.floor(Math.random() * 3) + 1
        }`,
        city: location.city,
        state: location.state,
        pincode: location.pincode,
        country: 'India',
      },

      contactPerson,

      categories: [category],
      subcategories: [subcategory],
      specialization: categoryData.specialization,
      productRange: this.generateProductRange(subcategory),
      servicesOffered: categoryData.services,
      exportCountries: this.generateExportCountries(),

      certifications:
        (CERTIFICATIONS_BY_CATEGORY as any)[category] || CERTIFICATIONS_BY_CATEGORY['Default'],
      qualityControl: 'In-house quality testing laboratory with latest equipment',
      rdCapabilities: 'Dedicated R&D team with modern testing facilities',
      qualityManagement: 'ISO 9001:2015 certified quality management system',

      paymentTerms: [
        '30% Advance, 70% before delivery',
        '50% Advance, 50% against documents',
        'LC at sight',
      ],
      creditFacility: `₹${Math.floor(Math.random() * 50) + 10} Lakh approved credit limit`,
      minimumOrderValue: `₹${Math.floor(Math.random() * 5) + 1} Lakh`,
      deliveryTime: `${Math.floor(Math.random() * 20) + 10}-${
        Math.floor(Math.random() * 10) + 25
      } days`,
      shippingMethods: ['Road Transport', 'Rail Transport', 'Air Cargo', 'Sea Freight'],

      ...marketplaceMetrics,

      uniqueSellingPoints: this.generateUSPs(category),
      awardsRecognition: this.generateAwards(),
      keyClients: this.generateKeyClients(category),
      testimonials: this.generateTestimonials(),

      workingHours: 'Monday to Saturday: 9:00 AM to 6:00 PM',
      holidaySchedule: 'Closed on Sundays and national holidays',
      supportAvailability: '24/7 technical support via phone and email',
      languages: ['English', 'Hindi', this.getRegionalLanguage(location.state)],

      companyDescription: this.generateCompanyDescription(companyName, category, companyType),
      vision: 'To be the leading provider of quality products and services in our industry',
      coreValues: ['Quality', 'Innovation', 'Customer Satisfaction', 'Integrity', 'Excellence'],
      sustainability: ['Eco-friendly manufacturing', 'Waste reduction', 'Energy efficiency'],
      socialResponsibility: 'Committed to community development and environmental protection',
    };
  }

  generateProductRange(subcategory: string): string[] {
    const ranges = {
      'Agriculture Equipment': ['Tractors', 'Harvesters', 'Tillers', 'Seeders', 'Sprayers'],
      'Electronics Components': ['Resistors', 'Capacitors', 'ICs', 'PCBs', 'Connectors'],
      'Auto Parts': ['Engine Parts', 'Brake Systems', 'Transmission', 'Electrical', 'Body Parts'],
      Chemicals: ['Basic Chemicals', 'Specialty Chemicals', 'Intermediates', 'Additives'],
      Default: ['Standard Products', 'Custom Solutions', 'Spare Parts', 'Accessories'],
    };

    return (ranges as any)[subcategory] || ranges['Default'];
  }

  generateExportCountries(): string[] {
    const countries = [
      'USA',
      'Germany',
      'UK',
      'France',
      'Italy',
      'Japan',
      'Australia',
      'Canada',
      'UAE',
      'Saudi Arabia',
    ];
    const count = Math.floor(Math.random() * 5) + 1;
    return countries.slice(0, count);
  }

  generateUSPs(category: string): string[] {
    const usps = [
      '25+ years of industry experience',
      'State-of-the-art manufacturing facility',
      'In-house R&D and quality testing',
      '99% on-time delivery record',
      'ISO certified quality management',
      'Competitive pricing with best quality',
      'Dedicated technical support team',
      'Pan-India service network',
      'Export to 15+ countries',
      'Zero-defect manufacturing process',
    ];

    return usps.slice(0, Math.floor(Math.random() * 4) + 3);
  }

  generateAwards(): string[] {
    const awards = [
      'Best Supplier Award 2023',
      'Quality Excellence Award',
      'Export Excellence Certificate',
      'Innovation in Manufacturing',
      'Customer Satisfaction Award',
      'Green Manufacturing Award',
    ];

    return awards.slice(0, Math.floor(Math.random() * 3) + 1);
  }

  generateKeyClients(category: string): string[] {
    const clients = {
      Agriculture: ['Mahindra Tractors', 'TAFE', 'Escorts', 'Sonalika', 'John Deere India'],
      Electronics: ['Tata Electronics', 'Wipro', 'HCL', 'Infosys', 'Samsung India'],
      Automobile: ['Tata Motors', 'Mahindra', 'Maruti Suzuki', 'Hyundai', 'Honda'],
      Chemical: ['Reliance Industries', 'ONGC', 'IOCL', 'Tata Chemicals', 'UPL'],
      Default: ['L&T', 'Godrej', 'ITC', 'Wipro', 'Infosys'],
    };

    const categoryClients = (clients as any)[category] || clients['Default'];
    return categoryClients.slice(0, Math.floor(Math.random() * 3) + 2);
  }

  generateTestimonials(): string[] {
    return [
      'Excellent quality products and timely delivery. Highly recommended supplier.',
      'Professional service and technical support. Been working with them for 5+ years.',
      'Consistent quality and competitive pricing. Reliable business partner.',
    ];
  }

  getRegionalLanguage(state: string): string {
    const languages: Record<string, string> = {
      Maharashtra: 'Marathi',
      Karnataka: 'Kannada',
      'Tamil Nadu': 'Tamil',
      Gujarat: 'Gujarati',
      Punjab: 'Punjabi',
      'West Bengal': 'Bengali',
      'Andhra Pradesh': 'Telugu',
      Telangana: 'Telugu',
      Rajasthan: 'Rajasthani',
      'Uttar Pradesh': 'Urdu',
      'Madhya Pradesh': 'Hindi',
      Haryana: 'Haryanvi',
    };

    return languages[state] || 'Hindi';
  }

  generateCompanyDescription(companyName: string, category: string, companyType: string): string {
    return `${companyName} is a leading ${companyType.toLowerCase()} specializing in ${category.toLowerCase()} products and solutions. With state-of-the-art manufacturing facilities and a dedicated team of professionals, we deliver high-quality products to customers across India and internationally. Our commitment to innovation, quality, and customer satisfaction has made us a trusted partner in the industry.`;
  }

  // Generate suppliers for a specific category
  generateSuppliersForCategory(category: any): SupplierProfile[] {
    const suppliers: SupplierProfile[] = [];

    category.subcategories.forEach((subcategory: string) => {
      const supplierCount = Math.floor(Math.random() * 6) + 5; // 5-10 suppliers per subcategory

      for (let i = 0; i < supplierCount; i++) {
        suppliers.push(this.generateSupplier(category.name, subcategory));
      }
    });

    return suppliers;
  }

  // Generate all suppliers for all categories
  generateAllSuppliers(): SupplierProfile[] {
    const allSuppliers: SupplierProfile[] = [];

    ALL_CATEGORIES.forEach(category => {
      const categorySuppliers = this.generateSuppliersForCategory(category);
      allSuppliers.push(...categorySuppliers);
    });

    return allSuppliers;
  }
}

// Export generator instance and functions
export const supplierGenerator = new SupplierGenerator();

export const generateSuppliersForCategory = (categoryName: string): SupplierProfile[] => {
  const category = ALL_CATEGORIES.find(cat => cat.name === categoryName);
  if (!category) return [];

  return supplierGenerator.generateSuppliersForCategory(category);
};

export const generateAllSuppliers = (): SupplierProfile[] => {
  return supplierGenerator.generateAllSuppliers();
};

// Generate demo suppliers for testing (first 5 categories)
export const generateDemoSuppliers = (): SupplierProfile[] => {
  const demoSuppliers: SupplierProfile[] = [];

  ALL_CATEGORIES.slice(0, 5).forEach(category => {
    const categorySuppliers = supplierGenerator.generateSuppliersForCategory(category);
    demoSuppliers.push(...categorySuppliers.slice(0, 10)); // 10 suppliers per demo category
  });

  return demoSuppliers;
};
