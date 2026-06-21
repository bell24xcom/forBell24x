'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Users, TrendingUp, Plus } from 'lucide-react';

interface Category {
  name: string;
  suppliers: number;
  subcategories: string[];
  icon: string;
  rfqCount?: number;
  avgPrice?: string;
}

interface CategoryGroup {
  title: string;
  categories: Category[];
}

const categoryData: CategoryGroup[] = [
  {
    title: "Raw Materials & Metals",
    categories: [
      { name: "Steel & Metals", suppliers: 1200, subcategories: ["TMT Bars", "Steel Sheets", "Aluminum", "Copper", "Brass"], icon: "🔩", rfqCount: 45, avgPrice: "₹Contact" },
      { name: "Construction Materials", suppliers: 800, subcategories: ["Cement", "Bricks", "Sand", "Tiles", "Pipes"], icon: "🏗️", rfqCount: 32, avgPrice: "₹Contact" },
      { name: "Chemicals & Polymers", suppliers: 950, subcategories: ["Industrial Chemicals", "Plastics", "Rubber", "Adhesives"], icon: "🧪", rfqCount: 28, avgPrice: "₹Contact" },
      { name: "Textiles & Fabrics", suppliers: 1100, subcategories: ["Cotton", "Synthetic", "Wool", "Silk", "Jute"], icon: "🧵", rfqCount: 67, avgPrice: "₹Contact" },
      { name: "Paper & Packaging", suppliers: 650, subcategories: ["Corrugated", "Kraft Paper", "Labels", "Tapes"], icon: "📦", rfqCount: 23, avgPrice: "₹Contact" }
    ]
  },
  {
    title: "Industrial Equipment",
    categories: [
      { name: "Manufacturing Machinery", suppliers: 1500, subcategories: ["CNC Machines", "Lathes", "Mills", "Presses"], icon: "⚙️", rfqCount: 89, avgPrice: "₹Contact" },
      { name: "Automation & Robotics", suppliers: 750, subcategories: ["Robotic Arms", "Sensors", "Controllers", "Vision Systems"], icon: "🤖", rfqCount: 34, avgPrice: "₹Contact" },
      { name: "Power & Energy", suppliers: 900, subcategories: ["Generators", "Transformers", "Solar Panels", "Batteries"], icon: "⚡", rfqCount: 56, avgPrice: "₹Contact" },
      { name: "HVAC & Climate Control", suppliers: 600, subcategories: ["Air Conditioners", "Ventilation", "Heating", "Cooling"], icon: "❄️", rfqCount: 41, avgPrice: "₹Contact" },
      { name: "Material Handling", suppliers: 850, subcategories: ["Conveyors", "Cranes", "Forklifts", "Hoists"], icon: "🏗️", rfqCount: 38, avgPrice: "₹Contact" }
    ]
  },
  {
    title: "Electronics & Technology",
    categories: [
      { name: "Electronic Components", suppliers: 1800, subcategories: ["Semiconductors", "Resistors", "Capacitors", "PCBs"], icon: "🔌", rfqCount: 156, avgPrice: "₹Contact" },
      { name: "Computing & IT", suppliers: 1200, subcategories: ["Servers", "Laptops", "Networking", "Storage"], icon: "💻", rfqCount: 98, avgPrice: "₹Contact" },
      { name: "Telecommunications", suppliers: 700, subcategories: ["Mobile Devices", "Network Equipment", "Satellite", "Fiber Optics"], icon: "📱", rfqCount: 45, avgPrice: "₹Contact" },
      { name: "IoT & Smart Devices", suppliers: 550, subcategories: ["Sensors", "Controllers", "Smart Home", "Wearables"], icon: "🌐", rfqCount: 67, avgPrice: "₹Contact" },
      { name: "Audio & Video", suppliers: 400, subcategories: ["Speakers", "Microphones", "Cameras", "Displays"], icon: "📺", rfqCount: 34, avgPrice: "₹Contact" }
    ]
  },
  {
    title: "Automotive & Transportation",
    categories: [
      { name: "Automotive Parts", suppliers: 1600, subcategories: ["Engine Parts", "Brake Systems", "Suspension", "Electrical"], icon: "🚗", rfqCount: 123, avgPrice: "₹Contact" },
      { name: "Commercial Vehicles", suppliers: 450, subcategories: ["Trucks", "Buses", "Tractors", "Trailers"], icon: "🚛", rfqCount: 56, avgPrice: "₹Contact" },
      { name: "Aerospace & Aviation", suppliers: 300, subcategories: ["Aircraft Parts", "Avionics", "Ground Support", "Simulation"], icon: "✈️", rfqCount: 23, avgPrice: "₹Contact" },
      { name: "Marine & Shipping", suppliers: 250, subcategories: ["Ship Parts", "Navigation", "Safety Equipment", "Port Machinery"], icon: "🚢", rfqCount: 18, avgPrice: "₹Contact" },
      { name: "Railway Equipment", suppliers: 180, subcategories: ["Locomotives", "Coaches", "Signaling", "Track Equipment"], icon: "🚆", rfqCount: 12, avgPrice: "₹Contact" }
    ]
  },
  {
    title: "Healthcare & Medical",
    categories: [
      { name: "Medical Devices", suppliers: 800, subcategories: ["Diagnostic Equipment", "Surgical Tools", "Monitoring", "Therapy"], icon: "🏥", rfqCount: 78, avgPrice: "₹Contact" },
      { name: "Pharmaceuticals", suppliers: 1200, subcategories: ["Active Ingredients", "Excipients", "Formulations", "Packaging"], icon: "💊", rfqCount: 89, avgPrice: "₹Contact" },
      { name: "Laboratory Equipment", suppliers: 600, subcategories: ["Analytical Instruments", "Glassware", "Reagents", "Safety"], icon: "🧬", rfqCount: 45, avgPrice: "₹Contact" },
      { name: "Dental Equipment", suppliers: 350, subcategories: ["Dental Chairs", "Handpieces", "Imaging", "Sterilization"], icon: "🦷", rfqCount: 34, avgPrice: "₹Contact" },
      { name: "Veterinary Supplies", suppliers: 280, subcategories: ["Animal Health", "Surgical Equipment", "Diagnostics", "Medicines"], icon: "🐾", rfqCount: 23, avgPrice: "₹Contact" }
    ]
  },
  {
    title: "Food & Agriculture",
    categories: [
      { name: "Agricultural Machinery", suppliers: 950, subcategories: ["Tractors", "Harvesters", "Irrigation", "Processing"], icon: "🚜", rfqCount: 67, avgPrice: "₹Contact" },
      { name: "Food Processing", suppliers: 1100, subcategories: ["Baking Equipment", "Packaging", "Refrigeration", "Quality Control"], icon: "🍞", rfqCount: 89, avgPrice: "₹Contact" },
      { name: "Beverage Production", suppliers: 650, subcategories: ["Brewing", "Bottling", "Filtration", "Carbonation"], icon: "🍺", rfqCount: 45, avgPrice: "₹Contact" },
      { name: "Dairy Equipment", suppliers: 420, subcategories: ["Milking Machines", "Pasteurization", "Cheese Making", "Storage"], icon: "🥛", rfqCount: 34, avgPrice: "₹Contact" },
      { name: "Seeds & Fertilizers", suppliers: 780, subcategories: ["Hybrid Seeds", "Organic Fertilizers", "Pesticides", "Growth Promoters"], icon: "🌱", rfqCount: 56, avgPrice: "₹Contact" }
    ]
  },
  {
    title: "Textiles & Apparel",
    categories: [
      { name: "Fabric Manufacturing", suppliers: 1400, subcategories: ["Cotton", "Synthetic", "Wool", "Silk", "Blends"], icon: "🧵", rfqCount: 134, avgPrice: "₹Contact" },
      { name: "Garment Production", suppliers: 2200, subcategories: ["Cutting", "Sewing", "Finishing", "Quality Control"], icon: "👕", rfqCount: 189, avgPrice: "₹Contact" },
      { name: "Footwear & Leather", suppliers: 850, subcategories: ["Shoes", "Bags", "Belts", "Accessories"], icon: "👟", rfqCount: 67, avgPrice: "₹Contact" },
      { name: "Home Textiles", suppliers: 720, subcategories: ["Bedding", "Curtains", "Towels", "Carpets"], icon: "🛏️", rfqCount: 45, avgPrice: "₹Contact" },
      { name: "Technical Textiles", suppliers: 380, subcategories: ["Industrial Fabrics", "Medical Textiles", "Sports", "Protective"], icon: "🛡️", rfqCount: 28, avgPrice: "₹Contact" }
    ]
  },
  {
    title: "Construction & Real Estate",
    categories: [
      { name: "Building Materials", suppliers: 1800, subcategories: ["Cement", "Steel", "Bricks", "Tiles", "Paints"], icon: "🏠", rfqCount: 167, avgPrice: "₹Contact" },
      { name: "Construction Equipment", suppliers: 1200, subcategories: ["Excavators", "Cranes", "Concrete Mixers", "Scaffolding"], icon: "🏗️", rfqCount: 98, avgPrice: "₹Contact" },
      { name: "Electrical & Plumbing", suppliers: 950, subcategories: ["Wiring", "Switches", "Pipes", "Fittings"], icon: "🔌", rfqCount: 76, avgPrice: "₹Contact" },
      { name: "Interior Design", suppliers: 680, subcategories: ["Furniture", "Lighting", "Flooring", "Decor"], icon: "🪑", rfqCount: 54, avgPrice: "₹Contact" },
      { name: "Smart Building", suppliers: 320, subcategories: ["Automation", "Security", "Energy Management", "IoT"], icon: "🏢", rfqCount: 23, avgPrice: "₹Contact" }
    ]
  },
  {
    title: "Energy & Utilities",
    categories: [
      { name: "Renewable Energy", suppliers: 850, subcategories: ["Solar Panels", "Wind Turbines", "Biomass", "Hydroelectric"], icon: "☀️", rfqCount: 67, avgPrice: "₹Contact" },
      { name: "Oil & Gas Equipment", suppliers: 650, subcategories: ["Drilling Equipment", "Pipelines", "Refining", "Storage"], icon: "⛽", rfqCount: 45, avgPrice: "₹Contact" },
      { name: "Water Treatment", suppliers: 480, subcategories: ["Filtration", "Purification", "Desalination", "Wastewater"], icon: "💧", rfqCount: 34, avgPrice: "₹Contact" },
      { name: "Waste Management", suppliers: 320, subcategories: ["Recycling", "Incineration", "Composting", "Landfill"], icon: "♻️", rfqCount: 23, avgPrice: "₹Contact" },
      { name: "Smart Grid", suppliers: 280, subcategories: ["Meters", "Controllers", "Distribution", "Monitoring"], icon: "⚡", rfqCount: 18, avgPrice: "₹Contact" }
    ]
  },
  {
    title: "Logistics & Transportation",
    categories: [
      { name: "Freight & Cargo", suppliers: 1200, subcategories: ["Air Freight", "Sea Freight", "Road Transport", "Rail Cargo"], icon: "📦", rfqCount: 89, avgPrice: "₹Contact" },
      { name: "Warehousing", suppliers: 850, subcategories: ["Storage Solutions", "Inventory Management", "Picking Systems", "Packaging"], icon: "🏭", rfqCount: 67, avgPrice: "₹Contact" },
      { name: "Supply Chain", suppliers: 720, subcategories: ["3PL Services", "Customs Clearance", "Tracking", "Insurance"], icon: "🔗", rfqCount: 54, avgPrice: "₹Contact" },
      { name: "E-commerce Logistics", suppliers: 650, subcategories: ["Last Mile Delivery", "Returns Management", "Fulfillment", "Customer Service"], icon: "🛒", rfqCount: 76, avgPrice: "₹Contact" },
      { name: "Cold Chain", suppliers: 380, subcategories: ["Refrigerated Transport", "Cold Storage", "Temperature Monitoring", "Pharma Logistics"], icon: "❄️", rfqCount: 34, avgPrice: "₹Contact" }
    ]
  }
];

// Enhanced Category Card Component with RFQ Integration
function EnhancedCategoryCard({ category }: { category: Category }) {
  const [isHovered, setIsHovered] = useState(false);

  // ✅ CORRECT SLUG GENERATION
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const categorySlug = generateSlug(category.name);
  
  // Generate RFQ URLs
  const buyerRFQUrl = `/buyer/rfq/create?category=${encodeURIComponent(category.name)}`;
  const supplierRFQUrl = `/supplier/products/add?category=${encodeURIComponent(category.name)}`;
  const browseSuppliersUrl = `/buyer/suppliers?category=${encodeURIComponent(category.name)}`;
  const categoryDetailUrl = `/categories/${categorySlug}`;

  return (
    <div className="relative bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden group">
      {/* Card Content */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-3xl">{category.icon}</span>
          <div className="flex space-x-2">
            <Link href={buyerRFQUrl}>
              <button className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold hover:bg-blue-700 transition-colors">
                Buy
              </button>
            </Link>
            <Link href={supplierRFQUrl}>
              <button className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold hover:bg-green-700 transition-colors">
                Sell
              </button>
            </Link>
          </div>
        </div>

        <h4 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
          {category.name}
        </h4>
        
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-600">
            {category.suppliers.toLocaleString()}+ suppliers
          </span>
        </div>

        {/* RFQ Stats */}
        <div className="space-y-1 mb-4">
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">RFQs Today:</span>
            <span className="font-bold text-green-600">{category.rfqCount || '50+'}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">Avg. Price:</span>
            <span className="font-bold text-purple-600">{category.avgPrice || '₹Contact'}</span>
          </div>
        </div>

        {/* Subcategories with Links */}
        <div className="space-y-1">
          {category.subcategories.slice(0, 3).map((sub, subIndex) => (
            <Link 
              key={subIndex} 
              href={`${buyerRFQUrl}&subcategory=${encodeURIComponent(sub)}`}
              className="block text-xs text-gray-600 hover:text-blue-600 transition-colors"
            >
              <span className="w-1 h-1 bg-gray-400 rounded-full mr-2 inline-block"></span>
              {sub}
            </Link>
          ))}
          {category.subcategories.length > 3 && (
            <div className="text-xs text-blue-600">
              +{category.subcategories.length - 3} more
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-4 space-y-2">
          <Link href={categoryDetailUrl}>
            <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105">
              <Plus className="w-4 h-4 inline mr-2" />
              View Category
            </button>
          </Link>
          <Link href={buyerRFQUrl}>
            <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors">
              Create RFQ
            </button>
          </Link>
        </div>
      </div>

      {/* Hover Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="text-center text-white p-4">
          <h4 className="font-bold mb-2">Ready to Trade?</h4>
          <p className="text-sm mb-4">Connect with {category.suppliers.toLocaleString()}+ suppliers</p>
          <div className="space-y-2">
            <Link href={buyerRFQUrl}>
              <button className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Post RFQ
              </button>
            </Link>
            <Link href={supplierRFQUrl}>
              <button className="border-2 border-white text-white px-4 py-2 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                List Product
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CategoryShowcase() {
  const [activeGroup, setActiveGroup] = useState(0);
  const [showAll, setShowAll] = useState(false);

  const totalSuppliers = categoryData.reduce((sum, group) => 
    sum + group.categories.reduce((groupSum, cat) => groupSum + cat.suppliers, 0), 0
  );

  const displayedGroups = showAll ? categoryData : categoryData.slice(0, 3);

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Complete B2B Marketplace
          </h2>
          <p className="text-xl text-gray-600 mb-6">
            Discover 51+ categories with <span className="font-semibold text-blue-600">{totalSuppliers.toLocaleString()}+ verified suppliers</span>
          </p>
          <div className="flex justify-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              Verified Suppliers
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
              Quality Assured
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
              GST Compliant
            </div>
          </div>
        </div>

        {/* Category Groups */}
        <div className="space-y-8">
          {displayedGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                <span className="mr-3">{group.title}</span>
                <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                  {group.categories.length} Categories
                </span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {group.categories.map((category, catIndex) => (
                  <EnhancedCategoryCard key={catIndex} category={category} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Show More/Less Button */}
        <div className="text-center mt-8">
          <button
            onClick={() => setShowAll(!showAll)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
          >
            {showAll ? 'Show Less Categories' : `Show All ${categoryData.length} Categories`}
          </button>
        </div>

        {/* Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{categoryData.length}</div>
            <div className="text-gray-600">Business Categories</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{totalSuppliers.toLocaleString()}+</div>
            <div className="text-gray-600">Verified Suppliers</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">₹500Cr+</div>
            <div className="text-gray-600">Monthly Trade Volume</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">24/7</div>
            <div className="text-gray-600">Support Available</div>
          </div>
        </div>
      </div>
    </section>
  );
} 
