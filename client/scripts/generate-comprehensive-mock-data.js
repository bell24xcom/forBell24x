#!/usr/bin/env node

/**
 * Comprehensive Mock Data Generator for Bell24H
 * Generates 50 categories × 8-9 subcategories × 50-100 suppliers = 20,000-40,000 suppliers
 * Each supplier has 3-5 products = 60,000-200,000 products
 * Each product has 3 mock RFQs (Video, Voice, Text) = 180,000-600,000 RFQs
 */

const { PrismaClient } = require('@prisma/client');
const { ALL_50_CATEGORIES } = require('../src/data/all-50-categories.ts');

const prisma = new PrismaClient();

// Mock data generators
const companyNames = [
  'TechCorp Solutions', 'Global Machinery Ltd.', 'ChemTech Industries', 'Textile Masters',
  'AutoParts Pro', 'SteelCorp Industries', 'ElectroMax Solutions', 'AgriTech Solutions',
  'PharmaCorp Ltd.', 'Construction Materials Co.', 'Fashion Forward', 'MetalWorks Inc.',
  'Precision Tools', 'Industrial Supplies', 'Quality Components', 'Advanced Materials',
  'Innovation Labs', 'Prime Manufacturing', 'Elite Solutions', 'Supreme Industries',
  'MegaCorp Ltd.', 'UltraTech Systems', 'ProMax Industries', 'Superior Materials',
  'Excellence Corp', 'Premium Solutions', 'TopGrade Industries', 'FirstClass Materials',
  'Ace Manufacturing', 'Champion Industries', 'Winner Solutions', 'Leader Materials',
  'Pioneer Corp', 'Trailblazer Industries', 'Frontier Solutions', 'Vanguard Materials',
  'Elite Manufacturing', 'Premium Industries', 'Supreme Solutions', 'Ultimate Materials',
  'Master Corp', 'Expert Industries', 'Professional Solutions', 'Specialist Materials',
  'Advanced Corp', 'Modern Industries', 'Contemporary Solutions', 'Current Materials',
  'Future Corp', 'NextGen Industries', 'Innovation Solutions', 'Breakthrough Materials'
];

const locations = [
  'Mumbai, Maharashtra', 'Delhi, NCR', 'Bangalore, Karnataka', 'Chennai, Tamil Nadu',
  'Pune, Maharashtra', 'Ahmedabad, Gujarat', 'Hyderabad, Telangana', 'Kolkata, West Bengal',
  'Surat, Gujarat', 'Jaipur, Rajasthan', 'Lucknow, Uttar Pradesh', 'Kanpur, Uttar Pradesh',
  'Nagpur, Maharashtra', 'Indore, Madhya Pradesh', 'Thane, Maharashtra', 'Bhopal, Madhya Pradesh',
  'Visakhapatnam, Andhra Pradesh', 'Pimpri-Chinchwad, Maharashtra', 'Patna, Bihar', 'Vadodara, Gujarat',
  'Ghaziabad, Uttar Pradesh', 'Ludhiana, Punjab', 'Agra, Uttar Pradesh', 'Nashik, Maharashtra',
  'Faridabad, Haryana', 'Meerut, Uttar Pradesh', 'Rajkot, Gujarat', 'Kalyan-Dombivali, Maharashtra',
  'Vasai-Virar, Maharashtra', 'Varanasi, Uttar Pradesh', 'Srinagar, Jammu and Kashmir', 'Aurangabad, Maharashtra'
];

const trafficTiers = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'];
const stockStatuses = ['In Stock', 'Low Stock', 'Out of Stock', 'Available on Order'];
const rfqStatuses = ['PENDING', 'QUOTED', 'ACCEPTED', 'REJECTED', 'COMPLETED'];
const rfqTypes = ['VIDEO', 'VOICE', 'TEXT'];

// Generate random company name
function generateCompanyName() {
  const prefixes = ['Advanced', 'Premium', 'Elite', 'Superior', 'Ultimate', 'Pro', 'Max', 'Prime', 'First', 'Top'];
  const suffixes = ['Solutions', 'Industries', 'Corp', 'Ltd', 'Inc', 'Systems', 'Materials', 'Manufacturing', 'Technologies', 'Services'];
  const industries = ['Steel', 'Tech', 'Chem', 'Auto', 'Textile', 'Electro', 'Agri', 'Pharma', 'Construction', 'Fashion'];
  
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const industry = industries[Math.floor(Math.random() * industries.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  
  return `${prefix} ${industry}${suffix}`;
}

// Generate random supplier data
function generateSupplier(categoryId, subcategoryId, index) {
  const companyName = generateCompanyName();
  const location = locations[Math.floor(Math.random() * locations.length)];
  const trafficTier = trafficTiers[Math.floor(Math.random() * trafficTiers.length)];
  
  return {
    id: `SUP-${categoryId}-${subcategoryId}-${index}`,
    companyName,
    brandName: companyName.split(' ')[0] + ' Brand',
    logoUrl: `https://via.placeholder.com/100x100/4F46E5/FFFFFF?text=${companyName.charAt(0)}`,
    coverImageUrl: `https://via.placeholder.com/400x200/6366F1/FFFFFF?text=${companyName}`,
    description: `Leading supplier of ${subcategoryId.replace('-', ' ')} products with ${Math.floor(Math.random() * 20) + 5} years of experience in the industry.`,
    website: `www.${companyName.toLowerCase().replace(/\s+/g, '')}.com`,
    email: `contact@${companyName.toLowerCase().replace(/\s+/g, '')}.com`,
    phone: `+91-${Math.floor(Math.random() * 9000000000) + 1000000000}`,
    address: `${Math.floor(Math.random() * 999) + 1} Industrial Area, ${location}`,
    city: location.split(',')[0],
    state: location.split(',')[1]?.trim() || 'Maharashtra',
    country: 'India',
    pincode: `${Math.floor(Math.random() * 900000) + 100000}`,
    gstNumber: `27${Math.floor(Math.random() * 9000000000) + 1000000000}L1Z8`,
    cinNumber: `U27100MH${Math.floor(Math.random() * 9000) + 1000}PTC${Math.floor(Math.random() * 900000) + 100000}`,
    establishedYear: Math.floor(Math.random() * 30) + 1990,
    employeeCount: `${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 1000}`,
    annualTurnover: `₹${Math.floor(Math.random() * 900) + 100} Crores`,
    rating: 4.0 + Math.random() * 1.0,
    reviewCount: Math.floor(Math.random() * 500) + 50,
    verified: Math.random() > 0.2,
    responseTime: `${Math.floor(Math.random() * 24) + 1} hours`,
    trafficTier,
    userRoles: ['supplier', Math.random() > 0.5 ? 'manufacturer' : 'distributor'],
    categories: [categoryId],
    specializations: [subcategoryId.replace('-', ' '), 'Custom Solutions', 'Bulk Supply'],
    certifications: ['ISO 9001:2015', 'ISO 14001:2015', 'OHSAS 18001:2007'],
    manufacturingCapacity: `${Math.floor(Math.random() * 900) + 100} MT/year`,
    facilities: ['Production Unit', 'Quality Lab', 'Warehouse', 'R&D Center'],
    qualityStandards: ['ISO 9001', 'BIS Certification', 'CE Marking'],
    escrowEligible: Math.random() > 0.3,
    invoiceDiscounting: Math.random() > 0.5,
    isActive: true
  };
}

// Generate random product data
function generateProduct(supplierId, categoryId, subcategoryId, index) {
  const basePrice = Math.floor(Math.random() * 50000) + 1000;
  const trafficPrice = Math.floor(basePrice * (1 + Math.random() * 0.3));
  const msmePrice = Math.floor(basePrice * (0.9 + Math.random() * 0.1));
  
  return {
    id: `PROD-${supplierId}-${index}`,
    supplierId,
    categoryId,
    subcategoryId,
    name: `${subcategoryId.replace('-', ' ')} Product ${index + 1}`,
    description: `High-quality ${subcategoryId.replace('-', ' ')} product manufactured with precision and attention to detail. Perfect for industrial applications.`,
    brand: `Brand ${index + 1}`,
    basePrice,
    trafficPrice,
    msmePrice,
    minOrderQuantity: `${Math.floor(Math.random() * 100) + 1} units`,
    stockStatus: stockStatuses[Math.floor(Math.random() * stockStatuses.length)],
    images: [
      'https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=Product',
      'https://via.placeholder.com/400x300/7C3AED/FFFFFF?text=Image2',
      'https://via.placeholder.com/400x300/059669/FFFFFF?text=Image3'
    ],
    videoUrl: Math.random() > 0.7 ? 'https://example.com/product-video.mp4' : null,
    specifications: {
      'Material': 'Premium Grade',
      'Dimensions': 'Custom Available',
      'Weight': `${Math.floor(Math.random() * 50) + 1} kg`,
      'Certification': 'ISO 9001:2015',
      'Warranty': '1 Year',
      'Color': 'Standard',
      'Finish': 'Professional'
    },
    features: ['High Quality', 'Durable', 'Easy to Use', 'Cost Effective', 'Reliable'],
    views: Math.floor(Math.random() * 2000) + 100,
    impressions: Math.floor(Math.random() * 5000) + 500,
    rfqCount: Math.floor(Math.random() * 20) + 1,
    rating: 4.0 + Math.random() * 1.0,
    reviewCount: Math.floor(Math.random() * 200) + 10,
    isActive: true,
    isFeatured: Math.random() > 0.8
  };
}

// Generate random RFQ data
function generateRFQ(productId, supplierId, index) {
  const rfqType = rfqTypes[Math.floor(Math.random() * rfqTypes.length)];
  const status = rfqStatuses[Math.floor(Math.random() * rfqStatuses.length)];
  
  return {
    id: `RFQ-${productId}-${index}`,
    productId,
    supplierId,
    buyerId: `BUYER-${Math.floor(Math.random() * 1000) + 1}`,
    rfqType,
    subject: `RFQ for ${productId.replace('PROD-', '')}`,
    message: `Looking for reliable suppliers of ${productId.replace('PROD-', '').replace('-', ' ')}. Quality and timely delivery are our top priorities.`,
    videoUrl: rfqType === 'VIDEO' ? 'https://example.com/rfq-video.mp4' : null,
    audioUrl: rfqType === 'VOICE' ? 'https://example.com/rfq-audio.mp3' : null,
    quantity: Math.floor(Math.random() * 1000) + 10,
    unit: 'pieces',
    expectedPrice: Math.floor(Math.random() * 100000) + 10000,
    deliveryLocation: locations[Math.floor(Math.random() * locations.length)],
    deliveryTimeframe: `${Math.floor(Math.random() * 60) + 7} days`,
    specifications: {
      'Quality': 'High',
      'Certification': 'ISO 9001',
      'Packaging': 'Standard',
      'Payment': '30% advance, 70% on delivery'
    },
    status,
    quotedPrice: status === 'QUOTED' || status === 'ACCEPTED' ? Math.floor(Math.random() * 100000) + 10000 : null,
    quotedDeliveryTime: status === 'QUOTED' || status === 'ACCEPTED' ? `${Math.floor(Math.random() * 60) + 7} days` : null,
    quotedMessage: status === 'QUOTED' || status === 'ACCEPTED' ? 'We can provide the requested product at competitive rates.' : null,
    quotedAt: status === 'QUOTED' || status === 'ACCEPTED' ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) : null,
    acceptedAt: status === 'ACCEPTED' ? new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000) : null,
    completedAt: status === 'COMPLETED' ? new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000) : null,
    isActive: true
  };
}

// Main function to generate comprehensive mock data
async function generateComprehensiveMockData() {
  console.log('🚀 Starting comprehensive mock data generation...');
  
  try {
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await prisma.rFQ.deleteMany();
    await prisma.product.deleteMany();
    await prisma.supplier.deleteMany();
    await prisma.subcategory.deleteMany();
    await prisma.category.deleteMany();
    
    let totalSuppliers = 0;
    let totalProducts = 0;
    let totalRFQs = 0;
    
    // Generate categories and subcategories
    console.log('📂 Generating categories and subcategories...');
    for (const categoryData of ALL_50_CATEGORIES) {
      const category = await prisma.category.create({
        data: {
          id: categoryData.id,
          name: categoryData.name,
          slug: categoryData.slug,
          description: categoryData.description,
          icon: categoryData.icon,
          supplierCount: 0, // Will be updated later
          productCount: 0, // Will be updated later
          rfqCount: 0, // Will be updated later
          mockOrderCount: 0,
          trending: categoryData.featured,
          isActive: categoryData.isActive,
          sortOrder: Math.floor(Math.random() * 100),
          metaTitle: `${categoryData.name} - Bell24H B2B Marketplace`,
          metaDescription: `Find reliable suppliers for ${categoryData.name} products on Bell24H. ${categoryData.description}`,
          keywords: `${categoryData.name}, ${categoryData.subcategories.map(s => s.name).join(', ')}, suppliers, manufacturers`
        }
      });
      
      // Generate subcategories
      for (const subcategoryData of categoryData.subcategories) {
        await prisma.subcategory.create({
          data: {
            id: subcategoryData.id,
            name: subcategoryData.name,
            slug: subcategoryData.slug,
            description: subcategoryData.description,
            categoryId: category.id,
            supplierCount: 0, // Will be updated later
            productCount: 0, // Will be updated later
            rfqCount: 0, // Will be updated later
            mockOrderCount: 0,
            isActive: subcategoryData.isActive,
            sortOrder: Math.floor(Math.random() * 100)
          }
        });
      }
    }
    
    console.log(`✅ Created ${ALL_50_CATEGORIES.length} categories and subcategories`);
    
    // Generate suppliers, products, and RFQs for each subcategory
    for (const categoryData of ALL_50_CATEGORIES) {
      console.log(`🏭 Processing category: ${categoryData.name}`);
      
      for (const subcategoryData of categoryData.subcategories) {
        console.log(`  📁 Processing subcategory: ${subcategoryData.name}`);
        
        // Generate 50-100 suppliers per subcategory
        const supplierCount = Math.floor(Math.random() * 51) + 50; // 50-100 suppliers
        const suppliers = [];
        
        for (let i = 0; i < supplierCount; i++) {
          const supplierData = generateSupplier(categoryData.id, subcategoryData.id, i);
          const supplier = await prisma.supplier.create({
            data: supplierData
          });
          suppliers.push(supplier);
          totalSuppliers++;
        }
        
        // Generate 3-5 products per supplier
        for (const supplier of suppliers) {
          const productCount = Math.floor(Math.random() * 3) + 3; // 3-5 products
          
          for (let i = 0; i < productCount; i++) {
            const productData = generateProduct(supplier.id, categoryData.id, subcategoryData.id, i);
            const product = await prisma.product.create({
              data: productData
            });
            totalProducts++;
            
            // Generate 3 RFQs per product (Video, Voice, Text)
            for (let j = 0; j < 3; j++) {
              const rfqData = generateRFQ(product.id, supplier.id, j);
              await prisma.rFQ.create({
                data: rfqData
              });
              totalRFQs++;
            }
          }
        }
        
        // Update subcategory counts
        await prisma.subcategory.update({
          where: { id: subcategoryData.id },
          data: {
            supplierCount: supplierCount,
            productCount: supplierCount * 4, // Average 4 products per supplier
            rfqCount: supplierCount * 4 * 3 // 3 RFQs per product
          }
        });
      }
      
      // Update category counts
      const categorySupplierCount = categoryData.subcategories.reduce((sum, sub) => sum + sub.supplierCount, 0);
      const categoryProductCount = categoryData.subcategories.reduce((sum, sub) => sum + sub.productCount, 0);
      const categoryRFQCount = categoryData.subcategories.reduce((sum, sub) => sum + sub.rfqCount, 0);
      
      await prisma.category.update({
        where: { id: categoryData.id },
        data: {
          supplierCount: categorySupplierCount,
          productCount: categoryProductCount,
          rfqCount: categoryRFQCount
        }
      });
    }
    
    console.log('🎉 Comprehensive mock data generation completed!');
    console.log('\n📊 Final Statistics:');
    console.log(`  Categories: ${ALL_50_CATEGORIES.length}`);
    console.log(`  Subcategories: ${ALL_50_CATEGORIES.reduce((sum, cat) => sum + cat.subcategories.length, 0)}`);
    console.log(`  Suppliers: ${totalSuppliers.toLocaleString()}`);
    console.log(`  Products: ${totalProducts.toLocaleString()}`);
    console.log(`  RFQs: ${totalRFQs.toLocaleString()}`);
    console.log(`  Average suppliers per category: ${Math.round(totalSuppliers / ALL_50_CATEGORIES.length)}`);
    console.log(`  Average products per supplier: ${Math.round(totalProducts / totalSuppliers)}`);
    console.log(`  Average RFQs per product: ${Math.round(totalRFQs / totalProducts)}`);
    
  } catch (error) {
    console.error('❌ Error generating mock data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the generator
if (require.main === module) {
  generateComprehensiveMockData()
    .catch((error) => {
      console.error('❌ Mock data generation failed:', error);
      process.exit(1);
    });
}

module.exports = { generateComprehensiveMockData };
