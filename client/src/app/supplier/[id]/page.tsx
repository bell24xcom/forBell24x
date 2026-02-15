'use client';

import React, { useState } from 'react';
import { Star, MapPin, Phone, Mail, Globe, Shield, Award, TrendingUp, Package, Users, Calendar, Download, Share2, MessageCircle, Heart } from 'lucide-react';

interface SupplierProfile {
  id: string;
  type: 'manufacturer' | 'supplier' | 'trader' | 'service_provider';
  companyName: string;
  logo: string;
  coverImage: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  location: {
    city: string;
    state: string;
    country: string;
  };
  contact: {
    phone: string;
    email: string;
    website: string;
  };
  businessInfo: {
    establishedYear: number;
    employeeCount: string;
    annualTurnover: string;
    gstNumber: string;
    cinNumber: string;
  };
  capabilities: {
    categories: string[];
    specializations: string[];
    certifications: string[];
    manufacturing: {
      capacity: string;
      facilities: string[];
      qualityStandards: string[];
    };
  };
  products: Array<{
    id: string;
    name: string;
    image: string;
    price: string;
    minOrder: string;
    category: string;
  }>;
  services: Array<{
    id: string;
    name: string;
    description: string;
    image: string;
    portfolio: string[];
  }>;
  tradeData: {
    exportCountries: string[];
    importSources: string[];
    tradeVolume: string;
    experience: string;
  };
  financials: {
    creditRating: string;
    paymentTerms: string[];
    escrowEligible: boolean;
    invoiceDiscounting: boolean;
  };
}

export default function SupplierShowcasePage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isFavorited, setIsFavorited] = useState(false);

  // Sample supplier data
  const supplier: SupplierProfile = {
    id: params.id,
    type: "manufacturer",
    companyName: "Maharashtra Steel Industries Pvt Ltd",
    logo: "/supplier-logos/msi-logo.png",
    coverImage: "/supplier-covers/steel-facility.jpg",
    rating: 4.7,
    reviewCount: 342,
    verified: true,
    location: {
      city: "Pune",
      state: "Maharashtra",
      country: "India"
    },
    contact: {
      phone: "+91 20 2647 8900",
      email: "sales@maharashtrasteel.com",
      website: "www.maharashtrasteel.com"
    },
    businessInfo: {
      establishedYear: 1995,
      employeeCount: "500-1000",
      annualTurnover: "₹250 Crores",
      gstNumber: "27AABCM1234L1Z8",
      cinNumber: "U27100MH1995PTC123456"
    },
    capabilities: {
      categories: ["Steel & Metals", "Construction Materials", "Industrial Equipment"],
      specializations: ["TMT Bars", "Steel Sheets", "Custom Fabrication"],
      certifications: ["ISO 9001:2015", "BIS Certification", "CE Marking"],
      manufacturing: {
        capacity: "50,000 MT/year",
        facilities: ["Rolling Mill", "Wire Rod Mill", "Quality Lab"],
        qualityStandards: ["IS 1786", "IS 2062", "ASTM A615"]
      }
    },
    products: [
      {
        id: "P001",
        name: "TMT Bars Grade 500",
        image: "/products/tmt-bars.jpg",
        price: "₹42,000/MT",
        minOrder: "10 MT",
        category: "Steel & Metals"
      },
      {
        id: "P002", 
        name: "Steel Sheets 2mm",
        image: "/products/steel-sheets.jpg",
        price: "₹48,000/MT",
        minOrder: "5 MT",
        category: "Steel & Metals"
      }
    ],
    services: [
      {
        id: "S001",
        name: "Custom Fabrication",
        description: "Custom steel fabrication for industrial projects",
        image: "/services/fabrication.jpg",
        portfolio: ["Bridge Components", "Industrial Structures", "Custom Machinery Parts"]
      }
    ],
    tradeData: {
      exportCountries: ["UAE", "Bangladesh", "Sri Lanka", "Nepal"],
      importSources: ["China", "South Korea", "Japan"],
      tradeVolume: "₹150 Cr annually",
      experience: "25+ years"
    },
    financials: {
      creditRating: "AA",
      paymentTerms: ["30 Days Credit", "LC", "Advance Payment"],
      escrowEligible: true,
      invoiceDiscounting: true
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'manufacturer': return '🏭';
      case 'supplier': return '📦';
      case 'trader': return '🌐';
      case 'service_provider': return '🔧';
      default: return '🏢';
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'manufacturer': return 'Manufacturer';
      case 'supplier': return 'Supplier';
      case 'trader': return 'Trader';
      case 'service_provider': return 'Service Provider';
      default: return 'Business';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Section */}
      <div className="relative h-80 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="absolute inset-0 bg-black/30"></div>
        <img 
          src={supplier.coverImage} 
          alt="Company Cover"
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto px-4 pb-8 w-full">
            <div className="flex items-end gap-6">
              {/* Company Logo */}
              <div className="w-32 h-32 bg-white rounded-2xl p-4 shadow-lg">
                <img 
                  src={supplier.logo} 
                  alt="Company Logo"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.src = '/default-company-logo.png';
                  }}
                />
              </div>
              
              {/* Company Info */}
              <div className="text-white flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">{supplier.companyName}</h1>
                  {supplier.verified && (
                    <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                      <Shield className="w-4 h-4" />
                      Verified
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-4 mb-2">
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                    {getTypeIcon(supplier.type)} {getTypeName(supplier.type)}
                  </span>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{supplier.location.city}, {supplier.location.state}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{supplier.rating} ({supplier.reviewCount} reviews)</span>
                  </div>
                </div>
                
                <div className="text-sm opacity-90">
                  Established {supplier.businessInfo.establishedYear} • {supplier.businessInfo.employeeCount} employees • {supplier.businessInfo.annualTurnover} turnover
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setIsFavorited(!isFavorited)}
                  className={`p-3 rounded-lg transition-all ${
                    isFavorited ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
                </button>
                <button className="bg-white/20 text-white px-4 py-3 rounded-lg hover:bg-white/30 transition-all flex items-center gap-2">
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
                <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-all font-semibold">
                  Contact Supplier
                </button>
                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all font-semibold">
                  Create RFQ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'products', label: 'Products', icon: '📦' },
              { id: 'services', label: 'Services', icon: '🔧' },
              { id: 'capabilities', label: 'Capabilities', icon: '⚡' },
              { id: 'trade', label: 'Trade Data', icon: '🌐' },
              { id: 'financials', label: 'Financials', icon: '💰' },
              { id: 'reviews', label: 'Reviews', icon: '⭐' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-all ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Company Stats */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-bold mb-4">Company Overview</h3>
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{supplier.businessInfo.annualTurnover}</div>
                      <div className="text-sm text-gray-600">Annual Turnover</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{supplier.businessInfo.employeeCount}</div>
                      <div className="text-sm text-gray-600">Employees</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{supplier.tradeData.experience}</div>
                      <div className="text-sm text-gray-600">Experience</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{supplier.capabilities.manufacturing.capacity}</div>
                      <div className="text-sm text-gray-600">Capacity</div>
                    </div>
                  </div>
                </div>

                {/* Certifications */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-bold mb-4">Certifications & Standards</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    {supplier.capabilities.certifications.map((cert, index) => (
                      <div key={index} className="flex items-center gap-3 p-4 border rounded-lg">
                        <Award className="w-8 h-8 text-yellow-500" />
                        <div>
                          <div className="font-semibold">{cert}</div>
                          <div className="text-sm text-gray-600">Certified</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Package className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-semibold">New Product Added</div>
                        <div className="text-sm text-gray-600">Added TMT Bars Grade 500 to catalog</div>
                        <div className="text-xs text-gray-500">2 days ago</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <MessageCircle className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-semibold">RFQ Responded</div>
                        <div className="text-sm text-gray-600">Responded to Steel Bars RFQ from Mumbai Constructions</div>
                        <div className="text-xs text-gray-500">5 days ago</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'products' && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold">Product Catalog</h3>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all">
                    Request Custom Quote
                  </button>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {supplier.products.map((product) => (
                    <div key={product.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-all">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/default-product.png';
                        }}
                      />
                      <div className="p-4">
                        <h4 className="font-semibold text-lg mb-2">{product.name}</h4>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-2xl font-bold text-green-600">{product.price}</span>
                          <span className="text-sm text-gray-600">MOQ: {product.minOrder}</span>
                        </div>
                        <div className="flex gap-2">
                          <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-all">
                            Get Quote
                          </button>
                          <button className="flex-1 border border-blue-600 text-blue-600 py-2 rounded-lg hover:bg-blue-50 transition-all">
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'financials' && (
              <div className="space-y-6">
                {/* Credit Rating */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-bold mb-4">Financial Standing</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Credit Rating</h4>
                      <div className="flex items-center gap-3">
                        <div className="text-3xl font-bold text-green-600">{supplier.financials.creditRating}</div>
                        <div>
                          <div className="text-sm text-gray-600">Excellent Credit</div>
                          <div className="text-xs text-gray-500">Updated last month</div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">Financial Services</h4>
                      <div className="space-y-2">
                        {supplier.financials.escrowEligible && (
                          <div className="flex items-center gap-2 text-green-600">
                            <Shield className="w-4 h-4" />
                            <span className="text-sm">Escrow Eligible (₹5L+ transactions)</span>
                          </div>
                        )}
                        {supplier.financials.invoiceDiscounting && (
                          <div className="flex items-center gap-2 text-blue-600">
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-sm">Invoice Discounting Available</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Terms */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-bold mb-4">Payment Terms</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    {supplier.financials.paymentTerms.map((term, index) => (
                      <div key={index} className="p-4 border rounded-lg text-center">
                        <div className="font-semibold">{term}</div>
                        <div className="text-sm text-gray-600 mt-1">Available</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fintech Integration */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200 p-6">
                  <h3 className="text-xl font-bold mb-4">🏦 Financial Services Integration</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg p-4">
                      <h4 className="font-semibold mb-2">M1 Exchange</h4>
                      <p className="text-sm text-gray-600 mb-3">Invoice discounting and supply chain finance</p>
                      <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-all">
                        Apply for Finance
                      </button>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Kreed</h4>
                      <p className="text-sm text-gray-600 mb-3">Working capital and trade finance solutions</p>
                      <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-all">
                        Get Credit Line
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{supplier.contact.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{supplier.contact.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-blue-600">{supplier.contact.website}</span>
                </div>
              </div>
            </div>

            {/* Business Details */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold mb-4">Business Details</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-600">GST Number:</span>
                  <div className="font-mono">{supplier.businessInfo.gstNumber}</div>
                </div>
                <div>
                  <span className="text-gray-600">CIN Number:</span>
                  <div className="font-mono">{supplier.businessInfo.cinNumber}</div>
                </div>
                <div>
                  <span className="text-gray-600">Established:</span>
                  <div>{supplier.businessInfo.establishedYear}</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-all font-semibold">
                  Send Message
                </button>
                <button className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-all font-semibold">
                  Create RFQ
                </button>
                <button className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-all">
                  Download Profile
                </button>
                <button className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-all">
                  Report Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 