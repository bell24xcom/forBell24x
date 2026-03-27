'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  Grid,
  List,
  Star,
  MapPin,
  Phone,
  Mail,
  Globe,
  Shield,
  Award,
  TrendingUp,
  Package,
  Users,
  Calendar,
  Download,
  Share2,
  MessageCircle,
  Heart,
  Eye,
  ShoppingCart,
  CheckCircle,
  Clock,
  Building2,
  Factory,
  Truck,
  CreditCard,
  FileText,
  BarChart3,
  Zap,
  ArrowRight,
  ChevronDown,
  X,
  Plus,
  Edit,
  Trash2,
  Upload,
  Image as ImageIcon,
  Video,
  Mic,
  Camera,
} from 'lucide-react';

// Enhanced interfaces for comprehensive supplier showcase
interface Supplier {
  id: string;
  companyName: string;
  logo: string;
  coverImage: string;
  type: 'manufacturer' | 'supplier' | 'trader' | 'service_provider' | 'distributor';
  rating: number;
  reviewCount: number;
  verified: boolean;
  premium: boolean;
  location: {
    city: string;
    state: string;
    country: string;
    pincode: string;
  };
  contact: {
    phone: string;
    email: string;
    website: string;
    whatsapp: string;
  };
  businessInfo: {
    establishedYear: number;
    employeeCount: string;
    annualTurnover: string;
    gstNumber: string;
    cinNumber: string;
    panNumber: string;
    iecCode: string;
    msmeNumber: string;
  };
  capabilities: {
    categories: string[];
    subcategories: string[];
    specializations: string[];
    certifications: string[];
    manufacturing: {
      capacity: string;
      facilities: string[];
      qualityStandards: string[];
      machinery: string[];
    };
  };
  products: Product[];
  services: Service[];
  tradeData: {
    exportCountries: string[];
    importSources: string[];
    tradeVolume: string;
    experience: string;
    languages: string[];
  };
  financials: {
    creditRating: string;
    bankDetails: {
      bankName: string;
      accountNumber: string;
      ifscCode: string;
    };
    escrowEligible: boolean;
    invoiceDiscounting: boolean;
    creditLimit: string;
  };
  socialProof: {
    totalOrders: number;
    repeatCustomers: number;
    responseTime: string;
    onTimeDelivery: string;
    customerSatisfaction: number;
  };
  showcase: {
    videos: string[];
    images: string[];
    catalogs: string[];
    testimonials: Testimonial[];
    awards: Award[];
  };
  kycStatus: {
    gstVerified: boolean;
    panVerified: boolean;
    bankVerified: boolean;
    addressVerified: boolean;
    phoneVerified: boolean;
    emailVerified: boolean;
    documentsUploaded: string[];
  };
  lastActive: string;
  joinedDate: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  images: string[];
  videos: string[];
  price: {
    min: number;
    max: number;
    currency: string;
    unit: string;
  };
  minOrder: {
    quantity: number;
    unit: string;
  };
  category: string;
  subcategory: string;
  specifications: Record<string, string>;
  features: string[];
  tags: string[];
  stock: {
    available: boolean;
    quantity: number;
    leadTime: string;
  };
  supplier: {
    id: string;
    name: string;
    rating: number;
    verified: boolean;
  };
  metrics: {
    views: number;
    inquiries: number;
    orders: number;
    favorites: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface Service {
  id: string;
  name: string;
  description: string;
  images: string[];
  category: string;
  subcategory: string;
  pricing: {
    type: 'fixed' | 'hourly' | 'project' | 'custom';
    amount?: number;
    currency: string;
  };
  features: string[];
  deliverables: string[];
  timeline: string;
  supplier: {
    id: string;
    name: string;
    rating: number;
  };
  metrics: {
    views: number;
    inquiries: number;
    orders: number;
  };
}

interface Testimonial {
  id: string;
  customerName: string;
  company: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}

interface Award {
  id: string;
  name: string;
  issuer: string;
  year: number;
  category: string;
  image: string;
}

// Mock data generator for 400 categories
const generateMockData = () => {
  const categories = [
    'Steel & Metals', 'Electronics', 'Textiles', 'Chemicals', 'Automotive',
    'Construction', 'Food & Beverage', 'Pharmaceuticals', 'Machinery',
    'Plastics', 'Rubber', 'Paper', 'Glass', 'Ceramics', 'Wood',
    'Agriculture', 'Mining', 'Energy', 'Telecommunications', 'Healthcare',
    'Furniture', 'Packaging', 'Transportation', 'Aerospace', 'Marine',
    'Defense', 'Sports', 'Entertainment', 'Education', 'Real Estate',
    'Financial Services', 'IT Services', 'Consulting', 'Logistics',
    'Manufacturing', 'Retail', 'Wholesale', 'Import/Export', 'Trading',
    'Services', 'Technology', 'Innovation', 'Research', 'Development',
    'Engineering', 'Design', 'Marketing', 'Sales', 'Support', 'Maintenance'
  ];

  const subcategories = [
    'Raw Materials', 'Components', 'Finished Goods', 'Semi-Finished',
    'Custom Manufacturing', 'OEM', 'Aftermarket', 'Replacement Parts',
    'Accessories', 'Tools', 'Equipment', 'Machinery', 'Software',
    'Hardware', 'Services', 'Consulting', 'Maintenance', 'Installation',
    'Training', 'Support', 'Warranty', 'Extended Warranty', 'Upgrades',
    'Modifications', 'Customization', 'Design', 'Prototyping', 'Testing',
    'Quality Control', 'Certification', 'Compliance', 'Documentation',
    'Technical Support', 'Customer Service', 'Logistics', 'Shipping',
    'Warehousing', 'Distribution', 'Retail', 'Wholesale', 'B2B',
    'B2C', 'E-commerce', 'Online', 'Offline', 'Hybrid', 'Omnichannel'
  ];

  const suppliers: Supplier[] = [];
  const products: Product[] = [];

  // Generate suppliers for each category
  categories.forEach((category, categoryIndex) => {
    const subcats = subcategories.slice(0, 8); // 8 subcategories per category
    
    subcats.forEach((subcategory, subcatIndex) => {
      // Generate 50-100 suppliers per subcategory
      const supplierCount = Math.floor(Math.random() * 51) + 50; // 50-100
      
      for (let i = 0; i < supplierCount; i++) {
        const supplierId = `${categoryIndex}-${subcatIndex}-${i}`;
        const supplier: Supplier = {
          id: supplierId,
          companyName: `${category} ${subcategory} Supplier ${i + 1}`,
          logo: `/supplier-logos/${category.toLowerCase().replace(/\s+/g, '-')}-${i}.png`,
          coverImage: `/supplier-covers/${category.toLowerCase().replace(/\s+/g, '-')}-${i}.jpg`,
          type: ['manufacturer', 'supplier', 'trader', 'service_provider', 'distributor'][Math.floor(Math.random() * 5)],
          rating: Math.random() * 2 + 3, // 3-5
          reviewCount: Math.floor(Math.random() * 500) + 50,
          verified: Math.random() > 0.2, // 80% verified
          premium: Math.random() > 0.7, // 30% premium
          location: {
            city: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Pune', 'Hyderabad', 'Ahmedabad'][Math.floor(Math.random() * 8)],
            state: ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'West Bengal', 'Gujarat', 'Telangana', 'Rajasthan'][Math.floor(Math.random() * 8)],
            country: 'India',
            pincode: Math.floor(Math.random() * 900000) + 100000 + '',
          },
          contact: {
            phone: `+91-${Math.floor(Math.random() * 9000000000) + 1000000000}`,
            email: `contact@${category.toLowerCase().replace(/\s+/g, '')}${i}.com`,
            website: `www.${category.toLowerCase().replace(/\s+/g, '')}${i}.com`,
            whatsapp: `+91-${Math.floor(Math.random() * 9000000000) + 1000000000}`,
          },
          businessInfo: {
            establishedYear: Math.floor(Math.random() * 30) + 1990,
            employeeCount: ['1-10', '11-50', '51-200', '201-500', '500+'][Math.floor(Math.random() * 5)],
            annualTurnover: ['₹1-10 Cr', '₹10-50 Cr', '₹50-100 Cr', '₹100+ Cr'][Math.floor(Math.random() * 4)],
            gstNumber: `${Math.floor(Math.random() * 90) + 10}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(Math.random() * 9000) + 1000}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(Math.random() * 90) + 10}`,
            cinNumber: `U${Math.floor(Math.random() * 90) + 10}${Math.floor(Math.random() * 90) + 10}${Math.floor(Math.random() * 90) + 10}${Math.floor(Math.random() * 90) + 10}${Math.floor(Math.random() * 90) + 10}${Math.floor(Math.random() * 90) + 10}${Math.floor(Math.random() * 90) + 10}${Math.floor(Math.random() * 90) + 10}`,
            panNumber: `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(Math.random() * 9000) + 1000}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
            iecCode: `IEC${Math.floor(Math.random() * 900000000) + 100000000}`,
            msmeNumber: `MSME${Math.floor(Math.random() * 900000000) + 100000000}`,
          },
          capabilities: {
            categories: [category],
            subcategories: [subcategory],
            specializations: [`${subcategory} Specialization 1`, `${subcategory} Specialization 2`],
            certifications: ['ISO 9001:2015', 'BIS Certification', 'CE Marking', 'RoHS Compliance'],
            manufacturing: {
              capacity: `${Math.floor(Math.random() * 10000) + 1000} units/year`,
              facilities: ['Production Line 1', 'Quality Lab', 'Packaging Unit'],
              qualityStandards: ['ISO 9001', 'BIS', 'CE', 'RoHS'],
              machinery: ['CNC Machine', 'Quality Testing Equipment', 'Packaging Machine'],
            },
          },
          products: [],
          services: [],
          tradeData: {
            exportCountries: ['USA', 'UK', 'Germany', 'Japan', 'Australia'],
            importSources: ['China', 'Germany', 'Japan', 'USA', 'South Korea'],
            tradeVolume: `${Math.floor(Math.random() * 100) + 10} Cr`,
            experience: `${Math.floor(Math.random() * 20) + 5} years`,
            languages: ['English', 'Hindi', 'Local Language'],
          },
          financials: {
            creditRating: ['AAA', 'AA', 'A', 'BBB', 'BB'][Math.floor(Math.random() * 5)],
            bankDetails: {
              bankName: ['SBI', 'HDFC', 'ICICI', 'Axis', 'Kotak'][Math.floor(Math.random() * 5)],
              accountNumber: Math.floor(Math.random() * 9000000000) + 1000000000 + '',
              ifscCode: `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(Math.random() * 9000) + 1000}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
            },
            escrowEligible: Math.random() > 0.3,
            invoiceDiscounting: Math.random() > 0.4,
            creditLimit: `${Math.floor(Math.random() * 50) + 10} Lakhs`,
          },
          socialProof: {
            totalOrders: Math.floor(Math.random() * 1000) + 100,
            repeatCustomers: Math.floor(Math.random() * 200) + 50,
            responseTime: `${Math.floor(Math.random() * 4) + 1} hours`,
            onTimeDelivery: `${Math.floor(Math.random() * 20) + 80}%`,
            customerSatisfaction: Math.floor(Math.random() * 20) + 80,
          },
          showcase: {
            videos: [`/videos/${category.toLowerCase()}-${i}.mp4`],
            images: [`/images/${category.toLowerCase()}-${i}-1.jpg`, `/images/${category.toLowerCase()}-${i}-2.jpg`],
            catalogs: [`/catalogs/${category.toLowerCase()}-${i}.pdf`],
            testimonials: [],
            awards: [],
          },
          kycStatus: {
            gstVerified: Math.random() > 0.1,
            panVerified: Math.random() > 0.1,
            bankVerified: Math.random() > 0.2,
            addressVerified: Math.random() > 0.1,
            phoneVerified: Math.random() > 0.05,
            emailVerified: Math.random() > 0.05,
            documentsUploaded: ['GST Certificate', 'PAN Card', 'Bank Statement', 'Address Proof'],
          },
          lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          joinedDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        };

        // Generate products for this supplier
        const productCount = Math.floor(Math.random() * 20) + 5; // 5-25 products
        for (let j = 0; j < productCount; j++) {
          const product: Product = {
            id: `${supplierId}-product-${j}`,
            name: `${subcategory} Product ${j + 1}`,
            description: `High-quality ${subcategory.toLowerCase()} product for industrial applications.`,
            images: [`/products/${category.toLowerCase()}-${j}-1.jpg`, `/products/${category.toLowerCase()}-${j}-2.jpg`],
            videos: [`/product-videos/${category.toLowerCase()}-${j}.mp4`],
            price: {
              min: Math.floor(Math.random() * 10000) + 1000,
              max: Math.floor(Math.random() * 50000) + 10000,
              currency: 'INR',
              unit: 'piece',
            },
            minOrder: {
              quantity: Math.floor(Math.random() * 100) + 10,
              unit: 'pieces',
            },
            category,
            subcategory,
            specifications: {
              'Material': 'High-grade steel',
              'Dimensions': 'Customizable',
              'Weight': 'Varies',
              'Color': 'Standard',
              'Finish': 'Powder coated',
            },
            features: ['Durable', 'High Quality', 'Customizable', 'Fast Delivery'],
            tags: [category, subcategory, 'Industrial', 'Quality'],
            stock: {
              available: Math.random() > 0.1,
              quantity: Math.floor(Math.random() * 1000) + 100,
              leadTime: `${Math.floor(Math.random() * 14) + 1} days`,
            },
            supplier: {
              id: supplierId,
              name: supplier.companyName,
              rating: supplier.rating,
              verified: supplier.verified,
            },
            metrics: {
              views: Math.floor(Math.random() * 1000) + 100,
              inquiries: Math.floor(Math.random() * 50) + 10,
              orders: Math.floor(Math.random() * 20) + 5,
              favorites: Math.floor(Math.random() * 100) + 10,
            },
            createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          };
          products.push(product);
          supplier.products.push(product);
        }

        suppliers.push(supplier);
      }
    });
  });

  return { suppliers, products };
};

export default function SupplierShowcasePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [sortBy, setSortBy] = useState('rating');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [showSupplierModal, setShowSupplierModal] = useState(false);

  // Generate mock data
  useEffect(() => {
    setLoading(true);
    const { suppliers: mockSuppliers, products: mockProducts } = generateMockData();
    setSuppliers(mockSuppliers);
    setProducts(mockProducts);
    setLoading(false);
  }, []);

  // Get unique categories and subcategories
  const categories = useMemo(() => {
    const cats = [...new Set(suppliers.flatMap(s => s.capabilities.categories))];
    return cats.sort();
  }, [suppliers]);

  const subcategories = useMemo(() => {
    const subcats = [...new Set(suppliers.flatMap(s => s.capabilities.subcategories))];
    return subcats.sort();
  }, [suppliers]);

  const locations = useMemo(() => {
    const locs = [...new Set(suppliers.map(s => `${s.location.city}, ${s.location.state}`))];
    return locs.sort();
  }, [suppliers]);

  // Filter suppliers
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(supplier => {
      const matchesSearch = supplier.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          supplier.capabilities.specializations.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = !selectedCategory || supplier.capabilities.categories.includes(selectedCategory);
      const matchesSubcategory = !selectedSubcategory || supplier.capabilities.subcategories.includes(selectedSubcategory);
      const matchesLocation = !selectedLocation || `${supplier.location.city}, ${supplier.location.state}` === selectedLocation;
      const matchesType = !selectedType || supplier.type === selectedType;
      
      return matchesSearch && matchesCategory && matchesSubcategory && matchesLocation && matchesType;
    });
  }, [suppliers, searchTerm, selectedCategory, selectedSubcategory, selectedLocation, selectedType]);

  // Sort suppliers
  const sortedSuppliers = useMemo(() => {
    return [...filteredSuppliers].sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'reviews':
          return b.reviewCount - a.reviewCount;
        case 'orders':
          return b.socialProof.totalOrders - a.socialProof.totalOrders;
        case 'name':
          return a.companyName.localeCompare(b.companyName);
        case 'newest':
          return new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime();
        default:
          return 0;
      }
    });
  }, [filteredSuppliers, sortBy]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getSupplierTypeColor = (type: string) => {
    const colors = {
      manufacturer: 'bg-blue-100 text-blue-800',
      supplier: 'bg-green-100 text-green-800',
      trader: 'bg-purple-100 text-purple-800',
      service_provider: 'bg-orange-100 text-orange-800',
      distributor: 'bg-pink-100 text-pink-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading supplier showcase...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Supplier Product Showcase</h1>
              <p className="text-gray-600">
                {suppliers.length.toLocaleString()} suppliers across {categories.length} categories
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="w-4 h-4 mr-2" />
                Add Your Company
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search suppliers, products, or specializations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <select
                value={selectedSubcategory}
                onChange={(e) => setSelectedSubcategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Subcategories</option>
                {subcategories.map(subcategory => (
                  <option key={subcategory} value={subcategory}>{subcategory}</option>
                ))}
              </select>

              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Locations</option>
                {locations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>

              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Types</option>
                <option value="manufacturer">Manufacturer</option>
                <option value="supplier">Supplier</option>
                <option value="trader">Trader</option>
                <option value="service_provider">Service Provider</option>
                <option value="distributor">Distributor</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="rating">Sort by Rating</option>
                <option value="reviews">Sort by Reviews</option>
                <option value="orders">Sort by Orders</option>
                <option value="name">Sort by Name</option>
                <option value="newest">Sort by Newest</option>
              </select>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {sortedSuppliers.length.toLocaleString()} of {suppliers.length.toLocaleString()} suppliers
            {searchTerm && ` for "${searchTerm}"`}
            {selectedCategory && ` in ${selectedCategory}`}
            {selectedSubcategory && ` > ${selectedSubcategory}`}
          </p>
        </div>

        {/* Suppliers Grid/List */}
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {sortedSuppliers.map((supplier) => (
            <div
              key={supplier.id}
              className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer ${
                viewMode === 'list' ? 'flex' : ''
              }`}
              onClick={() => {
                setSelectedSupplier(supplier);
                setShowSupplierModal(true);
              }}
            >
              {viewMode === 'grid' ? (
                <>
                  {/* Cover Image */}
                  <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative">
                    <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                    <div className="absolute top-4 right-4 flex space-x-2">
                      {supplier.verified && (
                        <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center">
                          <Shield className="w-3 h-3 mr-1" />
                          Verified
                        </div>
                      )}
                      {supplier.premium && (
                        <div className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs flex items-center">
                          <Award className="w-3 h-3 mr-1" />
                          Premium
                        </div>
                      )}
                    </div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="text-xl font-bold">{supplier.companyName}</h3>
                      <p className="text-sm opacity-90">{supplier.location.city}, {supplier.location.state}</p>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(supplier.rating)
                                  ? 'text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                              fill={i < Math.floor(supplier.rating) ? 'currentColor' : 'none'}
                            />
                          ))}
                          <span className="ml-2 text-sm text-gray-600">
                            {supplier.rating.toFixed(1)} ({supplier.reviewCount} reviews)
                          </span>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${getSupplierTypeColor(supplier.type)}`}>
                        {supplier.type.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Building2 className="w-4 h-4 mr-2" />
                        <span>Est. {supplier.businessInfo.establishedYear}</span>
                        <span className="mx-2">•</span>
                        <span>{supplier.businessInfo.employeeCount} employees</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Package className="w-4 h-4 mr-2" />
                        <span>{supplier.products.length} products</span>
                        <span className="mx-2">•</span>
                        <span>{supplier.socialProof.totalOrders} orders</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        <span>{supplier.socialProof.onTimeDelivery} on-time delivery</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {supplier.capabilities.categories.map((category, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {category}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Eye className="w-4 h-4 mr-1" />
                          <span>{supplier.socialProof.totalOrders}</span>
                        </div>
                        <div className="flex items-center">
                          <MessageCircle className="w-4 h-4 mr-1" />
                          <span>{supplier.socialProof.responseTime}</span>
                        </div>
                      </div>
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        View Profile →
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                // List view
                <div className="flex w-full">
                  <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-600 flex-shrink-0"></div>
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold">{supplier.companyName}</h3>
                          {supplier.verified && (
                            <Shield className="w-4 h-4 text-green-500" />
                          )}
                          {supplier.premium && (
                            <Award className="w-4 h-4 text-yellow-500" />
                          )}
                        </div>
                        <p className="text-gray-600 mb-2">{supplier.location.city}, {supplier.location.state}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center">
                            <Star className="w-4 h-4 mr-1 text-yellow-400" />
                            <span>{supplier.rating.toFixed(1)} ({supplier.reviewCount})</span>
                          </div>
                          <span>•</span>
                          <span>{supplier.products.length} products</span>
                          <span>•</span>
                          <span>{supplier.socialProof.totalOrders} orders</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {supplier.capabilities.categories.map((category, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                            >
                              {category}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 text-xs rounded-full ${getSupplierTypeColor(supplier.type)}`}>
                          {supplier.type.replace('_', ' ')}
                        </span>
                        <p className="text-sm text-gray-600 mt-2">{supplier.socialProof.responseTime} response</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Load More */}
        {sortedSuppliers.length > 0 && (
          <div className="text-center mt-8">
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Load More Suppliers
            </button>
          </div>
        )}
      </div>

      {/* Supplier Modal */}
      {showSupplierModal && selectedSupplier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">{selectedSupplier.companyName}</h3>
                <button
                  onClick={() => setShowSupplierModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              {/* Supplier details would go here */}
              <p className="text-gray-600">Detailed supplier information and products would be displayed here.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
