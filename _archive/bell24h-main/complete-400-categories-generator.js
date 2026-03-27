const { Pool } = require('pg');

// Database connection (using your Neon credentials)
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_0Duqdxs3RoyA@ep-super-wind-a1c1ni4n-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false }
});

// 50 Main Categories with their subcategories
const categoriesData = [
  {
    name: 'Agriculture',
    slug: 'agriculture',
    description: 'Agricultural products and equipment',
    priority: 10,
    subcategories: [
      'Agriculture Equipment', 'Fresh Flowers', 'Seeds & Saplings', 'Tractor Parts',
      'Animal Feed', 'Irrigation Systems', 'Fertilizers & Pesticides', 'Organic Farming Tools'
    ]
  },
  {
    name: 'Apparel & Fashion',
    slug: 'apparel-fashion',
    description: 'Clothing, textiles, and fashion accessories',
    priority: 10,
    subcategories: [
      'Sarees', 'Sunglasses', 'Unisex Clothing', 'Suitcases & Briefcases',
      'Footwear', 'Textiles & Fabrics', 'Sportswear', 'Fashion Accessories'
    ]
  },
  {
    name: 'Automobile',
    slug: 'automobile',
    description: 'Automotive parts and commercial vehicles',
    priority: 10,
    subcategories: [
      'Auto Electrical Parts', 'Engine Parts', 'Commercial Vehicles', 'Coach Building',
      'Car Accessories', 'Tires & Tubes', 'Lubricants & Greases'
    ]
  },
  {
    name: 'Ayurveda & Herbal Products',
    slug: 'ayurveda-herbal',
    description: 'Ayurvedic medicines and herbal products',
    priority: 9,
    subcategories: [
      'Herbal Henna', 'Ayurvedic Extracts', 'Herbal Foods', 'Ayurvedic Medicines',
      'Herbal Oils', 'Natural Skincare'
    ]
  },
  {
    name: 'Business Services',
    slug: 'business-services',
    description: 'Consulting and professional services',
    priority: 9,
    subcategories: [
      'Turnkey Project Services', 'Environmental Services', 'Business Consultants',
      'Import/Export Documentation', 'Financial Consulting', 'Legal & Compliance Services'
    ]
  },
  {
    name: 'Chemical',
    slug: 'chemical',
    description: 'Industrial and specialty chemicals',
    priority: 9,
    subcategories: [
      'Industrial Chemicals', 'Pharmaceutical Chemicals', 'Agro Chemicals',
      'Textile Chemicals', 'Water Treatment Chemicals', 'Paint & Coating Chemicals',
      'Petrochemicals', 'Specialty Chemicals'
    ]
  },
  {
    name: 'Computers and Internet',
    slug: 'computers-internet',
    description: 'IT services and software development',
    priority: 9,
    subcategories: [
      'Software Development', 'Web Development', 'Mobile App Development', 'Cloud Services',
      'IT Consulting', 'Data Analytics', 'Cybersecurity', 'Digital Marketing'
    ]
  },
  {
    name: 'Consumer Electronics',
    slug: 'consumer-electronics',
    description: 'Electronics and mobile accessories',
    priority: 8,
    subcategories: [
      'Mobile Phones', 'Laptops & Computers', 'Audio Equipment', 'Cameras & Photography',
      'Home Appliances', 'Gaming Consoles', 'Smart Home Devices', 'Mobile Accessories'
    ]
  },
  {
    name: 'Cosmetics & Personal Care',
    slug: 'cosmetics-personal-care',
    description: 'Beauty and personal hygiene products',
    priority: 8,
    subcategories: [
      'Skincare Products', 'Makeup & Cosmetics', 'Hair Care Products', 'Personal Hygiene',
      'Fragrances', 'Men\'s Grooming', 'Baby Care Products', 'Natural & Organic Products'
    ]
  },
  {
    name: 'Electronics & Electrical',
    slug: 'electronics-electrical',
    description: 'Electrical equipment and components',
    priority: 8,
    subcategories: [
      'Electronic Components', 'Electrical Equipment', 'Power Systems', 'Lighting Solutions',
      'Automation Systems', 'Control Panels', 'Cables & Wires', 'Electronic Instruments'
    ]
  },
  {
    name: 'Food Products & Beverage',
    slug: 'food-beverage',
    description: 'Food products and beverages',
    priority: 8,
    subcategories: [
      'Packaged Foods', 'Beverages', 'Spices & Seasonings', 'Dairy Products',
      'Snacks & Confectionery', 'Frozen Foods', 'Organic Foods', 'Bakery Products'
    ]
  },
  {
    name: 'Furniture & Carpentry Services',
    slug: 'furniture-carpentry',
    description: 'Furniture and woodwork services',
    priority: 7,
    subcategories: [
      'Office Furniture', 'Home Furniture', 'Carpentry Services', 'Wooden Crafts',
      'Garden Furniture', 'Modular Furniture', 'Antique Furniture', 'Custom Furniture'
    ]
  },
  {
    name: 'Gifts & Crafts',
    slug: 'gifts-crafts',
    description: 'Handicrafts and gift items',
    priority: 7,
    subcategories: [
      'Handicrafts', 'Gift Items', 'Art & Paintings', 'Traditional Crafts',
      'Festive Decorations', 'Corporate Gifts', 'Customized Gifts', 'Artisan Products'
    ]
  },
  {
    name: 'Health & Beauty',
    slug: 'health-beauty',
    description: 'Health supplements and beauty products',
    priority: 7,
    subcategories: [
      'Health Supplements', 'Beauty Products', 'Wellness Products', 'Medical Devices',
      'Fitness Equipment', 'Alternative Medicine', 'Spa Products', 'Nutritional Products'
    ]
  },
  {
    name: 'Home Furnishings',
    slug: 'home-furnishings',
    description: 'Home textiles and furnishings',
    priority: 7,
    subcategories: [
      'Bedding & Linens', 'Curtains & Blinds', 'Carpets & Rugs', 'Cushions & Pillows',
      'Table Linens', 'Bathroom Accessories', 'Kitchen Textiles', 'Decorative Items'
    ]
  },
  {
    name: 'Home Supplies',
    slug: 'home-supplies',
    description: 'Household supplies and cleaning products',
    priority: 6,
    subcategories: [
      'Cleaning Products', 'Kitchen Supplies', 'Storage Solutions', 'Home Maintenance',
      'Plumbing Supplies', 'Electrical Supplies', 'Hardware Items', 'Home Security'
    ]
  },
  {
    name: 'Industrial Machinery',
    slug: 'industrial-machinery',
    description: 'Heavy machinery and equipment',
    priority: 6,
    subcategories: [
      'Heavy Machinery', 'Manufacturing Equipment', 'Construction Machinery', 'Mining Equipment',
      'Agricultural Machinery', 'Packaging Machinery', 'Textile Machinery', 'Food Processing Equipment'
    ]
  },
  {
    name: 'Industrial Supplies',
    slug: 'industrial-supplies',
    description: 'Industrial tools and supplies',
    priority: 6,
    subcategories: [
      'Industrial Tools', 'Safety Equipment', 'Raw Materials', 'Industrial Chemicals',
      'Machinery Parts', 'Measuring Instruments', 'Industrial Fasteners', 'Industrial Lubricants'
    ]
  },
  {
    name: 'Jewelry & Jewelry Designers',
    slug: 'jewelry',
    description: 'Precious jewelry and designers',
    priority: 6,
    subcategories: [
      'Gold Jewelry', 'Silver Jewelry', 'Diamond Jewelry', 'Pearl Jewelry',
      'Costume Jewelry', 'Custom Jewelry', 'Jewelry Designers', 'Jewelry Tools'
    ]
  },
  {
    name: 'Mineral & Metals',
    slug: 'mineral-metals',
    description: 'Metals and minerals',
    priority: 6,
    subcategories: [
      'Iron & Steel', 'Aluminum', 'Copper', 'Zinc',
      'Lead', 'Nickel', 'Minerals', 'Metal Alloys'
    ]
  },
  {
    name: 'Office Supplies',
    slug: 'office-supplies',
    description: 'Office stationery and supplies',
    priority: 5,
    subcategories: [
      'Stationery', 'Office Furniture', 'Office Equipment', 'Paper Products',
      'Writing Instruments', 'Filing Systems', 'Office Decor', 'Business Cards'
    ]
  },
  {
    name: 'Packaging & Paper',
    slug: 'packaging-paper',
    description: 'Packaging materials and paper products',
    priority: 5,
    subcategories: [
      'Packaging Materials', 'Paper Products', 'Corrugated Boxes', 'Flexible Packaging',
      'Labels & Stickers', 'Packaging Machinery', 'Protective Packaging', 'Sustainable Packaging'
    ]
  },
  {
    name: 'Real Estate, Building & Construction',
    slug: 'real-estate-construction',
    description: 'Construction materials and services',
    priority: 5,
    subcategories: [
      'Construction Materials', 'Building Services', 'Real Estate Services', 'Architecture',
      'Interior Design', 'Landscaping', 'Construction Equipment', 'Building Automation'
    ]
  },
  {
    name: 'Security Products & Services',
    slug: 'security',
    description: 'Security systems and services',
    priority: 5,
    subcategories: [
      'Security Systems', 'CCTV Cameras', 'Access Control', 'Fire Safety',
      'Security Guards', 'Alarm Systems', 'Biometric Systems', 'Security Consulting'
    ]
  },
  {
    name: 'Sports Goods & Entertainment',
    slug: 'sports-entertainment',
    description: 'Sporting goods and entertainment',
    priority: 5,
    subcategories: [
      'Sports Equipment', 'Fitness Equipment', 'Outdoor Gear', 'Team Sports',
      'Water Sports', 'Winter Sports', 'Entertainment Equipment', 'Musical Instruments'
    ]
  },
  {
    name: 'Telecommunication',
    slug: 'telecommunication',
    description: 'Telecom equipment and services',
    priority: 5,
    subcategories: [
      'Telecom Equipment', 'Mobile Services', 'Internet Services', 'Satellite Communication',
      'Network Equipment', 'Telecom Infrastructure', 'VoIP Services', 'Data Services'
    ]
  },
  {
    name: 'Textiles, Yarn & Fabrics',
    slug: 'textiles-yarn-fabrics',
    description: 'Textile materials and fabrics',
    priority: 5,
    subcategories: [
      'Cotton Fabrics', 'Silk Fabrics', 'Wool Fabrics', 'Synthetic Fabrics',
      'Yarn & Threads', 'Textile Machinery', 'Dyeing & Printing', 'Garment Manufacturing'
    ]
  },
  {
    name: 'Tools & Equipment',
    slug: 'tools-equipment',
    description: 'Hand and power tools',
    priority: 5,
    subcategories: [
      'Hand Tools', 'Power Tools', 'Measuring Tools', 'Cutting Tools',
      'Welding Equipment', 'Tool Storage', 'Safety Tools', 'Specialized Tools'
    ]
  },
  {
    name: 'Tours, Travels & Hotels',
    slug: 'tours-travels-hotels',
    description: 'Travel and hospitality services',
    priority: 4,
    subcategories: [
      'Travel Services', 'Hotel Services', 'Tour Packages', 'Car Rental',
      'Airline Services', 'Travel Insurance', 'Adventure Tourism', 'Cultural Tourism'
    ]
  },
  {
    name: 'Toys & Games',
    slug: 'toys-games',
    description: 'Toys and gaming products',
    priority: 4,
    subcategories: [
      'Educational Toys', 'Electronic Games', 'Board Games', 'Outdoor Toys',
      'Puzzle Games', 'Action Figures', 'Dolls & Accessories', 'Building Sets'
    ]
  },
  {
    name: 'Renewable Energy Equipment',
    slug: 'renewable-energy',
    description: 'Solar, wind, and renewable energy',
    priority: 4,
    subcategories: [
      'Solar Panels', 'Wind Turbines', 'Battery Storage', 'Energy Management Systems',
      'Solar Inverters', 'Green Energy Solutions', 'Energy Monitoring', 'Renewable Energy Consulting'
    ]
  },
  {
    name: 'Artificial Intelligence & Automation Tools',
    slug: 'ai-automation',
    description: 'AI software and robotics',
    priority: 4,
    subcategories: [
      'AI Software', 'Machine Learning Tools', 'Robotics', 'Automation Systems',
      'Chatbots', 'Data Analytics', 'Predictive Analytics', 'AI Consulting'
    ]
  },
  {
    name: 'Sustainable & Eco-Friendly Products',
    slug: 'sustainable-eco',
    description: 'Eco-friendly and recyclable products',
    priority: 4,
    subcategories: [
      'Eco-Friendly Materials', 'Recycled Products', 'Biodegradable Products', 'Green Technology',
      'Sustainable Packaging', 'Carbon Footprint Solutions', 'Environmental Consulting', 'Green Energy'
    ]
  },
  {
    name: 'Healthcare Equipment & Technology',
    slug: 'healthcare-technology',
    description: 'Medical devices and health tech',
    priority: 4,
    subcategories: [
      'Medical Devices', 'Diagnostic Equipment', 'Surgical Instruments', 'Healthcare Software',
      'Telemedicine', 'Health Monitoring', 'Rehabilitation Equipment', 'Medical Supplies'
    ]
  },
  {
    name: 'E-commerce & Digital Platforms Solutions',
    slug: 'ecommerce-platforms',
    description: 'E-commerce software and platforms',
    priority: 4,
    subcategories: [
      'E-commerce Platforms', 'Payment Gateways', 'Digital Marketing', 'Online Store Solutions',
      'Inventory Management', 'Order Management', 'Customer Support', 'Analytics Tools'
    ]
  },
  {
    name: 'Gaming & Esports Hardware',
    slug: 'gaming-esports',
    description: 'Gaming consoles and esports equipment',
    priority: 3,
    subcategories: [
      'Gaming Consoles', 'Gaming PCs', 'Gaming Accessories', 'Esports Equipment',
      'Gaming Chairs', 'Gaming Monitors', 'Gaming Keyboards', 'Gaming Mice'
    ]
  },
  {
    name: 'Electric Vehicles & Charging Solutions',
    slug: 'electric-vehicles',
    description: 'EV batteries and charging stations',
    priority: 3,
    subcategories: [
      'Electric Cars', 'EV Batteries', 'Charging Stations', 'EV Components',
      'Electric Bikes', 'EV Infrastructure', 'Battery Management', 'EV Services'
    ]
  },
  {
    name: 'Drones & UAVs',
    slug: 'drones-uavs',
    description: 'Drones and aerial equipment',
    priority: 3,
    subcategories: [
      'Commercial Drones', 'Consumer Drones', 'Drone Accessories', 'Aerial Photography',
      'Drone Services', 'Drone Parts', 'Flight Controllers', 'Drone Training'
    ]
  },
  {
    name: 'Wearable Technology',
    slug: 'wearable-tech',
    description: 'Smartwatches and fitness trackers',
    priority: 3,
    subcategories: [
      'Smartwatches', 'Fitness Trackers', 'Health Monitors', 'Wearable Accessories',
      'Smart Glasses', 'Wearable Cameras', 'Fitness Bands', 'Wearable Apps'
    ]
  },
  {
    name: 'Logistics & Supply Chain Solutions',
    slug: 'logistics-supply-chain',
    description: 'Logistics and warehouse automation',
    priority: 3,
    subcategories: [
      'Warehouse Management', 'Transportation', 'Inventory Management', 'Supply Chain Software',
      'Freight Services', 'Last Mile Delivery', 'Logistics Consulting', 'Supply Chain Analytics'
    ]
  },
  {
    name: '3D Printing Equipment',
    slug: '3d-printing',
    description: '3D printers and materials',
    priority: 3,
    subcategories: [
      '3D Printers', '3D Printing Materials', '3D Design Software', '3D Printing Services',
      'Industrial 3D Printers', 'Desktop 3D Printers', '3D Scanning', '3D Printing Training'
    ]
  },
  {
    name: 'Food Tech & Agri-Tech',
    slug: 'food-tech-agri-tech',
    description: 'Agricultural technology and food delivery',
    priority: 3,
    subcategories: [
      'Precision Agriculture', 'Food Delivery Apps', 'Agricultural Drones', 'Smart Farming',
      'Food Processing Technology', 'Agri-Analytics', 'Hydroponic Systems', 'Food Safety Tech'
    ]
  },
  {
    name: 'Iron & Steel Industry',
    slug: 'iron-steel',
    description: 'Steel production and iron smelting',
    priority: 3,
    subcategories: [
      'Steel Production', 'Iron Smelting', 'Steel Products', 'Steel Trading',
      'Steel Fabrication', 'Steel Processing', 'Steel Recycling', 'Steel Consulting'
    ]
  },
  {
    name: 'Mining & Raw Materials',
    slug: 'mining-raw-materials',
    description: 'Mining operations and raw materials',
    priority: 3,
    subcategories: [
      'Mining Operations', 'Raw Material Trading', 'Mining Equipment', 'Mining Services',
      'Mineral Processing', 'Mining Technology', 'Environmental Mining', 'Mining Consulting'
    ]
  },
  {
    name: 'Metal Recycling',
    slug: 'metal-recycling',
    description: 'Scrap metal and recycling',
    priority: 3,
    subcategories: [
      'Scrap Metal Trading', 'Metal Recycling Services', 'Recycling Equipment', 'Waste Management',
      'Metal Processing', 'Recycling Technology', 'Environmental Services', 'Circular Economy'
    ]
  },
  {
    name: 'Metallurgy & Metalworking',
    slug: 'metallurgy-metalworking',
    description: 'Metal forging and casting',
    priority: 2,
    subcategories: [
      'Metal Forging', 'Metal Casting', 'Heat Treatment', 'Metal Finishing',
      'Welding Services', 'Metal Fabrication', 'Quality Control', 'Metallurgical Testing'
    ]
  },
  {
    name: 'Heavy Machinery & Mining Equipment',
    slug: 'heavy-machinery-mining',
    description: 'Mining trucks and excavators',
    priority: 2,
    subcategories: [
      'Excavators', 'Mining Trucks', 'Bulldozers', 'Cranes',
      'Loaders', 'Drilling Equipment', 'Mining Vehicles', 'Heavy Equipment Parts'
    ]
  },
  {
    name: 'Ferrous and Non-Ferrous Metals',
    slug: 'ferrous-non-ferrous',
    description: 'Steel, aluminum, and copper',
    priority: 2,
    subcategories: [
      'Steel Products', 'Aluminum Products', 'Copper Products', 'Metal Alloys',
      'Metal Sheets', 'Metal Rods', 'Metal Tubes', 'Metal Trading'
    ]
  },
  {
    name: 'Mining Safety & Environmental Solutions',
    slug: 'mining-safety',
    description: 'Mining safety gear and environmental solutions',
    priority: 2,
    subcategories: [
      'Safety Equipment', 'Environmental Monitoring', 'Safety Training', 'Emergency Response',
      'Air Quality Control', 'Water Treatment', 'Waste Management', 'Safety Consulting'
    ]
  },
  {
    name: 'Precious Metals & Mining',
    slug: 'precious-metals',
    description: 'Gold, silver, and platinum mining',
    priority: 2,
    subcategories: [
      'Gold Mining', 'Silver Mining', 'Platinum Mining', 'Precious Metal Trading',
      'Jewelry Manufacturing', 'Bullion Trading', 'Mining Investment', 'Precious Metal Analysis'
    ]
  }
];

async function createCompleteCategories() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 STARTING COMPLETE CATEGORIES SETUP');
    console.log('=====================================');
    
    // Clear existing categories if needed
    console.log('📋 Clearing existing categories...');
    await client.query('DELETE FROM public.categories WHERE id > 10');
    
    let totalCategories = 0;
    let totalSubcategories = 0;
    
    // Insert main categories
    console.log('📂 Inserting 50 main categories...');
    for (const category of categoriesData) {
      const result = await client.query(`
        INSERT INTO public.categories (name, slug, description, priority, is_active, created_at, updated_at)
        VALUES ($1, $2, $3, $4, true, NOW(), NOW())
        ON CONFLICT (slug) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          priority = EXCLUDED.priority,
          updated_at = NOW()
        RETURNING id
      `, [category.name, category.slug, category.description, category.priority]);
      
      const categoryId = result.rows[0].id;
      totalCategories++;
      
      console.log(`✅ ${category.name} (ID: ${categoryId})`);
      
      // Insert subcategories
      if (category.subcategories && category.subcategories.length > 0) {
        console.log(`   📁 Adding ${category.subcategories.length} subcategories...`);
        
        for (const subcategoryName of category.subcategories) {
          const subcategorySlug = subcategoryName.toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '-')
            .replace(/'/g, '');
          
          await client.query(`
            INSERT INTO public.categories (name, slug, description, parent_category_id, is_active, created_at, updated_at)
            VALUES ($1, $2, $3, $4, true, NOW(), NOW())
            ON CONFLICT (slug) DO UPDATE SET
              name = EXCLUDED.name,
              description = EXCLUDED.description,
              parent_category_id = EXCLUDED.parent_category_id,
              updated_at = NOW()
          `, [subcategoryName, subcategorySlug, `Subcategory of ${category.name}`, categoryId]);
          
          totalSubcategories++;
        }
      }
    }
    
    // Verify results
    const categoryCount = await client.query('SELECT COUNT(*) as count FROM public.categories');
    const mainCategoryCount = await client.query('SELECT COUNT(*) as count FROM public.categories WHERE parent_category_id IS NULL');
    const subcategoryCount = await client.query('SELECT COUNT(*) as count FROM public.categories WHERE parent_category_id IS NOT NULL');
    
    console.log('\n🎉 CATEGORIES SETUP COMPLETE!');
    console.log('==============================');
    console.log(`📊 Total Categories: ${categoryCount.rows[0].count}`);
    console.log(`📂 Main Categories: ${mainCategoryCount.rows[0].count}`);
    console.log(`📁 Subcategories: ${subcategoryCount.rows[0].count}`);
    console.log(`✅ Successfully inserted: ${totalCategories} main + ${totalSubcategories} subcategories`);
    
    // Show sample categories
    console.log('\n📋 SAMPLE CATEGORIES:');
    const sampleCategories = await client.query(`
      SELECT c1.name as main_category, c2.name as subcategory
      FROM public.categories c1
      LEFT JOIN public.categories c2 ON c1.id = c2.parent_category_id
      WHERE c1.parent_category_id IS NULL
      ORDER BY c1.priority DESC, c1.name
      LIMIT 10
    `);
    
    sampleCategories.rows.forEach(row => {
      if (row.subcategory) {
        console.log(`   ${row.main_category} → ${row.subcategory}`);
      } else {
        console.log(`   ${row.main_category}`);
      }
    });
    
    console.log('\n🚀 Database is ready for N8N workflows!');
    
  } catch (error) {
    console.error('❌ Error creating categories:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run the script
createCompleteCategories()
  .then(() => {
    console.log('\n✅ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error.message);
    process.exit(1);
  });
