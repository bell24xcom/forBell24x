// All 50 categories for Bell24h marketplace

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  rfqCount: number;
  supplierCount?: number;
  description?: string;
  subcategories?: string[];
}

export const ALL_50_CATEGORIES: Category[] = [
  {
    id: 1,
    name: 'Agriculture',
    slug: 'agriculture',
    icon: '🏭',
    rfqCount: 234,
    supplierCount: 1240,
    description: 'Agricultural equipment, seeds, and farming supplies',
    subcategories: ['Agriculture Equipment', 'Fresh Flowers', 'Seeds & Saplings', 'Tractor Parts', 'Animal Feed', 'Irrigation Systems', 'Fertilizers & Pesticides', 'Organic Farming Tools']
  },
  {
    id: 2,
    name: 'Apparel & Fashion',
    slug: 'apparel',
    icon: '👕',
    rfqCount: 156,
    supplierCount: 890,
    description: 'Clothing, textiles, and fashion accessories',
    subcategories: ['Sarees', 'Sunglasses', 'Unisex Clothing', 'Suitcases & Briefcases', 'Footwear', 'Textiles & Fabrics', 'Sportswear', 'Fashion Accessories']
  },
  {
    id: 3,
    name: 'Automobile',
    slug: 'automobile',
    icon: '🚗',
    rfqCount: 189,
    supplierCount: 567,
    description: 'Auto parts, accessories, and vehicles',
    subcategories: ['Auto Electrical Parts', 'Engine Parts', 'Commercial Vehicles', 'Coach Building', 'Car Accessories', 'Tires & Tubes', 'Lubricants & Greases']
  },
  {
    id: 4,
    name: 'Ayurveda & Herbal',
    slug: 'ayurveda',
    icon: '🌿',
    rfqCount: 98,
    supplierCount: 234,
    description: 'Ayurvedic medicines and herbal products',
    subcategories: ['Herbal Henna', 'Ayurvedic Extracts', 'Herbal Foods', 'Ayurvedic Medicines', 'Herbal Oils', 'Natural Skincare']
  },
  {
    id: 5,
    name: 'Business Services',
    slug: 'business-services',
    icon: '💼',
    rfqCount: 145,
    supplierCount: 456,
    description: 'Professional business and consulting services',
    subcategories: ['Turnkey Project Services', 'Environmental Services', 'Business Consultants', 'Import/Export Documentation', 'Financial Consulting', 'Legal & Compliance Services']
  },
  {
    id: 6,
    name: 'Chemical',
    slug: 'chemical',
    icon: '🧪',
    rfqCount: 167,
    supplierCount: 345,
    description: 'Industrial chemicals and specialty chemicals',
    subcategories: ['Catalysts', 'PET Granules', 'Dyes & Pigments', 'Agrochemicals', 'Specialty Chemicals', 'Industrial Gases', 'Detergent Chemicals']
  },
  {
    id: 7,
    name: 'Computers & IT',
    slug: 'computers',
    icon: '💻',
    rfqCount: 203,
    supplierCount: 567,
    description: 'IT services, software, and hardware',
    subcategories: ['Software Development', 'Data Entry Services', 'Web Development', 'Cloud Computing Solutions', 'E-commerce Platforms', 'Cybersecurity Services', 'IT Hardware & Peripherals']
  },
  {
    id: 8,
    name: 'Consumer Electronics',
    slug: 'electronics',
    icon: '📱',
    rfqCount: 178,
    supplierCount: 678,
    description: 'Electronic devices and accessories',
    subcategories: ['Surveillance Equipment', 'Photography Supplies', 'Mobile Accessories', 'Televisions & Home Audio', 'Laptops & Tablets', 'Wearables']
  },
  {
    id: 9,
    name: 'Cosmetics & Personal Care',
    slug: 'cosmetics',
    icon: '💄',
    rfqCount: 134,
    supplierCount: 789,
    description: 'Beauty products and personal care items',
    subcategories: ['Body Care', 'Ayurvedic Oils', 'Fragrances', 'Hair Care Products', 'Makeup & Beauty Products', 'Organic Skincare', 'Personal Hygiene Products']
  },
  {
    id: 10,
    name: 'Electronics & Electrical',
    slug: 'electrical',
    icon: '⚡',
    rfqCount: 192,
    supplierCount: 890,
    description: 'Electrical components and equipment',
    subcategories: ['Cables & Wires', 'Active Devices', 'Testing Devices', 'Electrical Transformers', 'Batteries & Energy Storage', 'Switches & Circuit Breakers']
  },
  {
    id: 11,
    name: 'Food & Beverage',
    slug: 'food',
    icon: '🍔',
    rfqCount: 156,
    supplierCount: 1123,
    description: 'Food products and beverages',
    subcategories: ['Vegetables', 'Dry Fruits', 'Baked Goods', 'Cooking Spices', 'Dairy Products', 'Canned Foods', 'Beverages']
  },
  {
    id: 12,
    name: 'Furniture',
    slug: 'furniture',
    icon: '🪑',
    rfqCount: 123,
    supplierCount: 456,
    description: 'Furniture and carpentry services',
    subcategories: ['Bedroom Furniture', 'Kitchen Furniture', 'Office Furniture', 'Custom Carpentry', 'Shelving & Storage Solutions', 'Outdoor Furniture', 'Wooden Artifacts']
  },
  {
    id: 13,
    name: 'Gifts & Crafts',
    slug: 'gifts',
    icon: '🎁',
    rfqCount: 89,
    supplierCount: 234,
    description: 'Handicrafts and gift items',
    subcategories: ['Metal Handicrafts', 'Festival Items', 'Personalized Gifts', 'Handmade Jewelry', 'Artistic Ceramics', 'Corporate Gifts']
  },
  {
    id: 14,
    name: 'Health & Beauty',
    slug: 'health',
    icon: '💊',
    rfqCount: 167,
    supplierCount: 567,
    description: 'Healthcare products and beauty items',
    subcategories: ['Dietary Supplements', 'Veterinary Medicines', 'Organic Health Products', 'Beauty Enhancers', 'Wellness Products']
  },
  {
    id: 15,
    name: 'Home Furnishings',
    slug: 'home-furnishings',
    icon: '🏠',
    rfqCount: 112,
    supplierCount: 345,
    description: 'Home decor and furnishing items',
    subcategories: ['Bed Linen', 'Rugs', 'Placemats', 'Curtains & Drapes', 'Cushions & Throws', 'Tableware']
  },
  {
    id: 16,
    name: 'Home Supplies',
    slug: 'home-supplies',
    icon: '🏡',
    rfqCount: 98,
    supplierCount: 234,
    description: 'Household supplies and cleaning products',
    subcategories: ['Cleaning Liquids', 'Pest Control Services', 'Household Tools', 'Sanitary Products', 'Storage Solutions']
  },
  {
    id: 17,
    name: 'Industrial Machinery',
    slug: 'machinery',
    icon: '⚙️',
    rfqCount: 234,
    supplierCount: 567,
    description: 'Industrial machines and equipment',
    subcategories: ['Chemical Machinery', 'CNC Machines', 'Milling Tools', 'Heavy Machinery', 'Hydraulic Equipment', 'Packaging Machines']
  },
  {
    id: 18,
    name: 'Industrial Supplies',
    slug: 'industrial-supplies',
    icon: '🔧',
    rfqCount: 178,
    supplierCount: 456,
    description: 'Industrial parts and supplies',
    subcategories: ['Pumps', 'Insulators', 'Trolleys & Pallets', 'Bearings', 'Conveyor Belts']
  },
  {
    id: 19,
    name: 'Jewelry',
    slug: 'jewelry',
    icon: '💎',
    rfqCount: 145,
    supplierCount: 345,
    description: 'Jewelry and precious stones',
    subcategories: ['Precious Stones', 'Diamond Jewelry', 'Custom Jewelry', 'Gold & Silver Accessories', 'Fashion Jewelry']
  },
  {
    id: 20,
    name: 'Mineral & Metals',
    slug: 'metals',
    icon: '⛏️',
    rfqCount: 267,
    supplierCount: 789,
    description: 'Metals, minerals, and raw materials',
    subcategories: ['Mica', 'Steel', 'Non-Ferrous Scrap', 'Aluminum', 'Copper', 'Rare Earth Elements']
  },
  {
    id: 21,
    name: 'Office Supplies',
    slug: 'office',
    icon: '📎',
    rfqCount: 87,
    supplierCount: 234,
    description: 'Office stationery and supplies',
    subcategories: ['Stationery', 'Printer Consumables', 'Office Furniture', 'Paper Products', 'Filing Solutions']
  },
  {
    id: 22,
    name: 'Packaging & Paper',
    slug: 'packaging',
    icon: '📦',
    rfqCount: 134,
    supplierCount: 456,
    description: 'Packaging materials and paper products',
    subcategories: ['Bulk Bags', 'Pallets', 'Food Packaging', 'Industrial Packaging', 'Paper Products', 'Sustainable Packaging']
  },
  {
    id: 23,
    name: 'Real Estate & Construction',
    slug: 'construction',
    icon: '🏗️',
    rfqCount: 198,
    supplierCount: 567,
    description: 'Construction materials and services',
    subcategories: ['Bricks', 'Sanitary Ware', 'Tiles', 'Building Materials', 'Cement & Concrete', 'Construction Equipment']
  },
  {
    id: 24,
    name: 'Security Products',
    slug: 'security',
    icon: '🔒',
    rfqCount: 112,
    supplierCount: 234,
    description: 'Security systems and services',
    subcategories: ['Alarms', 'Safety Systems', 'Surveillance Equipment', 'Fire Protection Systems', 'Access Control Systems']
  },
  {
    id: 25,
    name: 'Sports & Entertainment',
    slug: 'sports',
    icon: '⚽',
    rfqCount: 89,
    supplierCount: 123,
    description: 'Sports equipment and entertainment',
    subcategories: ['Sporting Goods', 'Exercise Accessories', 'Fitness Equipment', 'Gaming Consoles', 'Outdoor Games']
  },
  {
    id: 26,
    name: 'Telecommunication',
    slug: 'telecom',
    icon: '📡',
    rfqCount: 156,
    supplierCount: 345,
    description: 'Telecom equipment and services',
    subcategories: ['Equipment', 'Wi-Fi Solutions', 'VOIP Systems', 'Mobile Networks', 'Satellite Communication']
  },
  {
    id: 27,
    name: 'Textiles & Fabrics',
    slug: 'textiles',
    icon: '🧵',
    rfqCount: 223,
    supplierCount: 890,
    description: 'Fabrics, yarn, and textile products',
    subcategories: ['Cotton Fabrics', 'Leather Materials', 'Embroidery Tools', 'Synthetic Fibers', 'Organic Textiles']
  },
  {
    id: 28,
    name: 'Tools & Equipment',
    slug: 'tools',
    icon: '🔨',
    rfqCount: 145,
    supplierCount: 456,
    description: 'Hand tools and power tools',
    subcategories: ['Saw Blades', 'Hydraulic Tools', 'Thermometers', 'Hand Tools', 'Power Tools']
  },
  {
    id: 29,
    name: 'Tours & Travel',
    slug: 'travel',
    icon: '✈️',
    rfqCount: 76,
    supplierCount: 123,
    description: 'Travel services and tourism',
    subcategories: ['Tour Providers', 'Bus Rentals', 'Hotel Booking', 'Holiday Packages', 'Travel Accessories']
  },
  {
    id: 30,
    name: 'Toys & Games',
    slug: 'toys',
    icon: '🧸',
    rfqCount: 92,
    supplierCount: 234,
    description: 'Toys and gaming products',
    subcategories: ['Stuffed Toys', 'Video Games', 'Educational Toys', 'Board Games', 'Outdoor Games']
  },
  {
    id: 31,
    name: 'Renewable Energy',
    slug: 'renewable-energy',
    icon: '☀️',
    rfqCount: 178,
    supplierCount: 345,
    description: 'Solar, wind, and renewable energy',
    subcategories: ['Solar Panels', 'Wind Turbines', 'Energy Storage Solutions', 'Hydroelectric Equipment']
  },
  {
    id: 32,
    name: 'AI & Automation',
    slug: 'ai-automation',
    icon: '🤖',
    rfqCount: 134,
    supplierCount: 234,
    description: 'AI tools and automation systems',
    subcategories: ['AI Software', 'Robotics', 'Machine Learning Tools', 'AI Hardware']
  },
  {
    id: 33,
    name: 'Eco-Friendly Products',
    slug: 'eco-friendly',
    icon: '♻️',
    rfqCount: 89,
    supplierCount: 123,
    description: 'Sustainable and eco-friendly products',
    subcategories: ['Recyclable Materials', 'Eco-Friendly Packaging', 'Organic Clothing', 'Zero-Waste Products']
  },
  {
    id: 34,
    name: 'Healthcare Equipment',
    slug: 'healthcare',
    icon: '🏥',
    rfqCount: 167,
    supplierCount: 456,
    description: 'Medical devices and healthcare tech',
    subcategories: ['Telemedicine Devices', 'Health Wearables', 'Medical Devices', 'Health Informatics']
  },
  {
    id: 35,
    name: 'E-commerce Solutions',
    slug: 'ecommerce',
    icon: '🛒',
    rfqCount: 112,
    supplierCount: 234,
    description: 'E-commerce platforms and tools',
    subcategories: ['Online Marketplaces', 'Payment Gateways', 'E-commerce Software', 'Dropshipping Platforms']
  },
  {
    id: 36,
    name: 'Gaming Hardware',
    slug: 'gaming',
    icon: '🎮',
    rfqCount: 98,
    supplierCount: 123,
    description: 'Gaming and esports equipment',
    subcategories: ['Gaming Consoles', 'VR & AR Devices', 'Esports Equipment', 'Gaming Software']
  },
  {
    id: 37,
    name: 'Electric Vehicles',
    slug: 'ev',
    icon: '🔋',
    rfqCount: 189,
    supplierCount: 345,
    description: 'EVs and charging infrastructure',
    subcategories: ['EV Batteries', 'Charging Stations', 'Electric Cars', 'EV Accessories']
  },
  {
    id: 38,
    name: 'Drones & UAVs',
    slug: 'drones',
    icon: '🚁',
    rfqCount: 76,
    supplierCount: 89,
    description: 'Drones and aerial systems',
    subcategories: ['UAV Manufacturing', 'Drone Software', 'Drone Photography', 'Aerial Mapping Services']
  },
  {
    id: 39,
    name: 'Wearable Technology',
    slug: 'wearables',
    icon: '⌚',
    rfqCount: 87,
    supplierCount: 234,
    description: 'Smart wearables and fitness tech',
    subcategories: ['Smartwatches', 'Fitness Trackers', 'Medical Wearables', 'AR Glasses']
  },
  {
    id: 40,
    name: 'Logistics & Supply Chain',
    slug: 'logistics',
    icon: '🚚',
    rfqCount: 156,
    supplierCount: 456,
    description: 'Logistics and supply chain solutions',
    subcategories: ['Warehouse Automation', 'Fleet Management', 'Freight Forwarding', 'Supply Chain Analytics']
  },
  {
    id: 41,
    name: '3D Printing',
    slug: '3d-printing',
    icon: '🖨️',
    rfqCount: 92,
    supplierCount: 123,
    description: '3D printing equipment and services',
    subcategories: ['3D Printers', 'Printing Materials', 'Prototyping Services', 'Custom Manufacturing']
  },
  {
    id: 42,
    name: 'Food Tech & Agri-Tech',
    slug: 'foodtech',
    icon: '🌾',
    rfqCount: 123,
    supplierCount: 345,
    description: 'Agricultural and food technology',
    subcategories: ['Vertical Farming', 'Food Delivery Platforms', 'Lab-Grown Meat', 'Precision Agriculture']
  },
  {
    id: 43,
    name: 'Iron & Steel Industry',
    slug: 'iron-steel',
    icon: '🏭',
    rfqCount: 278,
    supplierCount: 890,
    description: 'Iron and steel manufacturing',
    subcategories: ['Steel Production', 'Iron Smelting', 'Ferrous Metals', 'Foundries']
  },
  {
    id: 44,
    name: 'Mining & Raw Materials',
    slug: 'mining',
    icon: '⛏️',
    rfqCount: 198,
    supplierCount: 567,
    description: 'Mining equipment and raw materials',
    subcategories: ['Iron Ore', 'Bauxite', 'Coal Mining', 'Precious Metals']
  },
  {
    id: 45,
    name: 'Metal Recycling',
    slug: 'recycling',
    icon: '♻️',
    rfqCount: 145,
    supplierCount: 345,
    description: 'Metal recycling and scrap',
    subcategories: ['Scrap Iron', 'Recycled Steel', 'Non-Ferrous Scrap', 'Metal Processing']
  },
  {
    id: 46,
    name: 'Metallurgy',
    slug: 'metallurgy',
    icon: '🔥',
    rfqCount: 167,
    supplierCount: 456,
    description: 'Metallurgy and metalworking',
    subcategories: ['Metal Forging', 'Casting', 'Alloy Production', 'Heat Treatment']
  },
  {
    id: 47,
    name: 'Heavy Machinery',
    slug: 'heavy-machinery',
    icon: '🚜',
    rfqCount: 234,
    supplierCount: 567,
    description: 'Heavy machinery and mining equipment',
    subcategories: ['Mining Trucks', 'Excavators', 'Drilling Machines', 'Crushing Equipment']
  },
  {
    id: 48,
    name: 'Ferrous & Non-Ferrous',
    slug: 'ferrous-metals',
    icon: '⚙️',
    rfqCount: 189,
    supplierCount: 456,
    description: 'Ferrous and non-ferrous metals',
    subcategories: ['Steel', 'Aluminum', 'Copper', 'Zinc']
  },
  {
    id: 49,
    name: 'Mining Safety',
    slug: 'mining-safety',
    icon: '🦺',
    rfqCount: 98,
    supplierCount: 234,
    description: 'Mining safety equipment and services',
    subcategories: ['Mining Safety Gear', 'Environmental Monitoring', 'Dust Control Solutions', 'Mine Rehabilitation']
  },
  {
    id: 50,
    name: 'Precious Metals Mining',
    slug: 'precious-metals',
    icon: '💰',
    rfqCount: 156,
    supplierCount: 345,
    description: 'Precious metals and mining',
    subcategories: ['Gold', 'Silver', 'Platinum', 'Mining Exploration']
  },
];

// Helper functions
export function getCategoryBySlug(slug: string): Category | undefined {
  return ALL_50_CATEGORIES.find(cat => cat.slug === slug);
}

export function getCategoryById(id: number): Category | undefined {
  return ALL_50_CATEGORIES.find(cat => cat.id === id);
}

export function getTotalRFQCount(): number {
  return ALL_50_CATEGORIES.reduce((total, cat) => total + cat.rfqCount, 0);
}

export function getCategoriesByRFQCount(limit?: number): Category[] {
  const sorted = [...ALL_50_CATEGORIES].sort((a, b) => b.rfqCount - a.rfqCount);
  return limit ? sorted.slice(0, limit) : sorted;
}

