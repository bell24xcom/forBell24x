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
  // 1
  {
    id: 'agriculture',
    name: 'Agriculture',
    icon: '🌾',
    supplierCount: '18K+',
    trending: true,
    description: 'Farming equipment, seeds, fertilizers, and agri-inputs for modern agriculture',
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
  // 2
  {
    id: 'apparel-fashion',
    name: 'Apparel & Fashion',
    icon: '👗',
    supplierCount: '24K+',
    trending: true,
    description: 'Clothing, footwear, textiles and fashion accessories for all segments',
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
  // 3
  {
    id: 'automobile',
    name: 'Automobile',
    icon: '🚗',
    supplierCount: '20K+',
    trending: true,
    description: 'Auto parts, accessories, lubricants and commercial vehicle components',
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
  // 4
  {
    id: 'ayurveda-herbal',
    name: 'Ayurveda & Herbal Products',
    icon: '🌿',
    supplierCount: '12K+',
    trending: true,
    description: 'Ayurvedic medicines, herbal extracts, natural skincare and wellness products',
    subcategories: [
      'Herbal Henna',
      'Ayurvedic Extracts',
      'Herbal Foods',
      'Ayurvedic Medicines',
      'Herbal Oils',
      'Natural Skincare',
    ],
  },
  // 5
  {
    id: 'business-services',
    name: 'Business Services',
    icon: '💼',
    supplierCount: '15K+',
    description: 'Consulting, compliance, financial, legal and project management services',
    subcategories: [
      'Turnkey Project Services',
      'Environmental Services',
      'Business Consultants',
      'Import/Export Documentation',
      'Financial Consulting',
      'Legal & Compliance Services',
    ],
  },
  // 6
  {
    id: 'chemical',
    name: 'Chemical',
    icon: '⚗️',
    supplierCount: '16K+',
    description: 'Industrial chemicals, agrochemicals, dyes, pigments and specialty chemicals',
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
  // 7
  {
    id: 'computers-internet',
    name: 'Computers and Internet',
    icon: '💻',
    supplierCount: '22K+',
    trending: true,
    description: 'IT services, software development, cloud computing and cybersecurity solutions',
    subcategories: [
      'Software Development',
      'Data Entry Services',
      'Web Development',
      'Cloud Computing Solutions',
      'E-commerce Platforms',
      'Cybersecurity Services',
      'IT Hardware & Peripherals',
    ],
  },
  // 8
  {
    id: 'consumer-electronics',
    name: 'Consumer Electronics',
    icon: '📱',
    supplierCount: '19K+',
    trending: true,
    description: 'Mobiles, laptops, televisions, wearables and home audio equipment',
    subcategories: [
      'Surveillance Equipment',
      'Photography Supplies',
      'Mobile Accessories',
      'Televisions & Home Audio',
      'Laptops & Tablets',
      'Wearables (Smartwatches, Fitness Trackers)',
    ],
  },
  // 9
  {
    id: 'cosmetics-personal-care',
    name: 'Cosmetics & Personal Care',
    icon: '💄',
    supplierCount: '14K+',
    description: 'Skincare, haircare, makeup, fragrances and organic beauty products',
    subcategories: [
      'Body Care',
      'Ayurvedic Oils',
      'Fragrances',
      'Hair Care Products',
      'Makeup & Beauty Products',
      'Organic Skincare',
      'Personal Hygiene Products',
    ],
  },
  // 10
  {
    id: 'electronics-electrical',
    name: 'Electronics & Electrical',
    icon: '⚡',
    supplierCount: '32K+',
    trending: true,
    description: 'Cables, wires, transformers, batteries, switches and electrical components',
    subcategories: [
      'Cables & Wires',
      'Active Devices',
      'Testing Devices',
      'Electrical Transformers',
      'Batteries & Energy Storage',
      'Switches & Circuit Breakers',
    ],
  },
  // 11
  {
    id: 'food-beverage',
    name: 'Food Products & Beverage',
    icon: '🍽️',
    supplierCount: '26K+',
    trending: true,
    description: 'Fresh produce, processed foods, spices, dairy and beverages for B2B procurement',
    subcategories: [
      'Vegetables',
      'Dry Fruits',
      'Baked Goods',
      'Cooking Spices',
      'Dairy Products',
      'Canned Foods',
      'Beverages (Juices, Soft Drinks, Coffee)',
    ],
  },
  // 12
  {
    id: 'furniture-carpentry',
    name: 'Furniture & Carpentry Services',
    icon: '🪑',
    supplierCount: '11K+',
    description: 'Bedroom, kitchen, office and outdoor furniture with custom carpentry services',
    subcategories: [
      'Bedroom Furniture',
      'Kitchen Furniture',
      'Office Furniture',
      'Custom Carpentry',
      'Shelving & Storage Solutions',
      'Outdoor Furniture',
      'Wooden Artifacts',
    ],
  },
  // 13
  {
    id: 'gifts-crafts',
    name: 'Gifts & Crafts',
    icon: '🎁',
    supplierCount: '9K+',
    description: 'Handicrafts, personalized gifts, corporate gifts and artistic products',
    subcategories: [
      'Metal Handicrafts',
      'Festival Items',
      'Personalized Gifts',
      'Handmade Jewelry',
      'Artistic Ceramics',
      'Corporate Gifts',
    ],
  },
  // 14
  {
    id: 'health-beauty',
    name: 'Health & Beauty',
    icon: '💊',
    supplierCount: '13K+',
    description: 'Dietary supplements, wellness products, organic health and beauty enhancers',
    subcategories: [
      'Dietary Supplements',
      'Veterinary Medicines',
      'Organic Health Products',
      'Beauty Enhancers',
      'Wellness Products',
    ],
  },
  // 15
  {
    id: 'home-furnishings',
    name: 'Home Furnishings',
    icon: '🛋️',
    supplierCount: '10K+',
    description: 'Bed linen, rugs, curtains, cushions, tableware and home decor products',
    subcategories: [
      'Bed Linen',
      'Rugs',
      'Placemats',
      'Curtains & Drapes',
      'Cushions & Throws',
      'Tableware',
    ],
  },
  // 16
  {
    id: 'home-supplies',
    name: 'Home Supplies',
    icon: '🏠',
    supplierCount: '8K+',
    description: 'Cleaning products, pest control, household tools and sanitary supplies',
    subcategories: [
      'Cleaning Liquids',
      'Pest Control Services',
      'Household Tools',
      'Sanitary Products',
      'Storage Solutions',
    ],
  },
  // 17
  {
    id: 'industrial-machinery',
    name: 'Industrial Machinery',
    icon: '⚙️',
    supplierCount: '25K+',
    trending: true,
    description: 'Chemical, CNC, milling, heavy and hydraulic machinery for all industries',
    subcategories: [
      'Chemical Machinery',
      'CNC Machines',
      'Milling Tools',
      'Heavy Machinery',
      'Hydraulic Equipment',
      'Packaging Machines',
    ],
  },
  // 18
  {
    id: 'industrial-supplies',
    name: 'Industrial Supplies',
    icon: '🔩',
    supplierCount: '20K+',
    description: 'Pumps, insulators, trolleys, bearings and conveyor systems for industry',
    subcategories: [
      'Pumps',
      'Insulators',
      'Trolleys & Pallets',
      'Bearings',
      'Conveyor Belts',
    ],
  },
  // 19
  {
    id: 'jewelry',
    name: 'Jewelry & Jewelry Designers',
    icon: '💍',
    supplierCount: '8K+',
    description: 'Diamond, gold, silver, custom and fashion jewelry from verified suppliers',
    subcategories: [
      'Precious Stones',
      'Diamond Jewelry',
      'Custom Jewelry',
      'Gold & Silver Accessories',
      'Fashion Jewelry',
    ],
  },
  // 20
  {
    id: 'minerals-metals',
    name: 'Mineral & Metals',
    icon: '🪨',
    supplierCount: '17K+',
    description: 'Mica, steel, aluminum, copper, zinc and rare earth elements',
    subcategories: [
      'Mica',
      'Steel',
      'Non-Ferrous Scrap',
      'Aluminum',
      'Copper',
      'Rare Earth Elements',
    ],
  },
  // 21
  {
    id: 'office-supplies',
    name: 'Office Supplies',
    icon: '📎',
    supplierCount: '7K+',
    description: 'Stationery, printer consumables, office furniture and filing solutions',
    subcategories: [
      'Stationery',
      'Printer Consumables',
      'Office Furniture',
      'Paper Products',
      'Filing Solutions',
    ],
  },
  // 22
  {
    id: 'packaging-paper',
    name: 'Packaging & Paper',
    icon: '📦',
    supplierCount: '14K+',
    description: 'Bulk bags, pallets, food & industrial packaging and sustainable paper products',
    subcategories: [
      'Bulk Bags',
      'Pallets',
      'Food Packaging',
      'Industrial Packaging',
      'Paper Products',
      'Sustainable Packaging',
    ],
  },
  // 23
  {
    id: 'real-estate-construction',
    name: 'Real Estate, Building & Construction',
    icon: '🏗️',
    supplierCount: '22K+',
    trending: true,
    description: 'Bricks, tiles, cement, sanitary ware and construction equipment',
    subcategories: [
      'Bricks',
      'Sanitary Ware',
      'Tiles',
      'Building Materials',
      'Cement & Concrete',
      'Construction Equipment',
    ],
  },
  // 24
  {
    id: 'security-products',
    name: 'Security Products & Services',
    icon: '🔒',
    supplierCount: '9K+',
    description: 'Alarms, surveillance, fire protection, access control and safety systems',
    subcategories: [
      'Alarms',
      'Safety Systems',
      'Surveillance Equipment',
      'Fire Protection Systems',
      'Access Control Systems',
    ],
  },
  // 25
  {
    id: 'sports-entertainment',
    name: 'Sports Goods & Entertainment',
    icon: '⚽',
    supplierCount: '7K+',
    description: 'Sporting goods, fitness equipment, gaming consoles and outdoor games',
    subcategories: [
      'Sporting Goods',
      'Exercise Accessories',
      'Fitness Equipment',
      'Gaming Consoles',
      'Outdoor Games',
    ],
  },
  // 26
  {
    id: 'telecommunication',
    name: 'Telecommunication',
    icon: '📡',
    supplierCount: '15K+',
    description: 'Telecom equipment, Wi-Fi, VOIP, mobile networks and satellite communication',
    subcategories: [
      'Equipment',
      'Wi-Fi Solutions',
      'VOIP Systems',
      'Mobile Networks',
      'Satellite Communication',
    ],
  },
  // 27
  {
    id: 'textiles-yarn-fabrics',
    name: 'Textiles, Yarn & Fabrics',
    icon: '🧵',
    supplierCount: '21K+',
    trending: true,
    description: 'Cotton, silk, leather, synthetic and organic textiles with embroidery tools',
    subcategories: [
      'Cotton Fabrics',
      'Leather Materials',
      'Embroidery Tools',
      'Synthetic Fibers',
      'Organic Textiles',
    ],
  },
  // 28
  {
    id: 'tools-equipment',
    name: 'Tools & Equipment',
    icon: '🔧',
    supplierCount: '18K+',
    description: 'Hand tools, power tools, hydraulic tools, saw blades and thermometers',
    subcategories: [
      'Saw Blades',
      'Hydraulic Tools',
      'Thermometers',
      'Hand Tools',
      'Power Tools',
    ],
  },
  // 29
  {
    id: 'tours-travel-hotels',
    name: 'Tours, Travels & Hotels',
    icon: '✈️',
    supplierCount: '6K+',
    description: 'Tour providers, bus rentals, hotel booking, holiday packages and travel accessories',
    subcategories: [
      'Tour Providers',
      'Bus Rentals',
      'Hotel Booking',
      'Holiday Packages',
      'Travel Accessories',
    ],
  },
  // 30
  {
    id: 'toys-games',
    name: 'Toys & Games',
    icon: '🧸',
    supplierCount: '6K+',
    description: 'Stuffed toys, video games, educational toys, board games and outdoor games',
    subcategories: [
      'Stuffed Toys',
      'Video Games',
      'Educational Toys',
      'Board Games',
      'Outdoor Games',
    ],
  },
  // 31
  {
    id: 'renewable-energy',
    name: 'Renewable Energy Equipment',
    icon: '☀️',
    supplierCount: '10K+',
    trending: true,
    description: 'Solar panels, wind turbines, energy storage and hydroelectric equipment',
    subcategories: [
      'Solar Panels',
      'Wind Turbines',
      'Energy Storage Solutions',
      'Hydroelectric Equipment',
    ],
  },
  // 32
  {
    id: 'ai-automation',
    name: 'Artificial Intelligence & Automation Tools',
    icon: '🤖',
    supplierCount: '8K+',
    trending: true,
    description: 'AI software, robotics, machine learning tools and AI hardware solutions',
    subcategories: [
      'AI Software',
      'Robotics',
      'Machine Learning Tools',
      'AI Hardware',
    ],
  },
  // 33
  {
    id: 'sustainable-eco',
    name: 'Sustainable & Eco-Friendly Products',
    icon: '♻️',
    supplierCount: '7K+',
    trending: true,
    description: 'Recyclable materials, eco-friendly packaging, organic clothing and zero-waste products',
    subcategories: [
      'Recyclable Materials',
      'Eco-Friendly Packaging',
      'Organic Clothing',
      'Zero-Waste Products',
    ],
  },
  // 34
  {
    id: 'healthcare-technology',
    name: 'Healthcare Equipment & Technology',
    icon: '🏥',
    supplierCount: '11K+',
    trending: true,
    description: 'Telemedicine devices, health wearables, medical devices and health informatics',
    subcategories: [
      'Telemedicine Devices',
      'Health Wearables',
      'Medical Devices',
      'Health Informatics',
    ],
  },
  // 35
  {
    id: 'ecommerce-digital',
    name: 'E-commerce & Digital Platforms Solutions',
    icon: '🛒',
    supplierCount: '9K+',
    trending: true,
    description: 'Online marketplaces, payment gateways, e-commerce software and dropshipping platforms',
    subcategories: [
      'Online Marketplaces',
      'Payment Gateways',
      'E-commerce Software',
      'Dropshipping Platforms',
    ],
  },
  // 36
  {
    id: 'gaming-esports',
    name: 'Gaming & Esports Hardware',
    icon: '🎮',
    supplierCount: '5K+',
    description: 'Gaming consoles, VR & AR devices, esports equipment and gaming software',
    subcategories: [
      'Gaming Consoles',
      'VR & AR Devices',
      'Esports Equipment',
      'Gaming Software',
    ],
  },
  // 37
  {
    id: 'ev-charging',
    name: 'Electric Vehicles (EVs) & Charging Solutions',
    icon: '🔋',
    supplierCount: '7K+',
    trending: true,
    description: 'EV batteries, charging stations, electric cars and EV accessories',
    subcategories: [
      'EV Batteries',
      'Charging Stations',
      'Electric Cars',
      'EV Accessories',
    ],
  },
  // 38
  {
    id: 'drones-uav',
    name: 'Drones & UAVs',
    icon: '🚁',
    supplierCount: '4K+',
    trending: true,
    description: 'UAV manufacturing, drone software, photography drones and aerial mapping services',
    subcategories: [
      'UAV Manufacturing',
      'Drone Software',
      'Drone Photography',
      'Aerial Mapping Services',
    ],
  },
  // 39
  {
    id: 'wearable-technology',
    name: 'Wearable Technology',
    icon: '⌚',
    supplierCount: '6K+',
    trending: true,
    description: 'Smartwatches, fitness trackers, medical wearables and AR glasses',
    subcategories: [
      'Smartwatches',
      'Fitness Trackers',
      'Medical Wearables',
      'AR Glasses',
    ],
  },
  // 40
  {
    id: 'logistics-supply-chain',
    name: 'Logistics & Supply Chain Solutions',
    icon: '🚚',
    supplierCount: '12K+',
    description: 'Warehouse automation, fleet management, freight forwarding and supply chain analytics',
    subcategories: [
      'Warehouse Automation',
      'Fleet Management',
      'Freight Forwarding',
      'Supply Chain Analytics',
    ],
  },
  // 41
  {
    id: '3d-printing',
    name: '3D Printing Equipment',
    icon: '🖨️',
    supplierCount: '4K+',
    trending: true,
    description: '3D printers, printing materials, prototyping services and custom manufacturing',
    subcategories: [
      '3D Printers',
      'Printing Materials',
      'Prototyping Services',
      'Custom Manufacturing',
    ],
  },
  // 42
  {
    id: 'food-tech-agri-tech',
    name: 'Food Tech & Agri-Tech',
    icon: '🌱',
    supplierCount: '5K+',
    trending: true,
    description: 'Vertical farming, food delivery platforms, lab-grown meat and precision agriculture',
    subcategories: [
      'Vertical Farming',
      'Food Delivery Platforms',
      'Lab-Grown Meat',
      'Precision Agriculture',
    ],
  },
  // 43
  {
    id: 'iron-steel',
    name: 'Iron & Steel Industry',
    icon: '🏭',
    supplierCount: '14K+',
    description: 'Steel production, iron smelting, ferrous metals and foundries',
    subcategories: [
      'Steel Production',
      'Iron Smelting',
      'Ferrous Metals',
      'Foundries',
    ],
  },
  // 44
  {
    id: 'mining-raw-materials',
    name: 'Mining & Raw Materials',
    icon: '⛏️',
    supplierCount: '10K+',
    description: 'Iron ore, bauxite, coal mining, precious metals and raw material extraction',
    subcategories: [
      'Iron Ore',
      'Bauxite',
      'Coal Mining',
      'Precious Metals',
    ],
  },
  // 45
  {
    id: 'metal-recycling',
    name: 'Metal Recycling',
    icon: '🔄',
    supplierCount: '6K+',
    description: 'Scrap iron, recycled steel, non-ferrous scrap and metal processing',
    subcategories: [
      'Scrap Iron',
      'Recycled Steel',
      'Non-Ferrous Scrap',
      'Metal Processing',
    ],
  },
  // 46
  {
    id: 'metallurgy-metalworking',
    name: 'Metallurgy & Metalworking',
    icon: '🔨',
    supplierCount: '9K+',
    description: 'Metal forging, casting, alloy production and heat treatment',
    subcategories: [
      'Metal Forging',
      'Casting',
      'Alloy Production',
      'Heat Treatment',
    ],
  },
  // 47
  {
    id: 'heavy-machinery-mining',
    name: 'Heavy Machinery & Mining Equipment',
    icon: '🚜',
    supplierCount: '8K+',
    description: 'Mining trucks, excavators, drilling machines and crushing equipment',
    subcategories: [
      'Mining Trucks',
      'Excavators',
      'Drilling Machines',
      'Crushing Equipment',
    ],
  },
  // 48
  {
    id: 'ferrous-nonferrous-metals',
    name: 'Ferrous and Non-Ferrous Metals',
    icon: '🪛',
    supplierCount: '11K+',
    description: 'Steel, aluminum, copper and zinc from verified metal suppliers',
    subcategories: [
      'Steel',
      'Aluminum',
      'Copper',
      'Zinc',
    ],
  },
  // 49
  {
    id: 'mining-safety-environment',
    name: 'Mining Safety & Environmental Solutions',
    icon: '🦺',
    supplierCount: '4K+',
    description: 'Mining safety gear, environmental monitoring, dust control and mine rehabilitation',
    subcategories: [
      'Mining Safety Gear',
      'Environmental Monitoring',
      'Dust Control Solutions',
      'Mine Rehabilitation',
    ],
  },
  // 50
  {
    id: 'precious-metals-mining',
    name: 'Precious Metals & Mining',
    icon: '🥇',
    supplierCount: '5K+',
    description: 'Gold, silver, platinum and mining exploration services',
    subcategories: [
      'Gold',
      'Silver',
      'Platinum',
      'Mining Exploration',
    ],
  },
];

// Helper: get a category by id
export function getCategoryById(id: string): Category | undefined {
  return ALL_CATEGORIES.find((c) => c.id === id);
}

// Helper: search categories by name or subcategory
export function searchCategories(query: string): Category[] {
  const q = query.toLowerCase().trim();
  if (!q) return ALL_CATEGORIES;
  return ALL_CATEGORIES.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.subcategories.some((s) => s.toLowerCase().includes(q))
  );
}

// Helper: get trending categories
export function getTrendingCategories(): Category[] {
  return ALL_CATEGORIES.filter((c) => c.trending);
}
