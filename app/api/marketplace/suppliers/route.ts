import { NextRequest, NextResponse } from 'next/server';

// Enhanced suppliers data with live information
const suppliers = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    company: 'Steel Works India Ltd',
    category: 'manufacturing',
    location: 'Mumbai, Maharashtra',
    rating: 4.8,
    verified: true,
    products: ['Steel Pipes', 'Steel Sheets', 'Steel Rods', 'Steel Plates'],
    gstNumber: '27AABCU9603R1ZX',
    establishedYear: 2015,
    employeeCount: '50-100',
    certifications: ['ISO 9001:2015', 'GST Registered', 'MSME Certified'],
    responseTime: '1.2 hours',
    orderValue: '₹2.5M+',
    lastActive: '2 hours ago',
    profileImage: '/avatars/supplier1.jpg',
    description: 'Leading manufacturer of high-quality steel products with 8+ years of experience',
    specialties: ['Carbon Steel', 'Stainless Steel', 'Alloy Steel'],
    minimumOrder: '₹50,000',
    deliveryTime: '7-14 days'
  },
  {
    id: '2',
    name: 'Priya Sharma',
    company: 'Textile Solutions Pvt Ltd',
    category: 'textiles',
    location: 'Surat, Gujarat',
    rating: 4.6,
    verified: true,
    products: ['Cotton Fabric', 'Silk Material', 'Synthetic Textiles', 'Denim'],
    gstNumber: '24AABCU9603R1ZY',
    establishedYear: 2012,
    employeeCount: '100-200',
    certifications: ['OEKO-TEX Standard 100', 'GST Registered', 'Export House'],
    responseTime: '0.8 hours',
    orderValue: '₹1.8M+',
    lastActive: '30 minutes ago',
    profileImage: '/avatars/supplier2.jpg',
    description: 'Premium textile manufacturer specializing in sustainable and eco-friendly fabrics',
    specialties: ['Organic Cotton', 'Silk Weaving', 'Digital Printing'],
    minimumOrder: '₹25,000',
    deliveryTime: '5-10 days'
  },
  {
    id: '3',
    name: 'Amit Patel',
    company: 'ElectroTech Components',
    category: 'electronics',
    location: 'Bangalore, Karnataka',
    rating: 4.9,
    verified: true,
    products: ['Circuit Boards', 'Electronic Components', 'LED Lights', 'Sensors'],
    gstNumber: '29AABCU9603R1ZZ',
    establishedYear: 2018,
    employeeCount: '25-50',
    certifications: ['ISO 14001:2015', 'GST Registered', 'Startup India'],
    responseTime: '0.5 hours',
    orderValue: '₹3.2M+',
    lastActive: '15 minutes ago',
    profileImage: '/avatars/supplier3.jpg',
    description: 'Innovative electronics manufacturer focused on IoT and smart technology solutions',
    specialties: ['IoT Devices', 'PCB Assembly', 'LED Technology'],
    minimumOrder: '₹10,000',
    deliveryTime: '3-7 days'
  },
  {
    id: '4',
    name: 'Sunita Singh',
    company: 'Construction Materials Co',
    category: 'construction',
    location: 'Delhi, NCR',
    rating: 4.5,
    verified: true,
    products: ['Cement', 'Steel Bars', 'Bricks', 'Tiles'],
    gstNumber: '07AABCU9603R1ZA',
    establishedYear: 2010,
    employeeCount: '200+',
    certifications: ['BIS Certified', 'GST Registered', 'Quality Assurance'],
    responseTime: '2.1 hours',
    orderValue: '₹5.8M+',
    lastActive: '1 hour ago',
    profileImage: '/avatars/supplier4.jpg',
    description: 'Established construction materials supplier serving major infrastructure projects',
    specialties: ['Ready Mix Concrete', 'Structural Steel', 'Building Materials'],
    minimumOrder: '₹1,00,000',
    deliveryTime: '10-15 days'
  },
  {
    id: '5',
    name: 'Vikram Reddy',
    company: 'ChemCorp Industries',
    category: 'chemicals',
    location: 'Chennai, Tamil Nadu',
    rating: 4.7,
    verified: true,
    products: ['Industrial Chemicals', 'Solvents', 'Raw Materials', 'Specialty Chemicals'],
    gstNumber: '33AABCU9603R1ZB',
    establishedYear: 2016,
    employeeCount: '50-100',
    certifications: ['ISO 45001:2018', 'GST Registered', 'Environmental Clearance'],
    responseTime: '3.2 hours',
    orderValue: '₹4.1M+',
    lastActive: '3 hours ago',
    profileImage: '/avatars/supplier5.jpg',
    description: 'Specialized chemical manufacturer with focus on industrial and specialty chemicals',
    specialties: ['Organic Chemicals', 'Inorganic Compounds', 'Custom Synthesis'],
    minimumOrder: '₹75,000',
    deliveryTime: '7-12 days'
  },
  {
    id: '6',
    name: 'Meera Joshi',
    company: 'Machine Works Ltd',
    category: 'machinery',
    location: 'Pune, Maharashtra',
    rating: 4.8,
    verified: true,
    products: ['CNC Machines', 'Industrial Equipment', 'Spare Parts', 'Automation Systems'],
    gstNumber: '27AABCU9603R1ZC',
    establishedYear: 2014,
    employeeCount: '100-200',
    certifications: ['CE Marked', 'GST Registered', 'ISO 9001:2015'],
    responseTime: '2.8 hours',
    orderValue: '₹6.7M+',
    lastActive: '45 minutes ago',
    profileImage: '/avatars/supplier6.jpg',
    description: 'Precision machinery manufacturer with advanced CNC and automation capabilities',
    specialties: ['CNC Machining', 'Industrial Automation', 'Custom Machinery'],
    minimumOrder: '₹2,00,000',
    deliveryTime: '15-30 days'
  },
  {
    id: '7',
    name: 'Arjun Gupta',
    company: 'Packaging Solutions Inc',
    category: 'packaging',
    location: 'Ahmedabad, Gujarat',
    rating: 4.4,
    verified: true,
    products: ['Cardboard Boxes', 'Plastic Packaging', 'Labels', 'Corrugated Sheets'],
    gstNumber: '24AABCU9603R1ZD',
    establishedYear: 2019,
    employeeCount: '25-50',
    certifications: ['FSC Certified', 'GST Registered', 'Eco-Friendly'],
    responseTime: '1.2 hours',
    orderValue: '₹1.2M+',
    lastActive: '1 hour ago',
    profileImage: '/avatars/supplier7.jpg',
    description: 'Sustainable packaging solutions with focus on eco-friendly materials',
    specialties: ['Biodegradable Packaging', 'Custom Printing', 'Bulk Packaging'],
    minimumOrder: '₹15,000',
    deliveryTime: '3-5 days'
  },
  {
    id: '8',
    name: 'Deepika Agarwal',
    company: 'AutoParts Direct',
    category: 'automotive',
    location: 'Gurgaon, Haryana',
    rating: 4.6,
    verified: true,
    products: ['Engine Parts', 'Brake Components', 'Electrical Parts', 'Body Parts'],
    gstNumber: '06AABCU9603R1ZE',
    establishedYear: 2017,
    employeeCount: '50-100',
    certifications: ['OEM Certified', 'GST Registered', 'Quality Assured'],
    responseTime: '1.8 hours',
    orderValue: '₹3.9M+',
    lastActive: '2 hours ago',
    profileImage: '/avatars/supplier8.jpg',
    description: 'Automotive parts supplier with OEM quality standards and competitive pricing',
    specialties: ['OEM Parts', 'Aftermarket Components', 'Custom Fabrication'],
    minimumOrder: '₹30,000',
    deliveryTime: '5-8 days'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const verified = searchParams.get('verified');
    const minRating = searchParams.get('minRating');
    const sortBy = searchParams.get('sortBy') || 'rating';
    const limit = searchParams.get('limit');
    
    let filteredSuppliers = [...suppliers];
    
    // Filter by category
    if (category && category !== 'all') {
      filteredSuppliers = filteredSuppliers.filter(supplier => supplier.category === category);
    }
    
    // Filter by search term
    if (search) {
      const searchLower = search.toLowerCase();
      filteredSuppliers = filteredSuppliers.filter(supplier => 
        supplier.name.toLowerCase().includes(searchLower) ||
        supplier.company.toLowerCase().includes(searchLower) ||
        supplier.products.some(product => product.toLowerCase().includes(searchLower)) ||
        supplier.specialties.some(specialty => specialty.toLowerCase().includes(searchLower))
      );
    }
    
    // Filter by verification status
    if (verified === 'true') {
      filteredSuppliers = filteredSuppliers.filter(supplier => supplier.verified);
    }
    
    // Filter by minimum rating
    if (minRating) {
      const minRatingNum = parseFloat(minRating);
      filteredSuppliers = filteredSuppliers.filter(supplier => supplier.rating >= minRatingNum);
    }
    
    // Sort suppliers
    if (sortBy === 'rating') {
      filteredSuppliers.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'responseTime') {
      filteredSuppliers.sort((a, b) => parseFloat(a.responseTime) - parseFloat(b.responseTime));
    } else if (sortBy === 'establishedYear') {
      filteredSuppliers.sort((a, b) => b.establishedYear - a.establishedYear);
    } else if (sortBy === 'orderValue') {
      filteredSuppliers.sort((a, b) => parseFloat(b.orderValue.replace(/[₹,M+]/g, '')) - parseFloat(a.orderValue.replace(/[₹,M+]/g, '')));
    }
    
    // Apply limit
    if (limit) {
      filteredSuppliers = filteredSuppliers.slice(0, parseInt(limit));
    }
    
    return NextResponse.json({
      success: true,
      suppliers: filteredSuppliers,
      total: filteredSuppliers.length,
      filters: {
        category,
        search,
        verified,
        minRating,
        sortBy
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch suppliers' },
      { status: 500 }
    );
  }
}
