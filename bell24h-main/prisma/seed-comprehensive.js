import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// 50 Main Categories with 8-9 Subcategories each = 400+ Categories
const mainCategories = [
  {
    name: 'Textiles & Garments',
    slug: 'textiles-garments',
    description: 'Clothing, fabrics, and textile products',
    icon: '👕',
    color: '#FF6B6B',
    subcategories: [
      'Cotton Fabrics', 'Silk Materials', 'Wool Products', 'Synthetic Fabrics',
      'Ready-made Garments', 'Traditional Wear', 'Workwear', 'Sportswear', 'Accessories'
    ]
  },
  {
    name: 'Electronics & Technology',
    slug: 'electronics-technology',
    description: 'Electronic components and technology products',
    icon: '📱',
    color: '#4ECDC4',
    subcategories: [
      'Consumer Electronics', 'Industrial Electronics', 'Computer Hardware', 'Mobile Devices',
      'Audio Equipment', 'Video Equipment', 'Electronic Components', 'IoT Devices', 'Wearables'
    ]
  },
  {
    name: 'Steel & Metals',
    slug: 'steel-metals',
    description: 'Steel, metal products and alloys',
    icon: '🔩',
    color: '#45B7D1',
    subcategories: [
      'Carbon Steel', 'Stainless Steel', 'Aluminum Products', 'Copper Products',
      'Iron Products', 'Metal Fabrication', 'Metal Casting', 'Metal Coating', 'Metal Tools'
    ]
  },
  {
    name: 'Machinery & Equipment',
    slug: 'machinery-equipment',
    description: 'Industrial machinery and equipment',
    icon: '⚙️',
    color: '#96CEB4',
    subcategories: [
      'Heavy Machinery', 'Light Machinery', 'Agricultural Equipment', 'Construction Equipment',
      'Manufacturing Equipment', 'Packaging Machinery', 'Textile Machinery', 'Food Processing Equipment', 'Medical Equipment'
    ]
  },
  {
    name: 'Chemicals & Pharmaceuticals',
    slug: 'chemicals-pharmaceuticals',
    description: 'Chemical products and pharmaceutical supplies',
    icon: '🧪',
    color: '#FFEAA7',
    subcategories: [
      'Industrial Chemicals', 'Agricultural Chemicals', 'Pharmaceuticals', 'Cosmetics',
      'Paints & Coatings', 'Adhesives', 'Lubricants', 'Cleaning Chemicals', 'Specialty Chemicals'
    ]
  },
  {
    name: 'Food & Beverages',
    slug: 'food-beverages',
    description: 'Food products and beverage supplies',
    icon: '🍎',
    color: '#DDA0DD',
    subcategories: [
      'Fresh Produce', 'Processed Foods', 'Beverages', 'Dairy Products',
      'Bakery Products', 'Spices & Condiments', 'Frozen Foods', 'Organic Foods', 'Packaged Foods'
    ]
  },
  {
    name: 'Construction & Building',
    slug: 'construction-building',
    description: 'Construction materials and building supplies',
    icon: '🏗️',
    color: '#98D8C8',
    subcategories: [
      'Cement & Concrete', 'Bricks & Blocks', 'Steel Structures', 'Roofing Materials',
      'Flooring Materials', 'Paints & Finishes', 'Electrical Fixtures', 'Plumbing Materials', 'Insulation Materials'
    ]
  },
  {
    name: 'Automotive & Transportation',
    slug: 'automotive-transportation',
    description: 'Automotive parts and transportation equipment',
    icon: '🚗',
    color: '#F7DC6F',
    subcategories: [
      'Auto Parts', 'Tires & Wheels', 'Engine Components', 'Electrical Parts',
      'Body Parts', 'Interior Parts', 'Commercial Vehicles', 'Two-wheelers', 'Accessories'
    ]
  },
  {
    name: 'Plastics & Polymers',
    slug: 'plastics-polymers',
    description: 'Plastic products and polymer materials',
    icon: '🔲',
    color: '#BB8FCE',
    subcategories: [
      'Raw Plastic Materials', 'Plastic Products', 'Packaging Materials', 'Medical Plastics',
      'Automotive Plastics', 'Construction Plastics', 'Household Plastics', 'Industrial Plastics', 'Recycled Plastics'
    ]
  },
  {
    name: 'Paper & Packaging',
    slug: 'paper-packaging',
    description: 'Paper products and packaging materials',
    icon: '📦',
    color: '#85C1E9',
    subcategories: [
      'Paper Products', 'Packaging Materials', 'Corrugated Boxes', 'Labels & Tags',
      'Tissue Products', 'Printing Papers', 'Industrial Papers', 'Eco-friendly Packaging', 'Custom Packaging'
    ]
  },
  {
    name: 'Rubber & Elastomers',
    slug: 'rubber-elastomers',
    description: 'Rubber products and elastomer materials',
    icon: '🛞',
    color: '#F8C471',
    subcategories: [
      'Natural Rubber', 'Synthetic Rubber', 'Rubber Products', 'Tires',
      'Rubber Sheets', 'Rubber Tubes', 'Rubber Gaskets', 'Rubber Molding', 'Rubber Coating'
    ]
  },
  {
    name: 'Ceramics & Glass',
    slug: 'ceramics-glass',
    description: 'Ceramic and glass products',
    icon: '🏺',
    color: '#82E0AA',
    subcategories: [
      'Ceramic Tiles', 'Glass Products', 'Sanitary Ware', 'Tableware',
      'Industrial Ceramics', 'Decorative Ceramics', 'Glass Containers', 'Safety Glass', 'Specialty Glass'
    ]
  },
  {
    name: 'Wood & Furniture',
    slug: 'wood-furniture',
    description: 'Wood products and furniture',
    icon: '🪑',
    color: '#D7BDE2',
    subcategories: [
      'Hardwood', 'Softwood', 'Plywood', 'Furniture',
      'Wooden Crafts', 'Wooden Toys', 'Wooden Packaging', 'Wooden Tools', 'Wooden Decor'
    ]
  },
  {
    name: 'Leather & Footwear',
    slug: 'leather-footwear',
    description: 'Leather products and footwear',
    icon: '👞',
    color: '#F9E79F',
    subcategories: [
      'Leather Materials', 'Leather Goods', 'Footwear', 'Bags & Wallets',
      'Belts & Accessories', 'Leather Jackets', 'Shoes', 'Boots', 'Leather Crafts'
    ]
  },
  {
    name: 'Gems & Jewelry',
    slug: 'gems-jewelry',
    description: 'Precious stones and jewelry',
    icon: '💎',
    color: '#AED6F1',
    subcategories: [
      'Precious Stones', 'Semi-precious Stones', 'Gold Jewelry', 'Silver Jewelry',
      'Diamond Jewelry', 'Pearl Jewelry', 'Fashion Jewelry', 'Antique Jewelry', 'Custom Jewelry'
    ]
  },
  {
    name: 'Handicrafts & Art',
    slug: 'handicrafts-art',
    description: 'Handmade products and artistic items',
    icon: '🎨',
    color: '#A9DFBF',
    subcategories: [
      'Wooden Crafts', 'Metal Crafts', 'Textile Crafts', 'Pottery',
      'Paintings', 'Sculptures', 'Decorative Items', 'Traditional Crafts', 'Modern Art'
    ]
  },
  {
    name: 'Agricultural Products',
    slug: 'agricultural-products',
    description: 'Farming and agricultural supplies',
    icon: '🌾',
    color: '#F7DC6F',
    subcategories: [
      'Seeds', 'Fertilizers', 'Pesticides', 'Agricultural Tools',
      'Irrigation Equipment', 'Greenhouse Supplies', 'Organic Products', 'Livestock Feed', 'Farm Machinery'
    ]
  },
  {
    name: 'IT & Software Services',
    slug: 'it-software-services',
    description: 'Information technology and software services',
    icon: '💻',
    color: '#85C1E9',
    subcategories: [
      'Software Development', 'Web Development', 'Mobile Apps', 'IT Consulting',
      'Cloud Services', 'Cybersecurity', 'Data Analytics', 'AI/ML Services', 'IT Support'
    ]
  },
  {
    name: 'Healthcare & Medical',
    slug: 'healthcare-medical',
    description: 'Medical equipment and healthcare supplies',
    icon: '🏥',
    color: '#F1948A',
    subcategories: [
      'Medical Equipment', 'Pharmaceuticals', 'Surgical Instruments', 'Diagnostic Equipment',
      'Dental Equipment', 'Laboratory Equipment', 'Medical Supplies', 'Rehabilitation Equipment', 'Emergency Equipment'
    ]
  },
  {
    name: 'Energy & Power',
    slug: 'energy-power',
    description: 'Energy generation and power equipment',
    icon: '⚡',
    color: '#F7DC6F',
    subcategories: [
      'Solar Equipment', 'Wind Energy', 'Battery Systems', 'Power Generators',
      'Electrical Equipment', 'Power Transmission', 'Energy Storage', 'Renewable Energy', 'Power Distribution'
    ]
  },
  {
    name: 'Textile Machinery',
    slug: 'textile-machinery',
    description: 'Machinery for textile production',
    icon: '🧵',
    color: '#D7BDE2',
    subcategories: [
      'Spinning Machinery', 'Weaving Machinery', 'Knitting Machinery', 'Dyeing Equipment',
      'Finishing Machinery', 'Cutting Equipment', 'Sewing Machines', 'Quality Control Equipment', 'Maintenance Tools'
    ]
  },
  {
    name: 'Printing & Publishing',
    slug: 'printing-publishing',
    description: 'Printing equipment and publishing services',
    icon: '📚',
    color: '#BB8FCE',
    subcategories: [
      'Printing Machines', 'Printing Materials', 'Publishing Services', 'Digital Printing',
      'Offset Printing', 'Screen Printing', 'Book Binding', 'Packaging Printing', 'Label Printing'
    ]
  },
  {
    name: 'Sports & Fitness',
    slug: 'sports-fitness',
    description: 'Sports equipment and fitness products',
    icon: '⚽',
    color: '#82E0AA',
    subcategories: [
      'Sports Equipment', 'Fitness Equipment', 'Outdoor Gear', 'Team Sports',
      'Individual Sports', 'Water Sports', 'Winter Sports', 'Adventure Sports', 'Fitness Accessories'
    ]
  },
  {
    name: 'Toys & Games',
    slug: 'toys-games',
    description: 'Toys, games and entertainment products',
    icon: '🧸',
    color: '#F8C471',
    subcategories: [
      'Educational Toys', 'Electronic Toys', 'Board Games', 'Outdoor Toys',
      'Puzzle Games', 'Action Figures', 'Dolls', 'Building Blocks', 'Video Games'
    ]
  },
  {
    name: 'Beauty & Personal Care',
    slug: 'beauty-personal-care',
    description: 'Beauty products and personal care items',
    icon: '💄',
    color: '#F1948A',
    subcategories: [
      'Skincare Products', 'Hair Care', 'Makeup', 'Fragrances',
      'Personal Hygiene', 'Men\'s Grooming', 'Baby Care', 'Natural Products', 'Professional Products'
    ]
  },
  {
    name: 'Home & Garden',
    slug: 'home-garden',
    description: 'Home improvement and garden supplies',
    icon: '🏡',
    color: '#A9DFBF',
    subcategories: [
      'Home Decor', 'Garden Tools', 'Outdoor Furniture', 'Indoor Plants',
      'Lighting', 'Kitchen Accessories', 'Bathroom Accessories', 'Storage Solutions', 'Cleaning Supplies'
    ]
  },
  {
    name: 'Office & Stationery',
    slug: 'office-stationery',
    description: 'Office supplies and stationery products',
    icon: '📝',
    color: '#85C1E9',
    subcategories: [
      'Writing Instruments', 'Paper Products', 'Office Furniture', 'Computer Accessories',
      'Filing Systems', 'Presentation Materials', 'Office Equipment', 'School Supplies', 'Art Supplies'
    ]
  },
  {
    name: 'Pet Supplies',
    slug: 'pet-supplies',
    description: 'Pet care products and supplies',
    icon: '🐕',
    color: '#F7DC6F',
    subcategories: [
      'Pet Food', 'Pet Toys', 'Pet Grooming', 'Pet Accessories',
      'Pet Health', 'Pet Housing', 'Pet Training', 'Pet Travel', 'Pet Safety'
    ]
  },
  {
    name: 'Security & Safety',
    slug: 'security-safety',
    description: 'Security equipment and safety products',
    icon: '🔒',
    color: '#D7BDE2',
    subcategories: [
      'CCTV Systems', 'Access Control', 'Fire Safety', 'Personal Safety',
      'Industrial Safety', 'Home Security', 'Vehicle Security', 'Cybersecurity', 'Emergency Equipment'
    ]
  },
  {
    name: 'Environmental & Waste',
    slug: 'environmental-waste',
    description: 'Environmental solutions and waste management',
    icon: '♻️',
    color: '#82E0AA',
    subcategories: [
      'Waste Management', 'Recycling Equipment', 'Water Treatment', 'Air Purification',
      'Environmental Monitoring', 'Green Energy', 'Sustainable Products', 'Pollution Control', 'Conservation'
    ]
  },
  {
    name: 'Marine & Shipping',
    slug: 'marine-shipping',
    description: 'Marine equipment and shipping supplies',
    icon: '🚢',
    color: '#85C1E9',
    subcategories: [
      'Marine Equipment', 'Shipping Containers', 'Navigation Equipment', 'Marine Safety',
      'Port Equipment', 'Cargo Handling', 'Marine Electronics', 'Marine Maintenance', 'Marine Services'
    ]
  },
  {
    name: 'Aviation & Aerospace',
    slug: 'aviation-aerospace',
    description: 'Aviation and aerospace equipment',
    icon: '✈️',
    color: '#F8C471',
    subcategories: [
      'Aircraft Parts', 'Avionics', 'Ground Support Equipment', 'Aerospace Materials',
      'Navigation Systems', 'Communication Equipment', 'Safety Equipment', 'Maintenance Tools', 'Training Equipment'
    ]
  },
  {
    name: 'Mining & Minerals',
    slug: 'mining-minerals',
    description: 'Mining equipment and mineral products',
    icon: '⛏️',
    color: '#D7BDE2',
    subcategories: [
      'Mining Equipment', 'Mineral Products', 'Drilling Equipment', 'Safety Equipment',
      'Processing Machinery', 'Transportation Equipment', 'Environmental Equipment', 'Exploration Tools', 'Maintenance'
    ]
  },
  {
    name: 'Oil & Gas',
    slug: 'oil-gas',
    description: 'Oil and gas industry equipment',
    icon: '🛢️',
    color: '#F1948A',
    subcategories: [
      'Drilling Equipment', 'Production Equipment', 'Refining Equipment', 'Pipeline Equipment',
      'Safety Equipment', 'Environmental Equipment', 'Maintenance Tools', 'Measurement Equipment', 'Control Systems'
    ]
  },
  {
    name: 'Telecommunications',
    slug: 'telecommunications',
    description: 'Telecom equipment and communication systems',
    icon: '📡',
    color: '#BB8FCE',
    subcategories: [
      'Network Equipment', 'Communication Devices', 'Antenna Systems', 'Cabling',
      'Switching Equipment', 'Transmission Equipment', 'Test Equipment', 'Installation Tools', 'Maintenance'
    ]
  },
  {
    name: 'Renewable Energy',
    slug: 'renewable-energy',
    description: 'Renewable energy equipment and solutions',
    icon: '🌱',
    color: '#82E0AA',
    subcategories: [
      'Solar Panels', 'Wind Turbines', 'Battery Storage', 'Inverters',
      'Charge Controllers', 'Monitoring Systems', 'Installation Equipment', 'Maintenance Tools', 'Energy Management'
    ]
  },
  {
    name: 'Water & Wastewater',
    slug: 'water-wastewater',
    description: 'Water treatment and wastewater management',
    icon: '💧',
    color: '#85C1E9',
    subcategories: [
      'Water Treatment', 'Wastewater Treatment', 'Pumps', 'Filtration Systems',
      'Water Testing', 'Water Storage', 'Distribution Systems', 'Monitoring Equipment', 'Maintenance'
    ]
  },
  {
    name: 'Food Processing',
    slug: 'food-processing',
    description: 'Food processing equipment and machinery',
    icon: '🍽️',
    color: '#F7DC6F',
    subcategories: [
      'Processing Machinery', 'Packaging Equipment', 'Quality Control', 'Storage Equipment',
      'Conveyor Systems', 'Cleaning Equipment', 'Cooking Equipment', 'Refrigeration', 'Safety Equipment'
    ]
  },
  {
    name: 'Textile Dyeing & Finishing',
    slug: 'textile-dyeing-finishing',
    description: 'Textile dyeing and finishing equipment',
    icon: '🎨',
    color: '#D7BDE2',
    subcategories: [
      'Dyeing Machines', 'Finishing Equipment', 'Drying Machines', 'Calendering',
      'Coating Equipment', 'Printing Machines', 'Quality Control', 'Waste Treatment', 'Maintenance'
    ]
  },
  {
    name: 'Packaging & Labeling',
    slug: 'packaging-labeling',
    description: 'Packaging and labeling equipment',
    icon: '📦',
    color: '#F8C471',
    subcategories: [
      'Packaging Machines', 'Labeling Equipment', 'Sealing Machines', 'Wrapping Equipment',
      'Filling Machines', 'Capping Machines', 'Coding Equipment', 'Quality Control', 'Maintenance'
    ]
  },
  {
    name: 'Testing & Measurement',
    slug: 'testing-measurement',
    description: 'Testing equipment and measurement instruments',
    icon: '📏',
    color: '#BB8FCE',
    subcategories: [
      'Measuring Instruments', 'Testing Equipment', 'Calibration Tools', 'Quality Control',
      'Laboratory Equipment', 'Field Testing', 'Precision Instruments', 'Digital Tools', 'Maintenance'
    ]
  },
  {
    name: 'Automation & Robotics',
    slug: 'automation-robotics',
    description: 'Automation systems and robotics',
    icon: '🤖',
    color: '#82E0AA',
    subcategories: [
      'Industrial Robots', 'Automation Systems', 'Control Systems', 'Sensors',
      'Actuators', 'Programming Tools', 'Safety Systems', 'Integration Services', 'Maintenance'
    ]
  },
  {
    name: 'Education & Training',
    slug: 'education-training',
    description: 'Educational equipment and training materials',
    icon: '🎓',
    color: '#85C1E9',
    subcategories: [
      'Educational Equipment', 'Training Materials', 'Laboratory Equipment', 'Computer Labs',
      'Audio-Visual Equipment', 'Simulation Tools', 'Assessment Tools', 'Online Learning', 'Certification'
    ]
  },
  {
    name: 'Entertainment & Media',
    slug: 'entertainment-media',
    description: 'Entertainment equipment and media production',
    icon: '🎬',
    color: '#F1948A',
    subcategories: [
      'Audio Equipment', 'Video Equipment', 'Lighting', 'Stage Equipment',
      'Broadcasting Equipment', 'Recording Equipment', 'Editing Tools', 'Streaming Equipment', 'Maintenance'
    ]
  },
  {
    name: 'Hospitality & Tourism',
    slug: 'hospitality-tourism',
    description: 'Hospitality equipment and tourism services',
    icon: '🏨',
    color: '#A9DFBF',
    subcategories: [
      'Hotel Equipment', 'Restaurant Equipment', 'Kitchen Equipment', 'Guest Services',
      'Recreation Equipment', 'Transportation', 'Tourism Services', 'Event Equipment', 'Maintenance'
    ]
  },
  {
    name: 'Logistics & Warehousing',
    slug: 'logistics-warehousing',
    description: 'Logistics equipment and warehousing solutions',
    icon: '📦',
    color: '#F7DC6F',
    subcategories: [
      'Warehouse Equipment', 'Material Handling', 'Conveyor Systems', 'Storage Solutions',
      'Transportation', 'Tracking Systems', 'Packaging', 'Inventory Management', 'Maintenance'
    ]
  },
  {
    name: 'Financial Services',
    slug: 'financial-services',
    description: 'Financial technology and banking equipment',
    icon: '💰',
    color: '#D7BDE2',
    subcategories: [
      'Banking Equipment', 'Payment Systems', 'ATM Machines', 'Security Systems',
      'Software Solutions', 'Consulting Services', 'Training', 'Compliance Tools', 'Maintenance'
    ]
  },
  {
    name: 'Real Estate & Construction',
    slug: 'real-estate-construction',
    description: 'Real estate services and construction equipment',
    icon: '🏢',
    color: '#85C1E9',
    subcategories: [
      'Construction Equipment', 'Building Materials', 'Property Management', 'Real Estate Services',
      'Architectural Services', 'Engineering Services', 'Project Management', 'Maintenance Services', 'Consulting'
    ]
  }
]

// Mock RFQ Templates for each category
const generateMockRFQs = (category, subcategory) => {
  const baseTemplates = {
    text: [
      `Looking for high-quality ${subcategory} suppliers. Need bulk quantities for manufacturing. Please provide detailed specifications and pricing.`,
      `Require ${subcategory} products for commercial project. Budget range ₹50,000 - ₹2,00,000. Need samples before final order.`,
      `Seeking reliable ${subcategory} manufacturer. Must be GST verified and ISO certified. Delivery required within 30 days.`
    ],
    voice: [
      `Hi, I'm looking for ${subcategory} suppliers. We need about 500 units for our manufacturing unit in Mumbai. Can you please send me your catalog and pricing? We're looking for good quality products at competitive rates.`,
      `Hello, we're a construction company and need ${subcategory} materials for our upcoming project. Our budget is around ₹1,50,000. We need delivery to Delhi within 3 weeks. Please contact us with your best quote.`,
      `Good morning, I represent a textile company and we're sourcing ${subcategory} products. We need suppliers who can provide consistent quality and timely delivery. Please share your company profile and product details.`
    ],
    video: [
      `[Shows product samples] I'm looking for suppliers who can manufacture similar ${subcategory} products. We need about 1000 pieces in different colors and sizes. Quality should be export-grade.`,
      `[Shows construction site] We're working on a major project and need ${subcategory} materials. The project is in Bangalore and we need delivery within 4 weeks. Please quote for bulk quantities.`,
      `[Shows manufacturing facility] Our company produces consumer goods and we need reliable ${subcategory} suppliers. We're looking for long-term partnerships with quality-focused manufacturers.`
    ]
  }
  
  return baseTemplates
}

async function main() {
  console.log('🌱 Starting comprehensive database seeding...')
  
  try {
    // Create main categories and subcategories
    for (const mainCategory of mainCategories) {
      console.log(`Creating category: ${mainCategory.name}`)
      
      // Create main category
      const createdMainCategory = await prisma.category.upsert({
        where: { name: mainCategory.name },
        update: {},
        create: {
          name: mainCategory.name,
          slug: mainCategory.slug,
          description: mainCategory.description,
          icon: mainCategory.icon,
          color: mainCategory.color,
          level: 1,
          isActive: true,
          sortOrder: mainCategories.indexOf(mainCategory)
        }
      })
      
      // Create subcategories
      for (let i = 0; i < mainCategory.subcategories.length; i++) {
        const subcategoryName = mainCategory.subcategories[i]
        const subcategorySlug = subcategoryName.toLowerCase().replace(/\s+/g, '-')
        
        await prisma.category.upsert({
          where: { name: subcategoryName },
          update: {},
          create: {
            name: subcategoryName,
            slug: subcategorySlug,
            description: `${subcategoryName} products and services`,
            parentId: createdMainCategory.id,
            level: 2,
            isActive: true,
            sortOrder: i
          }
        })
        
        // Create mock RFQ templates for each subcategory
        const mockRFQs = generateMockRFQs(mainCategory.name, subcategoryName)
        
        // Text RFQs
        for (let j = 0; j < 3; j++) {
          await prisma.mockRFQTemplate.upsert({
            where: { 
              categoryId_type: {
                categoryId: createdMainCategory.id,
                type: 'text'
              }
            },
            update: {},
            create: {
              categoryId: createdMainCategory.id,
              title: `${subcategoryName} - Text RFQ ${j + 1}`,
              description: mockRFQs.text[j],
              textContent: mockRFQs.text[j],
              type: 'text',
              difficulty: ['easy', 'medium', 'hard'][j],
              quantity: [100, 500, 1000][j],
              budget: [50000, 150000, 300000][j],
              location: ['Mumbai', 'Delhi', 'Bangalore'][j],
              urgency: ['low', 'medium', 'high'][j],
              specifications: [
                'High quality materials',
                'GST verified supplier',
                'Timely delivery required'
              ]
            }
          })
        }
        
        // Voice RFQs
        for (let j = 0; j < 3; j++) {
          await prisma.mockRFQTemplate.upsert({
            where: { 
              categoryId_type: {
                categoryId: createdMainCategory.id,
                type: 'voice'
              }
            },
            update: {},
            create: {
              categoryId: createdMainCategory.id,
              title: `${subcategoryName} - Voice RFQ ${j + 1}`,
              description: mockRFQs.voice[j],
              audioScript: mockRFQs.voice[j],
              type: 'voice',
              difficulty: ['easy', 'medium', 'hard'][j],
              quantity: [200, 750, 1500][j],
              budget: [75000, 200000, 400000][j],
              location: ['Chennai', 'Kolkata', 'Hyderabad'][j],
              urgency: ['medium', 'high', 'low'][j],
              specifications: [
                'Audio quality must be clear',
                'Professional recording required',
                'Multiple language support'
              ]
            }
          })
        }
        
        // Video RFQs
        for (let j = 0; j < 3; j++) {
          await prisma.mockRFQTemplate.upsert({
            where: { 
              categoryId_type: {
                categoryId: createdMainCategory.id,
                type: 'video'
              }
            },
            update: {},
            create: {
              categoryId: createdMainCategory.id,
              title: `${subcategoryName} - Video RFQ ${j + 1}`,
              description: mockRFQs.video[j],
              videoScript: mockRFQs.video[j],
              type: 'video',
              difficulty: ['medium', 'hard', 'easy'][j],
              quantity: [150, 600, 1200][j],
              budget: [100000, 250000, 500000][j],
              location: ['Pune', 'Ahmedabad', 'Jaipur'][j],
              urgency: ['high', 'low', 'medium'][j],
              specifications: [
                'HD video quality required',
                'Professional presentation',
                'Product demonstration needed'
              ]
            }
          })
        }
      }
    }
    
    console.log('✅ Categories and mock RFQs created successfully!')
    
    // Create sample suppliers
    const suppliers = [
      {
        name: 'TechCorp Solutions',
        email: 'contact@techcorp.com',
        phone: '+91 98765 43210',
        companyName: 'TechCorp Solutions Pvt Ltd',
        gstNumber: '27AABCT1234C1Z5',
        panNumber: 'AABCT1234C',
        address: '123 Tech Park, Mumbai',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        isGstVerified: true,
        isPanVerified: true,
        rating: 4.8,
        totalOrders: 156,
        successRate: 0.98,
        responseTime: 2,
        trustScore: 0.92,
        priceRange: { min: 10000, max: 500000 },
        capabilities: ['Electronics', 'Automation', 'IoT']
      },
      {
        name: 'SteelWorks Industries',
        email: 'info@steelworks.com',
        phone: '+91 87654 32109',
        companyName: 'SteelWorks Industries Ltd',
        gstNumber: '07AABCT5678C1Z5',
        panNumber: 'AABCT5678C',
        address: '456 Industrial Area, Delhi',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110001',
        isGstVerified: true,
        isPanVerified: true,
        rating: 4.6,
        totalOrders: 89,
        successRate: 0.95,
        responseTime: 4,
        trustScore: 0.89,
        priceRange: { min: 5000, max: 200000 },
        capabilities: ['Steel', 'Metals', 'Fabrication']
      }
    ]
    
    for (const supplier of suppliers) {
      await prisma.supplier.upsert({
        where: { email: supplier.email },
        update: {},
        create: supplier
      })
    }
    
    console.log('✅ Sample suppliers created!')
    
    // Create analytics record
    await prisma.analytics.create({
      data: {
        totalRFQs: 0,
        totalSuppliers: suppliers.length,
        totalQuotes: 0,
        totalOrders: 0,
        avgMatchScore: 0,
        avgConfidence: 0,
        aiAccuracy: 0,
        avgResponseTime: 0,
        conversionRate: 0
      }
    })
    
    console.log('✅ Analytics initialized!')
    
    // Get total counts
    const categoryCount = await prisma.category.count()
    const mockRFQCount = await prisma.mockRFQTemplate.count()
    
    console.log(`\n🎉 Database seeding completed successfully!`)
    console.log(`📊 Statistics:`)
    console.log(`   - Main Categories: ${mainCategories.length}`)
    console.log(`   - Total Categories: ${categoryCount}`)
    console.log(`   - Mock RFQ Templates: ${mockRFQCount}`)
    console.log(`   - Text RFQs: ${mockRFQCount / 3}`)
    console.log(`   - Voice RFQs: ${mockRFQCount / 3}`)
    console.log(`   - Video RFQs: ${mockRFQCount / 3}`)
    console.log(`   - Sample Suppliers: ${suppliers.length}`)
    
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
